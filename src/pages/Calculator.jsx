import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Zap, Car, Utensils, ShoppingBag, ChevronRight, ChevronLeft, CheckCircle, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { footprintApi } from '../api/footprintApi';

const Calculator = () => {
    // const { history, addToHistory } = useAuth(); // Removed as per refactor
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
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

    const generateRecommendations = (breakdown) => {
        const recommendations = [];

        // Energy
        if (breakdown.electricity > 1000) {
            recommendations.push({
                category: 'Energy',
                text: 'Switch to LED bulbs and energy-efficient appliances to reduce electricity consumption.',
                icon: Zap
            });
        }

        // Transport
        if (breakdown.transport > 1200) {
            recommendations.push({
                category: 'Transport',
                text: 'Consider carpooling, using public transport, or cycling for short distances.',
                icon: Car
            });
        }

        // Diet
        if (breakdown.diet > 1500) {
            recommendations.push({
                category: 'Diet',
                text: 'Try participating in "Meatless Mondays" or incorporating more plant-based meals.',
                icon: Utensils
            });
        }

        // Lifestyle
        if (breakdown.lifestyle > 800) {
            recommendations.push({
                category: 'Lifestyle',
                text: 'Reduce shopping frequency and practice the 3Rs: Reduce, Reuse, Recycle.',
                icon: ShoppingBag
            });
        }

        // Fallback
        if (recommendations.length === 0) {
            recommendations.push({
                category: 'General',
                text: 'Great job! Keep maintaining your eco-friendly habits.',
                icon: Lightbulb
            });
        }

        return recommendations;
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-yellow-100 p-2 rounded-full">
                    <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Step 1: Home Energy</h3>
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
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-100 p-2 rounded-full">
                    <Car className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Step 2: Transport</h3>
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
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-green-100 p-2 rounded-full">
                    <Utensils className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Step 3: Diet & Lifestyle</h3>
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
        return (
            <div className="space-y-8 animate-fadeIn">
                <div className="text-center">
                    <div className="inline-block bg-primary-100 p-4 rounded-full mb-4">
                        <CheckCircle className="w-12 h-12 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Calculation Complete!</h3>
                    <p className="text-gray-600 mt-2">Here is your estimated annual carbon footprint.</p>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-xl p-8 text-center shadow-sm">
                    <p className="text-sm font-medium text-primary-600 uppercase tracking-wider">Total Annual Emissions</p>
                    <div className="mt-2 flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-extrabold text-gray-900">{Math.round(result.total).toLocaleString()}</span>
                        <span className="text-xl text-gray-500 font-medium">kg CO₂</span>
                    </div>
                    {result.comparison && (
                        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${result.comparison.isIncrease ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {result.comparison.isIncrease ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {result.comparison.percentChange}% {result.comparison.isIncrease ? 'increase' : 'decrease'} from last time
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            Recommendations
                        </h4>
                        <div className="space-y-3">
                            {result.recommendations.map((rec, index) => (
                                <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg flex gap-3 shadow-sm">
                                    <div className="bg-gray-50 p-2 rounded-lg h-fit">
                                        <rec.icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{rec.category}</p>
                                        <p className="text-sm text-gray-600 mt-1">{rec.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Breakdown</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 flex items-center gap-2"><Zap className="w-4 h-4" /> Home Energy</span>
                                <span className="font-medium text-gray-900">{Math.round(result.breakdown.electricity)} kg</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 flex items-center gap-2"><Car className="w-4 h-4" /> Transport</span>
                                <span className="font-medium text-gray-900">{Math.round(result.breakdown.transport)} kg</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 flex items-center gap-2"><Utensils className="w-4 h-4" /> Diet</span>
                                <span className="font-medium text-gray-900">{Math.round(result.breakdown.diet)} kg</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Lifestyle</span>
                                <span className="font-medium text-gray-900">{Math.round(result.breakdown.lifestyle)} kg</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const calculation = calculateFootprint(formData);

            // Fetch latest history for comparison
            const latestRecord = await footprintApi.getLatestFootprint();

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

            const recommendations = generateRecommendations(calculation.breakdown);

            const finalResult = {
                ...calculation,
                comparison,
                recommendations
            };

            // Save to API
            await footprintApi.saveFootprint(finalResult);

            setResult(finalResult);
            nextStep(); // Move to result step (Step 4)
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Calculation failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-500">Step {currentStep} of 4</span>
                <span className="text-sm font-medium text-primary-600">{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
            </div>

            <Card className="min-h-[400px] flex flex-col justify-center">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderResults()}

                {currentStep < 4 && (
                    <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={currentStep === 1 ? 'invisible' : ''}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>

                        {currentStep === 3 ? (
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Calculating...' : 'See Results'}
                            </Button>
                        ) : (
                            <Button onClick={nextStep}>
                                Next <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Calculator;
