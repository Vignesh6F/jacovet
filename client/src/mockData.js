export const initialClinics = [
  { id: 'clinic-1', name: 'Madurai Pet Care Center', location: 'Anna Nagar, Madurai', rating: 4.8 },
  { id: 'clinic-2', name: 'Temple City Veterinary Clinic', location: 'K.K. Nagar, Madurai', rating: 4.6 },
  { id: 'clinic-3', name: 'JacoVet Specialty Hospital', location: 'Madurai Junction, Madurai', rating: 4.9 }
];

export const initialVets = [
  {
    id: 'vet-1',
    name: 'Dr. Sarah Connor',
    specialty: 'Surgery & General Medicine',
    experience: '12 years',
    rating: 4.9,
    reviewsCount: 3,
    price: 650,
    clinicId: 'clinic-1',
    location: 'Anna Nagar, Madurai',
    lat: 9.9272,
    lng: 78.1438,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    bio: 'Specialist in small animal soft tissue surgeries and preventive medicine. Dedicated to offering compassionate care to dogs and cats.',
    categories: ['Dog', 'Cat'],
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
    plan: 'FreeStarter',
    reviews: [
      { id: 'rev-1', author: 'Vikram Singh', rating: 5, comment: 'Dr. Sarah performed surgery on my retriever\'s leg. She was amazing, explained everything clearly, and the recovery was extremely smooth!', date: '2026-06-28' },
      { id: 'rev-2', author: 'Ananya Rao', rating: 5, comment: 'Very professional clinic and super gentle with cats. Highly recommend.', date: '2026-07-01' },
      { id: 'rev-3', author: 'Karan Malhotra', rating: 4, comment: 'Great clinic, minimal wait time. Good diagnostic advice.', date: '2026-07-04' }
    ]
  },
  {
    id: 'vet-2',
    name: 'Dr. Rajesh Patel',
    specialty: 'Feline Specialist & Dentistry',
    experience: '8 years',
    rating: 4.5,
    reviewsCount: 2,
    price: 550,
    clinicId: 'clinic-2',
    location: 'K.K. Nagar, Madurai',
    lat: 9.9295,
    lng: 78.1565,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    bio: 'Passionate about feline behavior, medicine, and advanced veterinary dentistry. Over 8 years of specialized clinic experience.',
    categories: ['Cat'],
    availability: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
    slots: ['10:00 AM', '11:30 AM', '01:00 PM', '03:30 PM', '05:00 PM', '06:00 PM'],
    plan: 'ProPremium',
    reviews: [
      { id: 'rev-4', author: 'Meera Nair', rating: 4, comment: 'Luna is normally very aggressive at the vet, but Dr. Rajesh managed her dental cleaning beautifully. Thanks!', date: '2026-06-20' },
      { id: 'rev-5', author: 'Siddharth Das', rating: 5, comment: 'Outstanding kitty dental care. Smelly breath problem is completely gone now.', date: '2026-06-25' }
    ]
  },
  {
    id: 'vet-3',
    name: 'Dr. Emily Watson',
    specialty: 'Avian & Exotic Animals',
    experience: '15 years',
    rating: 5.0,
    reviewsCount: 2,
    price: 800,
    clinicId: 'clinic-3',
    location: 'Madurai Junction, Madurai',
    lat: 9.9192,
    lng: 78.1120,
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&q=80',
    bio: 'One of the leading specialists in exotic pets, birds, and reptiles in the city. Certified member of the Association of Avian Veterinarians.',
    categories: ['Bird', 'Exotic'],
    availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    slots: ['09:30 AM', '11:00 AM', '12:30 PM', '03:00 PM', '04:30 PM'],
    plan: 'ClinicGrowth',
    reviews: [
      { id: 'rev-6', author: 'Sunita Krishnan', rating: 5, comment: 'Very hard to find a good vet for parrots in Madurai. Dr. Emily is a blessing! She handled my green conure with extreme care.', date: '2026-07-02' },
      { id: 'rev-7', author: 'Aditya Sen', rating: 5, comment: 'The absolute best doctor for turtles and reptiles. Extremely knowledgeable.', date: '2026-07-05' }
    ]
  }
];

export const initialPets = [
  {
    id: 'PET-782',
    name: 'Rocky',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    dob: '2024-04-12',
    weight: '28.5 kg',
    color: 'Golden',
    microchip: 'MC-98218-A',
    bloodGroup: 'DEA 1.1',
    allergies: 'Penicillin, Soy proteins',
    emergencyContact: '+91 98451 23456',
    ownerEmail: 'owner@jacovet.com',
    insurance: 'HDFC PetProtect - Active'
  },
  {
    id: 'PET-291',
    name: 'Kiwi',
    species: 'Bird',
    breed: 'Green Conure',
    gender: 'Female',
    dob: '2025-06-01',
    weight: '0.12 kg',
    color: 'Green / Yellow',
    microchip: 'N/A',
    bloodGroup: 'Unknown',
    allergies: 'None',
    emergencyContact: '+91 98451 23456',
    ownerEmail: 'owner@jacovet.com',
    insurance: 'None'
  }
];

