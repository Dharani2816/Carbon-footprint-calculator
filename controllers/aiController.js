const OpenAI = require('openai');
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AiInsight } = require('../models');

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 10000 })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 5000 })
  : null;

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const riskLevelFromTotal = (total) => {
  if (total > 600) return 'High';
  if (total >= 400) return 'Moderate';
  return 'Low';
};

const validateInput = (body) => {
  const { energy, transport, diet, total } = body;
  const numbers = [energy, transport, diet, total];
  if (numbers.some((value) => value === undefined || value === null || Number.isNaN(Number(value)))) {
    return 'All fields (energy, transport, diet, total) are required and must be numbers.';
  }
  if (numbers.some((value) => Number(value) < 0)) {
    return 'Values cannot be negative.';
  }
  return null;
};

const buildPrompt = ({ energy, transport, diet, total, highestCategory, riskLevel }) => `You are an Indian climate action coach. Respond ONLY with valid JSON using EXACTLY these field names:
{
  "highestCategory": "${highestCategory}",
  "reasonAnalysis": "2-3 sentences explaining why ${highestCategory} is the highest contributor, using the actual numbers",
  "reductionTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "thirtyDayPlan": { "week1": "action", "week2": "action", "week3": "action", "week4": "action" },
  "estimatedReductionPercentage": "12-18%",
  "motivationalMessage": "short motivational sentence"
}

User Carbon Data (monthly kg CO2): Total=${total}, Energy=${energy}, Transport=${transport}, Diet=${diet}.
Highest contributor: ${highestCategory}. Risk level: ${riskLevel}.

Rules:
- 5 India-specific, actionable reduction tips (under 20 words each)
- 30-day plan with escalating weekly actions
- Realistic reduction % range based on tips
- Keep motivational, practical tone
- Use field names EXACTLY as shown above (highestCategory, reasonAnalysis, reductionTips, thirtyDayPlan, estimatedReductionPercentage, motivationalMessage)
- Output ONLY valid JSON, no markdown, no code fences.`;

const buildMinimalPrompt = ({ energy, transport, diet, total, highestCategory, riskLevel }) => `Return compact JSON only. Fields:
{
  "highestCategory": string,
  "reasonAnalysis": string (<=25 words),
  "reductionTips": [3 strings, each <=15 words],
  "thirtyDayPlan": {"week1": string, "week2": string, "week3": string, "week4": string each <=15 words},
  "estimatedReductionPercentage": string like "15-25%",
  "motivationalMessage": string <=15 words
}
Use these numbers: total ${total}, energy ${energy}, transport ${transport}, diet ${diet}, highest ${highestCategory}, risk ${riskLevel}. No code fences. No markdown. JSON only.`;

const GEMINI_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    highestCategory: { type: 'string' },
    reasonAnalysis: { type: 'string' },
    reductionTips: { type: 'array', items: { type: 'string' } },
    thirtyDayPlan: {
      type: 'object',
      properties: {
        week1: { type: 'string' },
        week2: { type: 'string' },
        week3: { type: 'string' },
        week4: { type: 'string' }
      }
    },
    estimatedReductionPercentage: { type: 'string' },
    motivationalMessage: { type: 'string' }
  },
  required: ['highestCategory', 'reasonAnalysis', 'reductionTips', 'thirtyDayPlan', 'estimatedReductionPercentage', 'motivationalMessage']
};

const GEMINI_SAFETY_NONE = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
];

const parseJsonSafe = (text) => {
  if (!text) return null;
  let cleaned = text.trim();

  // Strip common code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9]*\s*/,'').replace(/```\s*$/,'');
  }

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const slice = cleaned.slice(first, last + 1);
      try {
        return JSON.parse(slice);
      } catch (_) {
        return null;
      }
    }
    return null;
  }
};

const callGroq = async (prompt) => {
  if (!groq) throw new Error('GROQ_API_KEY not configured');
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    temperature: 0.4,
    max_tokens: 800,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a concise Indian climate coach. Always return valid JSON that matches the requested schema. Keep it under 400 words.'
      },
      { role: 'user', content: prompt }
    ]
  });
  const content = completion.choices?.[0]?.message?.content?.trim();
  return { provider: 'groq', raw: content, parsed: parseJsonSafe(content) };
};

const callOpenAI = async (prompt) => {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.4,
    max_tokens: 600,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a concise Indian climate coach. Always return valid JSON that matches the requested schema. Keep it under 400 words.'
      },
      { role: 'user', content: prompt }
    ]
  });
  const content = completion.choices?.[0]?.message?.content?.trim();
  return { provider: 'openai', raw: content, parsed: parseJsonSafe(content) };
};

