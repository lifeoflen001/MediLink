export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  description: string;
  dosage: string;
  uses: string[];
  sideEffects: string[];
  precautions: string[];
  requiresPrescription: boolean;
  minPrice: number;
  maxPrice: number;
  pharmacyCount: number;
  inStock: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  openHours: string;
  isOpen: boolean;
  phone: string;
  hasEmergency: boolean;
}

export interface MedicineAvailability {
  pharmacyId: string;
  price: number;
  inStock: boolean;
  quantity: number;
}

export const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'antibiotic', name: 'Antibiotics' },
  { id: 'antimalarial', name: 'Antimalarial' },
  { id: 'pain', name: 'Pain Relief' },
  { id: 'diabetes', name: 'Diabetes' },
  { id: 'hypertension', name: 'Hypertension' },
  { id: 'respiratory', name: 'Respiratory' },
  { id: 'vitamins', name: 'Vitamins' },
  { id: 'gastro', name: 'Stomach' },
];

export const MEDICINES: Medicine[] = [
  {
    id: '1',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    description:
      'A penicillin-type antibiotic used to treat a wide range of bacterial infections including chest, ear, dental, and urinary infections.',
    dosage: '500mg capsule, taken 3 times daily for 7–10 days',
    uses: ['Chest infections', 'Ear infections', 'Urinary tract infections', 'Dental infections', 'Skin infections'],
    sideEffects: ['Nausea', 'Diarrhea', 'Skin rash', 'Stomach pain', 'Headache'],
    precautions: [
      'Tell your doctor if you are allergic to penicillin',
      'Complete the full course even if you feel better',
      'Can be taken with or without food',
    ],
    requiresPrescription: true,
    minPrice: 350,
    maxPrice: 850,
    pharmacyCount: 18,
    inStock: true,
  },
  {
    id: '2',
    name: 'Artemether-Lumefantrine 80/480mg',
    genericName: 'Artemether-Lumefantrine',
    category: 'Antimalarial',
    description:
      'A combination antimalarial medicine used to treat uncomplicated malaria caused by Plasmodium falciparum.',
    dosage: '4 tablets twice daily for 3 days (adult dose)',
    uses: ['Malaria treatment', 'P. falciparum malaria'],
    sideEffects: ['Headache', 'Dizziness', 'Nausea', 'Vomiting', 'Fatigue', 'Loss of appetite'],
    precautions: [
      'Take with food or a fatty meal for better absorption',
      'Complete the full 3-day course',
      'Not suitable for malaria prevention',
    ],
    requiresPrescription: true,
    minPrice: 450,
    maxPrice: 1200,
    pharmacyCount: 15,
    inStock: true,
  },
  {
    id: '3',
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol / Acetaminophen',
    category: 'Pain Relief',
    description:
      'An analgesic and antipyretic used to relieve mild-to-moderate pain and reduce fever.',
    dosage: '500–1000mg every 4–6 hours as needed. Maximum 4000mg per day.',
    uses: ['Headache', 'Fever', 'Toothache', 'Muscle pain', 'Period pain', 'Cold and flu symptoms'],
    sideEffects: ['Rare when taken correctly', 'Liver damage if overdosed', 'Skin rash in some people'],
    precautions: [
      'Do not exceed the recommended dose',
      'Avoid alcohol',
      'Keep away from children',
      'Check other medicines for paracetamol content',
    ],
    requiresPrescription: false,
    minPrice: 30,
    maxPrice: 120,
    pharmacyCount: 34,
    inStock: true,
  },
  {
    id: '4',
    name: 'Metformin 500mg',
    genericName: 'Metformin Hydrochloride',
    category: 'Diabetes',
    description: 'First-line medication for type 2 diabetes. Helps control blood sugar levels.',
    dosage: '500mg twice daily with meals, may be increased to 1000mg twice daily',
    uses: ['Type 2 diabetes management', 'Blood sugar control', 'Insulin resistance'],
    sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset', 'Metallic taste', 'Loss of appetite'],
    precautions: [
      'Take with meals to reduce stomach side effects',
      'Regular blood sugar monitoring required',
      'Avoid excessive alcohol',
    ],
    requiresPrescription: true,
    minPrice: 120,
    maxPrice: 380,
    pharmacyCount: 22,
    inStock: true,
  },
  {
    id: '5',
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine Besylate',
    category: 'Hypertension',
    description:
      'A calcium channel blocker used to treat high blood pressure and chest pain (angina).',
    dosage: '5mg once daily, may be increased to 10mg once daily',
    uses: ['High blood pressure', 'Angina (chest pain)', 'Coronary artery disease'],
    sideEffects: ['Swollen ankles', 'Headache', 'Flushing', 'Dizziness', 'Fatigue'],
    precautions: [
      'Take at the same time each day',
      'Do not stop suddenly without medical advice',
      'Monitor blood pressure regularly',
      'Avoid grapefruit juice',
    ],
    requiresPrescription: true,
    minPrice: 150,
    maxPrice: 450,
    pharmacyCount: 20,
    inStock: true,
  },
  {
    id: '6',
    name: 'Salbutamol Inhaler 100mcg',
    genericName: 'Salbutamol / Albuterol',
    category: 'Respiratory',
    description:
      'A bronchodilator inhaler used to quickly relieve symptoms of asthma and other breathing conditions.',
    dosage: '1–2 puffs as needed. Max 8 puffs per day.',
    uses: ['Asthma attacks', 'Bronchospasm', 'COPD', 'Exercise-induced breathing problems'],
    sideEffects: ['Trembling', 'Headache', 'Fast heartbeat', 'Muscle cramps', 'Dizziness'],
    precautions: [
      'Keep inhaler with you at all times',
      'Shake before use',
      'Rinse mouth after use',
      'Replace when dose counter reaches zero',
    ],
    requiresPrescription: true,
    minPrice: 280,
    maxPrice: 650,
    pharmacyCount: 16,
    inStock: true,
  },
  {
    id: '7',
    name: 'Vitamin C 1000mg',
    genericName: 'Ascorbic Acid',
    category: 'Vitamins',
    description:
      'An essential vitamin that supports immune function, skin health, and wound healing.',
    dosage: '1000mg once daily with or after food',
    uses: ['Immune support', 'Cold prevention', 'Antioxidant', 'Wound healing', 'Iron absorption'],
    sideEffects: ['Stomach upset if taken on empty stomach', 'Diarrhea at high doses'],
    precautions: [
      'Take with food to minimize stomach upset',
      'Avoid doses over 2000mg daily',
    ],
    requiresPrescription: false,
    minPrice: 80,
    maxPrice: 250,
    pharmacyCount: 28,
    inStock: true,
  },
  {
    id: '8',
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    category: 'Stomach',
    description:
      'A proton pump inhibitor that reduces stomach acid, used for heartburn and ulcers.',
    dosage: '20mg once daily before breakfast for 4–8 weeks',
    uses: ['Acid reflux', 'Stomach ulcers', 'Heartburn', 'H. pylori infection', 'GERD'],
    sideEffects: ['Headache', 'Nausea', 'Diarrhea', 'Stomach pain', 'Dizziness'],
    precautions: [
      'Take before eating',
      'Do not crush or chew capsules',
      'Long-term use needs medical supervision',
    ],
    requiresPrescription: false,
    minPrice: 90,
    maxPrice: 320,
    pharmacyCount: 25,
    inStock: true,
  },
];

