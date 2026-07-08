const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const prisma = new PrismaClient();

// Register Owner & their first pet (optional)
const registerOwner = async (req, res) => {
  try {
    const { name, email, password, petName, petCategory, petBreed, petAge } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User, Owner, and Pet in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'owner'
        }
      });

      const owner = await tx.owner.create({
        data: {
          name,
          userId: user.id
        }
      });

      let pet = null;
      if (petName) {
        pet = await tx.pet.create({
          data: {
            name: petName,
            species: petCategory || 'Dog',
            breed: petBreed || 'Mixed Breed',
            gender: 'Male',
            dob: petAge ? new Date(Date.now() - parseFloat(petAge) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '2025-01-01',
            weight: 'Unknown',
            color: 'Mixed',
            microchip: 'N/A',
            bloodGroup: 'Unknown',
            allergies: 'None',
            emergencyContact: '+91 99999 99999',
            ownerId: owner.id
          }
        });
      }

      return { user, owner, pet };
    });

    const token = jwt.sign({ id: result.user.id, email: result.user.email, role: result.user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Log registration audit
    await prisma.auditLog.create({
      data: {
        user: result.user.email,
        role: 'Pet Owner',
        action: 'Register Profile',
        details: `Registered profile and first pet: ${result.pet ? result.pet.name : 'None'}.`
      }
    });

    return res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.owner.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Login for all roles
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.trim(),
        role
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or role mismatch.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Load role-specific profile name
    let profileName = 'System User';
    if (role === 'owner') {
      const owner = await prisma.owner.findUnique({ where: { userId: user.id } });
      if (owner) profileName = owner.name;
    } else if (role === 'doctor') {
      const vet = await prisma.vet.findUnique({ where: { userId: user.id } });
      if (vet) profileName = vet.name;
    } else if (role === 'admin') {
      profileName = 'Clinic Admin';
    } else if (role === 'super-admin') {
      profileName = 'Central Super Admin';
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, profileName }, JWT_SECRET, { expiresIn: '7d' });

    // Log Login Audit
    await prisma.auditLog.create({
      data: {
        user: user.email,
        role: role === 'owner' ? 'Pet Owner' : role === 'doctor' ? 'Veterinarian' : role === 'admin' ? 'Clinic Admin' : 'Super Admin',
        action: 'Log In',
        details: `Logged into JacoVet ${role} workspace.`
      }
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: profileName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Register Doctor
const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialty, experience } = req.body;

    if (!name || !email || !password || !specialty) {
      return res.status(400).json({ message: 'Name, email, password, and specialty are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get the first clinic in the database or fall back to creating one
    let clinic = await prisma.clinic.findFirst();
    if (!clinic) {
      clinic = await prisma.clinic.create({
        data: {
          name: 'JacoVet Central Clinic',
          location: 'Madurai Central',
          rating: 5.0
        }
      });
    }

    // Create User and Vet in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'doctor'
        }
      });

      const vet = await tx.vet.create({
        data: {
          name,
          specialty,
          experience: experience || '1 year',
          rating: 5.0,
          price: 500,
          clinicId: clinic.id,
          location: clinic.location,
          lat: 9.9250,
          lng: 78.1200,
          image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
          bio: `Specialized in ${specialty}. Welcome to my workspace!`,
          categories: 'Dog,Cat,Bird,Exotic',
          plan: 'FreeStarter',
          userId: user.id
        }
      });

      return { user, vet };
    });

    const token = jwt.sign({ id: result.user.id, email: result.user.email, role: result.user.role, profileName: result.vet.name }, JWT_SECRET, { expiresIn: '7d' });

    // Log registration audit
    await prisma.auditLog.create({
      data: {
        user: result.user.email,
        role: 'Veterinarian',
        action: 'Register Profile',
        details: `Registered doctor profile: ${result.vet.name}.`
      }
    });

    return res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.vet.name
      }
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    return res.status(500).json({ message: 'Server error during doctor registration.' });
  }
};

module.exports = {
  registerOwner,
  registerDoctor,
  login
};
