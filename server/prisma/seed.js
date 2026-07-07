const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding JacoVet database...');

  // 1. Clear database
  await prisma.auditLog.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.vet.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default passwords
  const ownerHash = await bcrypt.hash('owner123', 10);
  const doctorHash = await bcrypt.hash('doctor123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);
  const superHash = await bcrypt.hash('super123', 10);

  // 3. Create Users
  const userOwner = await prisma.user.create({
    data: { email: 'owner@jacovet.com', password: ownerHash, role: 'owner' }
  });
  const userDoctor = await prisma.user.create({
    data: { email: 'doctor@jacovet.com', password: doctorHash, role: 'doctor' }
  });
  const userAdmin = await prisma.user.create({
    data: { email: 'admin@jacovet.com', password: adminHash, role: 'admin' }
  });
  const userSuper = await prisma.user.create({
    data: { email: 'super@jacovet.com', password: superHash, role: 'super-admin' }
  });

  // 4. Create Owners
  const ownerVignesh = await prisma.owner.create({
    data: {
      name: 'Vignesh',
      userId: userOwner.id
    }
  });

  // 5. Create Clinics
  const clinic1 = await prisma.clinic.create({
    data: { id: 'clinic-1', name: 'Madurai Pet Care Center', location: 'Anna Nagar, Madurai', rating: 4.8 }
  });
  const clinic2 = await prisma.clinic.create({
    data: { id: 'clinic-2', name: 'Temple City Veterinary Clinic', location: 'K.K. Nagar, Madurai', rating: 4.6 }
  });
  const clinic3 = await prisma.clinic.create({
    data: { id: 'clinic-3', name: 'JacoVet Specialty Hospital', location: 'Madurai Junction, Madurai', rating: 4.9 }
  });

  // 6. Create Vets
  const vet1 = await prisma.vet.create({
    data: {
      id: 'vet-1',
      name: 'Dr. Sarah Connor',
      specialty: 'Surgery & General Medicine',
      experience: '12 years',
      rating: 4.9,
      price: 650,
      clinicId: clinic1.id,
      location: 'Anna Nagar, Madurai',
      lat: 9.9272,
      lng: 78.1438,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      bio: 'Specialist in small animal soft tissue surgeries and preventive medicine. Dedicated to offering compassionate care to dogs and cats.',
      categories: 'Dog,Cat',
      plan: 'FreeStarter',
      userId: userDoctor.id
    }
  });

  const vet2 = await prisma.vet.create({
    data: {
      id: 'vet-2',
      name: 'Dr. Rajesh Patel',
      specialty: 'Feline Specialist & Dentistry',
      experience: '8 years',
      rating: 4.5,
      price: 550,
      clinicId: clinic2.id,
      location: 'K.K. Nagar, Madurai',
      lat: 9.9295,
      lng: 78.1565,
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      bio: 'Passionate about feline behavior, medicine, and advanced veterinary dentistry. Over 8 years of specialized clinic experience.',
      categories: 'Cat',
      plan: 'ProPremium',
      userId: (await prisma.user.create({ data: { email: 'rajesh@jacovet.com', password: doctorHash, role: 'doctor' } })).id
    }
  });

  const vet3 = await prisma.vet.create({
    data: {
      id: 'vet-3',
      name: 'Dr. Emily Watson',
      specialty: 'Avian & Exotic Animals',
      experience: '15 years',
      rating: 5.0,
      price: 800,
      clinicId: clinic3.id,
      location: 'Madurai Junction, Madurai',
      lat: 9.9192,
      lng: 78.1120,
      image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&q=80',
      bio: 'One of the leading specialists in exotic pets, birds, and reptiles in the city. Certified member of the Association of Avian Veterinarians.',
      categories: 'Bird,Exotic',
      plan: 'ClinicGrowth',
      userId: (await prisma.user.create({ data: { email: 'emily@jacovet.com', password: doctorHash, role: 'doctor' } })).id
    }
  });

  // 7. Create Pets
  const petRocky = await prisma.pet.create({
    data: {
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
      insurance: 'HDFC PetProtect - Active',
      ownerId: ownerVignesh.id
    }
  });

  const petKiwi = await prisma.pet.create({
    data: {
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
      insurance: 'None',
      ownerId: ownerVignesh.id
    }
  });

  // 8. Create Medical Records
  await prisma.medicalRecord.create({
    data: {
      id: 'REC-101',
      petId: petRocky.id,
      doctorId: vet1.id,
      doctorName: vet1.name,
      clinicName: clinic1.name,
      visitDate: '2026-01-15',
      type: 'Vaccination',
      chiefComplaint: 'Scheduled annual vaccination booster checkup.',
      temp: '101.5 °F',
      weight: '27.8 kg',
      heartRate: '92 bpm',
      diagnosis: 'Healthy adult Golden Retriever. All physical vitals are within normal range.',
      notes: 'Administered annual DHPP vaccination. Tolerated well. No immediate allergic symptoms observed.',
      prescriptions: '[]',
      vaccinations: JSON.stringify([
        {
          name: 'DHPP Booster',
          batch: 'DH-8902-X',
          manufacturer: 'Zoetis',
          dateGiven: '2026-01-15',
          dueDate: '2027-01-15'
        }
      ]),
      followUpDate: ''
    }
  });

  await prisma.medicalRecord.create({
    data: {
      id: 'REC-102',
      petId: petRocky.id,
      doctorId: vet1.id,
      doctorName: vet1.name,
      clinicName: clinic1.name,
      visitDate: '2026-03-20',
      type: 'Checkup',
      chiefComplaint: 'Mild itching in the left ear.',
      temp: '102.1 °F',
      weight: '28.2 kg',
      heartRate: '98 bpm',
      diagnosis: 'Mild otitis externa (ear canal irritation). No ear mites detected.',
      notes: 'Cleaned ear canal with antiseptic solution. Instilled ear drops. Owner instructed to apply twice daily.',
      prescriptions: JSON.stringify([
        {
          name: 'Otomax Ear Drops',
          dosage: '4 drops in left ear',
          morning: true,
          afternoon: false,
          night: true,
          days: 7,
          notes: 'Apply after cleaning the ear'
        }
      ]),
      vaccinations: '[]',
      followUpDate: '2026-03-27'
    }
  });

  await prisma.medicalRecord.create({
    data: {
      id: 'REC-103',
      petId: petKiwi.id,
      doctorId: vet3.id,
      doctorName: vet3.name,
      clinicName: clinic3.name,
      visitDate: '2026-07-02',
      type: 'Checkup',
      chiefComplaint: 'Wing feather damage, checking for stress or mites.',
      temp: '104.2 °F',
      weight: '0.12 kg',
      heartRate: '280 bpm',
      diagnosis: 'Mild wing damage due to cage rubbing. No mites detected.',
      notes: 'Feather shaft is intact. Suspect mild stress molting. Recommended vitamin supplements and cage size enlargement.',
      prescriptions: JSON.stringify([
        {
          name: 'PetVit Avian Supplement',
          dosage: '3 drops in drinking water',
          morning: true,
          afternoon: false,
          night: false,
          days: 14,
          notes: 'Replace drinking water daily'
        }
      ]),
      vaccinations: '[]',
      followUpDate: ''
    }
  });

  // 9. Create Appointments
  await prisma.appointment.create({
    data: {
      id: 'appt-1',
      vetId: vet1.id,
      petId: petRocky.id,
      ownerEmail: 'owner@jacovet.com',
      date: '2026-07-10',
      time: '11:00 AM',
      reason: 'Annual vaccination booster and general checkup.',
      status: 'upcoming',
      notes: '',
      prescription: '',
      billed: false,
      billAmount: 0
    }
  });

  await prisma.appointment.create({
    data: {
      id: 'appt-2',
      vetId: vet3.id,
      petId: petKiwi.id,
      ownerEmail: 'owner@jacovet.com',
      date: '2026-07-02',
      time: '03:00 PM',
      reason: 'Slight wing feather damage, checking for mites.',
      status: 'completed',
      notes: 'Examined Kiwi. Feather structure is fine. Mild stress molt suspected. Advised vitamin supplements in water.',
      prescription: 'PetVit Avian Drops: 3 drops daily in drinking water for 14 days.',
      billed: true,
      billAmount: 800
    }
  });

  // 10. Create Inventory Items
  await prisma.inventoryItem.createMany({
    data: [
      { id: 'inv-1', name: 'DHPP Booster Vaccine', category: 'Vaccines', stock: 45, consumptionThisMonth: 12, minLimit: 10 },
      { id: 'inv-2', name: 'Rabies Booster Vaccine', category: 'Vaccines', stock: 8, consumptionThisMonth: 19, minLimit: 15 },
      { id: 'inv-3', name: 'Otomax Ear Drops', category: 'Medications', stock: 14, consumptionThisMonth: 22, minLimit: 8 },
      { id: 'inv-4', name: 'PetVit Avian Drops', category: 'Supplements', stock: 29, consumptionThisMonth: 5, minLimit: 10 },
      { id: 'inv-5', name: 'Sterile Sutures (Pack of 12)', category: 'Surgical Supplies', stock: 3, consumptionThisMonth: 9, minLimit: 5 },
      { id: 'inv-6', name: 'Antiseptic Ear Cleanser', category: 'Consumables', stock: 18, consumptionThisMonth: 14, minLimit: 6 }
    ]
  });

  // 11. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { id: 'LOG-001', timestamp: new Date('2026-07-07T09:12:00Z'), user: 'system', role: 'System', action: 'Initialize Database', details: 'Pre-populated initial clinic registry and credentials.' },
      { id: 'LOG-002', timestamp: new Date('2026-07-07T09:14:30Z'), user: 'Dr. Sarah Connor', role: 'Veterinarian', action: 'Record Access', details: 'Accessed history folder for Pet ID: PET-782.' },
      { id: 'LOG-003', timestamp: new Date('2026-07-07T09:15:10Z'), user: 'owner@jacovet.com', role: 'Pet Owner', action: 'Create Appointment', details: 'Booked consultation session for Rocky with Dr. Connor.' }
    ]
  });

  console.log('JacoVet seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