export const PHARMACIES: Pharmacy[] = [
  {
    id: '1',
    name: 'Goodlife Pharmacy',
    address: 'Westlands Road, Nairobi',
    distance: 0.3,
    rating: 4.8,
    reviewCount: 342,
    openHours: '7:00 AM – 10:00 PM',
    isOpen: true,
    phone: '+254 20 123 4567',
    hasEmergency: true,
  },
  {
    id: '2',
    name: 'Haltons Pharmacy',
    address: 'Sarit Centre, Westlands',
    distance: 0.7,
    rating: 4.6,
    reviewCount: 218,
    openHours: '8:00 AM – 9:00 PM',
    isOpen: true,
    phone: '+254 20 234 5678',
    hasEmergency: false,
  },
  {
    id: '3',
    name: 'Medplus Pharmacy',
    address: 'Kenyatta Avenue, CBD',
    distance: 1.2,
    rating: 4.5,
    reviewCount: 156,
    openHours: '8:00 AM – 8:00 PM',
    isOpen: true,
    phone: '+254 20 345 6789',
    hasEmergency: true,
  },
  {
    id: '4',
    name: 'Skylight Pharmacy',
    address: 'Karen Shopping Centre',
    distance: 2.1,
    rating: 4.7,
    reviewCount: 289,
    openHours: '9:00 AM – 9:00 PM',
    isOpen: true,
    phone: '+254 20 456 7890',
    hasEmergency: false,
  },
  {
    id: '5',
    name: 'Alpha Pharmacy',
    address: 'Ngong Road, Kilimani',
    distance: 2.8,
    rating: 4.3,
    reviewCount: 98,
    openHours: '8:00 AM – 10:00 PM',
    isOpen: true,
    phone: '+254 20 567 8901',
    hasEmergency: true,
  },
  {
    id: '6',
    name: 'Wellcome Pharmacy',
    address: 'Mombasa Road, Industrial Area',
    distance: 3.5,
    rating: 4.4,
    reviewCount: 174,
    openHours: '7:30 AM – 9:30 PM',
    isOpen: false,
    phone: '+254 20 678 9012',
    hasEmergency: false,
  },
];

export const MEDICINE_AVAILABILITY: Record<string, MedicineAvailability[]> = {
  '1': [
    { pharmacyId: '1', price: 450, inStock: true, quantity: 50 },
    { pharmacyId: '2', price: 380, inStock: true, quantity: 30 },
    { pharmacyId: '3', price: 420, inStock: false, quantity: 0 },
    { pharmacyId: '4', price: 500, inStock: true, quantity: 80 },
  ],
  '2': [
    { pharmacyId: '1', price: 850, inStock: true, quantity: 20 },
    { pharmacyId: '3', price: 780, inStock: true, quantity: 15 },
    { pharmacyId: '5', price: 900, inStock: true, quantity: 10 },
  ],
  '3': [
    { pharmacyId: '1', price: 45, inStock: true, quantity: 200 },
    { pharmacyId: '2', price: 35, inStock: true, quantity: 150 },
    { pharmacyId: '3', price: 40, inStock: true, quantity: 100 },
    { pharmacyId: '4', price: 50, inStock: true, quantity: 300 },
    { pharmacyId: '5', price: 38, inStock: true, quantity: 80 },
  ],
  '4': [
    { pharmacyId: '2', price: 180, inStock: true, quantity: 60 },
    { pharmacyId: '4', price: 220, inStock: true, quantity: 40 },
  ],
  '5': [
    { pharmacyId: '1', price: 280, inStock: true, quantity: 35 },
    { pharmacyId: '3', price: 250, inStock: true, quantity: 20 },
    { pharmacyId: '5', price: 300, inStock: false, quantity: 0 },
  ],
};

export const QUICK_SUGGESTIONS = [
  'I have had a fever for 3 days',
  'How do I take Amoxicillin?',
  'What are malaria symptoms?',
  'Is this safe during pregnancy?',
];