const callGemini = async (prompt, context) => {
  if (!geminiClient) throw new Error('GEMINI_API_KEY not configured');

  const preferred = process.env.GEMINI_MODEL;
  const candidates = [preferred, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro'].filter(Boolean);
  let lastErr;

  for (const modelName of candidates) {
    let attempts = 0;
    while (attempts < 3) {
      attempts += 1;
      try {
        const model = geminiClient.getGenerativeModel({ model: modelName });
        const promptToUse = attempts <= 2 ? prompt : buildMinimalPrompt(context);
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: `${promptToUse}\nReturn ONLY valid JSON for the schema, no code fences. Do not cut off mid-word; close all braces.` }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 768,
            responseMimeType: 'application/json',
            responseSchema: GEMINI_RESPONSE_SCHEMA,
            candidateCount: 1,
            topP: 0.9
          },
          safetySettings: GEMINI_SAFETY_NONE
        });
        const content = result?.response?.text?.() || result?.response?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('');
        const parsed = parseJsonSafe(content);
        if (!parsed) {
          console.warn(`⚠️ Gemini ${modelName} returned non-JSON (attempt ${attempts}):`, content?.slice(0, 400));
          if (attempts < 3) continue;
        }
        return { provider: `gemini:${modelName}`, raw: content, parsed };
      } catch (err) {
        lastErr = err;
        const msg = err?.message || '';
        if (err?.status === 404 || /not found/i.test(msg)) {
          console.warn(`⚠️ Gemini model not found: ${modelName}, trying next`);
          break; // move to next model
        }
        throw err;
      }
    }
  }

  throw lastErr || new Error('No Gemini model succeeded');
};

const isRateLimit = (err) => {
  const msg = err?.message || '';
  return err?.status === 429 || /quota|rate limit/i.test(msg);
};

/* ── Rule-based fallback when all AI providers fail ── */
const TIPS_DB = {
  Energy: [
    'Switch to LED bulbs — saves up to 80% lighting energy.',
    'Use a smart power strip to cut standby power waste.',
    'Set AC to 24°C instead of lower; each degree saves ~6% energy.',
    'Air-dry clothes instead of using a dryer.',
    'Use solar water heaters — common and cost-effective in India.'
  ],
  Transport: [
    'Carpool or use public transport at least 3 days a week.',
    'Walk or cycle for trips under 3 km.',
    'Combine errands into fewer trips to cut fuel use.',
    'Maintain correct tyre pressure — improves mileage by 3%.',
    'Consider an electric two-wheeler for daily commutes.'
  ],
  Diet: [
    'Add 2 fully plant-based meals per week.',
    'Buy seasonal, locally grown vegetables and fruits.',
    'Reduce food waste — plan meals and use leftovers.',
    'Replace bottled drinks with homemade alternatives.',
    'Choose millets (ragi, jowar) over rice for lower water and carbon footprint.'
  ]
};

const PLANS_DB = {
  Energy: {
    week1: 'Audit every room: unplug unused chargers and appliances.',
    week2: 'Replace 50% of bulbs with LEDs; set AC timer.',
    week3: 'Install a smart power strip for entertainment center.',
    week4: 'Track electricity bill — target 10% reduction from baseline.'
  },
  Transport: {
    week1: 'Log every trip this week; identify ones under 3 km.',
    week2: 'Switch short trips to walking or cycling.',
    week3: 'Try carpooling or public transport for work commute.',
    week4: 'Review fuel/fare spend — aim for 15% savings.'
  },
  Diet: {
    week1: 'Track meals; identify high-emission items (red meat, dairy).',
    week2: 'Replace 3 meat meals with plant-based alternatives.',
    week3: 'Start a small kitchen garden for herbs and greens.',
    week4: 'Review weekly grocery — buy local, seasonal, less packaged.'
  }
};

