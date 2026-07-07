const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get appointments for standard user (Owner)
const getOwnerAppointments = async (req, res) => {
  try {
    const owner = await prisma.owner.findUnique({ where: { userId: req.user.id } });
    if (!owner) {
      return res.status(404).json({ message: 'Owner profile not found.' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { ownerEmail: req.user.email },
      include: {
        pet: true,
        vet: { include: { clinic: true } }
      },
      orderBy: { date: 'asc' }
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching owner appointments:', error);
    return res.status(500).json({ message: 'Failed to retrieve appointments list.' });
  }
};

// Get appointments for currently logged-in Doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const vet = await prisma.vet.findUnique({ where: { userId: req.user.id } });
    if (!vet) {
      return res.status(404).json({ message: 'Veterinarian profile not found.' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { vetId: vet.id },
      include: {
        pet: true
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return res.status(500).json({ message: 'Failed to retrieve doctor queue list.' });
  }
};

// Get appointments for Clinic Admin (completed & pending checkout)
const getAdminAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        pet: true,
        vet: true
      },
      orderBy: { date: 'asc' }
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching admin appointments:', error);
    return res.status(500).json({ message: 'Failed to retrieve clinic appointments registry.' });
  }
};

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const { vetId, petId, date, time, reason } = req.body;

    if (!vetId || !petId || !date || !time || !reason) {
      return res.status(400).json({ message: 'Missing required appointment parameters.' });
    }

    const vet = await prisma.vet.findUnique({ where: { id: vetId } });
    if (!vet) {
      return res.status(404).json({ message: 'Veterinarian not found.' });
    }

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found.' });
    }

    // Check slot conflicts
    const conflict = await prisma.appointment.findFirst({
      where: {
        vetId,
        date,
        time,
        status: { not: 'cancelled' }
      }
    });

    if (conflict) {
      return res.status(400).json({ message: 'This slot is already booked. Please choose another slot.' });
    }

    const newAppt = await prisma.appointment.create({
      data: {
        vetId,
        petId,
        ownerEmail: req.user.email,
        date,
        time,
        reason,
        status: 'upcoming'
      }
    });

    // Log Audit
    await prisma.auditLog.create({
      data: {
        user: req.user.email,
        role: 'Pet Owner',
        action: 'Book Appointment',
        details: `Scheduled visit with ${vet.name} for ${pet.name} on ${date} at ${time}.`
      }
    });

    return res.status(201).json(newAppt);
  } catch (error) {
    console.error('Error booking appointment:', error);
    return res.status(500).json({ message: 'Failed to book appointment.' });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Validate ownership (Owners can only cancel their own)
    if (req.user.role === 'owner' && appt.ownerEmail !== req.user.email) {
      return res.status(403).json({ message: 'Access denied: You do not own this appointment.' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    // Log Audit
    await prisma.auditLog.create({
      data: {
        user: req.user.email,
        role: req.user.role === 'owner' ? 'Pet Owner' : 'Clinic Desk',
        action: 'Cancel Appointment',
        details: `Cancelled appointment Ref: ${id}.`
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return res.status(500).json({ message: 'Failed to cancel appointment.' });
  }
};

// Reschedule appointment
const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required.' });
    }

    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Check slot conflicts
    const conflict = await prisma.appointment.findFirst({
      where: {
        vetId: appt.vetId,
        date,
        time,
        status: { not: 'cancelled' }
      }
    });

    if (conflict) {
      return res.status(400).json({ message: 'This slot is already booked. Please choose another slot.' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { date, time }
    });

    // Log Audit
    await prisma.auditLog.create({
      data: {
        user: req.user.email,
        role: 'Pet Owner',
        action: 'Reschedule Appointment',
        details: `Rescheduled visit Ref: ${id} from ${appt.date} to ${date} at ${time}.`
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return res.status(500).json({ message: 'Failed to reschedule appointment.' });
  }
};

module.exports = {
  getOwnerAppointments,
  getDoctorAppointments,
  getAdminAppointments,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment
};
