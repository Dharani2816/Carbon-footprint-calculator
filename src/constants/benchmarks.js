// Benchmarking data and emission factors for carbon footprint calculations

export const BENCHMARKS = {
    // Annual CO₂ emissions in kg
    INDIAN_AVERAGE: 1900,
    GLOBAL_AVERAGE: 4000,
    SUSTAINABLE_TARGET: 1200,
    
    // Impact classification thresholds (kg CO₂/year)
    LOW_IMPACT_THRESHOLD: 1500,
    MEDIUM_IMPACT_THRESHOLD: 2500,
    // Above 2500 is HIGH_IMPACT
};

export const EMISSION_FACTORS = {
    // Electricity: kg CO₂ per kWh
    ELECTRICITY: 0.82,
    
    // Transport: kg CO₂ per km
    TRANSPORT: {
        PETROL_CAR: 0.192,
        DIESEL_CAR: 0.171,
        BIKE: 0.103,
        BUS: 0.027,
        TRAIN: 0.006,
        WALK_CYCLE: 0,
    },
    
    // Flights: kg CO₂ per year
    FLIGHTS: {
        NONE: 0,
        SHORT_1_2: 300,
        MULTIPLE_3_PLUS: 1000,
    },
    
    // Diet: kg CO₂ per year (base values)
    DIET: {
        VEGAN: 700,
        VEGETARIAN: 1000,
        MIXED: 1500,
        HEAVY_NON_VEG: 2500,
    },
    
    // AC Usage: additional kg CO₂ per year
    AC: {
        NO_AC: 0,
        OCCASIONAL: 200,
        REGULAR: 600,
    },
    
    // Shopping: kg CO₂ per year
    SHOPPING: {
        RARELY: 300,
        OCCASIONALLY: 600,
        FREQUENTLY: 1000,
    },
    
    // Waste segregation impact: kg CO₂ per year
    WASTE: {
        YES: -100,  // Reduction
        SOMETIMES: 0,
        NO: 100,    // Increase
    },
};

export const IMPACT_LEVELS = {
    LOW: {
        label: 'Low Impact',
        color: 'green',
        message: 'Excellent! You\'re doing great for the environment.',
        icon: '🌿',
    },
    MEDIUM: {
        label: 'Medium Impact',
        color: 'yellow',
        message: 'Good progress! There\'s room for improvement.',
        icon: '⚠️',
    },
    HIGH: {
        label: 'High Impact',
        color: 'red',
        message: 'Time to take action and reduce your footprint.',
        icon: '🔴',
    },
};

export const getImpactLevel = (total) => {
    if (total <= BENCHMARKS.LOW_IMPACT_THRESHOLD) return 'LOW';
    if (total <= BENCHMARKS.MEDIUM_IMPACT_THRESHOLD) return 'MEDIUM';
    return 'HIGH';
};

export const GOAL_PRESETS = [
    { label: '5% Reduction', value: 5 },
    { label: '10% Reduction', value: 10 },
    { label: '15% Reduction', value: 15 },
    { label: '20% Reduction', value: 20 },
];

// CO₂ savings estimates for common actions (kg CO₂/year)
export const SAVINGS_ESTIMATES = {
    SWITCH_TO_LED: 50,
    REDUCE_AC_USAGE: 200,
    CARPOOL_ONCE_WEEK: 400,
    PUBLIC_TRANSPORT: 800,
    MEATLESS_MONDAY: 250,
    REDUCE_SHOPPING: 300,
    WASTE_SEGREGATION: 100,
    BIKE_SHORT_TRIPS: 150,
};
