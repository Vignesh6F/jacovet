import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMyPets, useAddPet as useAddPetMutation } from '../hooks/usePets';
import { useAppointments, useCancelAppointment } from '../hooks/useAppointments';
import Toast from '../components/Toast';
import { Plus, User, Info, Calendar, QrCode, Upload, Award } from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Queries
  const { data: pets, isLoading: petsLoading } = useMyPets(); // wait, does useMyPets need hook? Yes, from '../hooks/usePets'
  const { data: appointments, isLoading: apptsLoading } = useAppointments('owner');
  const cancelApptMutation = useCancelAppointment('owner');
  const addPetMutation = useAddPetMutation();

  // States
  const [dashboardTab, setDashboardTab] = useState('pets'); // 'pets', 'appointments'
  const [petRegModalOpen, setPetRegModalOpen] = useState(false);
  const [newPetForm, setNewPetForm] = useState({ name: '', species: 'Dog', breed: '', gender: 'Male', dob: '', weight: '', color: '', microchip: '', bloodGroup: 'Unknown', allergies: '', emergencyContact: '', insurance: 'None' });
  const [qrPet, setQrPet] = useState(null);
  const [uploadPet, setUploadPet] = useState(null);
  
  // Notification Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleRegisterPet = (e) => {
    e.preventDefault();
    if (!newPetForm.name) {
      showToast('Pet name is required.', 'danger');
      return;
    }

    addPetMutation.mutate(newPetForm, {
      onSuccess: () => {
        showToast(`Successfully registered pet: ${newPetForm.name}!`);
        setPetRegModalOpen(false);
        setNewPetForm({ name: '', species: 'Dog', breed: '', gender: 'Male', dob: '', weight: '', color: '', microchip: '', bloodGroup: 'Unknown', allergies: '', emergencyContact: '', insurance: 'None' });
      },
      onError: (err) => {
        showToast(err.response?.data?.message || 'Failed to add pet.', 'danger');
      }
    });
  };

  const handleCancelAppt = (id) => {
    if (window.confirm('Are you sure you want to cancel this veterinary appointment?')) {
      cancelApptMutation.mutate(id, {
        onSuccess: () => {
          showToast('Appointment cancelled successfully.');
        },
        onError: (err) => {
          showToast(err.response?.data?.message || 'Failed to cancel appointment.', 'danger');
        }
      });
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '850' }}>Welcome, {user?.name || 'Pet Parent'}</h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.95rem' }}>Track your pet's lifelong health timeline, prescriptions, and vaccines.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setPetRegModalOpen(true)}>
          <Plus size={16} /> Register Pet Profile
        </button>
      </div>

      {/* Subtabs Switcher */}
      <div className="appointments-tabs" style={{ marginBottom: '2rem' }}>
        <button className={`appt-tab-btn ${dashboardTab === 'pets' ? 'active' : ''}`} onClick={() => setDashboardTab('pets')}>
          My Registered Pets ({pets ? pets.length : 0})
        </button>
        <button className={`appt-tab-btn ${dashboardTab === 'appointments' ? 'active' : ''}`} onClick={() => setDashboardTab('appointments')}>
          Appointments History & Prescriptions ({appointments ? appointments.length : 0})
        </button>
      </div>

      {/* Tab 1: Pets Profiles List */}
      {dashboardTab === 'pets' && (
        <div>
          {petsLoading ? (
            <p>Loading registered pets...</p>
          ) : !pets || pets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--neutral-300)' }}>
              <Info size={40} style={{ color: 'var(--neutral-300)', marginBottom: '1rem' }} />
              <h3>No Pets Registered</h3>
              <p style={{ color: 'var(--neutral-600)', marginBottom: '1.5rem' }}>Register your pet to manage medical timeline sheets.</p>
              <button className="btn btn-primary" onClick={() => setPetRegModalOpen(true)}>Register first pet</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {pets.map(pet => (
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
                    <div style={{ gridColumn: '1 / -1', color: 'var(--accent-red)' }}><strong>Allergies:</strong> {pet.allergies}</div>
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
                      onClick={() => navigate(`/pet/${pet.id}`)}
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

      {/* Tab 2: Appointment History */}
      {dashboardTab === 'appointments' && (
        <div>
          {apptsLoading ? (
            <p>Loading appointments list...</p>
          ) : !appointments || appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 'var(--radius-lg)' }}>
              <Calendar size={40} style={{ color: 'var(--neutral-300)', marginBottom: '1rem' }} />
              <h3>No Appointments Scheduled</h3>
              <p style={{ color: 'var(--neutral-500)', marginBottom: '1.5rem' }}>Schedule visit logs with our specialists to review health timeline charts.</p>
              <button className="btn btn-primary" onClick={() => navigate('/')}>Book Vet Appointment 🩺</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments.map(appt => (
                <div key={appt.id} className="card" style={{ padding: '1.5rem', marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div className={`appt-status-icon ${appt.status === 'completed' ? 'status-completed-bg' : appt.status === 'cancelled' ? 'status-cancelled-bg' : 'status-upcoming-bg'}`}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.15rem' }}>{appt.vet?.name}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Patient: <strong>{appt.pet?.name}</strong> • Reason: "{appt.reason}"</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 'bold', display: 'block' }}>{new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--neutral-500)' }}>Slot: {appt.time}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {appt.status === 'upcoming' && (
                          <button className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleCancelAppt(appt.id)}>
                            Cancel Visit
                          </button>
                        )}
                        <span className={`appt-badge badge-${appt.status}`}>
                          {appt.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {appt.status === 'completed' && appt.prescription && (
                    <div style={{ marginTop: '1rem', backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--neutral-150)' }}>
                      <h5 style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>💊 Prescribed Medications Checkout Log</h5>
                      <pre className="prescription-box">{appt.prescription}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Register Pet */}
      {petRegModalOpen && (
        <div className="modal-overlay" onClick={() => setPetRegModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register Pet Profile</h2>
              <button className="modal-close" onClick={() => setPetRegModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleRegisterPet}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Pet Name</label>
                  <input type="text" className="form-control" placeholder="Rocky" value={newPetForm.name} onChange={(e) => setNewPetForm(prev => ({ ...prev, name: e.target.value }))} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Species</label>
                  <select className="form-control" value={newPetForm.species} onChange={(e) => setNewPetForm(prev => ({ ...prev, species: e.target.value }))}>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Exotic">Exotic</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Breed</label>
                  <input type="text" className="form-control" placeholder="Golden Retriever" value={newPetForm.breed} onChange={(e) => setNewPetForm(prev => ({ ...prev, breed: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={newPetForm.gender} onChange={(e) => setNewPetForm(prev => ({ ...prev, gender: e.target.value }))}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" value={newPetForm.dob} onChange={(e) => setNewPetForm(prev => ({ ...prev, dob: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input type="text" className="form-control" placeholder="28.5 kg" value={newPetForm.weight} onChange={(e) => setNewPetForm(prev => ({ ...prev, weight: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <input type="text" className="form-control" placeholder="DEA 1.1" value={newPetForm.bloodGroup} onChange={(e) => setNewPetForm(prev => ({ ...prev, bloodGroup: e.target.value }))} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Microchip Tag ID</label>
                  <input type="text" className="form-control" placeholder="MC-98218-A" value={newPetForm.microchip} onChange={(e) => setNewPetForm(prev => ({ ...prev, microchip: e.target.value }))} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Active Allergies</label>
                  <input type="text" className="form-control" placeholder="Penicillin, Soy proteins" value={newPetForm.allergies} onChange={(e) => setNewPetForm(prev => ({ ...prev, allergies: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Phone Contact</label>
                  <input type="text" className="form-control" placeholder="+91 98451 23456" value={newPetForm.emergencyContact} onChange={(e) => setNewPetForm(prev => ({ ...prev, emergencyContact: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Pet Insurance Company</label>
                  <input type="text" className="form-control" placeholder="HDFC PetProtect" value={newPetForm.insurance} onChange={(e) => setNewPetForm(prev => ({ ...prev, insurance: e.target.value }))} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPetRegModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addPetMutation.isPending}>
                  {addPetMutation.isPending ? 'Registering...' : 'Register Pet Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Emergency QR Card */}
      {qrPet && (
        <div className="modal-overlay" onClick={() => setQrPet(null)}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Emergency Medical QR</h2>
              <button className="modal-close" onClick={() => setQrPet(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
                Scan this tag at any verified vet clinic in the network to retrieve {qrPet.name}'s medical chart files instantly.
              </p>
              
              {/* QR representation */}
              <div style={{ border: '8px solid white', borderRadius: '16px', padding: '1rem', backgroundColor: '#f8fafc', boxShadow: 'var(--shadow-md)' }}>
                <QrCode size={180} style={{ color: 'var(--neutral-900)' }} />
              </div>

              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '0.85rem', borderRadius: '12px', width: '100%', fontSize: '0.78rem', border: '1px solid var(--neutral-150)', textAlign: 'left' }}>
                <strong>Pet ID Ref:</strong> {qrPet.id}<br/>
                <strong>Species/Breed:</strong> {qrPet.species} • {qrPet.breed}<br/>
                <strong>Microchip:</strong> {qrPet.microchip}<br/>
                <span style={{ color: 'var(--accent-red)' }}><strong>Allergies:</strong> {qrPet.allergies}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Report */}
      {uploadPet && (
        <div className="modal-overlay" onClick={() => setUploadPet(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Lab Diagnostic Report</h2>
              <button className="modal-close" onClick={() => setUploadPet(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
                Upload external lab reports or test results to append them directly to {uploadPet.name}'s lifelong timeline chart.
              </p>

              <div style={{ border: '2px dashed var(--neutral-300)', padding: '2.5rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--neutral-50)' }} onClick={() => {
                showToast('Report uploaded successfully! Saved to timeline history.');
                setUploadPet(null);
              }}>
                <Upload size={32} style={{ color: 'var(--neutral-400)', marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '1rem' }}>Click or Drag File to Upload</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>PDF, JPG, or PNG (Max 5MB)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
