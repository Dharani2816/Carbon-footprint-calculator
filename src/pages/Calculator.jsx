import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Zap, Car, Utensils, ShoppingBag, ChevronRight, ChevronLeft, CheckCircle, TrendingUp, TrendingDown, Lightbulb, Target, Award } from 'lucide-react';
import { footprintApi } from '../api/footprintApi';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { CalculationExplainer } from '../components/CalculationExplainer';
import { BENCHMARKS, getImpactLevel, IMPACT_LEVELS, SAVINGS_ESTIMATES } from '../constants/benchmarks';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Calculator = () => {
    // const { history, addToHistory } = useAuth(); // Removed as per refactor
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        // Step 1: Home Energy
        electricity: '',
        cookingFuel: 'LPG',
        householdSize: '1',
        acUsage: 'No AC',

        // Step 2: Transport
        transportMode: 'Petrol car',
        transportDistance: '',
        vehicleOwnership: 'Own',
        flights: 'None',

        // Step 3: Diet & Lifestyle
        dietType: 'Mixed',
        nonVegFrequency: '1-2 times/week',
        shoppingFrequency: 'Occasionally',
        wasteSegregation: 'Sometimes',
    });
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const calculateFootprint = (data) => {
        // 1. Home Energy
        const electricity = parseFloat(data.electricity) || 0;
        const householdSize = data.householdSize;
        let householdFactor = 1;
        if (householdSize === '2-3') householdFactor = 2.5;
        if (householdSize === '4+') householdFactor = 4;

        let acFactor = 0;
        if (data.acUsage === 'Occasional') acFactor = 200;
        if (data.acUsage === 'Regular') acFactor = 600;

        const electricityEmission = ((electricity * 12 * 0.82) / householdFactor) + acFactor;

        // 2. Transport
        const distance = parseFloat(data.transportDistance) || 0;
        const transportFactors = {
            'Petrol car': 0.192,
            'Diesel car': 0.171,
            'Bike': 0.103,
            'Bus': 0.027,
            'Train': 0.006,
            'Walk / Cycle': 0,
        };
        const transportFactor = transportFactors[data.transportMode] || 0;

        let flightEmission = 0;
        if (data.flights === '1-2 short flights') flightEmission = 300;
        if (data.flights === '3+ flights') flightEmission = 1000;

        const transportEmission = (distance * 12 * transportFactor) + flightEmission;

        // 3. Diet
        const dietFactors = {
            'Vegan': 700,
            'Vegetarian': 1000,
            'Mixed': 1500,
            'Heavy non-veg': 2500,
        };
        let dietBase = dietFactors[data.dietType] || 1500;

        // Adjust mixed/non-veg based on frequency
        if (['Mixed', 'Heavy non-veg'].includes(data.dietType)) {
            if (data.nonVegFrequency === 'Daily') dietBase *= 1.2;
            if (data.nonVegFrequency === 'Never') dietBase *= 0.8;
        }

        const dietEmission = dietBase;

        // 4. Lifestyle
        let shoppingEmission = 600; // Occasional
        if (data.shoppingFrequency === 'Rarely') shoppingEmission = 300;
        if (data.shoppingFrequency === 'Frequently') shoppingEmission = 1000;

        let wasteFactor = 0;
        if (data.wasteSegregation === 'Yes') wasteFactor = -100;
        if (data.wasteSegregation === 'No') wasteFactor = 100;

        const lifestyleEmission = shoppingEmission + wasteFactor;

        const total = electricityEmission + transportEmission + dietEmission + lifestyleEmission;

        return {
            total,
            breakdown: {
                electricity: electricityEmission,
                transport: transportEmission,
                diet: dietEmission,
                lifestyle: lifestyleEmission,
            }
        };
    };

    const generateRecommendations = (breakdown, formData) => {
        const recommendations = [];

        // Energy recommendations
        if (breakdown.electricity > 800) {
            if (formData.acUsage === 'Regular') {
                recommendations.push({
                    category: 'Energy',
                    text: 'Reduce AC usage by setting temperature to 24-26°C and using fans alongside AC.',
                    savings: SAVINGS_ESTIMATES.REDUCE_AC_USAGE,
                    difficulty: 'Easy',
                    icon: Zap
                });
            }
            recommendations.push({
                category: 'Energy',
                text: 'Replace all bulbs with LED lights and unplug devices when not in use.',
                savings: SAVINGS_ESTIMATES.SWITCH_TO_LED,
                difficulty: 'Easy',
                icon: Zap
            });
        }

        // Transport recommendations
        if (breakdown.transport > 1000) {
            if (formData.transportMode === 'Petrol car' || formData.transportMode === 'Diesel car') {
                recommendations.push({
                    category: 'Transport',
                    text: 'Switch to public transport or metro for daily commute.',
                    savings: SAVINGS_ESTIMATES.PUBLIC_TRANSPORT,
                    difficulty: 'Medium',
                    icon: Car
                });
                recommendations.push({
                    category: 'Transport',
                    text: 'Carpool with colleagues or neighbors at least once a week.',
                    savings: SAVINGS_ESTIMATES.CARPOOL_ONCE_WEEK,
                    difficulty: 'Easy',
                    icon: Car
                });
            } else if (formData.transportMode === 'Bike') {
                recommendations.push({
                    category: 'Transport',
                    text: 'Use bicycle or walk for trips under 3 km.',
                    savings: SAVINGS_ESTIMATES.BIKE_SHORT_TRIPS,
                    difficulty: 'Medium',
                    icon: Car
                });
            }
        }

        // Diet recommendations
        if (breakdown.diet > 1400 && ['Mixed', 'Heavy non-veg'].includes(formData.dietType)) {
            recommendations.push({
                category: 'Diet',
                text: 'Try "Meatless Mondays" - go vegetarian one day per week.',
                savings: SAVINGS_ESTIMATES.MEATLESS_MONDAY,
                difficulty: 'Easy',
                icon: Utensils
            });
        }

        // Lifestyle recommendations
        if (breakdown.lifestyle > 600) {
            if (formData.shoppingFrequency === 'Frequently') {
                recommendations.push({
                    category: 'Lifestyle',
                    text: 'Buy only what you need and choose quality over quantity.',
                    savings: SAVINGS_ESTIMATES.REDUCE_SHOPPING,
                    difficulty: 'Medium',
                    icon: ShoppingBag
                });
            }
            if (formData.wasteSegregation !== 'Yes') {
                recommendations.push({
                    category: 'Lifestyle',
                    text: 'Start segregating waste into wet, dry, and recyclables.',
                    savings: SAVINGS_ESTIMATES.WASTE_SEGREGATION,
                    difficulty: 'Easy',
                    icon: ShoppingBag
                });
            }
        }

        // Ensure we have at least 3-5 recommendations, prioritize highest impact
        if (recommendations.length === 0) {
            recommendations.push({
                category: 'General',
                text: 'Excellent! Keep maintaining your eco-friendly lifestyle.',
                savings: 0,
                difficulty: 'Easy',
                icon: Lightbulb
            });
        }

        // Sort by savings (highest first) and return top 5
        return recommendations.sort((a, b) => b.savings - a.savings).slice(0, 5);
    };

    const renderStep1 = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-3 rounded-xl shadow-sm">
                        <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Home Energy Usage</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Tell us about your household electricity and fuel consumption</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                    label="Electricity Usage (kWh/month)"
                    name="electricity"
                    type="number"
                    min="0"
                    required
                    value={formData.electricity}
                    onChange={handleChange}
                    placeholder="e.g. 200"
                />
                <Select
                    label="Cooking Fuel"
                    name="cookingFuel"
                    value={formData.cookingFuel}
                    onChange={handleChange}
                >
                    <option value="LPG">LPG Cylinder</option>
                    <option value="Electric">Electric Induction</option>
                    <option value="Piped Gas">Piped Natural Gas</option>
                </Select>
                <Select
                    label="Household Size"
                    name="householdSize"
                    value={formData.householdSize}
                    onChange={handleChange}
                >
                    <option value="1">1 Person</option>
                    <option value="2-3">2-3 People</option>
                    <option value="4+">4+ People</option>
                </Select>
                <Select
                    label="AC Usage"
                    name="acUsage"
                    value={formData.acUsage}
                    onChange={handleChange}
                >
                    <option value="No AC">No AC</option>
                    <option value="Occasional">Occasional (Summer only)</option>
                    <option value="Regular">Regular Usage</option>
                </Select>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-3 rounded-xl shadow-sm">
                        <Car className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Transport Habits</h3>
                        <p className="text-sm text-gray-500 mt-0.5">How do you typically travel and what's your commute like?</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Select
                    label="Primary Mode of Transport"
                    name="transportMode"
                    value={formData.transportMode}
                    onChange={handleChange}
                >
                    <option value="Petrol car">Petrol Car</option>
                    <option value="Diesel car">Diesel Car</option>
                    <option value="Bike">Motorbike / Scooter</option>
                    <option value="Bus">Bus / Public Transport</option>
                    <option value="Train">Train / Metro</option>
                    <option value="Walk / Cycle">Walk / Cycle</option>
                </Select>
                <Input
                    label="Distance Travelled (km/month)"
                    name="transportDistance"
                    type="number"
                    min="0"
                    required
                    value={formData.transportDistance}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                />
                <Select
                    label="Vehicle Ownership"
                    name="vehicleOwnership"
                    value={formData.vehicleOwnership}
                    onChange={handleChange}
                >
                    <option value="Own">I own a vehicle</option>
                    <option value="None">I don't own a vehicle</option>
                </Select>
                <Select
                    label="Flights per Year"
                    name="flights"
                    value={formData.flights}
                    onChange={handleChange}
                >
                    <option value="None">None</option>
                    <option value="1-2 short flights">1-2 Short Flights</option>
                    <option value="3+ flights">3+ Flights</option>
                </Select>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-green-400 to-green-500 p-3 rounded-xl shadow-sm">
                        <Utensils className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Diet & Lifestyle Choices</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Your daily habits and consumption patterns</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Select
                    label="Diet Type"
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleChange}
                >
                    <option value="Mixed">Mixed Diet</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Heavy non-veg">Heavy Meat Eater</option>
                </Select>
                {['Mixed', 'Heavy non-veg'].includes(formData.dietType) && (
                    <Select
                        label="Non-Veg Frequency"
                        name="nonVegFrequency"
                        value={formData.nonVegFrequency}
                        onChange={handleChange}
                    >
                        <option value="1-2 times/week">1-2 times/week</option>
                        <option value="Daily">Daily</option>
                        <option value="Never">Rarely / Never</option>
                    </Select>
                )}
                <Select
                    label="Shopping Frequency (Clothes/Gadgets)"
                    name="shoppingFrequency"
                    value={formData.shoppingFrequency}
                    onChange={handleChange}
                >
                    <option value="Occasionally">Occasionally</option>
                    <option value="Rarely">Rarely</option>
                    <option value="Frequently">Frequently</option>
                </Select>
                <Select
                    label="Do you segregate waste?"
                    name="wasteSegregation"
                    value={formData.wasteSegregation}
                    onChange={handleChange}
                >
                    <option value="Sometimes">Sometimes</option>
                    <option value="Yes">Yes, always</option>
                    <option value="No">No</option>
                </Select>
            </div>
        </div>
    );

    const renderResults = () => {
        if (!result) return null;

        // Calculate advanced analytics
        const total = result.total;
        const breakdown = result.breakdown;

        // Top contributors
        const contributors = [
            { name: 'Home Energy', value: breakdown.electricity, icon: Zap, color: 'yellow' },
            { name: 'Transport', value: breakdown.transport, icon: Car, color: 'blue' },
            { name: 'Diet', value: breakdown.diet, icon: Utensils, color: 'green' },
            { name: 'Lifestyle', value: breakdown.lifestyle, icon: ShoppingBag, color: 'purple' },
        ].sort((a, b) => b.value - a.value);

        //Impact level
        const impactLevel = getImpactLevel(total);
        const impactInfo = IMPACT_LEVELS[impactLevel];

        // Pie chart data
        const pieData = {
            labels: ['Home Energy', 'Transport', 'Diet', 'Lifestyle'],
            datasets: [{
                data: [breakdown.electricity, breakdown.transport, breakdown.diet, breakdown.lifestyle],
                backgroundColor: ['#FCD34D', '#60A5FA', '#34D399', '#A78BFA'],
                borderWidth: 2,
                borderColor: '#fff',
            }]
        };

        return (
            <div className="space-y-8 animate-fadeIn">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-block bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-2xl mb-4 shadow-lg animate-bounce">
                        <CheckCircle className="w-14 h-14 text-white" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Calculation Complete!</h3>
                    <p className="text-gray-600 mt-2 text-lg">Here's your personalized carbon footprint analysis</p>
                </div>

                {/* Total Footprint with Impact Level */}
                <div className="bg-gradient-to-br from-primary-50 via-white to-green-50 border-2 border-primary-200 rounded-2xl p-10 text-center shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-100 rounded-full opacity-20 blur-3xl"></div>
                    <p className="text-sm font-bold text-primary-700 uppercase tracking-widest mb-3">Total Annual Emissions</p>
                    <div className="mt-2 flex items-baseline justify-center gap-3 relative z-10">
                        <span className="text-6xl font-black text-gray-900 tracking-tight">{Math.round(total).toLocaleString()}</span>
                        <span className="text-2xl text-gray-600 font-semibold">kg CO₂</span>
                    </div>

                    {/* Impact Badge */}
                    <div className={`mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full text-base font-bold shadow-lg border-2 ${impactLevel === 'LOW' ? 'bg-green-100 text-green-800 border-green-300' :
                        impactLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-red-100 text-red-800 border-red-300'
                        }`}>
                        <span className="text-2xl">{impactInfo.icon}</span>
                        {impactInfo.label}
                    </div>
                    <p className="text-sm text-gray-600 mt-3 italic">{impactInfo.message}</p>

                    {result.comparison && (
                        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${result.comparison.isIncrease ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {result.comparison.isIncrease ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {result.comparison.percentChange}% {result.comparison.isIncrease ? 'increase' : 'decrease'} from last time
                        </div>
                    )}
                </div>

                {/* Benchmarking */}
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-500 p-2.5 rounded-xl">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">How Do You Compare?</h4>
                            <p className="text-sm text-gray-600">Benchmarking against averages and targets</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border-2 border-transparent hover:border-blue-300 transition-all">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Your Footprint</p>
                            <p className="text-3xl font-black text-gray-900">{Math.round(total).toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">kg CO₂/year</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border-2 border-transparent hover:border-orange-300 transition-all">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Indian Average</p>
                            <p className="text-3xl font-black text-orange-600">{BENCHMARKS.INDIAN_AVERAGE.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {total > BENCHMARKS.INDIAN_AVERAGE ?
                                    `${Math.round((total / BENCHMARKS.INDIAN_AVERAGE - 1) * 100)}% above avg` :
                                    `${Math.round((1 - total / BENCHMARKS.INDIAN_AVERAGE) * 100)}% below avg`
                                }
                            </p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border-2 border-transparent hover:border-green-300 transition-all">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Sustainable Target</p>
                            <p className="text-3xl font-black text-green-600">{BENCHMARKS.SUSTAINABLE_TARGET.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {total > BENCHMARKS.SUSTAINABLE_TARGET ?
                                    `${Math.round(total - BENCHMARKS.SUSTAINABLE_TARGET)} kg to reach` :
                                    '🎉 Target achieved!'
                                }
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Top Contributors & Pie Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <div className="flex items-center gap-2 mb-6">
                            <Award className="w-6 h-6 text-yellow-500" />
                            <h4 className="text-lg font-bold text-gray-900">Top 3 Contributors</h4>
                        </div>
                        <div className="space-y-3">
                            {contributors.slice(0, 3).map((c, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className={`p-3 rounded-xl bg-${c.color}-100`}>
                                        <c.icon className={`w-6 h-6 text-${c.color}-600`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-gray-900">#{idx + 1} {c.name}</span>
                                            <span className="text-sm font-bold text-gray-700">{Math.round(c.value)} kg</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className={`bg-${c.color}-500 h-2.5 rounded-full`} style={{ width: `${(c.value / total) * 100}%` }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">{((c.value / total) * 100).toFixed(1)}% of total</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <h4 className="text-lg font-bold text-gray-900 mb-6">Emissions Breakdown</h4>
                        <div className="h-64 flex items-center justify-center">
                            <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                        </div>
                    </Card>
                </div>

                {/* What-If Simulator */}
                <WhatIfSimulator
                    currentFootprint={result}
                    currentFormData={formData}
                    onRecalculate={() => { }}
                />

                {/* Enhanced Recommendations */}
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-yellow-500 p-2.5 rounded-xl">
                            <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">Personalized Action Plan</h4>
                            <p className="text-sm text-gray-600">Tailored recommendations based on your lifestyle</p>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        {result.recommendations.map((rec, index) => (
                            <div key={index} className="bg-white border-2 border-gray-200 p-5 rounded-xl flex gap-4 hover:border-yellow-300 hover:shadow-md transition-all">
                                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-3 rounded-xl h-fit">
                                    <rec.icon className="w-6 h-6 text-yellow-700" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-bold text-gray-900">{rec.category}</p>
                                            <p className="text-sm text-gray-600 mt-1">{rec.text}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${rec.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                            rec.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {rec.difficulty}
                                        </span>
                                    </div>
                                    {rec.savings > 0 && (
                                        <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <TrendingDown className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-semibold text-green-700">
                                                Potential savings: <span className="font-black">{rec.savings} kg CO₂/year</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Calculation Transparency */}
                <CalculationExplainer />
            </div>
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const calculation = calculateFootprint(formData);

            // Fetch latest history for comparison - handle failure gracefully
            let latestRecord = null;
            try {
                latestRecord = await footprintApi.getLatestFootprint();
            } catch (err) {
                console.warn('Could not fetch latest history for comparison', err);
            }

            let comparison = null;
            if (latestRecord) {
                const diff = calculation.total - latestRecord.total;
                const percentChange = ((diff / latestRecord.total) * 100).toFixed(1);
                comparison = {
                    diff,
                    percentChange,
                    isIncrease: diff > 0
                };
            }

            const recommendations = generateRecommendations(calculation.breakdown, formData);

            const finalResult = {
                ...calculation,
                comparison,
                recommendations
            };

            // Save to API - handle failure gracefully so user still sees calculation
            try {
                await footprintApi.saveFootprint(finalResult);
            } catch (err) {
                console.error('Failed to save calculation to server', err);
                // Optionally set a non-blocking error message
                // setError('Calculated successfully, but failed to save to history.');
            }

            setResult(finalResult);
            nextStep(); // Move to result step (Step 4)
        } catch (error) {
            console.error('Calculation failed', error);
            if (error.response && error.response.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError(error.message || 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Progress Indicator */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -z-10 transform -translate-y-1/2"></div>
                <div
                    className="absolute top-1/2 left-0 h-1 bg-primary-500 rounded-full -z-10 transition-all duration-500 ease-in-out transform -translate-y-1/2"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>
                <div className="flex justify-between">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${step <= currentStep
                                ? 'bg-primary-500 border-primary-500 text-white'
                                : 'bg-white border-gray-300 text-gray-400'
                                }`}
                        >
                            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs font-medium text-gray-500 uppercase tracking-wide px-1">
                    <span>Energy</span>
                    <span className="translate-x-1">Transport</span>
                    <span className="-translate-x-1">Lifestyle</span>
                    <span>Result</span>
                </div>
            </div>

            <Card className="min-h-[450px] flex flex-col relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary-50 rounded-full opacity-50 blur-3xl -z-10 pointer-events-none"></div>

                <div className="flex-1">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderResults()}
                </div>

                {currentStep < 4 && (
                    <div className="mt-10 flex flex-col gap-4 pt-6 border-t border-gray-100">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center justify-center">
                                {error}
                            </div>
                        )}
                        <div className="flex justify-between">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={currentStep === 1 ? 'invisible' : ''}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Back
                            </Button>

                            {currentStep === 3 ? (
                                <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-40 shadow-lg shadow-primary-500/30">
                                    {loading ? 'Calculating...' : 'See Results'}
                                </Button>
                            ) : (
                                <Button onClick={nextStep} className="w-32">
                                    Next <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Calculator;