export const initialMedicalRecords = [
  {
    id: 'REC-101',
    petId: 'PET-782',
    doctorId: 'vet-1',
    doctorName: 'Dr. Sarah Connor',
    clinicName: 'Madurai Pet Care Center',
    visitDate: '2026-01-15',
    type: 'Vaccination',
    chiefComplaint: 'Scheduled annual vaccination booster checkup.',
    vitals: { temp: '101.5 °F', weight: '27.8 kg', heartRate: '92 bpm' },
    diagnosis: 'Healthy adult Golden Retriever. All physical vitals are within normal range.',
    notes: 'Administered annual DHPP vaccination. Tolerated well. No immediate allergic symptoms observed.',
    prescriptions: [],
    vaccinations: [
      { name: 'DHPP Booster', batch: 'DH-8902-X', manufacturer: 'Zoetis', dateGiven: '2026-01-15', dueDate: '2027-01-15' }
    ],
    followUpDate: ''
  },
  {
    id: 'REC-102',
    petId: 'PET-782',
    doctorId: 'vet-1',
    doctorName: 'Dr. Sarah Connor',
    clinicName: 'Madurai Pet Care Center',
    visitDate: '2026-03-20',
    type: 'Checkup',
    chiefComplaint: 'Mild itching in the left ear.',
    vitals: { temp: '102.1 °F', weight: '28.2 kg', heartRate: '98 bpm' },
    diagnosis: 'Mild otitis externa (ear canal irritation). No ear mites detected.',
    notes: 'Cleaned ear canal with antiseptic solution. Instilled ear drops. Owner instructed to apply twice daily.',
    prescriptions: [
      { name: 'Otomax Ear Drops', dosage: '4 drops in left ear', morning: true, afternoon: false, night: true, days: 7, notes: 'Apply after cleaning the ear' }
    ],
    vaccinations: [],
    followUpDate: '2026-03-27'
  },
  {
    id: 'REC-103',
    petId: 'PET-291',
    doctorId: 'vet-3',
    doctorName: 'Dr. Emily Watson',
    clinicName: 'JacoVet Specialty Hospital',
    visitDate: '2026-07-02',
    type: 'Checkup',
    chiefComplaint: 'Wing feather damage, checking for stress or mites.',
    vitals: { temp: '104.2 °F', weight: '0.12 kg', heartRate: '280 bpm' },
    diagnosis: 'Mild wing damage due to cage rubbing. No mites detected.',
    notes: 'Feather shaft is intact. Suspect mild stress molting. Recommended vitamin supplements and cage size enlargement.',
    prescriptions: [
      { name: 'PetVit Avian Supplement', dosage: '3 drops in drinking water', morning: true, afternoon: false, night: false, days: 14, notes: 'Replace drinking water daily' }
    ],
    vaccinations: [],
    followUpDate: ''
  }
];

export const initialAppointments = [
  {
    id: 'appt-1',
    vetId: 'vet-1',
    vetName: 'Dr. Sarah Connor',
    vetSpecialty: 'Surgery & General Medicine',
    ownerEmail: 'owner@jacovet.com',
    petId: 'PET-782',
    petName: 'Rocky',
    petCategory: 'Dog',
    petBreed: 'Golden Retriever',
    petAge: '2 years',
    date: '2026-07-10',
    time: '11:00 AM',
    reason: 'Annual vaccination booster and general checkup.',
    status: 'upcoming',
    notes: '',
    prescription: '',
    billed: false,
    billAmount: 0
  },
  {
    id: 'appt-2',
    vetId: 'vet-3',
    vetName: 'Dr. Emily Watson',
    vetSpecialty: 'Avian & Exotic Animals',
    ownerEmail: 'owner@jacovet.com',
    petId: 'PET-291',
    petName: 'Kiwi',
    petCategory: 'Bird',
    petBreed: 'Green Conure',
    petAge: '1 year',
    date: '2026-07-02',
    time: '03:00 PM',
    reason: 'Slight wing feather damage, checking for mites.',
    status: 'completed',
    notes: 'Examined Kiwi. Feather structure is fine. Mild stress molt suspected. Advised vitamin supplements in water.',
    prescription: '1. PetVit Avian Drops: 3 drops daily in drinking water for 14 days.',
    billed: true,
    billAmount: 800
  }
];

export const initialAuditLogs = [
  { id: 'LOG-001', timestamp: '2026-07-07T09:12:00Z', user: 'system', role: 'System', action: 'Initialize Database', details: 'Pre-populated initial clinic registry and credentials.' },
  { id: 'LOG-002', timestamp: '2026-07-07T09:14:30Z', user: 'Dr. Sarah Connor', role: 'Veterinarian', action: 'Record Access', details: 'Accessed history folder for Pet ID: PET-782.' },
  { id: 'LOG-003', timestamp: '2026-07-07T09:15:10Z', user: 'owner@jacovet.com', role: 'Pet Owner', action: 'Create Appointment', details: 'Booked consultation session for Rocky with Dr. Connor.' }
];

export const petCategories = [
  { name: 'All Specialties', icon: '🩺' },
  { name: 'Dog', icon: '🐕' },
  { name: 'Cat', icon: '🐈' },
  { name: 'Bird', icon: '🦜' },
  { name: 'Exotic', icon: '🦎' }
];

export const subscriptionPlans = [
  {
    name: 'FreeStarter',
    price: 0,
    billing: 'forever',
    description: 'Perfect for new practices getting started.',
    features: [
      'Manage up to 10 appointments/mo',
      'Standard search directory index',
      'Basic clinic profile details',
      'Standard email notifications'
    ],
    badge: 'Standard'
  },
  {
    name: 'ClinicGrowth',
    price: 1499,
    billing: 'month',
    description: 'Designed for expanding veterinary clinics.',
    features: [
      'Manage up to 150 appointments/mo',
      'Priority rank in search directory',
      'Highlight specialty species',
      'Auto-SMS confirmation notifications',
      'Standard analytics report'
    ],
    badge: 'Growth'
  },
  {
    name: 'ProPremium',
    price: 3499,
    billing: 'month',
    description: 'For busy clinics needing full priority visibility.',
    features: [
      'Unlimited client bookings',
      'Top-tier ranking in local searches',
      'Gold partner verification badge',
      'Full clinical records PDF exporter',
      'Priority live chat support',
      'Daily automated reminders'
    ],
    badge: 'Pro'
  }
];
