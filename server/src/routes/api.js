const express = require('express');
const router = express.Router();

const { authenticate, restrictTo } = require('../middleware/auth');
const { registerOwner, login } = require('../controllers/authController');
const { getMyPets, addPet, searchPets } = require('../controllers/petController');
const { getPetTimeline, addConsultRecord } = require('../controllers/recordController');
const {
  getOwnerAppointments,
  getDoctorAppointments,
  getAdminAppointments,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment
} = require('../controllers/appointmentController');
const { getInventory, restockItem, restockAll } = require('../controllers/inventoryController');
const { getAuditLogs, getClinicsAndVets, completeCheckout, updateVetPlan } = require('../controllers/adminController');

// 1. Authentication
router.post('/auth/register', registerOwner);
router.post('/auth/login', login);

// 2. Directories (Publicly viewable for booking search)
router.get('/admin/directories', getClinicsAndVets);

// 3. Pets (Owner gated / Doctor searches)
router.get('/pets/my', authenticate, restrictTo('owner'), getMyPets);
router.post('/pets/add', authenticate, restrictTo('owner'), addPet);
router.get('/pets/search', authenticate, restrictTo('doctor'), searchPets);

// 4. Lifelong Timelines & Check-ins
router.get('/records/timeline/:petId', authenticate, getPetTimeline);
router.post('/records/consult', authenticate, restrictTo('doctor'), addConsultRecord);

// 5. Appointments
router.get('/appointments/owner', authenticate, restrictTo('owner'), getOwnerAppointments);
router.get('/appointments/doctor', authenticate, restrictTo('doctor'), getDoctorAppointments);
router.get('/appointments/admin', authenticate, restrictTo('admin'), getAdminAppointments);
router.post('/appointments/book', authenticate, restrictTo('owner'), bookAppointment);
router.put('/appointments/cancel/:id', authenticate, cancelAppointment);
router.put('/appointments/reschedule/:id', authenticate, restrictTo('owner'), rescheduleAppointment);

// 6. Clinic Consumable Inventory
router.get('/inventory', authenticate, restrictTo('doctor', 'admin'), getInventory);
router.put('/inventory/restock/:id', authenticate, restrictTo('doctor', 'admin'), restockItem);
router.put('/inventory/restock-all', authenticate, restrictTo('doctor', 'admin'), restockAll);

// 7. Audit Command Center & Invoice Checkouts
router.get('/admin/audit-logs', authenticate, restrictTo('super-admin'), getAuditLogs);
router.put('/admin/checkout/:id', authenticate, restrictTo('admin'), completeCheckout);
router.put('/admin/vet-plan/:id', authenticate, restrictTo('super-admin', 'doctor'), updateVetPlan);

module.exports = router;
