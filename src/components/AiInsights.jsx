import { ShieldCheck, Loader2, AlertCircle, Sparkles, CheckCircle2, Flame, Leaf, ArrowRight, BadgePercent } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const riskStyles = {
    High: 'bg-red-100 text-red-800 border-red-200',
    Moderate: 'bg-amber-100 text-amber-800 border-amber-200',
    Low: 'bg-green-100 text-green-800 border-green-200'
};

export const AiInsights = ({ data, loading, error, onRetry }) => {
    if (loading) {
        return (
            <Card className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <p className="text-gray-600 font-medium">Generating AI climate insights…</p>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="flex flex-col gap-4 border-red-200 bg-red-50">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-red-100 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-red-800">We could not fetch AI insights right now.</p>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
                {onRetry && (
                    <div className="flex justify-end">
                        <Button onClick={onRetry} size="sm" className="bg-red-600 hover:bg-red-700">
                            Try again
                        </Button>
                    </div>
                )}
            </Card>
        );
    }

    if (!data) return null;

    const riskBadge = riskStyles[data.riskLevel] || riskStyles.Moderate;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary-100 text-primary-700">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">AI Climate Insights</p>
                    <h3 className="text-2xl font-bold text-gray-900">Personalized next steps</h3>
                </div>
            </div>

            <Card className="border border-gray-200">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        Highest: {data.highestCategory}
                    </span>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${riskBadge}`}>
                        <Flame className="w-4 h-4" />
                        Risk: {data.riskLevel}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
                        <BadgePercent className="w-4 h-4" />
                        Estimated drop: {data.estimatedReductionPercentage || '—'}
                    </span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">{data.reasonAnalysis}</p>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            5 reduction tips
                        </div>
                        <ul className="space-y-2">
                            {data.reductionTips?.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-800">
                                    <ArrowRight className="w-4 h-4 text-primary-600 mt-1" />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <Leaf className="w-4 h-4 text-emerald-600" />
                            30-day action plan
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['week1', 'week2', 'week3', 'week4'].map((weekKey) => (
                                <div key={weekKey} className="p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">{weekKey.replace('week', 'Week ')}</p>
                                    <p className="text-sm text-gray-700 leading-snug">{data.thirtyDayPlan?.[weekKey]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl border border-primary-100">
                    <p className="text-sm font-semibold text-primary-800 mb-1">Motivational note</p>
                    <p className="text-gray-800 leading-relaxed">{data.motivationalMessage}</p>
                </div>
            </Card>
        </div>
    );
};
