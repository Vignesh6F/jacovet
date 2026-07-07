const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// List pets owned by current user
const getMyPets = async (req, res) => {
  try {
    const owner = await prisma.owner.findUnique({ where: { userId: req.user.id } });
    if (!owner) {
      return res.status(404).json({ message: 'Owner profile not found.' });
    }

    const pets = await prisma.pet.findMany({
      where: { ownerId: owner.id }
    });

    return res.status(200).json(pets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    return res.status(500).json({ message: 'Failed to retrieve pet list.' });
  }
};

// Add a new pet
const addPet = async (req, res) => {
  try {
    const { name, species, breed, gender, dob, weight, color, microchip, bloodGroup, allergies, emergencyContact, insurance } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Pet name is required.' });
    }

    const owner = await prisma.owner.findUnique({ where: { userId: req.user.id } });
    if (!owner) {
      return res.status(404).json({ message: 'Owner profile not found.' });
    }

    const newPet = await prisma.pet.create({
      data: {
        id: `PET-${Math.floor(Math.random() * 900) + 100}`,
        name,
        species: species || 'Dog',
        breed: breed || 'Mixed Breed',
        gender: gender || 'Male',
        dob: dob || '2025-01-01',
        weight: weight || 'Unknown',
        color: color || 'Mixed',
        microchip: microchip || 'N/A',
        bloodGroup: bloodGroup || 'Unknown',
        allergies: allergies || 'None',
        emergencyContact: emergencyContact || owner.userEmail || '+91 99999 99999',
        insurance: insurance || 'None',
        ownerId: owner.id
      }
    });

    // Log action audit
    await prisma.auditLog.create({
      data: {
        user: req.user.email,
        role: 'Pet Owner',
        action: 'Add Pet Profile',
        details: `Registered new pet: ${newPet.name} (${newPet.species}).`
      }
    });

    return res.status(201).json(newPet);
  } catch (error) {
    console.error('Error adding pet:', error);
    return res.status(500).json({ message: 'Failed to register new pet.' });
  }
};

// Vet search lookup for a pet file (unrestricted)
const searchPets = async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.toLowerCase().trim() : '';
    if (!query) {
      return res.status(400).json({ message: 'Search query parameter required.' });
    }

    const pets = await prisma.pet.findMany({
      where: {
        OR: [
          { id: { equals: query } },
          { name: { contains: query } },
          { microchip: { equals: query } },
          { emergencyContact: { contains: query } }
        ]
      },
      include: {
        owner: true
      }
    });

    return res.status(200).json(pets);
  } catch (error) {
    console.error('Error searching pets:', error);
    return res.status(500).json({ message: 'Failed to search pet files.' });
  }
};

module.exports = {
  getMyPets,
  addPet,
  searchPets
};