const generateRuleBasedInsights = ({ energy, transport, diet, total, highestCategory, riskLevel }) => {
  const tips = TIPS_DB[highestCategory] || TIPS_DB.Energy;
  const plan = PLANS_DB[highestCategory] || PLANS_DB.Energy;

  const categoryValues = { Energy: energy, Transport: transport, Diet: diet };
  const highestValue = categoryValues[highestCategory];
  const pct = total > 0 ? Math.round((highestValue / total) * 100) : 0;

  const reasonAnalysis = `${highestCategory} is your highest contributor at ${highestValue} kg CO2/month (${pct}% of total). ` +
    (riskLevel === 'High'
      ? 'Your total footprint is in the high-risk zone — immediate action is recommended.'
      : riskLevel === 'Moderate'
        ? 'Your footprint is moderate — consistent small changes can bring it down significantly.'
        : 'Your footprint is relatively low — great job! Fine-tuning habits can reduce it further.');

  const reductionPct = riskLevel === 'High' ? '20-30%' : riskLevel === 'Moderate' ? '12-20%' : '5-12%';

  const motivationalMessage = riskLevel === 'High'
    ? 'Every big change starts with one step. You have the power to make a real difference — start today!'
    : riskLevel === 'Moderate'
      ? 'You are already on a good path. Small, consistent actions will create a lasting impact!'
      : 'Amazing work keeping your footprint low! Keep inspiring others with your choices.';

  return {
    highestCategory,
    reasonAnalysis,
    riskLevel,
    reductionTips: tips,
    thirtyDayPlan: plan,
    estimatedReductionPercentage: reductionPct,
    motivationalMessage,
    provider: 'rule-based'
  };
};

exports.generateInsights = async (req, res) => {
  const validationError = validateInput(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const energy = Number(req.body.energy);
  const transport = Number(req.body.transport);
  const diet = Number(req.body.diet);
  const total = Number(req.body.total);
  const userId = req.user?.id || 'anonymous';

  const highestCategory = ['Energy', 'Transport', 'Diet'].sort((a, b) => {
    const map = { Energy: energy, Transport: transport, Diet: diet };
    return map[b] - map[a];
  })[0];

  const riskLevel = riskLevelFromTotal(total);
  const cacheKey = `${userId}:${energy}:${transport}:${diet}:${total}`;

  try {
    const cached = await AiInsight.findByCacheKey(cacheKey);
    if (cached?.payload) {
      return res.json({ ...cached.payload, cached: true });
    }
  } catch (err) {
    console.warn('⚠️ AI cache lookup failed', err);
  }

  const promptContext = { energy, transport, diet, total, highestCategory, riskLevel };
  const prompt = buildPrompt(promptContext);

  const attemptProviders = [];
  if (groq) attemptProviders.push((p) => callGroq(p));
  if (openai) attemptProviders.push((p) => callOpenAI(p));
  if (geminiClient) attemptProviders.push((p) => callGemini(p, promptContext));

  let parsed;
  let providerUsed;
  let lastError;

  for (const fn of attemptProviders) {
    try {
      const { provider, raw, parsed: p } = await fn(prompt);
      providerUsed = provider;
      parsed = p;
      if (!parsed) {
        throw new Error(`${provider} returned non-JSON response`);
      }
      break;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ AI provider failed:`, err.message);
    }
  }

  let responsePayload;

  if (parsed) {
    // Normalize alternate field names from different AI models
    const tips = parsed.reductionTips || parsed.tips || parsed.reduction_tips || [];
    const plan = parsed.thirtyDayPlan || parsed.plan || parsed.thirty_day_plan || {};
    const reason = parsed.reasonAnalysis || parsed.reason || parsed.reason_analysis || parsed.analysis || '';
    const reduction = parsed.estimatedReductionPercentage || parsed.reductionRange || parsed.reduction_percentage || parsed.estimatedReduction || '';
    const motivation = parsed.motivationalMessage || parsed.motivation || parsed.motivational_message || parsed.message || '';

    responsePayload = {
      highestCategory: parsed.highestCategory || parsed.highest_category || parsed.category || highestCategory,
      reasonAnalysis: reason,
      riskLevel,
      reductionTips: Array.isArray(tips) ? tips.slice(0, 5) : [],
      thirtyDayPlan: {
        week1: plan?.week1 || plan?.Week1 || '',
        week2: plan?.week2 || plan?.Week2 || '',
        week3: plan?.week3 || plan?.Week3 || '',
        week4: plan?.week4 || plan?.Week4 || ''
      },
      estimatedReductionPercentage: reduction,
      motivationalMessage: motivation,
      provider: providerUsed
    };
  } else {
    // All AI providers failed — use rule-based fallback
    console.log('ℹ️ All AI providers failed, using rule-based fallback');
    responsePayload = generateRuleBasedInsights(promptContext);
  }

  try {
    await AiInsight.create({
      user_id: userId,
      cacheKey,
      payload: responsePayload,
      meta: { energy, transport, diet, total }
    });
  } catch (err) {
    console.warn('⚠️ Failed to store AI insight cache', err);
  }

  return res.json(responsePayload);
};
