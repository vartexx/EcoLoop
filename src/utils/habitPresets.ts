export interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'diet' | 'waste';
  points: number;
  offset: number; // in kg CO2e saved per day
  completed: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon identifier
  unlockedAtPoints: number;
}

export const HABIT_PRESETS: Habit[] = [
  {
    id: 'reusable-bottle',
    title: 'Refill & Re-use',
    description: 'Ditched single-use plastic bottles/cups today.',
    category: 'waste',
    points: 10,
    offset: 0.5,
    completed: false,
  },
  {
    id: 'public-transit',
    title: 'Transit Trailblazer',
    description: 'Commuted by bus, train, or subway instead of driving.',
    category: 'transport',
    points: 30,
    offset: 5.0,
    completed: false,
  },
  {
    id: 'vegan-meal',
    title: 'Green Gourmet',
    description: 'Ate a fully plant-based meal today.',
    category: 'diet',
    points: 20,
    offset: 2.5,
    completed: false,
  },
  {
    id: 'unplug-standby',
    title: 'Vampire Slayer',
    description: 'Unplugged idle chargers, appliances, and devices.',
    category: 'energy',
    points: 10,
    offset: 0.8,
    completed: false,
  },
  {
    id: 'line-dry',
    title: 'Solar Dried Clothes',
    description: 'Air-dried laundry instead of using a heated dryer tumble.',
    category: 'energy',
    points: 15,
    offset: 1.2,
    completed: false,
  },
  {
    id: 'carpool-bike',
    title: 'Pedal Power',
    description: 'Walked, cycled, or carpooled for short distances.',
    category: 'transport',
    points: 25,
    offset: 3.5,
    completed: false,
  },
  {
    id: 'compost-waste',
    title: 'Zero-Waste Hero',
    description: 'Composted kitchen scraps and avoided food waste.',
    category: 'waste',
    points: 15,
    offset: 1.0,
    completed: false,
  },
  {
    id: 'thermostat-tweak',
    title: 'Climate Control',
    description: 'Adjusted thermostat by 1-2°C to reduce heating or cooling energy.',
    category: 'energy',
    points: 20,
    offset: 2.0,
    completed: false,
  }
];

export const BADGES: Badge[] = [
  {
    id: 'green-novice',
    title: 'Eco Beginner',
    description: 'Earn 30 Eco Points. Starting a green journey!',
    icon: 'Leaf',
    unlockedAtPoints: 30,
  },
  {
    id: 'carbon-cutter',
    title: 'Carbon Cutter',
    description: 'Earn 80 Eco Points. Actively trimming your emissions footprint.',
    icon: 'TrendingDown',
    unlockedAtPoints: 80,
  },
  {
    id: 'climate-hero',
    title: 'Climate Champion',
    description: 'Earn 150 Eco Points. Consistently selecting eco-friendly transit & energy solutions.',
    icon: 'Shield',
    unlockedAtPoints: 150,
  },
  {
    id: 'earth-guardian',
    title: 'Earth Guardian',
    description: 'Earn 250 Eco Points. Mastered the low-carbon lifestyle!',
    icon: 'Globe',
    unlockedAtPoints: 250,
  }
];
