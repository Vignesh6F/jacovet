const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get audit logs (Super Admin exclusive)
const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' }
    });
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ message: 'Failed to retrieve system audit logs.' });
  }
};

// List all clinics & vets (public/shared list)
const getClinicsAndVets = async (req, res) => {
  try {
    const clinics = await prisma.clinic.findMany({ include: { vets: true } });
    const vets = await prisma.vet.findMany({ include: { clinic: true } });
    return res.status(200).json({ clinics, vets });
  } catch (error) {
    console.error('Error fetching directories:', error);
    return res.status(500).json({ message: 'Failed to retrieve directories list.' });
  }
};

// Clinic Admin: Complete Checkout Billing
const completeCheckout = async (req, res) => {
  try {
    const { id } = req.params;
    const { billAmount } = req.body;

    const appt = await prisma.appointment.findUnique({ where: { id }, include: { pet: true } });
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        billed: true,
        billAmount: parseInt(billAmount) || 650
      }
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        user: req.user.email,
        role: 'Clinic Admin',
        action: 'Generate Invoice',
        details: `Processed billing checkout invoice for ${appt.petName || 'Pet'} (Consultation Fee: ₹${billAmount}).`
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error completing checkout:', error);
    return res.status(500).json({ message: 'Failed to complete billing checkout.' });
  }
};

// Super Admin: Update Vet Plan (Partner subscription update)
const updateVetPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body; // e.g. "ProPremium"

    if (!plan) {
      return res.status(400).json({ message: 'Listing subscription plan name is required.' });
    }

    const vet = await prisma.vet.findUnique({ where: { id } });
    if (!vet) {
      return res.status(404).json({ message: 'Veterinarian profile not found.' });
    }

    const updated = await prisma.vet.update({
      where: { id },
      data: { plan }
    });

    // Log Action
    await prisma.auditLog.create({
      data: {
        user: req.user.email,
        role: 'Super Admin',
        action: 'Upgrade Plan',
        details: `Updated listing plan for ${vet.name} to ${plan}.`
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating plan:', error);
    return res.status(500).json({ message: 'Failed to update partner plan.' });
  }
};

module.exports = {
  getAuditLogs,
  getClinicsAndVets,
  completeCheckout,
  updateVetPlan
};
