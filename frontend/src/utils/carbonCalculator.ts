export interface CarbonCalculatorInputs {
  // Transport
  petrolCarKm: number; // km per year
  electricCarKm: number; // km per year
  publicTransitKm: number; // km per year
  shortFlights: number; // flights per year
  longFlights: number; // flights per year

  // Energy
  electricityKwh: number; // monthly kWh
  heatingSource: 'gas' | 'oil' | 'electricity' | 'biomass' | 'none';
  heatingKwh: number; // monthly kWh (or litres for oil)
  hasSolar: boolean;

  // Diet & Waste
  dietType: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan';
  recycles: boolean;
  foodWaste: 'low' | 'medium' | 'high';
}

export interface CarbonFootprintResult {
  transport: number;
  energy: number;
  diet: number;
  waste: number;
  total: number;
}

export const EMISSION_FACTORS = {
  // Transport (kg CO2e per km)
  petrolCar: 0.17,
  electricCar: 0.05,
  publicTransit: 0.03,
  
  // Flights (kg CO2e per flight)
  shortFlight: 150,
  longFlight: 1000,

  // Energy (kg CO2e per kWh / unit)
  electricityKwh: 0.4, // Grid average
  electricitySolarOffset: -0.35, // Offset deduction if they have solar panels
  heatingGas: 0.18, // per kWh
  heatingOil: 2.68, // per litre
  heatingBiomass: 0.02, // per kWh
  heatingElectricity: 0.4, // standard grid electricity

  // Diet (kg CO2e per year)
  diet: {
    'meat-heavy': 2800,
    'average': 2000,
    'vegetarian': 1300,
    'vegan': 900,
  },

  // Waste & Recycling (kg CO2e per year)
  waste: {
    recycles: 150,
    noRecycle: 500,
    foodWasteLow: 100,
    foodWasteMedium: 250,
    foodWasteHigh: 400,
  }
};

export const BENCHMARKS = {
  globalAverage: 5000,
  nationalAverage: 15000,
  targetSustainable: 2000,
};

export const DEFAULT_INPUTS: CarbonCalculatorInputs = {
  petrolCarKm: 8000,
  electricCarKm: 0,
  publicTransitKm: 2000,
  shortFlights: 2,
  longFlights: 0,
  electricityKwh: 350,
  heatingSource: 'gas',
  heatingKwh: 400,
  hasSolar: false,
  dietType: 'average',
  recycles: true,
  foodWaste: 'medium'
};

export function calculateCarbonFootprint(inputs: CarbonCalculatorInputs): CarbonFootprintResult {
  // 1. Transport
  const transport = 
    (inputs.petrolCarKm * EMISSION_FACTORS.petrolCar) +
    (inputs.electricCarKm * EMISSION_FACTORS.electricCar) +
    (inputs.publicTransitKm * EMISSION_FACTORS.publicTransit) +
    (inputs.shortFlights * EMISSION_FACTORS.shortFlight) +
    (inputs.longFlights * EMISSION_FACTORS.longFlight);

  // 2. Energy (convert monthly inputs to annual by multiplying by 12)
  let electricityFactor = EMISSION_FACTORS.electricityKwh;
  if (inputs.hasSolar) {
    electricityFactor += EMISSION_FACTORS.electricitySolarOffset; // net 0.05 kg CO2e per kWh
  }
  const electricityAnnual = inputs.electricityKwh * 12 * electricityFactor;

  let heatingAnnual = 0;
  if (inputs.heatingSource === 'gas') {
    heatingAnnual = inputs.heatingKwh * 12 * EMISSION_FACTORS.heatingGas;
  } else if (inputs.heatingSource === 'oil') {
    heatingAnnual = inputs.heatingKwh * 12 * EMISSION_FACTORS.heatingOil;
  } else if (inputs.heatingSource === 'electricity') {
    heatingAnnual = inputs.heatingKwh * 12 * EMISSION_FACTORS.heatingElectricity;
  } else if (inputs.heatingSource === 'biomass') {
    heatingAnnual = inputs.heatingKwh * 12 * EMISSION_FACTORS.heatingBiomass;
  }

  const energy = Math.max(0, electricityAnnual + heatingAnnual);

  // 3. Diet
  const diet = EMISSION_FACTORS.diet[inputs.dietType] || EMISSION_FACTORS.diet.average;

  // 4. Waste
  const recycleCost = inputs.recycles ? EMISSION_FACTORS.waste.recycles : EMISSION_FACTORS.waste.noRecycle;
  let foodWasteCost = EMISSION_FACTORS.waste.foodWasteMedium;
  if (inputs.foodWaste === 'low') {
    foodWasteCost = EMISSION_FACTORS.waste.foodWasteLow;
  } else if (inputs.foodWaste === 'high') {
    foodWasteCost = EMISSION_FACTORS.waste.foodWasteHigh;
  }
  const waste = recycleCost + foodWasteCost;

  const total = transport + energy + diet + waste;

  return {
    transport: Math.round(transport),
    energy: Math.round(energy),
    diet: Math.round(diet),
    waste: Math.round(waste),
    total: Math.round(total)
  };
}
