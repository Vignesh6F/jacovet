const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get medical timeline for a single pet
const getPetTimeline = async (req, res) => {
  try {
    const { petId } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { owner: true }
    });

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found.' });
    }

    const records = await prisma.medicalRecord.findMany({
      where: { petId },
      orderBy: { visitDate: 'desc' }
    });

    // Check if current user is Vet / Doctor. Log cross-clinic audit accesses
    if (req.user.role === 'doctor') {
      const vet = await prisma.vet.findUnique({ where: { userId: req.user.id } });
      
      // If the record was treated by a doctor from another clinic, log record folder access
      await prisma.auditLog.create({
        data: {
          user: vet ? vet.name : req.user.email,
          role: 'Veterinarian',
          action: 'Record Access',
          details: `Accessed medical history timeline for Pet ID: ${petId} (Patient: ${pet.name}).`
        }
      });
    }

    return res.status(200).json({ pet, records });
  } catch (error) {
    console.error('Error fetching pet timeline:', error);
    return res.status(500).json({ message: 'Failed to retrieve medical records timeline.' });
  }
};

// Create a new consultation record
const addConsultRecord = async (req, res) => {
  try {
    const { appointmentId, petId, type, chiefComplaint, temp, weight, heartRate, diagnosis, notes, prescriptions, vaccinations, followUpDate } = req.body;

    if (!petId || !chiefComplaint || !diagnosis) {
      return res.status(400).json({ message: 'Pet ID, Chief Complaint, and Diagnosis are required.' });
    }

    const vet = await prisma.vet.findUnique({ where: { userId: req.user.id } });
    if (!vet) {
      return res.status(404).json({ message: 'Veterinarian profile not found.' });
    }

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create medical record
      const record = await tx.medicalRecord.create({
        data: {
          petId,
          doctorId: vet.id,
          doctorName: vet.name,
          clinicName: vet.location,
          visitDate: new Date().toISOString().split('T')[0],
          type: type || 'Checkup',
          chiefComplaint,
          temp: temp || 'N/A',
          weight: weight || pet.weight,
          heartRate: heartRate || 'N/A',
          diagnosis,
          notes: notes || '',
          prescriptions: JSON.stringify(prescriptions || []),
          vaccinations: JSON.stringify(vaccinations || []),
          followUpDate: followUpDate || ''
        }
      });

      // 2. If appointmentId is supplied, close the appointment
      if (appointmentId) {
        await tx.appointment.update({
          where: { id: appointmentId },
          data: {
            status: 'completed',
            notes: notes || '',
            prescription: (prescriptions || []).map(m => `${m.name}: ${m.dosage}`).join('\n')
          }
        });
      }

      // 3. Update Pet's weight in profile dynamically
      if (weight) {
        await tx.pet.update({
          where: { id: petId },
          data: { weight }
        });
      }

      // 4. Deduct Stock in inventory dynamically
      const inventoryItems = await tx.inventoryItem.findMany();
      
      for (const item of inventoryItems) {
        let deductCount = 0;
        
        // A. Vaccine match
        if (vaccinations && vaccinations.length > 0 && item.category === 'Vaccines') {
          const vName = vaccinations[0].name.toLowerCase();
          const iName = item.name.toLowerCase();
          if (vName.includes(iName) || iName.includes(vName) ||
              (iName.includes('dhpp') && vName.includes('dhpp')) ||
              (iName.includes('rabies') && vName.includes('rabies'))) {
            deductCount += 1;
          }
        }

        // B. Medicine match
        if (prescriptions && prescriptions.length > 0) {
          prescriptions.forEach(med => {
            const mName = med.name.toLowerCase();
            const iName = item.name.toLowerCase();
            if (mName.includes(iName) || iName.includes(mName)) {
              deductCount += 1;
            }
          });
        }

        if (deductCount > 0) {
          await tx.inventoryItem.update({
            where: { id: item.id },
            data: {
              stock: Math.max(0, item.stock - deductCount),
              consumptionThisMonth: item.consumptionThisMonth + deductCount
            }
          });
        }
      }

      return record;
    });

    // Log complete audit log
    await prisma.auditLog.create({
      data: {
        user: vet.name,
        role: 'Veterinarian',
        action: 'Complete Consultation',
        details: `Created clinical report and prescription details for ${pet.name} (Patient ID: ${petId}).`
      }
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error adding consultation report:', error);
    return res.status(500).json({ message: 'Failed to record consultation check-in.' });
  }
};

module.exports = {
  getPetTimeline,
  addConsultRecord
};
