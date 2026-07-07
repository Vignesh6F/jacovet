import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  Award, 
  CheckCircle, 
  XCircle, 
  Plus, 
  ChevronRight, 
  User, 
  Activity, 
  Heart, 
  MapPin, 
  FileText, 
  AlertCircle, 
  Info,
  Trash2,
  Stethoscope,
  Crown,
  Navigation,
  Star,
  QrCode,
  Shield,
  Upload,
  Lock,
  Unlock,
  Printer,
  ChevronDown,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { initialClinics, initialVets, initialPets, initialMedicalRecords, initialAppointments, initialAuditLogs, petCategories, subscriptionPlans } from './mockData';

// Haversine distance calculator
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return c;
};

// Preset user simulated locations in Madurai
const userLocationPresets = [
  { name: 'Madurai Junction (Center)', lat: 9.9192, lng: 78.1120 },
  { name: 'Anna Nagar', lat: 9.9272, lng: 78.1438 },
  { name: 'K.K. Nagar', lat: 9.9295, lng: 78.1565 },
  { name: 'Othakadai', lat: 9.9575, lng: 78.1888 },
  { name: 'Thirunagar', lat: 9.8760, lng: 78.0735 }
];

const defaultOwners = [
  { name: 'Vignesh', email: 'owner@jacovet.com', password: 'owner123' }
];

console.log("DEBUG: initialClinics =", typeof initialClinics, initialClinics);
console.log("DEBUG: initialVets =", typeof initialVets, initialVets);

