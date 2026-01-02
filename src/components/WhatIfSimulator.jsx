import { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import { Lightbulb, Zap, Car, Utensils, TrendingDown } from 'lucide-react';

export const WhatIfSimulator = ({ currentFootprint, currentFormData }) => {
    const [simulations, setSimulations] = useState({
        electricityReduction: 0,
        travelReduction: 0,
        reduceMeat: false,
        acReduction: false,
    });

    const simulatedFootprint = useMemo(() => {
        // Start with current footprint breakdown
        let newElectricity = currentFootprint.breakdown.electricity;
        let newTransport = currentFootprint.breakdown.transport;
        let newDiet = currentFootprint.breakdown.diet;

        // Apply electricity reduction
        if (simulations.electricityReduction > 0) {
            newElectricity = newElectricity * (1 - simulations.electricityReduction / 100);
        }

        // Apply AC reduction (if they use AC)
        if (simulations.acReduction && currentFormData.acUsage !== 'No AC') {
            // Reduce AC contribution by 50% (simulating less usage)
            const acContribution = currentFormData.acUsage === 'Regular' ? 600 : 200;
            newElectricity -= acContribution * 0.5;
        }

        // Apply travel reduction
        if (simulations.travelReduction > 0) {
            newTransport = newTransport * (1 - simulations.travelReduction / 100);
        }

        // Apply meat reduction (if they eat meat)
        if (simulations.reduceMeat && ['Mixed', 'Heavy non-veg'].includes(currentFormData.dietType)) {
            // Reducing meat consumption by ~30%
            newDiet = newDiet * 0.7;
        }

        const newTotal = newElectricity + newTransport + newDiet + currentFootprint.breakdown.lifestyle;

        return {
            total: newTotal,
            breakdown: {
                electricity: newElectricity,
                transport: newTransport,
                diet: newDiet,
                lifestyle: currentFootprint.breakdown.lifestyle,
            }
        };
    }, [currentFootprint, simulations, currentFormData]);

    const savings = currentFootprint.total - simulatedFootprint.total;
    const savingsPercentage = ((savings / currentFootprint.total) * 100).toFixed(1);

    const hasChanges = simulations.electricityReduction > 0 ||
        simulations.travelReduction > 0 ||
        simulations.reduceMeat ||
        simulations.acReduction;

    return (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500 p-2.5 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h4 className="text-xl font-bold text-gray-900">What-If Simulator</h4>
                    <p className="text-sm text-gray-600">See how lifestyle changes impact your footprint</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Electricity Reduction */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Zap className="w-4 h-4 text-yellow-600" />
                            Reduce Electricity Usage
                        </label>
                        <span className="text-sm font-bold text-blue-600">{simulations.electricityReduction}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={simulations.electricityReduction}
                        onChange={(e) => setSimulations({ ...simulations, electricityReduction: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Switch to LED, reduce AC usage, unplug devices</p>
                </div>

                {/* AC Usage Toggle */}
                {currentFormData.acUsage !== 'No AC' && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Reduce AC usage by 50%</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={simulations.acReduction}
                                onChange={(e) => setSimulations({ ...simulations, acReduction: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                )}

                {/* Travel Reduction */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Car className="w-4 h-4 text-blue-600" />
                            Reduce Travel Distance
                        </label>
                        <span className="text-sm font-bold text-blue-600">{simulations.travelReduction}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={simulations.travelReduction}
                        onChange={(e) => setSimulations({ ...simulations, travelReduction: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Carpool, use public transport, work from home</p>
                </div>

                {/* Meat Reduction Toggle */}
                {['Mixed', 'Heavy non-veg'].includes(currentFormData.dietType) && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Reduce meat consumption by 30%</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={simulations.reduceMeat}
                                onChange={(e) => setSimulations({ ...simulations, reduceMeat: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                )}

                {/* Results */}
                {hasChanges && (
                    <div className="mt-6 p-5 bg-white rounded-xl border-2 border-green-200 animate-fade-in">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-600">Simulated Footprint</span>
                            <div className="text-right">
                                <p className="text-3xl font-black text-gray-900">{Math.round(simulatedFootprint.total).toLocaleString()}</p>
                                <p className="text-xs text-gray-500">kg CO₂/year</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <TrendingDown className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-green-700">
                                    You could save {Math.round(savings).toLocaleString()} kg CO₂/year
                                </p>
                                <p className="text-xs text-green-600">That's a {savingsPercentage}% reduction!</p>
                            </div>
                        </div>
                    </div>
                )}

                {!hasChanges && (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500 italic">Adjust the sliders above to see potential savings</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
