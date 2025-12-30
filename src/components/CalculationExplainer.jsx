import { useState } from 'react';
import { Card } from './ui/Card';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { EMISSION_FACTORS } from '../constants/benchmarks';

export const CalculationExplainer = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="bg-gray-50 border-gray-200">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h4 className="text-lg font-bold text-gray-900">How is this calculated?</h4>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-4 animate-fade-in">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Your carbon footprint is calculated using scientifically-backed emission factors.
                        Here's what we use:
                    </p>

                    <div className="space-y-3">
                        {/* Electricity */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h5 className="font-semibold text-gray-900 mb-2">⚡ Electricity</h5>
                            <p className="text-sm text-gray-600">
                                <span className="font-mono bg-yellow-50 px-2 py-1 rounded text-yellow-800">
                                    {EMISSION_FACTORS.ELECTRICITY} kg CO₂
                                </span> per kWh consumed
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Based on India's energy grid mix (coal, renewables, etc.)
                            </p>
                        </div>

                        {/* Transport */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h5 className="font-semibold text-gray-900 mb-2">🚗 Transport</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-700">Petrol Car:</span>
                                    <span className="ml-1 font-mono text-xs bg-blue-50 px-1.5 py-0.5 rounded text-blue-800">
                                        {EMISSION_FACTORS.TRANSPORT.PETROL_CAR} kg/km
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-700">Diesel Car:</span>
                                    <span className="ml-1 font-mono text-xs bg-blue-50 px-1.5 py-0.5 rounded text-blue-800">
                                        {EMISSION_FACTORS.TRANSPORT.DIESEL_CAR} kg/km
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-700">Bike/Scooter:</span>
                                    <span className="ml-1 font-mono text-xs bg-blue-50 px-1.5 py-0.5 rounded text-blue-800">
                                        {EMISSION_FACTORS.TRANSPORT.BIKE} kg/km
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-700">Bus:</span>
                                    <span className="ml-1 font-mono text-xs bg-blue-50 px-1.5 py-0.5 rounded text-blue-800">
                                        {EMISSION_FACTORS.TRANSPORT.BUS} kg/km
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Diet */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h5 className="font-semibold text-gray-900 mb-2">🍽️ Diet</h5>
                            <p className="text-sm text-gray-600 mb-2">Annual emissions by diet type:</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-700">Vegan:</span>
                                    <span className="ml-1 font-mono text-xs bg-green-50 px-1.5 py-0.5 rounded text-green-800">
                                        {EMISSION_FACTORS.DIET.VEGAN} kg/year
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-700">Vegetarian:</span>
                                    <span className="ml-1 font-mono text-xs bg-green-50 px-1.5 py-0.5 rounded text-green-800">
                                        {EMISSION_FACTORS.DIET.VEGETARIAN} kg/year
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-700">Mixed:</span>
                                    <span className="ml-1 font-mono text-xs bg-orange-50 px-1.5 py-0.5 rounded text-orange-800">
                                        {EMISSION_FACTORS.DIET.MIXED} kg/year
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-700">Heavy Meat:</span>
                                    <span className="ml-1 font-mono text-xs bg-red-50 px-1.5 py-0.5 rounded text-red-800">
                                        {EMISSION_FACTORS.DIET.HEAVY_NON_VEG} kg/year
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-800 leading-relaxed">
                                <strong>Note:</strong> These are average estimates. Actual emissions may vary based on
                                energy sources, vehicle efficiency, and lifestyle choices. Our calculations are based on
                                research from IPCC, EPA, and Indian environmental agencies.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};