function App() {
  console.log("DEBUG: App component execution started");
  // Navigation & Role selection
  const [currentRole, setCurrentRole] = useState('owner'); // 'owner', 'doctor', 'admin', 'super-admin'
  const [activeView, setActiveView] = useState('home'); // 'home', 'client-dashboard', 'vet-dashboard', 'admin-dashboard', 'super-admin-dashboard', 'login-portal', 'pet-timeline'
  
  // Simulated Database states
  const [clinics, setClinics] = useState(() => {
    try {
      const saved = localStorage.getItem('jacovet_clinics');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialClinics;
    } catch (e) {
      return initialClinics;
    }
  });
  const [vets, setVets] = useState(() => {
    try {
      const saved = localStorage.getItem('jacovet_vets');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialVets;
    } catch (e) {
      return initialVets;
    }
  });
  const [pets, setPets] = useState(() => {
    try {
      const saved = localStorage.getItem('jacovet_pets');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialPets;
    } catch (e) {
      return initialPets;
    }
  });
  const [medicalRecords, setMedicalRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('jacovet_medical_records');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialMedicalRecords;
    } catch (e) {
      return initialMedicalRecords;
    }
  });
  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('jacovet_appointments');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialAppointments;
    } catch (e) {
      return initialAppointments;
    }
  });
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('jacovet_audit_logs');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialAuditLogs;
    } catch (e) {
      return initialAuditLogs;
    }
  });
  const [owners, setOwners] = useState(() => {
    try {
      const saved = localStorage.getItem('jacovet_owners');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : defaultOwners;
    } catch (e) {
      return defaultOwners;
    }
  });

  // Session states
  const [currentOwner, setCurrentOwner] = useState(() => {
    try {
      const saved = localStorage.getItem('jacovet_current_owner');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(!!currentOwner);
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('jacovet_doctor_logged_in') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('jacovet_admin_logged_in') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isSuperAdminLoggedIn, setIsSuperAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('jacovet_super_logged_in') === 'true';
    } catch (e) {
      return false;
    }
  });

  // simulated location & search filters
  const [currentUserLocation, setCurrentUserLocation] = useState(userLocationPresets[0]);
  const [customLat, setCustomLat] = useState('9.9192');
  const [customLng, setCustomLng] = useState('78.1120');
  const [isCustomLoc, setIsCustomLoc] = useState(false);
  const [sortBy, setSortBy] = useState('proximity');
  const [selectedCategory, setSelectedCategory] = useState('All Specialties');
  const [searchQuery, setSearchQuery] = useState('');

  // Vet Clinic Monthly Inventory
  const [inventory, setInventory] = useState([
    { id: 'inv-1', name: 'DHPP Booster Vaccine', category: 'Vaccines', stock: 45, consumptionThisMonth: 12, minLimit: 10 },
    { id: 'inv-2', name: 'Rabies Booster Vaccine', category: 'Vaccines', stock: 8, consumptionThisMonth: 19, minLimit: 15 },
    { id: 'inv-3', name: 'Otomax Ear Drops', category: 'Medications', stock: 14, consumptionThisMonth: 22, minLimit: 8 },
    { id: 'inv-4', name: 'PetVit Avian Drops', category: 'Supplements', stock: 29, consumptionThisMonth: 5, minLimit: 10 },
    { id: 'inv-5', name: 'Sterile Sutures (Pack of 12)', category: 'Surgical Supplies', stock: 3, consumptionThisMonth: 9, minLimit: 5 },
    { id: 'inv-6', name: 'Antiseptic Ear Cleanser', category: 'Consumables', stock: 18, consumptionThisMonth: 14, minLimit: 6 }
  ]);

  // Gated login form state
  const [authTab, setAuthTab] = useState('owner-login'); // 'owner-login', 'owner-signup', 'doctor-login', 'admin-login', 'super-login'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [ownerSignupForm, setOwnerSignupForm] = useState({ name: '', email: '', password: '', petName: '', petCategory: 'Dog', petBreed: '', petAge: '' });

  // Pet Registration modal state
  const [petRegModalOpen, setPetRegModalOpen] = useState(false);
  const [newPetForm, setNewPetForm] = useState({ name: '', species: 'Dog', breed: '', gender: 'Male', dob: '', weight: '', color: '', microchip: '', bloodGroup: 'Unknown', allergies: '', emergencyContact: '', insurance: 'None' });

  // Detailed Timeline state
  const [selectedPet, setSelectedPet] = useState(null);

  // Booking Modal
  const [bookingVet, setBookingVet] = useState(null);
  const [pendingBookingVet, setPendingBookingVet] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [petDetails, setPetDetails] = useState({ name: '', category: 'Dog', breed: '', age: '', reason: '' });

  // Reschedule state
  const [reschedulingAppt, setReschedulingAppt] = useState(null);

  // Clinical check details
  const [completingAppt, setCompletingAppt] = useState(null);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [clinicalVitals, setClinicalVitals] = useState({ temp: '101.2 °F', weight: '28.0 kg', heartRate: '90 bpm' });
  const [prescriptionMeds, setPrescriptionMeds] = useState([]);
  const [medInput, setMedInput] = useState({ name: '', dosage: '', morning: true, afternoon: false, night: true, days: 5, notes: '' });
  const [vaccineInput, setVaccineInput] = useState({ administer: false, name: '', batch: '', manufacturer: '', dueDate: '' });

  // Review modal state
  const [reviewForm, setReviewForm] = useState({ author: '', rating: 5, comment: '' });

  // Emergency QR Modal
  const [qrPet, setQrPet] = useState(null);

  // External file upload modal/state
  const [uploadPet, setUploadPet] = useState(null);
  const [reportFileName, setReportFileName] = useState('');
  const [reportType, setReportType] = useState('Blood Test');

  // Medical Record summary details
  const [activePrescription, setActivePrescription] = useState(null);

  // Vet Lookup search state
  const [vetSearchTerm, setVetSearchTerm] = useState('');
  const [searchedPet, setSearchedPet] = useState(null);

  // Clinic Admin checkout billing
  const [checkoutAppt, setCheckoutAppt] = useState(null);
  const [billItems, setBillItems] = useState([]);

  // Active tabs
  const [dashboardTab, setDashboardTab] = useState('pets'); // 'pets', 'book', 'appointments'
  const [apptDashboardSubTab, setApptDashboardSubTab] = useState('upcoming');
  const [vetDashboardTab, setVetDashboardTab] = useState('appointments'); // 'appointments', 'search', 'subscription'
  const [adminTab, setAdminTab] = useState('checkout'); // 'checkout', 'vets'

  // Print/download modal previews
  const [printCertificate, setPrintCertificate] = useState(null);
  const [printPrescription, setPrintPrescription] = useState(null);

  // Toast Alerts
  const [toasts, setToasts] = useState([]);

  // Calculations & Helper functions
  const totalEarnings = appointments.filter(a => a.vetId === 'vet-1' && a.status === 'completed').reduce((sum, a) => sum + (a.billAmount || 650), 0);
  const activeVetData = vets.find(v => v.id === 'vet-1') || vets[0];
  const hasFiltersActive = () => selectedCategory !== 'All Specialties' || searchQuery !== '';

  const processedVets = vets
    .map(vet => {
      const distance = calculateDistance(currentUserLocation.lat, currentUserLocation.lng, vet.lat, vet.lng);
      return { ...vet, distance };
    })
    .filter(vet => {
      const matchesCategory = selectedCategory === 'All Specialties' || vet.categories.includes(selectedCategory);
      const matchesQuery = vet.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           vet.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vet.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'proximity') return a.distance - b.distance;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.price - b.price;
      return 0;
    });

  const getBookedSlots = (vetId, date) => {
    return appointments
      .filter(appt => appt.vetId === vetId && appt.date === date && appt.status !== 'cancelled')
      .map(appt => appt.time);
  };

  const handleUpgradeSubscription = (planName) => {
    setVets(prev => prev.map(v => {
      if (v.id === 'vet-1') {
        return { ...v, plan: planName };
      }
      return v;
    }));
    logAuditAction('Dr. Sarah Connor', 'Veterinarian', 'Upgrade Plan', `Upgraded partner plan to ${planName}.`);
    showToast(`Plan successfully updated to ${planName}!`);
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentUserLocation({ name: 'Live Geolocation', lat, lng });
          setCustomLat(lat.toString());
          setCustomLng(lng.toString());
          setIsCustomLoc(true);
          showToast(`Detected location: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);
          logAuditAction('system', 'System', 'Detect Geolocation', `User requested browser geolocation. Coordinates resolved: ${lat.toFixed(4)}, ${lng.toFixed(4)}.`);
        },
        (error) => {
          showToast('Failed to retrieve live geolocation. Access denied or unavailable.', 'danger');
        }
      );
    } else {
      showToast('Geolocation is not supported by your browser.', 'danger');
    }
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('jacovet_clinics', JSON.stringify(clinics));
      localStorage.setItem('jacovet_vets', JSON.stringify(vets));
      localStorage.setItem('jacovet_pets', JSON.stringify(pets));
      localStorage.setItem('jacovet_medical_records', JSON.stringify(medicalRecords));
      localStorage.setItem('jacovet_appointments', JSON.stringify(appointments));
      localStorage.setItem('jacovet_audit_logs', JSON.stringify(auditLogs));
      localStorage.setItem('jacovet_owners', JSON.stringify(owners));
      if (currentOwner) {
        localStorage.setItem('jacovet_current_owner', JSON.stringify(currentOwner));
      } else {
        localStorage.removeItem('jacovet_current_owner');
      }
      localStorage.setItem('jacovet_doctor_logged_in', isDoctorLoggedIn ? 'true' : 'false');
      localStorage.setItem('jacovet_admin_logged_in', isAdminLoggedIn ? 'true' : 'false');
      localStorage.setItem('jacovet_super_logged_in', isSuperAdminLoggedIn ? 'true' : 'false');
    } catch (e) {
      console.warn("localStorage sync failed:", e);
    }
  }, [clinics, vets, pets, medicalRecords, appointments, auditLogs, owners, currentOwner, isDoctorLoggedIn, isAdminLoggedIn, isSuperAdminLoggedIn]);

  // Handle URL Router simulation on mount & back/forward navigation
  useEffect(() => {
    const routeHandler = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path === '/doctor' || hash === '#doctor') {
        setCurrentRole('doctor');
        if (localStorage.getItem('jacovet_doctor_logged_in') === 'true') {
          setActiveView('vet-dashboard');
          setVetDashboardTab('appointments');
        } else {
          setAuthTab('doctor-login');
          setActiveView('login-portal');
        }
      } else if (path === '/admin' || hash === '#admin') {
        setCurrentRole('admin');
        if (localStorage.getItem('jacovet_admin_logged_in') === 'true') {
          setActiveView('admin-dashboard');
          setAdminTab('checkout');
        } else {
          setAuthTab('admin-login');
          setActiveView('login-portal');
        }
      } else if (path === '/super' || hash === '#super') {
        setCurrentRole('super-admin');
        if (localStorage.getItem('jacovet_super_logged_in') === 'true') {
          setActiveView('super-admin-dashboard');
        } else {
          setAuthTab('super-login');
          setActiveView('login-portal');
        }
      } else if (path === '/owner' || hash === '#owner') {
        setCurrentRole('owner');
        if (localStorage.getItem('jacovet_current_owner')) {
          setActiveView('client-dashboard');
          setDashboardTab('pets');
        } else {
          setAuthTab('owner-login');
          setActiveView('login-portal');
        }
      } else {
        // Default home route '/'
        setCurrentRole('owner');
        if (localStorage.getItem('jacovet_current_owner')) {
          setActiveView('client-dashboard');
          setDashboardTab('pets');
        } else {
          setActiveView('home');
        }
      }
    };

    routeHandler();
    window.addEventListener('popstate', routeHandler);
    return () => window.removeEventListener('popstate', routeHandler);
  }, []);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Add system audit log
  const logAuditAction = (user, role, action, details) => {
    const newLog = {
      id: `LOG-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchWorkspaceRole = (role) => {
    setCurrentRole(role);
    setAuthError('');
    
    // Update URL path dynamically
    if (role === 'owner') {
      window.history.pushState(null, '', '/');
    } else if (role === 'doctor') {
      window.history.pushState(null, '', '/doctor');
    } else if (role === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (role === 'super-admin') {
      window.history.pushState(null, '', '/super');
    }

    // Check credentials gate
    if (role === 'owner') {
      if (!isOwnerLoggedIn) {
        setAuthTab('owner-login');
        setActiveView('login-portal');
      } else {
        setActiveView('client-dashboard');
        setDashboardTab('pets');
      }
    } else if (role === 'doctor') {
      if (!isDoctorLoggedIn) {
        setAuthTab('doctor-login');
        setActiveView('login-portal');
      } else {
        setActiveView('vet-dashboard');
        setVetDashboardTab('appointments');
      }
    } else if (role === 'admin') {
      if (!isAdminLoggedIn) {
        setAuthTab('admin-login');
        setActiveView('login-portal');
      } else {
        setActiveView('admin-dashboard');
        setAdminTab('checkout');
      }
    } else if (role === 'super-admin') {
      if (!isSuperAdminLoggedIn) {
        setAuthTab('super-login');
        setActiveView('login-portal');
      } else {
        setActiveView('super-admin-dashboard');
      }
    }
  };

  // Owner Login / Signup
  const handleOwnerLogin = (e) => {
    e.preventDefault();
    const found = owners.find(o => o.email.toLowerCase() === loginEmail.toLowerCase() && o.password === loginPassword);
    if (found) {
      setCurrentOwner(found);
      setLoginEmail('');
      setLoginPassword('');
      logAuditAction(found.name, 'Pet Owner', 'Log In', 'Logged into JacoVet Pet Health parent console.');
      showToast(`Welcome back, ${found.name}!`);
      
      if (pendingBookingVet) {
        setBookingVet(pendingBookingVet);
        setPetDetails({ name: found.petName || '', category: 'Dog', breed: '', age: '', reason: '' });
        setPendingBookingVet(null);
        setActiveView('home');
      } else {
        setActiveView('client-dashboard');
        setDashboardTab('pets');
      }
    } else {
      setAuthError('Invalid credentials. Prefilled details are provided below.');
    }
  };

  const handleOwnerSignup = (e) => {
    e.preventDefault();
    if (!ownerSignupForm.name || !ownerSignupForm.email || !ownerSignupForm.password || !ownerSignupForm.petName) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    if (owners.some(o => o.email.toLowerCase() === ownerSignupForm.email.toLowerCase())) {
      setAuthError('This email is already registered.');
      return;
    }

    const newOwner = { name: ownerSignupForm.name, email: ownerSignupForm.email, password: ownerSignupForm.password };
    const newPet = {
      id: `PET-${Math.floor(Math.random() * 900) + 100}`,
      name: ownerSignupForm.petName,
      species: ownerSignupForm.petCategory,
      breed: ownerSignupForm.petBreed || 'Mixed Breed',
      gender: 'Male',
      dob: '2025-01-01',
      weight: ownerSignupForm.petAge ? '5.0 kg' : 'Unknown',
      color: 'Mixed',
      microchip: 'N/A',
      bloodGroup: 'Unknown',
      allergies: 'None',
      emergencyContact: '+91 99999 99999',
      ownerEmail: ownerSignupForm.email,
      insurance: 'None'
    };

    setOwners(prev => [...prev, newOwner]);
    setPets(prev => [...prev, newPet]);
    setCurrentOwner(newOwner);
    setOwnerSignupForm({ name: '', email: '', password: '', petName: '', petCategory: 'Dog', petBreed: '', petAge: '' });
    
    logAuditAction(newOwner.name, 'Pet Owner', 'Register Profile', `Registered owner profile and first pet: ${newPet.name}.`);
    showToast(`Account successfully registered, ${newOwner.name}!`);

    if (pendingBookingVet) {
      setBookingVet(pendingBookingVet);
      setPetDetails({ name: newPet.name, category: newPet.species, breed: newPet.breed, age: '1 year', reason: '' });
      setPendingBookingVet(null);
      setActiveView('home');
    } else {
      setActiveView('client-dashboard');
      setDashboardTab('pets');
    }
  };

  // Doctor Auth
  const handleDoctorLogin = (e) => {
    e.preventDefault();
    if (loginPasscode === 'doctor123') {
      setIsDoctorLoggedIn(true);
      setLoginPasscode('');
      logAuditAction('Dr. Sarah Connor', 'Veterinarian', 'Log In', 'Authenticated credentials to enter workspace.');
      showToast('Logged in successfully, Doctor.');
      setActiveView('vet-dashboard');
      setVetDashboardTab('appointments');
    } else {
      setAuthError('Invalid passcode. Use "doctor123" for demo authentication.');
    }
  };

  // Admin Auth
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginPasscode === 'admin123') {
      setIsAdminLoggedIn(true);
      setLoginPasscode('');
      logAuditAction('Madurai Pet Care Admin', 'Clinic Admin', 'Log In', 'Access granted to clinic administration desk.');
      showToast('Logged in successfully, Clinic Admin.');
      setActiveView('admin-dashboard');
      setAdminTab('checkout');
    } else {
      setAuthError('Invalid passcode. Use "admin123" for clinic access.');
    }
  };

  // Super Admin Auth
  const handleSuperAdminLogin = (e) => {
    e.preventDefault();
    if (loginPasscode === 'super123') {
      setIsSuperAdminLoggedIn(true);
      setLoginPasscode('');
      logAuditAction('JacoVet Operations Team', 'Super Admin', 'Log In', 'Logged into central system configurations.');
      showToast('Welcome back, Central Super Admin.');
      setActiveView('super-admin-dashboard');
    } else {
      setAuthError('Invalid passcode. Use "super123" for operations access.');
    }
  };

  // Pet Registration (Owner)
  const handlePetRegister = (e) => {
    e.preventDefault();
    if (!newPetForm.name) {
      showToast('Please enter pet name.', 'danger');
      return;
    }

    const regPet = {
      ...newPetForm,
      id: `PET-${Math.floor(Math.random() * 900) + 100}`,
      ownerEmail: currentOwner.email
    };

    setPets(prev => [...prev, regPet]);
    logAuditAction(currentOwner.name, 'Pet Owner', 'Add Pet Profile', `Registered new pet: ${regPet.name} (${regPet.species}).`);
    showToast(`Pet "${regPet.name}" registered successfully!`);
    setPetRegModalOpen(false);
    setNewPetForm({ name: '', species: 'Dog', breed: '', gender: 'Male', dob: '', weight: '', color: '', microchip: '', bloodGroup: 'Unknown', allergies: '', emergencyContact: '', insurance: 'None' });
  };

  // Booking Flow Trigger
  const triggerBookingGate = (vet) => {
    if (!isOwnerLoggedIn) {
      setPendingBookingVet(vet);
      setAuthTab('owner-login');
      setActiveView('login-portal');
      showToast('Please login as a Pet Owner to book appointments.', 'info');
    } else {
      setBookingVet(vet);
      // prefill with the first pet of the owner
      const firstPet = pets.find(p => p.ownerEmail === currentOwner.email);
      setPetDetails({
        name: firstPet ? firstPet.name : '',
        category: firstPet ? firstPet.species : 'Dog',
        breed: firstPet ? firstPet.breed : '',
        age: firstPet ? '2 years' : '',
        reason: ''
      });
    }
  };

  // Submit Booking
  const handleBooking = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !petDetails.name || !petDetails.reason) {
      showToast('Please complete all details to schedule.', 'danger');
      return;
    }

    const matchedPet = pets.find(p => p.ownerEmail === currentOwner.email && p.name.toLowerCase() === petDetails.name.toLowerCase());
    const petId = matchedPet ? matchedPet.id : `PET-${Math.floor(Math.random() * 900) + 100}`;

    // Create pet profile if not matched
    if (!matchedPet) {
      const autoPet = {
        id: petId,
        name: petDetails.name,
        species: petDetails.category,
        breed: petDetails.breed || 'Mixed Breed',
        gender: 'Male',
        dob: '2024-01-01',
        weight: petDetails.age ? '10 kg' : 'Unknown',
        color: 'Mixed',
        microchip: 'N/A',
        bloodGroup: 'Unknown',
        allergies: 'None',
        emergencyContact: '+91 99999 99999',
        ownerEmail: currentOwner.email,
        insurance: 'None'
      };
      setPets(prev => [...prev, autoPet]);
    }

    const newAppt = {
      id: `appt-${Date.now()}`,
      vetId: bookingVet.id,
      vetName: bookingVet.name,
      vetSpecialty: bookingVet.specialty,
      ownerEmail: currentOwner.email,
      petId: petId,
      petName: petDetails.name,
      petCategory: petDetails.category,
      petBreed: petDetails.breed || 'Mixed Breed',
      petAge: petDetails.age || '2 years',
      date: selectedDate,
      time: selectedSlot,
      reason: petDetails.reason,
      status: 'upcoming',
      notes: '',
      prescription: '',
      billed: false,
      billAmount: 0
    };

    setAppointments(prev => [newAppt, ...prev]);
    logAuditAction(currentOwner.name, 'Pet Owner', 'Book Appointment', `Scheduled visit with ${bookingVet.name} for ${newAppt.petName} on ${newAppt.date}.`);
    showToast(`Appointment booked successfully at ${bookingVet.location}!`);
    resetBookingForm();
    setActiveView('client-dashboard');
    setDashboardTab('appointments');
    setApptDashboardSubTab('upcoming');
  };

  const resetBookingForm = () => {
    setBookingVet(null);
    setSelectedDate('');
    setSelectedSlot('');
    setPetDetails({ name: '', category: 'Dog', breed: '', age: '', reason: '' });
  };

  // External Lab Report upload simulation
  const handleUploadReport = (e) => {
    e.preventDefault();
    if (!reportFileName) {
      showToast('Please enter report name.', 'danger');
      return;
    }

    const newRecord = {
      id: `REC-${Math.floor(Math.random() * 900) + 100}`,
      petId: uploadPet.id,
      doctorId: 'ext',
      doctorName: 'External Diagnostic Labs',
      clinicName: 'Madurai Pathology Services',
      visitDate: new Date().toISOString().split('T')[0],
      type: 'Lab Report',
      chiefComplaint: `Report upload: ${reportType}`,
      vitals: { temp: 'N/A', weight: uploadPet.weight, heartRate: 'N/A' },
      diagnosis: `${reportType} completed externally. Attached document: ${reportFileName}.pdf`,
      notes: 'Record added manually by Pet Owner.',
      prescriptions: [],
      vaccinations: [],
      followUpDate: ''
    };

    setMedicalRecords(prev => [newRecord, ...prev]);
    logAuditAction(currentOwner.name, 'Pet Owner', 'Upload Lab Report', `Uploaded external lab report for ${uploadPet.name}: ${reportFileName}.`);
    showToast('Report uploaded and linked to timeline successfully!');
    setUploadPet(null);
    setReportFileName('');
  };

  // Review submission
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.author || !reviewForm.comment) {
      showToast('Please enter your name and comments.', 'danger');
      return;
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      author: reviewForm.author,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      date: new Date().toISOString().split('T')[0]
    };

    setVets(prevVets => prevVets.map(vet => {
      if (vet.id === bookingVet.id) {
        const updated = [newReview, ...vet.reviews];
        const newAvg = (updated.reduce((sum, r) => sum + r.rating, 0) / updated.length).toFixed(1);
        const updatedVet = { ...vet, reviews: updated, reviewsCount: updated.length, rating: parseFloat(newAvg) };
        setBookingVet(updatedVet);
        return updatedVet;
      }
      return vet;
    }));

    showToast('Clinic review submitted successfully!');
    setReviewForm({ author: '', rating: 5, comment: '' });
  };

  // Cancel Appointment
  const handleCancelAppt = (apptId) => {
    setAppointments(prev => prev.map(appt => {
      if (appt.id === apptId) {
        logAuditAction(currentOwner ? currentOwner.name : 'System', 'User', 'Cancel Appointment', `Cancelled appointment id ${apptId}.`);
        return { ...appt, status: 'cancelled' };
      }
      return appt;
    }));
    showToast('Appointment cancelled.');
  };

  // Reschedule Booking
  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      showToast('Please choose date and slot.', 'danger');
      return;
    }
    setAppointments(prev => prev.map(appt => {
      if (appt.id === reschedulingAppt.id) {
        logAuditAction(currentOwner.name, 'Pet Owner', 'Reschedule Appointment', `Rescheduled visit from ${reschedulingAppt.date} to ${selectedDate}.`);
        return { ...appt, date: selectedDate, time: selectedSlot };
      }
      return appt;
    }));
    showToast('Appointment rescheduled.');
    setReschedulingAppt(null);
    setSelectedDate('');
    setSelectedSlot('');
  };

  // Clinical check-in: Add Prescription Med
  const handleAddMedToPrescription = (e) => {
    e.preventDefault();
    if (!medInput.name || !medInput.dosage) {
      showToast('Please specify drug name and dosage instructions.', 'danger');
      return;
    }
    setPrescriptionMeds(prev => [...prev, medInput]);
    setMedInput({ name: '', dosage: '', morning: true, afternoon: false, night: true, days: 5, notes: '' });
  };

  // Clinical check-in: Complete Consult Entry
  const handleConsultSubmit = (e) => {
    e.preventDefault();
    if (!clinicalDiagnosis || !chiefComplaint) {
      showToast('Diagnosis and Chief Complaint are required.', 'danger');
      return;
    }

    const consultId = `REC-${Math.floor(Math.random() * 900) + 100}`;
    const newRecord = {
      id: consultId,
      petId: completingAppt.petId,
      doctorId: 'vet-1',
      doctorName: 'Dr. Sarah Connor',
      clinicName: 'Madurai Pet Care Center',
      visitDate: new Date().toISOString().split('T')[0],
      type: vaccineInput.administer ? 'Vaccination' : 'Checkup',
      chiefComplaint: chiefComplaint,
      vitals: clinicalVitals,
      diagnosis: clinicalDiagnosis,
      notes: clinicalNotes,
      prescriptions: prescriptionMeds,
      vaccinations: vaccineInput.administer ? [
        {
          name: vaccineInput.name || 'Core Booster',
          batch: vaccineInput.batch || 'B-9021',
          manufacturer: vaccineInput.manufacturer || 'Pfizer Pet Health',
          dateGiven: new Date().toISOString().split('T')[0],
          dueDate: vaccineInput.dueDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ] : [],
      followUpDate: completingAppt.followUp || ''
    };

    // Save record
    setMedicalRecords(prev => [newRecord, ...prev]);

    // Deduct stock in inventory dynamically based on treatments and medications
    setInventory(prevInv => {
      return prevInv.map(item => {
        let deductCount = 0;
        if (vaccineInput.administer && item.category === 'Vaccines') {
          const vName = (vaccineInput.name || '').toLowerCase();
          const iName = (item.name || '').toLowerCase();
          if (vName.includes(iName) || iName.includes(vName) ||
              (iName.includes('dhpp') && vName.includes('dhpp')) ||
              (iName.includes('rabies') && vName.includes('rabies'))) {
            deductCount += 1;
          }
        }
        prescriptionMeds.forEach(med => {
          const mName = (med.name || '').toLowerCase();
          const iName = (item.name || '').toLowerCase();
          if (mName.includes(iName) || iName.includes(mName)) {
            deductCount += 1;
          }
        });
        if (deductCount > 0) {
          return {
            ...item,
            stock: Math.max(0, item.stock - deductCount),
            consumptionThisMonth: item.consumptionThisMonth + deductCount
          };
        }
        return item;
      });
    });

    // Update appointment status
    setAppointments(prev => prev.map(appt => {
      if (appt.id === completingAppt.id) {
        return { 
          ...appt, 
          status: 'completed', 
          notes: clinicalNotes,
          prescription: prescriptionMeds.map(m => `${m.name}: ${m.dosage}`).join('\n')
        };
      }
      return appt;
    }));

    logAuditAction('Dr. Sarah Connor', 'Veterinarian', 'Complete Consultation', `Created clinical report for ${completingAppt.petName} (ID: ${completingAppt.petId}).`);
    showToast('Consultation check-in record saved successfully!');
    
    // Reset consult form
    setCompletingAppt(null);
    setChiefComplaint('');
    setClinicalDiagnosis('');
    setClinicalNotes('');
    setPrescriptionMeds([]);
    setVaccineInput({ administer: false, name: '', batch: '', manufacturer: '', dueDate: '' });
  };

  // Vet Lookup Pet search & consent prompt (UNRESTRICTED)
  const handleVetPetSearch = (e) => {
    e.preventDefault();
    const query = vetSearchTerm.toLowerCase().trim();
    const found = pets.find(p => 
      p.id.toLowerCase() === query || 
      p.name.toLowerCase() === query || 
      p.microchip.toLowerCase() === query ||
      p.emergencyContact.toLowerCase().includes(query) ||
      p.ownerEmail.toLowerCase() === query
    );
    if (found) {
      setSearchedPet(found);
      setAuthError('');
      logAuditAction('Dr. Sarah Connor', 'Veterinarian', 'Pet Search Lookup', `Searched history details of Pet: ${found.name}.`);
    } else {
      setSearchedPet(null);
      setAuthError('No pet matching ID, Name, Microchip, or Contact Email/Phone found.');
    }
  };

  // Clinic Admin checkout checkout invoices
  const initiateCheckout = (appt) => {
    setCheckoutAppt(appt);
    
    // fetch medical record matching the appointment's pet and date to itemize fees
    const record = medicalRecords.find(r => r.petId === appt.petId && r.visitDate === appt.date);
    
    const items = [
      { desc: 'General Consultation Session', fee: appt.vetId === 'vet-3' ? 800 : 650 }
    ];

    if (record) {
      if (record.vaccinations.length > 0) {
        items.push({ desc: `Vaccine Administration (${record.vaccinations[0].name})`, fee: 450 });
      }
      if (record.prescriptions.length > 0) {
        items.push({ desc: 'Prescription Pharmacy dispensing fee', fee: 200 });
      }
    }

    setBillItems(items);
  };

  // Complete Payment checkout
  const completePaymentInvoice = () => {
    const total = billItems.reduce((sum, item) => sum + item.fee, 0);
    setAppointments(prev => prev.map(appt => {
      if (appt.id === checkoutAppt.id) {
        return { ...appt, billed: true, billAmount: total };
      }
      return appt;
    }));

    logAuditAction('Madurai Pet Care Admin', 'Clinic Admin', 'Generate Invoice', `Processed billing checkout for ${checkoutAppt.petName} (Consult Fee: ₹${total}).`);
    showToast(`Invoice generated successfully! Billed: ₹${total}`);
    setCheckoutAppt(null);
    setBillItems([]);
  };

  // Super Admin approvals
  const [pendingClinics, setPendingClinics] = useState([
    { id: 'p-1', name: 'Thirunagar Animal Welfare Hospital', location: 'Thirunagar, Madurai', applicant: 'Dr. Priya Nair' }
  ]);

  const approveClinicRequest = (clinic) => {
    setClinics(prev => [...prev, { id: clinic.id, name: clinic.name, location: clinic.location, rating: 5.0 }]);
    setPendingClinics(prev => prev.filter(c => c.id !== clinic.id));
    logAuditAction('JacoVet Operations Team', 'Super Admin', 'Approve Clinic', `Approved registration credentials for ${clinic.name}.`);
    showToast(`Clinic "${clinic.name}" approved and verified!`);
  };

  // Logouts
  const handleOwnerLogout = () => {
    setCurrentOwner(null);
    setActiveView('home');
    window.history.pushState(null, '', '/');
    showToast('Logged out of JacoVet.');
  };

  const handleDoctorLogout = () => {
    setIsDoctorLoggedIn(false);
    setActiveView('home');
    window.history.pushState(null, '', '/');
    showToast('Logged out of Doctor Portal.');
  };

  // Vet Dashboard Stats
  const clientAppointments = appointments.filter(appt => currentOwner && appt.ownerEmail === currentOwner.email);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast notifications rendering */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type === 'danger' ? 'toast-danger' : 'toast-success'}`}>
            {toast.type === 'danger' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Navigation Header */}
      <header className="navbar">
        <div className="container nav-content">
          <a href="#" className="logo-link" onClick={() => { setActiveView('home'); setSelectedPet(null); }}>
            <Activity className="logo-icon" size={28} />
            <span>JacoVet</span>
          </a>
          <nav className="nav-links">
            <a 
              href="#" 
              className={`nav-link ${activeView === 'home' ? 'active' : ''}`}
              onClick={() => { setActiveView('home'); setSelectedPet(null); }}
            >
              Find Vets
            </a>

            {/* Client Dashboard Access */}
            <a 
              href="#" 
              className={`nav-link ${activeView === 'client-dashboard' || activeView === 'pet-timeline' ? 'active' : ''}`}
              onClick={() => switchWorkspaceRole('owner')}
            >
              My Pets & Timeline
            </a>

            {/* Doctor Dashboard Access */}
            {isDoctorLoggedIn && (
              <a 
                href="#" 
                className={`nav-link ${activeView === 'vet-dashboard' ? 'active' : ''}`}
                onClick={() => switchWorkspaceRole('doctor')}
              >
                Doctor Console
              </a>
            )}

            {/* Clinic Admin Workspace Access */}
            {isAdminLoggedIn && (
              <a 
                href="#" 
                className={`nav-link ${activeView === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => switchWorkspaceRole('admin')}
              >
                Clinic Desk
              </a>
            )}

            {/* Super Admin Access */}
            {isSuperAdminLoggedIn && (
              <a 
                href="#" 
                className={`nav-link ${activeView === 'super-admin-dashboard' ? 'active' : ''}`}
                onClick={() => switchWorkspaceRole('super-admin')}
              >
                Central Console
              </a>
            )}

            {/* Quick role-switch bypass selector in the header */}
            <div style={{ borderLeft: '1px solid var(--neutral-200)', paddingLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.25rem 1.5rem 0.25rem 0.5rem', fontSize: '0.8rem', border: '1px solid var(--neutral-300)' }}
                value={currentRole}
                onChange={(e) => switchWorkspaceRole(e.target.value)}
              >
                <option value="owner">Pet Parent Portal</option>
                <option value="doctor">Vet Workspace</option>
                <option value="admin">Clinic Admin Desk</option>
                <option value="super-admin">Super Admin Panel</option>
              </select>
            </div>

            {/* Session Actions */}
            {isSuperAdminLoggedIn && currentRole === 'super-admin' ? (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => { setIsSuperAdminLoggedIn(false); handleDoctorLogout(); }}>Logout</button>
            ) : isAdminLoggedIn && currentRole === 'admin' ? (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => { setIsAdminLoggedIn(false); handleDoctorLogout(); }}>Logout</button>
            ) : isDoctorLoggedIn && currentRole === 'doctor' ? (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleDoctorLogout}>Logout</button>
            ) : isOwnerLoggedIn && currentRole === 'owner' ? (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleOwnerLogout}>Logout</button>
            ) : (
              <a 
                href="#" 
                className="nav-link"
                style={{ color: 'var(--primary)', fontWeight: 'bold' }}
                onClick={() => { setAuthTab('owner-login'); setActiveView('login-portal'); }}
              >
                Login
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Container Content */}
      <main style={{ flex: 1 }}>
        {/* VIEW 1: HOME LANDING PAGE */}
        {activeView === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="hero">
              <div className="container hero-grid">
                <div>
                  <div className="hero-tag">
                    <Shield size={14} style={{ color: 'var(--primary)' }} />
                    <span>One Pet • One Record • Unified Health Platform</span>
                  </div>
                  <h1 className="hero-title">
                    Unified health timeline for your <span>beloved pets</span>.
                  </h1>
                  <p className="hero-desc">
                    Book vet appointments, access lifelong medical timelines, and secure vaccine credentials. Owners retain full control of diagnostic history.
                  </p>
                  <div className="hero-btns">
                    <button className="btn btn-primary" onClick={() => {
                      const element = document.getElementById('browse-vets');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      Book Consultation Visit
                    </button>
                    <button className="btn btn-secondary" onClick={() => switchWorkspaceRole('owner')}>
                      My Pets Records
                    </button>
                  </div>
                  <div className="hero-stats">
                    <div className="stat-item">
                      <span className="stat-number">3+</span>
                      <span className="stat-label">Partner Clinics</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">2,400+</span>
                      <span className="stat-label">Active Timelines</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">100% Secure</span>
                      <span className="stat-label">Consent Restricted</span>
                    </div>
                  </div>
                </div>
                <div className="hero-image-wrapper">
                  <div className="hero-image-bg"></div>
                  <img src="https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=500&q=80" alt="Happy Dog and Cat" className="hero-img" />
                </div>
              </div>
            </section>

            {/* Category Pills & Search */}
            <section id="browse-vets" className="category-section">
              <div className="container">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Verified Veterinary Clinics</h2>
                    <p className="section-subtitle">Search veterinarians and schedule appointments in Madurai.</p>
                  </div>
                  
                  {/* Search input box */}
                  <div className="search-box">
                    <Search size={20} style={{ color: '#94a3b8', margin: 'auto 0 auto 0.75rem' }} />
                    <input 
                      type="text" 
                      placeholder="Search name, clinic location, specialty..." 
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Simulated Geolocation Settings & Sort Options */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--neutral-200)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--neutral-650)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Navigation size={15} style={{ color: 'var(--primary)' }} />
                        Location Center:
                      </span>
                      <select
                        className="form-control"
                        style={{ width: 'auto', padding: '0.4rem 1.5rem 0.4rem 0.75rem', fontSize: '0.9rem' }}
                        value={isCustomLoc ? 'custom' : currentUserLocation.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setIsCustomLoc(true);
                          } else {
                            setIsCustomLoc(false);
                            const selectedPreset = userLocationPresets.find(preset => preset.name === val);
                            if (selectedPreset) {
                              setCurrentUserLocation(selectedPreset);
                              setCustomLat(selectedPreset.lat.toString());
                              setCustomLng(selectedPreset.lng.toString());
                              showToast(`Location set to: ${selectedPreset.name}`);
                            }
                          }
                        }}
                      >
                        {userLocationPresets.map(preset => (
                          <option key={preset.name} value={preset.name}>{preset.name}</option>
                        ))}
                        <option value="custom">✏️ Custom Coordinates...</option>
                      </select>

                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={handleDetectLocation}
                      >
                        📍 Detect Live Location
                      </button>
                    </div>

                    {isCustomLoc && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'slideUp 0.2s ease', backgroundColor: 'var(--neutral-50)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Lat:</span>
                          <input
                            type="number"
                            step="0.0001"
                            className="form-control"
                            style={{ width: '100px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            value={customLat}
                            onChange={(e) => {
                              const latVal = e.target.value;
                              setCustomLat(latVal);
                              const lat = parseFloat(latVal);
                              const lng = parseFloat(customLng);
                              if (!isNaN(lat) && !isNaN(lng)) {
                                setCurrentUserLocation({ name: 'Custom Coordinates', lat, lng });
                              }
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Lng:</span>
                          <input
                            type="number"
                            step="0.0001"
                            className="form-control"
                            style={{ width: '100px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            value={customLng}
                            onChange={(e) => {
                              const lngVal = e.target.value;
                              setCustomLng(lngVal);
                              const lat = parseFloat(customLat);
                              const lng = parseFloat(lngVal);
                              if (!isNaN(lat) && !isNaN(lng)) {
                                setCurrentUserLocation({ name: 'Custom Coordinates', lat, lng });
                              }
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                          Active coords: {currentUserLocation.lat.toFixed(4)}, {currentUserLocation.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--neutral-650)' }}>Sort By:</span>
                    <select
                      className="form-control"
                      style={{ width: 'auto', padding: '0.4rem 1.5rem 0.4rem 0.75rem', fontSize: '0.9rem' }}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="proximity">Proximity (Nearest First)</option>
                      <option value="rating">Top Rated</option>
                      <option value="price">Consultation Fee</option>
                    </select>
                  </div>
                </div>

                {/* Category Pills layout */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="category-pills">
                    {petCategories.map(cat => (
                      <button
                        key={cat.name}
                        className={`category-pill ${selectedCategory === cat.name ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.name)}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                  {hasFiltersActive() && (
                    <button 
                      onClick={() => {
                        setSelectedCategory('All Specialties');
                        setSearchQuery('');
                      }} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Vets list */}
                {processedVets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--neutral-300)' }}>
                    <AlertCircle size={40} style={{ color: 'var(--neutral-400)', marginBottom: '1rem' }} />
                    <h3>No clinics matching criteria</h3>
                  </div>
                ) : (
                  <div className="vets-grid">
                    {processedVets.map(vet => (
                      <div key={vet.id} className="vet-card">
                        <div className="vet-card-header">
                          <img src={vet.image} alt={vet.name} className="vet-avatar" />
                          <div className="vet-name-spec">
                            <div className="vet-rating" style={{ cursor: 'pointer' }} onClick={() => triggerBookingGate(vet)}>
                              <span>⭐</span>
                              <span>{vet.rating} ({vet.reviewsCount} reviews)</span>
                            </div>
                            <h3 className="vet-card-title">{vet.name}</h3>
                            <span className="vet-card-spec">{vet.specialty}</span>
                            <span className="vet-card-exp">{vet.experience} experience</span>
                          </div>
                        </div>
                        <p className="vet-card-bio">{vet.bio}</p>
                        
                        <div className="vet-card-details">
                          <div className="vet-detail-item">
                            <span className="vet-detail-label">Clinic Proximity</span>
                            <span className="vet-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)' }}>
                              <Navigation size={12} /> {vet.distance.toFixed(1)} km away
                            </span>
                          </div>
                          <div className="vet-detail-item">
                            <span className="vet-detail-label">Clinic Location</span>
                            <span className="vet-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <MapPin size={12} /> {vet.location.split(',')[0]}
                            </span>
                          </div>
                        </div>

                        <div className="vet-card-footer">
                          <div className="vet-price-tag">
                            <span className="vet-detail-label">Consultation Fee</span>
                            <span className="vet-price-amount">₹{vet.price}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }} onClick={() => triggerBookingGate(vet)}>
                              Reviews
                            </button>
                            <button className="btn btn-primary" onClick={() => triggerBookingGate(vet)}>
                              {isOwnerLoggedIn ? 'Book Visit' : 'Login to Book'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: UNIFIED AUTHENTICATION ENTRANCE */}
        {activeView === 'login-portal' && (
          <div className="container" style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', animation: 'slideUp 0.4s ease' }}>
              
              <div className="appointments-tabs" style={{ display: 'flex', marginBottom: '2rem', justifyContent: 'center', gap: '0.5rem' }}>
                <button className={`appt-tab-btn ${authTab === 'owner-login' ? 'active' : ''}`} onClick={() => { setAuthTab('owner-login'); setAuthError(''); }}>Owner Signin</button>
                <button className={`appt-tab-btn ${authTab === 'owner-signup' ? 'active' : ''}`} onClick={() => { setAuthTab('owner-signup'); setAuthError(''); }}>Owner Register</button>
                <button className={`appt-tab-btn ${authTab === 'doctor-login' ? 'active' : ''}`} onClick={() => { setAuthTab('doctor-login'); setAuthError(''); }}>Vet Portal</button>
                <button className={`appt-tab-btn ${authTab === 'admin-login' ? 'active' : ''}`} onClick={() => { setAuthTab('admin-login'); setAuthError(''); }}>Clinic Desk</button>
                <button className={`appt-tab-btn ${authTab === 'super-login' ? 'active' : ''}`} onClick={() => { setAuthTab('super-login'); setAuthError(''); }}>System Operations</button>
              </div>

              {authError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--accent-red)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              {/* Owner Login form */}
              {authTab === 'owner-login' && (
                <form onSubmit={handleOwnerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>Pet Owner Sign In</h3>
                    <p style={{ color: 'var(--neutral-600)', fontSize: '0.85rem' }}>Unlock pet records and consultation booking.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" placeholder="owner@jacovet.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  </div>
                  <div style={{ backgroundColor: 'var(--neutral-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                    💡 <strong>Demo Credentials:</strong> owner@jacovet.com / owner123
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In 🐾</button>
                </form>
              )}

              {/* Owner Signup form */}
              {authTab === 'owner-signup' && (
                <form onSubmit={handleOwnerSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>Create Parent Profile</h3>
                    <p style={{ color: 'var(--neutral-600)', fontSize: '0.85rem' }}>Setup profile to issue pet health timelines.</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Owner Name *</label>
                      <input type="text" className="form-control" placeholder="Vignesh" value={ownerSignupForm.name} onChange={(e) => setOwnerSignupForm(prev => ({ ...prev, name: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input type="email" className="form-control" placeholder="vignesh@example.com" value={ownerSignupForm.email} onChange={(e) => setOwnerSignupForm(prev => ({ ...prev, email: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input type="password" className="form-control" placeholder="Choose Password" value={ownerSignupForm.password} onChange={(e) => setOwnerSignupForm(prev => ({ ...prev, password: e.target.value }))} required />
                  </div>
                  <h4 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.2rem', color: 'var(--neutral-900)' }}>Pet Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Pet Name *</label>
                      <input type="text" className="form-control" placeholder="Rocky" value={ownerSignupForm.petName} onChange={(e) => setOwnerSignupForm(prev => ({ ...prev, petName: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Species *</label>
                      <select className="form-control" value={ownerSignupForm.petCategory} onChange={(e) => setOwnerSignupForm(prev => ({ ...prev, petCategory: e.target.value }))}>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Exotic">Exotic</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account & Log In</button>
                </form>
              )}

              {/* Doctor Login Form */}
              {authTab === 'doctor-login' && (
                <form onSubmit={handleDoctorLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>Veterinarian Workspace</h3>
                    <p style={{ color: 'var(--neutral-650)', fontSize: '0.85rem' }}>Enter credentials to view scheduled lists.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Doctor Email / Username</label>
                    <input type="email" className="form-control" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Access Passcode</label>
                    <input type="password" className="form-control" placeholder="Enter demo passcode" value={loginPasscode} onChange={(e) => setLoginPasscode(e.target.value)} required />
                  </div>
                  <div style={{ backgroundColor: 'var(--neutral-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                    🔑 <strong>Passcode:</strong> <code style={{ color: 'var(--primary)', fontWeight: 'bold' }}>doctor123</code>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Authenticate Credentials</button>
                </form>
              )}

              {/* Clinic Admin Login */}
              {authTab === 'admin-login' && (
                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>Clinic Desk Sign In</h3>
                    <p style={{ color: 'var(--neutral-650)', fontSize: '0.85rem' }}>Access clinic billing dashboards and doctor scheduling.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Access Passcode</label>
                    <input type="password" className="form-control" placeholder="Enter admin passcode" value={loginPasscode} onChange={(e) => setLoginPasscode(e.target.value)} required />
                  </div>
                  <div style={{ backgroundColor: 'var(--neutral-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                    🔑 <strong>Passcode:</strong> <code style={{ color: 'var(--primary)', fontWeight: 'bold' }}>admin123</code>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Enter Administration Desk</button>
                </form>
              )}

              {/* Super Admin Login */}
              {authTab === 'super-login' && (
                <form onSubmit={handleSuperAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>Operations Command Center</h3>
                    <p style={{ color: 'var(--neutral-650)', fontSize: '0.85rem' }}>Central operations authority logins.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Access Passcode</label>
                    <input type="password" className="form-control" placeholder="Enter super passcode" value={loginPasscode} onChange={(e) => setLoginPasscode(e.target.value)} required />
                  </div>
                  <div style={{ backgroundColor: 'var(--neutral-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                    🔑 <strong>Passcode:</strong> <code style={{ color: 'var(--primary)', fontWeight: 'bold' }}>super123</code>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Authenticate Central Authority</button>
                </form>
              )}

            </div>
          </div>
        )}

        {/* VIEW 3: CLIENT DASHBOARD (OWNER PORTAL) */}
        {activeView === 'client-dashboard' && isOwnerLoggedIn && (
          <div className="container" style={{ padding: '3rem 0' }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '800' }}>Pet Parent Dashboard</h1>
                <p style={{ color: 'var(--neutral-600)' }}>Manage your pet profiles, inspect medical records, and monitor scheduled visits.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setPetRegModalOpen(true)}>
                  <Plus size={16} /> Register Pet
                </button>
                <button className="btn btn-primary" onClick={() => setDashboardTab('book')}>
                  Book Consultation
                </button>
              </div>
            </div>

            {/* Dashboard Navigation Tabs */}
            <div className="appointments-tabs" style={{ marginBottom: '2rem' }}>
              <button className={`appt-tab-btn ${dashboardTab === 'pets' ? 'active' : ''}`} onClick={() => setDashboardTab('pets')}>
                My Registered Pets & Timelines ({pets.filter(p => p.ownerEmail === currentOwner.email).length})
              </button>
              <button className={`appt-tab-btn ${dashboardTab === 'book' ? 'active' : ''}`} onClick={() => setDashboardTab('book')}>
                Book Vet Appointment 🩺
              </button>
              <button className={`appt-tab-btn ${dashboardTab === 'appointments' ? 'active' : ''}`} onClick={() => setDashboardTab('appointments')}>
                Appointments History & Prescriptions ({appointments.filter(a => a.ownerEmail === currentOwner.email).length})
              </button>
            </div>

            {/* Tab 1: Pets profiles list */}
            {dashboardTab === 'pets' && (
              <div>
                {pets.filter(p => p.ownerEmail === currentOwner.email).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--neutral-300)' }}>
                    <Info size={40} style={{ color: 'var(--neutral-300)', marginBottom: '1rem' }} />
                    <h3>No Pets Registered</h3>
                    <p style={{ color: 'var(--neutral-600)', marginBottom: '1.5rem' }}>Register your pet to manage medical timeline sheets.</p>
                    <button className="btn btn-primary" onClick={() => setPetRegModalOpen(true)}>Register first pet</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                    {pets
                      .filter(p => p.ownerEmail === currentOwner.email)
                      .map(pet => (
                        <div key={pet.id} className="pet-profile-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                              <h3 style={{ fontSize: '1.35rem', color: 'var(--neutral-900)' }}>{pet.name}</h3>
                              <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 'bold' }}>{pet.species} • {pet.breed}</span>
                            </div>
                            <span style={{ backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-600)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              ID: {pet.id}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', background: 'var(--neutral-50)', padding: '0.8rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--neutral-100)' }}>
                            <div><strong>Gender:</strong> {pet.gender}</div>
                            <div><strong>Blood Group:</strong> {pet.bloodGroup}</div>
                            <div><strong>Weight:</strong> {pet.weight}</div>
                            <div><strong>Insurance:</strong> {pet.insurance.split(' ')[0]}</div>
                            <div style={{ gridColumn: '1 / -1' }}><strong>Microchip:</strong> {pet.microchip}</div>
                            <div style={{ gridColumn: '1 / -1', color: 'var(--accent-red)' }}><strong>Allergies:</strong> {qrPet ? qrPet.allergies : pet.allergies}</div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.5rem', flex: 1, fontSize: '0.8rem' }} onClick={() => setQrPet(pet)}>
                              <QrCode size={14} /> Emergency QR
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '0.5rem', flex: 1, fontSize: '0.8rem' }} onClick={() => setUploadPet(pet)}>
                              <Upload size={14} /> Upload Report
                            </button>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '0.5rem', flex: 1.2, fontSize: '0.8rem' }}
                              onClick={() => {
                                setSelectedPet(pet);
                                setActiveView('pet-timeline');
                              }}
                            >
                              Medical Records
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Book Vet Appointment */}
            {dashboardTab === 'book' && (
              <div>
                <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem' }}>Find & Schedule with Local Vets</h3>
                    <p style={{ color: 'var(--neutral-600)', fontSize: '0.85rem' }}>Schedule direct consultations at partner clinics.</p>
                  </div>
                </div>

                {/* Simulated Geolocation Settings & Sort Options */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--neutral-200)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--neutral-650)' }}>Location:</span>
                      <select
                        className="form-control"
                        style={{ width: 'auto', padding: '0.4rem 1.5rem 0.4rem 0.75rem', fontSize: '0.9rem' }}
                        value={isCustomLoc ? 'custom' : currentUserLocation.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setIsCustomLoc(true);
                          } else {
                            setIsCustomLoc(false);
                            const selectedPreset = userLocationPresets.find(preset => preset.name === val);
                            if (selectedPreset) {
                              setCurrentUserLocation(selectedPreset);
                              setCustomLat(selectedPreset.lat.toString());
                              setCustomLng(selectedPreset.lng.toString());
                              showToast(`Location set to: ${selectedPreset.name}`);
                            }
                          }
                        }}
                      >
                        {userLocationPresets.map(preset => (
                          <option key={preset.name} value={preset.name}>{preset.name}</option>
                        ))}
                        <option value="custom">✏️ Custom Coordinates...</option>
                      </select>

                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={handleDetectLocation}
                      >
                        📍 Detect Live Location
                      </button>
                    </div>

                    {isCustomLoc && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'slideUp 0.2s ease', backgroundColor: 'var(--neutral-50)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Lat:</span>
                          <input
                            type="number"
                            step="0.0001"
                            className="form-control"
                            style={{ width: '90px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            value={customLat}
                            onChange={(e) => {
                              const latVal = e.target.value;
                              setCustomLat(latVal);
                              const lat = parseFloat(latVal);
                              const lng = parseFloat(customLng);
                              if (!isNaN(lat) && !isNaN(lng)) {
                                setCurrentUserLocation({ name: 'Custom Coordinates', lat, lng });
                              }
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Lng:</span>
                          <input
                            type="number"
                            step="0.0001"
                            className="form-control"
                            style={{ width: '90px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            value={customLng}
                            onChange={(e) => {
                              const lngVal = e.target.value;
                              setCustomLng(lngVal);
                              const lat = parseFloat(customLat);
                              const lng = parseFloat(lngVal);
                              if (!isNaN(lat) && !isNaN(lng)) {
                                setCurrentUserLocation({ name: 'Custom Coordinates', lat, lng });
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--neutral-650)' }}>Sort By:</span>
                    <select
                      className="form-control"
                      style={{ width: 'auto', padding: '0.4rem 1.5rem 0.4rem 0.75rem', fontSize: '0.9rem' }}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="proximity">Proximity</option>
                      <option value="rating">Top Rated</option>
                      <option value="price">Consultation Fee</option>
                    </select>
                  </div>
                </div>

                <div className="vets-grid">
                  {processedVets.map(vet => (
                    <div key={vet.id} className="vet-card">
                      <div className="vet-card-header">
                        <img src={vet.image} alt={vet.name} className="vet-avatar" />
                        <div className="vet-name-spec">
                          <h3 className="vet-card-title">{vet.name}</h3>
                          <span className="vet-card-spec">{vet.specialty}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>{vet.location}</span>
                        </div>
                      </div>
                      <p className="vet-card-bio">{vet.bio}</p>
                      
                      <div className="vet-card-details">
                        <div className="vet-detail-item">
                          <span className="vet-detail-label">Proximity</span>
                          <span className="vet-detail-value" style={{ color: 'var(--primary)' }}>
                            {vet.distance.toFixed(1)} km away
                          </span>
                        </div>
                        <div className="vet-detail-item">
                          <span className="vet-detail-label">Fee</span>
                          <span className="vet-detail-value">₹{vet.price}</span>
                        </div>
                      </div>

                      <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => triggerBookingGate(vet)}>
                        Schedule Visit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Appointments list & prescriptions display (PROMINENT CARDS) */}
            {dashboardTab === 'appointments' && (
              <div className="card">
                <div className="appointments-tabs" style={{ borderBottomColor: 'var(--neutral-100)' }}>
                  {[
                    { id: 'upcoming', label: 'Upcoming Visits' },
                    { id: 'completed', label: 'Completed Consults & Prescribed Medicines' },
                    { id: 'cancelled', label: 'Cancelled' }
                  ].map(subTab => (
                    <button
                      key={subTab.id}
                      className={`appt-tab-btn ${apptDashboardSubTab === subTab.id ? 'active' : ''}`}
                      onClick={() => setApptDashboardSubTab(subTab.id)}
                    >
                      {subTab.label} ({clientAppointments.filter(a => a.status === subTab.id).length})
                    </button>
                  ))}
                </div>

                {clientAppointments.filter(a => a.status === apptDashboardSubTab).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <Info size={32} style={{ color: 'var(--neutral-300)', marginBottom: '0.5rem' }} />
                    <p style={{ color: 'var(--neutral-600)', fontStyle: 'italic' }}>No consultations in this tab.</p>
                  </div>
                ) : (
                  <div className="appointment-list">
                    {clientAppointments
                      .filter(a => a.status === apptDashboardSubTab)
                      .map(appt => {
                        // Retrieve full medical record matching this pet and date to show details
                        const record = medicalRecords.find(r => r.petId === appt.petId && r.visitDate === appt.date);
                        
                        return (
                          <div key={appt.id} className="appointment-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.25rem' }}>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div className="appt-info-main">
                                <div className={`appt-status-icon ${appt.status === 'upcoming' ? 'status-upcoming-bg' : appt.status === 'completed' ? 'status-completed-bg' : 'status-cancelled-bg'}`}>
                                  <Stethoscope size={20} />
                                </div>
                                <div className="appt-details">
                                  <span className="appt-vet-name" style={{ fontSize: '1.2rem', color: 'var(--neutral-900)' }}>
                                    Pet: <strong>{appt.petName}</strong> ({appt.petCategory} • {appt.petBreed})
                                  </span>
                                  <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                    Clinic: {record ? record.clinicName : 'Madurai Pet Care Center'} (Doctor: {appt.vetName})
                                  </span>
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: 'bold', display: 'block' }}>{new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>{appt.time}</span>
                              </div>
                            </div>

                            {/* Detailed Clinical record on Completed tab */}
                            {appt.status === 'completed' && record && (
                              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--neutral-200)', marginTop: '0.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                                  <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Reason / Clinical Issue</span>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--neutral-800)', marginTop: '0.2rem' }}>"{record.chiefComplaint}"</p>
                                    
                                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', display: 'block', fontWeight: 'bold', marginTop: '0.75rem' }}>Diagnosis</span>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--neutral-800)', marginTop: '0.2rem' }}>{record.diagnosis}</p>
                                  </div>

                                  <div style={{ backgroundColor: 'white', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Medications Prescribed (Rx)</span>
                                    
                                    {record.prescriptions && record.prescriptions.length > 0 ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {record.prescriptions.map((med, idx) => (
                                          <div key={idx} style={{ fontSize: '0.8rem', borderBottom: idx < record.prescriptions.length - 1 ? '1px dashed var(--neutral-100)' : 'none', paddingBottom: '0.25rem' }}>
                                            <strong>{med.name}</strong> - {med.dosage}<br/>
                                            <span style={{ color: 'var(--neutral-500)', fontSize: '0.75rem' }}>
                                              {med.days} days • Schedule: {med.morning ? 'Morn ' : ''}{med.afternoon ? 'Aft ' : ''}{med.night ? 'Night' : ''}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p style={{ color: 'var(--neutral-400)', fontSize: '0.8rem', fontStyle: 'italic' }}>No medications prescribed.</p>
                                    )}

                                    {record.vaccinations && record.vaccinations.length > 0 && (
                                      <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--neutral-200)', fontSize: '0.8rem' }}>
                                        <strong>Vaccine Given:</strong> {record.vaccinations[0].name} (Due: {record.vaccinations[0].dueDate})
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  {record.vaccinations.length > 0 && (
                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setPrintCertificate({ pet: { name: appt.petName, breed: appt.petBreed, gender: 'Male' }, record })}>
                                      Vaccination Certificate
                                    </button>
                                  )}
                                  <button className="btn btn-teal" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setPrintPrescription(record)}>
                                    Print Prescription PDF
                                  </button>
                                </div>
                              </div>
                            )}

                            {appt.status === 'upcoming' && (
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--neutral-100)', paddingTop: '0.75rem' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setReschedulingAppt(appt)}>Reschedule</button>
                                <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleCancelAppt(appt.id)}>Cancel Visit</button>
                              </div>
                            )}

                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* VIEW 4: LIFELONG MEDICAL RECORD TIMELINE (OWNER PORTAL DETAIL VIEW) */}
        {activeView === 'pet-timeline' && selectedPet && (
          <div className="container" style={{ padding: '3rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--primary)', color: 'white', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                  {selectedPet.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: '850', color: 'var(--neutral-900)' }}>Medical History: {selectedPet.name}</h1>
                  <span style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>Species: {selectedPet.species} • Breed: {selectedPet.breed} • Microchip: {selectedPet.microchip}</span>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={() => { setActiveView('home'); setSelectedPet(null); }}>
                Back to Home Page
              </button>
            </div>

            {/* Vitals Summary Card */}
            <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem', backgroundColor: 'white' }}>
              <div>
                <span className="stat-label">Blood Group</span>
                <span className="stat-number" style={{ fontSize: '1.5rem', color: 'var(--accent-red)', marginTop: '0.25rem' }}>{selectedPet.bloodGroup}</span>
              </div>
              <div>
                <span className="stat-label">Active Allergies</span>
                <span className="stat-number" style={{ fontSize: '1.15rem', color: 'var(--neutral-800)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedPet.allergies}</span>
              </div>
              <div>
                <span className="stat-label">Last Recorded Weight</span>
                <span className="stat-number" style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>{selectedPet.weight}</span>
              </div>
              <div>
                <span className="stat-label">Emergency Phone</span>
                <span className="stat-number" style={{ fontSize: '1.25rem', color: 'var(--neutral-900)', marginTop: '0.25rem' }}>{selectedPet.emergencyContact}</span>
              </div>
            </div>

            {/* Booster Immunization Calendar Card */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💉 Active Immunization Booster Schedule
              </h2>
              
              {medicalRecords.filter(r => r.petId === selectedPet.id && r.vaccinations && r.vaccinations.length > 0).length === 0 ? (
                <p style={{ color: 'var(--neutral-400)', fontSize: '0.9rem' }}>No vaccination booster doses logged for this pet yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-500)' }}>
                        <th style={{ padding: '0.5rem' }}>Vaccine Name</th>
                        <th style={{ padding: '0.5rem' }}>1st Dose Date</th>
                        <th style={{ padding: '0.5rem' }}>Administered Clinic</th>
                        <th style={{ padding: '0.5rem' }}>Next Booster Date</th>
                        <th style={{ padding: '0.5rem' }}>Booster Status</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Certificate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecords
                        .filter(r => r.petId === selectedPet.id && r.vaccinations && r.vaccinations.length > 0)
                        .map(record => {
                          const vaccine = record.vaccinations[0];
                          const today = new Date();
                          const dueDate = new Date(vaccine.dueDate);
                          const diffTime = dueDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          let statusText = 'Booster Scheduled';
                          let statusColor = 'var(--primary)';
                          let statusBg = 'var(--primary-light)';
                          
                          if (diffDays < 0) {
                            statusText = 'Overdue ⚠️';
                            statusColor = 'var(--accent-red)';
                            statusBg = 'rgba(239, 68, 68, 0.1)';
                          } else if (diffDays <= 30) {
                            statusText = 'Booster Due Soon 🔔';
                            statusColor = 'var(--accent-amber)';
                            statusBg = 'rgba(245, 158, 11, 0.1)';
                          } else {
                            statusText = 'Active';
                            statusColor = 'var(--secondary)';
                            statusBg = 'var(--secondary-light)';
                          }

                          return (
                            <tr key={record.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                              <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{vaccine.name}</td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>{new Date(record.visitDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>{record.clinicName}</td>
                              <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700' }}>{new Date(vaccine.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>
                                <span style={{ backgroundColor: statusBg, color: statusColor, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  {statusText}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                  onClick={() => setPrintCertificate({ pet: selectedPet, record })}
                                >
                                  📄 Open
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Timeline records list */}
            <div className="card">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.75rem' }}>Lifelong Health Timeline</h2>

              {medicalRecords.filter(r => r.petId === selectedPet.id).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                  <Info size={32} style={{ color: 'var(--neutral-300)', marginBottom: '0.75rem' }} />
                  <p style={{ color: 'var(--neutral-600)', fontStyle: 'italic' }}>Timeline is empty. Record consult visits or upload lab reports to populate this chart.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', paddingLeft: '2rem', borderLeft: '3px solid var(--primary-light)' }}>
                  {medicalRecords
                    .filter(r => r.petId === selectedPet.id)
                    .map(record => (
                      <div key={record.id} style={{ position: 'relative', background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }}>
                        {/* Circle bullet node on the line */}
                        <div style={{ position: 'absolute', top: '24px', left: '-2.4rem', backgroundColor: 'var(--primary)', width: '14px', height: '14px', borderRadius: '50%', border: '3px solid white', boxShadow: '0 0 0 3px var(--primary-light)' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', fontWeight: 'bold' }}>{new Date(record.visitDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--neutral-900)', marginTop: '0.2.rem' }}>
                              {record.type} checkup • <span style={{ color: 'var(--primary)' }}>{record.clinicName}</span>
                            </h3>
                          </div>
                          <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            Ref: {record.id}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
                          <div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--neutral-800)', marginBottom: '0.5rem' }}><strong>Chief Complaint:</strong> "{record.chiefComplaint}"</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--neutral-800)', marginBottom: '0.5rem' }}><strong>Diagnosis:</strong> {record.diagnosis}</p>
                            {record.notes && <p style={{ fontSize: '0.9rem', color: 'var(--neutral-600)', fontStyle: 'italic' }}><strong>Notes:</strong> {record.notes}</p>}
                          </div>
                          
                          {/* Prescriptions / Vaccinations listing */}
                          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)' }}>
                            {record.prescriptions && record.prescriptions.length > 0 && (
                              <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--neutral-400)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Prescriptions Rx</h4>
                                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                  {record.prescriptions.map((p, i) => (
                                    <li key={i}>
                                      <strong>{p.name}</strong> - {p.dosage} ({p.days} days)
                                    </li>
                                  ))}
                                </ul>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', marginTop: '0.5rem', display: 'inline-flex' }}
                                  onClick={() => setPrintPrescription(record)}
                                >
                                  <FileText size={12} /> View Rx Details
                                </button>
                              </div>
                            )}

                            {record.vaccinations && record.vaccinations.length > 0 && (
                              <div>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--neutral-400)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Administered Vaccines</h4>
                                <div style={{ fontSize: '0.85rem' }}>
                                  <strong>Vaccine:</strong> {record.vaccinations[0].name}<br/>
                                  <strong>Batch:</strong> {record.vaccinations[0].batch}<br/>
                                  <strong>Due Date:</strong> {record.vaccinations[0].dueDate}
                                </div>
                                <button 
                                  className="btn btn-teal" 
                                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', marginTop: '0.5rem', display: 'inline-flex' }}
                                  onClick={() => setPrintCertificate({ pet: selectedPet, record })}
                                >
                                  <Award size={12} /> Vaccine Certificate
                                </button>
                              </div>
                            )}

                            {record.type === 'Lab Report' && (
                              <div style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                <FileText size={16} /> Attached Lab Document Available
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: VETERINARIAN PORTAL WORKSPACE */}
        {activeView === 'vet-dashboard' && isDoctorLoggedIn && (
          <div className="container" style={{ padding: '3rem 0' }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '850' }}>Doctor Consultation Workspace</h1>
                <p style={{ color: 'var(--neutral-650)' }}>Welcome back, <strong>Dr. Sarah Connor</strong>. Diagnose checked-in pets and view history.</p>
              </div>
              <span className="role-badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', cursor: 'default' }}>
                Madurai Pet Care Center
              </span>
            </div>

            {/* Dashboard Subtabs switcher */}
            <div className="appointments-tabs" style={{ marginBottom: '2rem' }}>
              <button className={`appt-tab-btn ${vetDashboardTab === 'appointments' ? 'active' : ''}`} onClick={() => setVetDashboardTab('appointments')}>
                Today's Appointments ({appointments.filter(a => a.vetId === 'vet-1' && a.status === 'upcoming').length})
              </button>
              <button className={`appt-tab-btn ${vetDashboardTab === 'search' ? 'active' : ''}`} onClick={() => setVetDashboardTab('search')}>
                Lookup Pet Medical History
              </button>
              <button className={`appt-tab-btn ${vetDashboardTab === 'subscription' ? 'active' : ''}`} onClick={() => setVetDashboardTab('subscription')}>
                JacoVet Partner Plan Setting 👑
              </button>
              <button className={`appt-tab-btn ${vetDashboardTab === 'inventory' ? 'active' : ''}`} onClick={() => setVetDashboardTab('inventory')}>
                Clinic Monthly Inventory 📦
              </button>
            </div>

            {/* Sub View 1: Today's Appointments */}
            {vetDashboardTab === 'appointments' && (
              <div>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                    <span className="stat-label">Pending Checks</span>
                    <span className="stat-number" style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>
                      {appointments.filter(a => a.vetId === 'vet-1' && a.status === 'upcoming').length}
                    </span>
                  </div>
                  <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                    <span className="stat-label">Completed Checks</span>
                    <span className="stat-number" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>
                      {appointments.filter(a => a.vetId === 'vet-1' && a.status === 'completed').length}
                    </span>
                  </div>
                  <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                    <span className="stat-label">Calculated Consultation Fee</span>
                    <span className="stat-number" style={{ color: 'var(--neutral-900)', marginTop: '0.25rem' }}>₹{totalEarnings}</span>
                  </div>
                </div>

                {/* List appointments */}
                <div className="card">
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Checked-in Pet Queue</h2>
                  
                  {appointments.filter(a => a.vetId === 'vet-1' && a.status === 'upcoming').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                      <CheckCircle size={36} style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }} />
                      <p style={{ color: 'var(--neutral-600)' }}>No pending appointments in your queue today.</p>
                    </div>
                  ) : (
                    <div className="appointment-list">
                      {appointments
                        .filter(a => a.vetId === 'vet-1' && a.status === 'upcoming')
                        .map(appt => (
                          <div key={appt.id} className="appointment-item">
                            <div className="appt-info-main">
                              <div className="appt-status-icon status-upcoming-bg">
                                <User size={20} />
                              </div>
                              <div className="appt-details">
                                <span className="appt-vet-name">Patient: {appt.petName} ({appt.petBreed})</span>
                                <span className="appt-sub-detail" style={{ fontWeight: 'bold' }}>Owner Phone emergency contact: {appt.ownerEmail}</span>
                                <span className="appt-sub-detail" style={{ fontStyle: 'italic', marginTop: '0.1rem' }}>Reason for Visit: "{appt.reason}"</span>
                              </div>
                            </div>

                            <div className="appt-meta-info">
                              <div className="appt-date-time" style={{ textAlign: 'right' }}>
                                <span className="appt-date" style={{ fontWeight: 'bold', display: 'block' }}>{new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span className="appt-time" style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', display: 'block' }}>{appt.time}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', display: 'block', marginTop: '0.2rem' }}>ID: {appt.petId}</span>
                              </div>

                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  className="btn btn-teal" 
                                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                  onClick={() => {
                                    setCompletingAppt(appt);
                                    setChiefComplaint(appt.reason);
                                  }}
                                >
                                  Consultation Check-in
                                </button>
                                <button className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => handleCancelAppt(appt.id)}>Cancel</button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Treated & Closed Cases Card */}
                <div className="card" style={{ marginTop: '2rem' }}>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={20} style={{ color: 'var(--secondary)' }} />
                    Treated & Closed Cases (Today)
                  </h2>
                  
                  {appointments.filter(a => a.vetId === 'vet-1' && a.status === 'completed').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                      <p style={{ color: 'var(--neutral-400)', fontSize: '0.9rem' }}>No cases treated and closed yet today.</p>
                    </div>
                  ) : (
                    <div className="appointment-list">
                      {appointments
                        .filter(a => a.vetId === 'vet-1' && a.status === 'completed')
                        .map(appt => (
                          <div key={appt.id} className="appointment-item" style={{ borderLeft: '4px solid var(--secondary)' }}>
                            <div className="appt-info-main">
                              <div className="appt-status-icon status-completed-bg">
                                <Check size={20} />
                              </div>
                              <div className="appt-details">
                                <span className="appt-vet-name" style={{ color: 'var(--neutral-900)' }}>Patient: {appt.petName} (ID: {appt.petId})</span>
                                <span className="appt-sub-detail" style={{ color: 'var(--neutral-500)' }}>Reason: "{appt.reason}"</span>
                                {appt.notes && (
                                  <span className="appt-sub-detail" style={{ color: 'var(--secondary)', fontWeight: '600', marginTop: '0.1rem' }}>
                                    Report Note: {appt.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="appt-meta-info">
                              <div className="appt-date-time" style={{ textAlign: 'right' }}>
                                <span className="appt-date" style={{ fontWeight: 'bold', display: 'block' }}>{new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span className="appt-time" style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', display: 'block' }}>{appt.time}</span>
                                <span className="appt-badge badge-completed" style={{ display: 'inline-block', marginTop: '0.25rem' }}>Closed Case</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub View 2: Lookup Pet Medical History (INSTANT DISPLAY ON SEARCH MATCH) */}
            {vetDashboardTab === 'search' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card">
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Inspect Pet Medical History File</h2>
                  <p style={{ color: 'var(--neutral-650)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    Type Pet ID (e.g. `PET-782`), Pet Name (e.g. `Rocky`), or Owner's phone contact/email details below to retrieve history.
                  </p>

                  <form onSubmit={handleVetPetSearch} style={{ display: 'flex', gap: '1rem', maxWidth: '600px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search Pet Name, ID, Phone, or Owner Email..." 
                      value={vetSearchTerm}
                      onChange={(e) => setVetSearchTerm(e.target.value)}
                      required 
                    />
                    <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Retrieve Records</button>
                  </form>

                  {authError && <p style={{ color: 'var(--accent-red)', marginTop: '0.75rem', fontSize: '0.9rem' }}>{authError}</p>}
                </div>

                {searchedPet && (
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Patient: {searchedPet.name} ({searchedPet.species})</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>Breed: {searchedPet.breed} • Owner Contact: {searchedPet.ownerEmail}</span>
                      </div>
                      <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.3rem 0.75rem', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        Pet ID: {searchedPet.id}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'var(--neutral-50)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--neutral-200)', fontSize: '0.85rem' }}>
                      <div><strong>Weight:</strong> {searchedPet.weight}</div>
                      <div><strong>Blood Group:</strong> {searchedPet.bloodGroup}</div>
                      <div><strong>Microchip:</strong> {searchedPet.microchip}</div>
                      <div><strong>Emergency Phone:</strong> {searchedPet.emergencyContact}</div>
                      <div style={{ gridColumn: '1 / -1', color: 'var(--accent-red)' }}><strong>Allergies:</strong> {searchedPet.allergies}</div>
                    </div>

                    {/* Lifelong timeline shown instantly */}
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--neutral-900)' }}>Chronological Medical History Timeline</h4>
                    
                    {medicalRecords.filter(r => r.petId === searchedPet.id).length === 0 ? (
                      <p style={{ color: 'var(--neutral-400)', fontStyle: 'italic', fontSize: '0.9rem' }}>Timeline is empty for this pet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--primary-light)' }}>
                        {medicalRecords
                          .filter(r => r.petId === searchedPet.id)
                          .map(record => (
                            <div key={record.id} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--neutral-200)', position: 'relative' }}>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--neutral-200)', paddingBottom: '0.4rem', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                <div>
                                  <strong>Date:</strong> {record.visitDate} • <strong>Clinic:</strong> {record.clinicName}
                                </div>
                                <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Dr. {record.doctorName} ({record.type})</span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', fontSize: '0.85rem' }}>
                                <div>
                                  <div><strong>Chief Complaint:</strong> "{record.chiefComplaint}"</div>
                                  <div><strong>Diagnosis:</strong> {record.diagnosis}</div>
                                  {record.notes && <div style={{ color: 'var(--neutral-600)', fontStyle: 'italic', marginTop: '0.2rem' }}>Notes: {record.notes}</div>}
                                </div>

                                <div style={{ backgroundColor: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--neutral-200)', fontSize: '0.8rem' }}>
                                  <strong>Prescriptions (Rx):</strong>
                                  {record.prescriptions && record.prescriptions.length > 0 ? (
                                    <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                      {record.prescriptions.map((p, idx) => (
                                        <li key={idx}>
                                          {p.name} - {p.dosage} ({p.days}d)
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span style={{ display: 'block', fontStyle: 'italic', color: 'var(--neutral-400)', fontSize: '0.75rem' }}>None</span>
                                  )}

                                  {record.vaccinations && record.vaccinations.length > 0 && (
                                    <div style={{ marginTop: '0.4rem', borderTop: '1px solid var(--neutral-200)', paddingTop: '0.25rem' }}>
                                      💉 <strong>Vaccine:</strong> {record.vaccinations[0].name}
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sub View 3: Subscriptions (gated from parent portal) */}
            {vetDashboardTab === 'subscription' && (
              <div className="card">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Manage Partner Program Subscription</h2>
                <p style={{ color: 'var(--neutral-650)', marginBottom: '2.5rem' }}>
                  Upgrade or modify your JacoVet Pet Health listing plan. Upgraded plan status highlights your practice profile with custom badges in search results.
                </p>

                {/* Sub Plan Display Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))', gap: '1.5rem' }}>
                  {subscriptionPlans.map(plan => {
                    const isCurrent = activeVetData.plan === plan.name;
                    return (
                      <div 
                        key={plan.name}
                        style={{ 
                          padding: '2rem', borderRadius: 'var(--radius-md)', 
                          border: isCurrent ? '3px solid var(--primary)' : '1px solid var(--neutral-200)',
                          backgroundColor: isCurrent ? 'var(--primary-light)' : 'white',
                          display: 'flex', flexDirection: 'column'
                        }}
                      >
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{plan.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '1.8rem', fontWeight: '850', color: 'var(--neutral-900)' }}>₹{plan.price}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginLeft: '0.25rem' }}>/ {plan.billing}</span>
                        </div>
                        
                        <p style={{ color: 'var(--neutral-600)', fontSize: '0.85rem', margin: '0 0 1.5rem 0', minHeight: '36px' }}>{plan.description}</p>
                        
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                          {plan.features.map((feature, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <CheckCircle size={14} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button 
                          type="button" 
                          className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'}`} 
                          style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem 1rem', marginTop: 'auto' }}
                          disabled={isCurrent}
                          onClick={() => handleUpgradeSubscription(plan.name)}
                        >
                          {isCurrent ? 'Active Plan' : `Change to ${plan.badge}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {vetDashboardTab === 'inventory' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Monthly Stock & Inventory Registry</h2>
                    <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>
                      Monitor and adjust quantities of clinical consumables, vaccines, and surgical supplies. Stocks decrement automatically upon consultation check-in.
                    </p>
                  </div>
                  <button 
                    className="btn btn-teal" 
                    onClick={() => {
                      setInventory(prev => prev.map(item => ({ ...item, stock: item.stock + 10 })));
                      showToast('Re-ordered and refueled all inventory lines (+10 units)!');
                    }}
                  >
                    🔄 Restock All Items (+10)
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-650)' }}>
                        <th style={{ padding: '0.75rem' }}>Item Description</th>
                        <th style={{ padding: '0.75rem' }}>Category</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Stock Level</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status Alert</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>This Month's Consumption</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(item => {
                        const isLow = item.stock <= item.minLimit;
                        const isDepleted = item.stock === 0;
                        
                        let badgeBg = 'var(--secondary-light)';
                        let badgeColor = 'var(--secondary)';
                        let badgeText = 'Optimal';
                        
                        if (isDepleted) {
                          badgeBg = 'rgba(239, 68, 68, 0.15)';
                          badgeColor = 'var(--accent-red)';
                          badgeText = 'Depleted';
                        } else if (isLow) {
                          badgeBg = 'rgba(245, 158, 11, 0.15)';
                          badgeColor = 'var(--accent-amber)';
                          badgeText = 'Low Stock';
                        }

                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                            <td style={{ padding: '1rem 0.75rem', fontWeight: '700' }}>{item.name}</td>
                            <td style={{ padding: '1rem 0.75rem' }}>{item.category}</td>
                            <td style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: 'bold' }}>{item.stock} units</td>
                            <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                              <span style={{ backgroundColor: badgeBg, color: badgeColor, padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {badgeText}
                              </span>
                            </td>
                            <td style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: '600' }}>
                              📈 {item.consumptionThisMonth} units used
                            </td>
                            <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => {
                                  setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, stock: inv.stock + 10 } : inv));
                                  showToast(`Restocked 10 units of ${item.name}`);
                                }}
                              >
                                ➕ Restock 10
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: CLINIC ADMIN WORKSPACE */}
        {activeView === 'admin-dashboard' && isAdminLoggedIn && (
          <div className="container" style={{ padding: '3rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '850' }}>Clinic Desk Administration</h1>
                <p style={{ color: 'var(--neutral-650)' }}>Manage consultation scheduling, doctor slots, and client checkouts.</p>
              </div>
              <span className="role-badge" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', padding: '0.5rem 1rem', cursor: 'default', border: 'none' }}>
                Madurai Pet Care Center (Desk Admin)
              </span>
            </div>

            <div className="appointments-tabs" style={{ marginBottom: '2rem' }}>
              <button className={`appt-tab-btn ${adminTab === 'checkout' ? 'active' : ''}`} onClick={() => setAdminTab('checkout')}>
                Client Checkouts & Billing
              </button>
              <button className={`appt-tab-btn ${adminTab === 'vets' ? 'active' : ''}`} onClick={() => setAdminTab('vets')}>
                Manage Clinic Veterinarians
              </button>
            </div>

            {/* Sub View 1: Client checkouts billing */}
            {adminTab === 'checkout' && (
              <div className="card">
                <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Client Invoice Processing</h2>

                {appointments.filter(a => a.vetId === 'vet-1' && a.status === 'completed' && !a.billed).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <CheckCircle size={36} style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }} />
                    <p style={{ color: 'var(--neutral-600)' }}>No pending client bills for Madurai Pet Care Center.</p>
                  </div>
                ) : (
                  <div className="appointment-list">
                    {appointments
                      .filter(a => a.vetId === 'vet-1' && a.status === 'completed' && !a.billed)
                      .map(appt => (
                        <div key={appt.id} className="appointment-item">
                          <div className="appt-info-main">
                            <div className="appt-status-icon status-completed-bg">
                              <FileText size={20} />
                            </div>
                            <div className="appt-details">
                              <span className="appt-vet-name">Owner Email: {appt.ownerEmail}</span>
                              <span className="appt-sub-detail">Patient: <strong>{appt.petName}</strong> • Vet: {appt.vetName}</span>
                              <span className="appt-sub-detail">Date: {new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {appt.time} • Code Ref: {appt.id}</span>
                            </div>
                          </div>

                          <div className="appt-meta-info">
                            <button className="btn btn-primary" onClick={() => initiateCheckout(appt)}>
                              Generate Bill
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub View 2: Vets management */}
            {adminTab === 'vets' && (
              <div className="card">
                <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Clinic Doctors Slot Configuration</h2>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-600)' }}>
                      <th style={{ padding: '0.75rem' }}>Doctor</th>
                      <th style={{ padding: '0.75rem' }}>Specialty</th>
                      <th style={{ padding: '0.75rem' }}>Availability Days</th>
                      <th style={{ padding: '0.75rem' }}>Configured Slots</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vets.filter(v => v.clinicId === 'clinic-1').map(vet => (
                      <tr key={vet.id} style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{vet.name}</td>
                        <td style={{ padding: '0.75rem' }}>{vet.specialty}</td>
                        <td style={{ padding: '0.75rem' }}>{vet.availability.join(', ')}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {vet.slots.length} Active Slots
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* VIEW 7: SUPER ADMIN DASHBOARD (JACOVET OPERATIONS) */}
        {activeView === 'super-admin-dashboard' && isSuperAdminLoggedIn && (
          <div className="container" style={{ padding: '3rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '850' }}>Central Operation Command</h1>
                <p style={{ color: 'var(--neutral-650)' }}>Verify veterinarians, approve clinic registrations, and audit system logs.</p>
              </div>
              <span className="role-badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', cursor: 'default', border: 'none' }}>
                Central Super Admin Authority
              </span>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                <span className="stat-label">Verified Clinics</span>
                <span className="stat-number" style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>{clinics.length}</span>
              </div>
              <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                <span className="stat-label">Active Medical Timelines</span>
                <span className="stat-number" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>{pets.length}</span>
              </div>
              <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                <span className="stat-label">Verified Veterinarians</span>
                <span className="stat-number" style={{ color: 'var(--accent-amber)', marginTop: '0.25rem' }}>{vets.length}</span>
              </div>
              <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                <span className="stat-label">Audit Actions Logged</span>
                <span className="stat-number" style={{ color: 'var(--neutral-900)', marginTop: '0.25rem' }}>{auditLogs.length}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
              {/* Left Column: Clinic approvals queue */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.5rem' }}>Clinic Registration Approvals</h2>
                
                {pendingClinics.length === 0 ? (
                  <p style={{ color: 'var(--neutral-400)', fontStyle: 'italic', fontSize: '0.9rem' }}>No pending clinic registrations.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pendingClinics.map(clinic => (
                      <div key={clinic.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{clinic.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', display: 'block' }}>Applicant: {clinic.applicant} • {clinic.location}</span>
                        </div>
                        <button className="btn btn-teal" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => approveClinicRequest(clinic)}>
                          Approve
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Audit Logs Table */}
              <div className="card">
                <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.5rem' }}>System Audit Trail</h2>
                
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-500)' }}>
                        <th style={{ padding: '0.5rem' }}>Timestamp</th>
                        <th style={{ padding: '0.5rem' }}>User / Role</th>
                        <th style={{ padding: '0.5rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                          <td style={{ padding: '0.5rem', color: 'var(--neutral-400)' }}>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <strong>{log.user}</strong><br/>
                            <span style={{ fontSize: '0.7rem', color: 'var(--neutral-400)' }}>{log.role}</span>
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <strong>{log.action}</strong><br/>
                            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-600)' }}>{log.details}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: BOOKING MODAL */}
      {bookingVet && (
        <div className="modal-overlay" onClick={resetBookingForm}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.4rem' }}>Clinic Portal: {bookingVet.name}</h2>
              <button className="modal-close" onClick={resetBookingForm}>✖</button>
            </div>
            
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              
              {/* Left Column: Form & About */}
              <div>
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <img src={bookingVet.image} alt={bookingVet.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '1rem' }}>{bookingVet.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--neutral-600)' }}>{bookingVet.specialty} • Fee: ₹{bookingVet.price}</span>
                  </div>
                </div>

                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.25rem' }}>1. Booking Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Pet Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Rocky" 
                        value={petDetails.name}
                        onChange={(e) => setPetDetails(prev => ({ ...prev, name: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Category *</label>
                      <select 
                        className="form-control"
                        value={petDetails.category}
                        onChange={(e) => setPetDetails(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Exotic">Exotic</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Breed</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Retriever" 
                        value={petDetails.breed}
                        onChange={(e) => setPetDetails(prev => ({ ...prev, breed: e.target.value }))}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Age</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="2 yrs" 
                        value={petDetails.age}
                        onChange={(e) => setPetDetails(prev => ({ ...prev, age: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Reason *</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      placeholder="Symptoms or checkup details..."
                      value={petDetails.reason}
                      onChange={(e) => setPetDetails(prev => ({ ...prev, reason: e.target.value }))}
                      required
                    ></textarea>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.25rem', marginTop: '0.5rem' }}>2. Date & Time</h3>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input 
                      type="date" 
                      className="form-control"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot('');
                      }}
                      required
                    />
                  </div>

                  {selectedDate && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="slot-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
                        {bookingVet.slots.map(slot => {
                          const isBooked = getBookedSlots(bookingVet.id, selectedDate).includes(slot);
                          return (
                            <div
                              key={slot}
                              className={`slot-item ${selectedSlot === slot ? 'active' : ''} ${isBooked ? 'disabled' : ''}`}
                              onClick={() => {
                                if (!isBooked) setSelectedSlot(slot);
                              }}
                              style={{ padding: '0.4rem 0.2rem', fontSize: '0.75rem' }}
                            >
                              {slot}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Confirm Appointment 🐾</button>
                </form>
              </div>

              {/* Right Column: Reviews & Clinic Ratings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid var(--neutral-200)', paddingLeft: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--neutral-900)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Star size={18} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                  Reviews ({bookingVet.reviewsCount})
                </h3>

                {/* Rating summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--neutral-50)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '850', color: 'var(--neutral-900)' }}>{bookingVet.rating.toFixed(1)}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                      {'★'.repeat(Math.round(bookingVet.rating))}{'☆'.repeat(5 - Math.round(bookingVet.rating))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>Verified Client Ratings</span>
                  </div>
                </div>

                {/* Reviews List */}
                <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '4px' }}>
                  {bookingVet.reviews.length === 0 ? (
                    <p style={{ color: 'var(--neutral-400)', fontStyle: 'italic', fontSize: '0.85rem' }}>No reviews yet. Be the first to leave one!</p>
                  ) : (
                    bookingVet.reviews.map(review => (
                      <div key={review.id} style={{ borderBottom: '1px solid var(--neutral-100)', paddingBottom: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                          <span>{review.author}</span>
                          <span style={{ color: '#f59e0b' }}>{'★'.repeat(review.rating)}</span>
                        </div>
                        <p style={{ color: 'var(--neutral-600)', lineHeight: '1.4' }}>"{review.comment}"</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <div style={{ background: 'var(--neutral-50)', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--neutral-200)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.6rem' }}>Add Clinic Review</h4>
                  <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Your Name" 
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                      value={reviewForm.author}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, author: e.target.value }))}
                      required 
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--neutral-650)' }}>Rating:</span>
                      <select
                        className="form-control"
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem', width: 'auto' }}
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                      >
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                    </div>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      placeholder="Share your experience..." 
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      required
                    ></textarea>
                    <button type="submit" className="btn btn-teal" style={{ padding: '0.4rem', fontSize: '0.8rem', fontWeight: 'bold' }}>Submit Review</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER PET MODAL */}
      {petRegModalOpen && (
        <div className="modal-overlay" onClick={() => setPetRegModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.4rem' }}>Register New Pet</h2>
              <button className="modal-close" onClick={() => setPetRegModalOpen(false)}>✖</button>
            </div>
            
            <form onSubmit={handlePetRegister}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Pet Name *</label>
                    <input type="text" className="form-control" placeholder="e.g. Buddy" value={newPetForm.name} onChange={(e) => setNewPetForm(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Species *</label>
                    <select className="form-control" value={newPetForm.species} onChange={(e) => setNewPetForm(prev => ({ ...prev, species: e.target.value }))}>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Exotic">Exotic</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Breed</label>
                    <input type="text" className="form-control" placeholder="e.g. Beagle" value={newPetForm.breed} onChange={(e) => setNewPetForm(prev => ({ ...prev, breed: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={newPetForm.gender} onChange={(e) => setNewPetForm(prev => ({ ...prev, gender: e.target.value }))}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" value={newPetForm.dob} onChange={(e) => setNewPetForm(prev => ({ ...prev, dob: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input type="text" className="form-control" placeholder="e.g. 12.4 kg" value={newPetForm.weight} onChange={(e) => setNewPetForm(prev => ({ ...prev, weight: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Microchip ID (if any)</label>
                    <input type="text" className="form-control" placeholder="e.g. MC-9812-B" value={newPetForm.microchip} onChange={(e) => setNewPetForm(prev => ({ ...prev, microchip: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group (if known)</label>
                    <input type="text" className="form-control" placeholder="e.g. DEA 1.1 / A" value={newPetForm.bloodGroup} onChange={(e) => setNewPetForm(prev => ({ ...prev, bloodGroup: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Active Allergies</label>
                  <input type="text" className="form-control" placeholder="e.g. Penicillin, Soy (None if healthy)" value={newPetForm.allergies} onChange={(e) => setNewPetForm(prev => ({ ...prev, allergies: e.target.value }))} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Emergency Phone *</label>
                    <input type="text" className="form-control" placeholder="+91 99999 99999" value={newPetForm.emergencyContact} onChange={(e) => setNewPetForm(prev => ({ ...prev, emergencyContact: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Insurance Provider</label>
                    <input type="text" className="form-control" placeholder="e.g. HDFC PetProtect" value={newPetForm.insurance} onChange={(e) => setNewPetForm(prev => ({ ...prev, insurance: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPetRegModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Pet Profile 🐾</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EMERGENCY ACCESS QR CODE MODAL */}
      {qrPet && (
        <div className="modal-overlay" onClick={() => setQrPet(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottomColor: 'var(--accent-red)' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <QrCode size={20} /> Emergency Paramedic Access
              </h2>
              <button className="modal-close" onClick={() => setQrPet(null)}>✖</button>
            </div>
            
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ background: 'white', padding: '1rem', border: '1px solid var(--neutral-200)', borderRadius: '12px', display: 'inline-block', marginBottom: '1.5rem' }}>
                <div style={{ width: '160px', height: '160px', background: 'radial-gradient(circle, #0f172a 70%, transparent 70%)', backgroundSize: '20px 20px', backgroundColor: '#e2e8f0', borderRadius: '6px' }}></div>
              </div>

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--neutral-50)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--neutral-200)' }}>
                <div><strong>Patient Pet Name:</strong> {qrPet.name}</div>
                <div><strong>Species Breed:</strong> {qrPet.species} • {qrPet.breed}</div>
                <div><strong>Blood Group:</strong> {qrPet.bloodGroup}</div>
                <div style={{ color: 'var(--accent-red)' }}><strong>Allergies:</strong> {qrPet.allergies}</div>
                <div><strong>Emergency Call:</strong> {qrPet.emergencyContact}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', borderTop: '1px solid var(--neutral-200)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  ℹ️ Paramedics can scan the pet's tag QR code to view this emergency sheet instantly. History records remain locked.
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ backgroundColor: 'white' }}>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setQrPet(null)}>Close Emergency Tag</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EXTERNAL LAB REPORT UPLOADER */}
      {uploadPet && (
        <div className="modal-overlay" onClick={() => setUploadPet(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.3rem' }}>Upload Diagnostic Report</h2>
              <button className="modal-close" onClick={() => setUploadPet(null)}>✖</button>
            </div>
            
            <form onSubmit={handleUploadReport}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--neutral-650)' }}>
                  Manually link diagnostic PDFs or images (blood test, X-ray, ultrasound) to **{uploadPet.name}**'s lifelong timeline.
                </p>

                <div className="form-group">
                  <label className="form-label">Report Document Name *</label>
                  <input type="text" className="form-control" placeholder="e.g. Full Blood Count" value={reportFileName} onChange={(e) => setReportFileName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Diagnostic Category *</label>
                  <select className="form-control" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <option value="Blood Test">Blood Test</option>
                    <option value="Urine Analysis">Urine Analysis</option>
                    <option value="X-Ray Scan">X-Ray Scan</option>
                    <option value="Ultrasound Scan">Ultrasound Scan</option>
                  </select>
                </div>

                <div style={{ border: '2px dashed var(--neutral-300)', padding: '2rem', borderRadius: '12px', textAlign: 'center', backgroundColor: 'var(--neutral-50)', cursor: 'pointer' }} onClick={() => showToast('Simulated file explorer opened.')}>
                  <Upload size={28} style={{ color: 'var(--neutral-400)', marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.85rem', display: 'block', fontWeight: 'bold' }}>Choose file or Drag & Drop</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>PDF, PNG, JPG up to 10MB</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setUploadPet(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Link to Timeline</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RESCHEDULE MODAL */}
      {reschedulingAppt && (
        <div className="modal-overlay" onClick={() => setReschedulingAppt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.4rem' }}>Reschedule Consultation</h2>
              <button className="modal-close" onClick={() => setReschedulingAppt(null)}>✖</button>
            </div>
            
            <form onSubmit={handleRescheduleSubmit}>
              <div className="modal-body">
                <p style={{ color: 'var(--neutral-650)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Rescheduling consultation for <strong>{reschedulingAppt.petName}</strong> with {reschedulingAppt.vetName}.
                </p>

                <div className="form-group">
                  <label className="form-label">Choose New Date *</label>
                  <input 
                    type="date" 
                    className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot('');
                    }}
                    required
                  />
                </div>

                {selectedDate && (
                  <div className="form-group">
                    <label className="form-label">Available Slots *</label>
                    <div className="slot-grid">
                      {vets.find(v => v.id === reschedulingAppt.vetId)?.slots.map(slot => {
                        const isBooked = getBookedSlots(reschedulingAppt.vetId, selectedDate).includes(slot);
                        return (
                          <div
                            key={slot}
                            className={`slot-item ${selectedSlot === slot ? 'active' : ''} ${isBooked ? 'disabled' : ''}`}
                            onClick={() => {
                              if (!isBooked) setSelectedSlot(slot);
                            }}
                          >
                            {slot}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setReschedulingAppt(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Reschedule Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: CLINICAL CONSULT ENTRY FORM (VET WORKSPACE CHECK-IN) */}
      {completingAppt && (
        <div className="modal-overlay" onClick={() => setCompletingAppt(null)}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottomColor: 'var(--secondary)' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Stethoscope size={20} /> Consultation check-in: {completingAppt.petName}
              </h2>
              <button className="modal-close" onClick={() => setCompletingAppt(null)}>✖</button>
            </div>
            
            <form onSubmit={handleConsultSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
                
                {/* Left panel: chief complaint, vitals, diagnosis */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.8rem', color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.2rem' }}>1. Vitals & Clinical Examination</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Chief Complaint *</label>
                    <input type="text" className="form-control" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Temp</label>
                      <input type="text" className="form-control" style={{ fontSize: '0.85rem' }} value={clinicalVitals.temp} onChange={(e) => setClinicalVitals(prev => ({ ...prev, temp: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Weight</label>
                      <input type="text" className="form-control" style={{ fontSize: '0.85rem' }} value={clinicalVitals.weight} onChange={(e) => setClinicalVitals(prev => ({ ...prev, weight: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Heart Rate</label>
                      <input type="text" className="form-control" style={{ fontSize: '0.85rem' }} value={clinicalVitals.heartRate} onChange={(e) => setClinicalVitals(prev => ({ ...prev, heartRate: e.target.value }))} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Diagnosis *</label>
                    <input type="text" className="form-control" placeholder="Otitis externa, stress molt..." value={clinicalDiagnosis} onChange={(e) => setClinicalDiagnosis(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Clinical Notes</label>
                    <textarea className="form-control" rows="3" placeholder="Enter clinical notes..." value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)}></textarea>
                  </div>
                </div>

                {/* Right panel: Prescriptions & Vaccinations */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.8rem', color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.2rem' }}>2. Prescription Medications (Rx)</h3>
                  
                  {/* Added medicines list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {prescriptionMeds.length === 0 ? (
                      <p style={{ color: 'var(--neutral-400)', fontSize: '0.8rem', fontStyle: 'italic' }}>No medicines added yet.</p>
                    ) : (
                      prescriptionMeds.map((med, i) => (
                        <div key={i} style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <strong>{med.name}</strong> - {med.dosage}<br/>
                            <span style={{ color: 'var(--neutral-400)' }}>
                              Schedule: {med.morning ? 'M ' : ''}{med.afternoon ? 'A ' : ''}{med.night ? 'N ' : ''}• {med.days} days
                            </span>
                          </div>
                          <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }} onClick={() => setPrescriptionMeds(prev => prev.filter((_, idx) => idx !== i))}>
                            ✖
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Med Inline form */}
                  <div style={{ background: 'var(--neutral-50)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input type="text" className="form-control" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Med Name" value={medInput.name} onChange={(e) => setMedInput(prev => ({ ...prev, name: e.target.value }))} />
                      <input type="text" className="form-control" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Dosage (e.g. 4 drops / 1 tab)" value={medInput.dosage} onChange={(e) => setMedInput(prev => ({ ...prev, dosage: e.target.value }))} />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 'bold' }}>Schedule:</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={medInput.morning} onChange={(e) => setMedInput(prev => ({ ...prev, morning: e.target.checked }))} /> Morn
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={medInput.afternoon} onChange={(e) => setMedInput(prev => ({ ...prev, afternoon: e.target.checked }))} /> Aft
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={medInput.night} onChange={(e) => setMedInput(prev => ({ ...prev, night: e.target.checked }))} /> Night
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input type="number" className="form-control" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Days" value={medInput.days} onChange={(e) => setMedInput(prev => ({ ...prev, days: Number(e.target.value) }))} />
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem' }} onClick={handleAddMedToPrescription}>Add Med</button>
                    </div>
                  </div>

                  {/* Vaccine Administration Module */}
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.8rem', color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.2rem', marginTop: '1rem' }}>3. Immunization / Vaccination</h3>
                  <div className="form-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input type="checkbox" id="administer" checked={vaccineInput.administer} onChange={(e) => setVaccineInput(prev => ({ ...prev, administer: e.target.checked }))} />
                    <label htmlFor="administer" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Administer vaccine during this session</label>
                  </div>

                  {vaccineInput.administer && (
                    <div style={{ background: 'var(--neutral-50)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.5rem' }}>
                        <input type="text" className="form-control" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Vaccine Name" value={vaccineInput.name} onChange={(e) => setVaccineInput(prev => ({ ...prev, name: e.target.value }))} required />
                        <input type="text" className="form-control" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Batch No" value={vaccineInput.batch} onChange={(e) => setVaccineInput(prev => ({ ...prev, batch: e.target.value }))} required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input type="text" className="form-control" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Manufacturer" value={vaccineInput.manufacturer} onChange={(e) => setVaccineInput(prev => ({ ...prev, manufacturer: e.target.value }))} required />
                        <input type="date" className="form-control" style={{ fontSize: '0.8rem', padding: '0.4rem' }} title="Next Due Date" value={vaccineInput.dueDate} onChange={(e) => setVaccineInput(prev => ({ ...prev, dueDate: e.target.value }))} required />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCompletingAppt(null)}>Cancel</button>
                <button type="submit" className="btn btn-teal">Save Medical Record & Complete Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: CLINIC ADMIN BILLING CHECKOUT MODAL */}
      {checkoutAppt && (
        <div className="modal-overlay" onClick={() => setCheckoutAppt(null)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.3rem' }}>Billing Checkout Invoice</h2>
              <button className="modal-close" onClick={() => setCheckoutAppt(null)}>✖</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.75rem' }}>
                <strong>Client:</strong> {checkoutAppt.ownerEmail}<br/>
                <strong>Patient:</strong> {checkoutAppt.petName} ({checkoutAppt.petCategory})<br/>
                <strong>Doctor:</strong> {checkoutAppt.vetName}
              </div>

              <h4 style={{ fontSize: '0.9rem', color: 'var(--neutral-650)' }}>Itemized Fees</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {billItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>{item.desc}</span>
                    <strong>₹{item.fee}</strong>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px solid var(--neutral-850)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 'bold' }}>
                <span>Invoice Total:</span>
                <span style={{ color: 'var(--primary)' }}>₹{billItems.reduce((sum, item) => sum + item.fee, 0)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setCheckoutAppt(null)}>Cancel</button>
              <button type="button" className="btn btn-teal" onClick={completePaymentInvoice}>Complete Payment & Print Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: IMMUNIZATION HEALTH CERTIFICATE PRINT VIEW */}
      {printCertificate && (
        <div className="modal-overlay" onClick={() => setPrintCertificate(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem' }}>Immunization Health Certificate</h2>
              <button className="modal-close" onClick={() => setPrintCertificate(null)}>✖</button>
            </div>
            
            <div className="modal-body" style={{ background: '#F8FAFC', padding: '2.5rem', border: '2px solid var(--neutral-200)', borderRadius: '12px' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Award size={36} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
                <h2 style={{ fontSize: '1.6rem', color: 'var(--neutral-900)' }}>CERTIFICATE OF VACCINATION</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>JacoVet Pet Health Network • Madurai</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', borderTop: '1px solid var(--neutral-200)', paddingTop: '1.5rem', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div>This is to certify that pet <strong>{printCertificate.pet.name}</strong>, a {printCertificate.pet.gender.toLowerCase()} {printCertificate.pet.breed} owned by Vignesh has successfully received the following immunization checkup:</div>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)' }}>
                  <strong>Vaccine Administered:</strong> {printCertificate.record.vaccinations[0].name}<br/>
                  <strong>Batch Serial No:</strong> {printCertificate.record.vaccinations[0].batch}<br/>
                  <strong>Manufacturer:</strong> {printCertificate.record.vaccinations[0].manufacturer}<br/>
                  <strong>Immunization Date:</strong> {printCertificate.record.visitDate}<br/>
                  <strong>Next Dose Due:</strong> {printCertificate.record.vaccinations[0].dueDate}
                </div>
                <div>Authorized Clinic: <strong>{printCertificate.record.clinicName}</strong> (Ref: {printCertificate.record.id})</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div>Date Issued: {new Date().toLocaleDateString()}</div>
                <div style={{ textDecoration: 'underline' }}>Authorized Signature (JacoVet)</div>
              </div>
            </div>

            <div className="modal-footer" style={{ backgroundColor: 'white' }}>
              <button className="btn btn-secondary" onClick={() => setPrintCertificate(null)}>Close</button>
              <button className="btn btn-teal" onClick={() => showToast('Certificate downloaded! (Demo)')}>
                <Printer size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: MEDICAL RX DETAILS PRINT PREVIEW */}
      {printPrescription && (
        <div className="modal-overlay" onClick={() => setPrintPrescription(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem' }}>Rx Medical Prescription Form</h2>
              <button className="modal-close" onClick={() => setPrintPrescription(null)}>✖</button>
            </div>
            
            <div className="modal-body" style={{ background: 'white', padding: '2rem', border: '1px solid var(--neutral-300)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--neutral-900)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem' }}>{printPrescription.doctorName}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Madurai Pet Care Center</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Date:</strong> {printPrescription.visitDate}<br/>
                  <strong>Ref:</strong> {printPrescription.id}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Rx Medications</h4>
                {printPrescription.prescriptions.map((p, i) => (
                  <div key={i} style={{ borderBottom: '1px dashed var(--neutral-200)', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>{i + 1}. {p.name}</span>
                      <span>Qty: {p.days} days</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', marginTop: '0.25rem' }}>
                      Dosage: {p.dosage} • Schedule: {p.morning ? 'Morning (M) ' : ''}{p.afternoon ? 'Afternoon (A) ' : ''}{p.night ? 'Night (N)' : ''}
                    </div>
                    {p.notes && <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--neutral-400)', marginTop: '0.1rem' }}>Notes: {p.notes}</div>}
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--neutral-300)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
                🚨 Warning: This is a simulated prescription copy. Do not consume without medical supervision.
              </div>
            </div>

            <div className="modal-footer" style={{ backgroundColor: 'white' }}>
              <button className="btn btn-secondary" onClick={() => setPrintPrescription(null)}>Close</button>
              <button className="btn btn-teal" onClick={() => showToast('Prescription downloaded! (Demo)')}>
                <Printer size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer footer */}
      <footer style={{ backgroundColor: 'var(--neutral-900)', color: 'var(--neutral-400)', padding: '3rem 0', marginTop: 'auto', borderTop: '1px solid var(--neutral-850)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>JacoVet Pet Health Platform</span>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>© 2026 JacoVet Pet Health Lifelong Registry Services. All rights reserved.</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => showToast('Terms of Service clicked.')}>Terms</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => showToast('Privacy Policy clicked.')}>Privacy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => showToast('Contact central support: support@jacovet.com')}>Help Desk</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
