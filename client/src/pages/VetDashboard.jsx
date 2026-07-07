import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { useSearchPets } from '../hooks/usePets';
import { useAddConsultRecord } from '../hooks/useRecords';
import { useInventory, useRestockItem, useRestockAll } from '../hooks/useInventory';
import Toast from '../components/Toast';
import { Stethoscope, Search, CheckCircle, Package, ArrowRight, User, ShieldCheck } from 'lucide-react';

const VetDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Queries
  const { data: appointments, isLoading: apptsLoading } = useAppointments('doctor');
  const { data: inventory, isLoading: invLoading } = useInventory();
  
  const addConsultMutation = useAddConsultRecord();
  const restockMutation = useRestockItem();
  const restockAllMutation = useRestockAll();

  // States
  const [vetDashboardTab, setVetDashboardTab] = useState('appointments'); // 'appointments', 'search', 'inventory'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  
  // Search query
  const { data: searchResults, isLoading: searchLoading } = useSearchPets(activeSearch);

  // Consult Modal / Check-in states
  const [completingAppt, setCompletingAppt] = useState(null);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptionMeds, setPrescriptionMeds] = useState([]);
  const [medInput, setMedInput] = useState({ name: '', dosage: '', morning: true, afternoon: false, night: true, days: 5 });
  
  // Vaccines
  const [vaccineInput, setVaccineInput] = useState({ administer: false, name: 'DHPP Booster', batch: 'B-9021', manufacturer: 'Zoetis', dueDate: '' });

  // Consent approval
  const [consentGranted, setConsentGranted] = useState({});

  // Notification
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!medInput.name || !medInput.dosage) {
      showToast('Please specify drug name and dosage.', 'danger');
      return;
    }
    setPrescriptionMeds(prev => [...prev, medInput]);
    setMedInput({ name: '', dosage: '', morning: true, afternoon: false, night: true, days: 5 });
  };

  const handleConsultSubmit = (e) => {
    e.preventDefault();
    if (!clinicalDiagnosis || !chiefComplaint) {
      showToast('Diagnosis and Chief Complaint are required.', 'danger');
      return;
    }

    const consultPayload = {
      appointmentId: completingAppt.id,
      petId: completingAppt.petId,
      type: vaccineInput.administer ? 'Vaccination' : 'Checkup',
      chiefComplaint,
      temp: '101.2 °F',
      weight: completingAppt.pet?.weight || 'Unknown',
      heartRate: '96 bpm',
      diagnosis: clinicalDiagnosis,
      notes: clinicalNotes,
      prescriptions: prescriptionMeds,
      vaccinations: vaccineInput.administer ? [
        {
          name: vaccineInput.name,
          batch: vaccineInput.batch,
          manufacturer: vaccineInput.manufacturer,
          dateGiven: new Date().toISOString().split('T')[0],
          dueDate: vaccineInput.dueDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ] : [],
      followUpDate: ''
    };

    addConsultMutation.mutate(consultPayload, {
      onSuccess: () => {
        showToast('Consultation check-in record saved, stock levels adjusted!');
        setCompletingAppt(null);
        setChiefComplaint('');
        setClinicalDiagnosis('');
        setClinicalNotes('');
        setPrescriptionMeds([]);
        setVaccineInput({ administer: false, name: 'DHPP Booster', batch: 'B-9021', manufacturer: 'Zoetis', dueDate: '' });
      },
      onError: (err) => {
        showToast(err.response?.data?.message || 'Failed to save consultation.', 'danger');
      }
    });
  };

  const handleRestockAll = () => {
    restockAllMutation.mutate(null, {
      onSuccess: () => {
        showToast('Bulk restocked all inventory lines (+10 units)!');
      }
    });
  };

  const handleRestockSingle = (id, name) => {
    restockMutation.mutate(
      { id, quantity: 10 },
      {
        onSuccess: () => {
          showToast(`Restocked 10 units of ${name}.`);
        }
      }
    );
  };

  const handleRequestConsent = (petId) => {
    setConsentGranted(prev => ({ ...prev, [petId]: true }));
    showToast(`Consent granted for Pet ID: ${petId}. Opening history timeline...`);
    setTimeout(() => {
      navigate(`/pet/${petId}`);
    }, 1500);
  };

  // Filter local listings
  const upcomingAppts = appointments ? appointments.filter(a => a.status === 'upcoming') : [];
  const completedAppts = appointments ? appointments.filter(a => a.status === 'completed') : [];

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '850' }}>Doctor Consultation Workspace</h1>
          <p style={{ color: 'var(--neutral-500)' }}>Welcome back, <strong>{user?.name}</strong>. Diagnose patients and monitor clinic stock levels.</p>
        </div>
        <span className="role-badge" style={{ cursor: 'default' }}>
          Madurai Pet Care Center
        </span>
      </div>

      {/* Switcher tabs */}
      <div className="appointments-tabs" style={{ marginBottom: '2rem' }}>
        <button className={`appt-tab-btn ${vetDashboardTab === 'appointments' ? 'active' : ''}`} onClick={() => setVetDashboardTab('appointments')}>
          Today's Appointments ({upcomingAppts.length})
        </button>
        <button className={`appt-tab-btn ${vetDashboardTab === 'search' ? 'active' : ''}`} onClick={() => setVetDashboardTab('search')}>
          Lookup Pet Medical History
        </button>
        <button className={`appt-tab-btn ${vetDashboardTab === 'inventory' ? 'active' : ''}`} onClick={() => setVetDashboardTab('inventory')}>
          Clinic Monthly Inventory 📦
        </button>
      </div>

      {/* Subtab 1: Today's Appointments */}
      {vetDashboardTab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Stats summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
              <span className="stat-label">Pending Checks</span>
              <span className="stat-number" style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>{upcomingAppts.length}</span>
            </div>
            <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
              <span className="stat-label">Completed Checks</span>
              <span className="stat-number" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>{completedAppts.length}</span>
            </div>
            <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
              <span className="stat-label">Consultation Income</span>
              <span className="stat-number" style={{ color: 'var(--neutral-900)', marginTop: '0.25rem' }}>₹{completedAppts.length * 650}</span>
            </div>
          </div>

          {/* Pending queue */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Checked-in Pet Queue</h2>
            {apptsLoading ? (
              <p>Loading patient queue...</p>
            ) : upcomingAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CheckCircle size={36} style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--neutral-650)' }}>No pending appointments in your queue today.</p>
              </div>
            ) : (
              <div className="appointment-list">
                {upcomingAppts.map(appt => (
                  <div key={appt.id} className="appointment-item">
                    <div className="appt-info-main">
                      <div className="appt-status-icon status-upcoming-bg">
                        <User size={20} />
                      </div>
                      <div className="appt-details">
                        <span className="appt-vet-name" style={{ color: 'var(--neutral-950)' }}>Patient: {appt.pet?.name} ({appt.pet?.species})</span>
                        <span className="appt-sub-detail">Owner Contact: {appt.ownerEmail}</span>
                        <span className="appt-sub-detail" style={{ fontStyle: 'italic', marginTop: '0.1rem' }}>Reason: "{appt.reason}"</span>
                      </div>
                    </div>

                    <div className="appt-meta-info">
                      <div className="appt-date-time" style={{ textAlign: 'right' }}>
                        <span className="appt-date" style={{ fontWeight: 'bold', display: 'block' }}>{appt.date}</span>
                        <span className="appt-time" style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Slot: {appt.time}</span>
                      </div>
                      
                      <button className="btn btn-teal" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => { setCompletingAppt(appt); setChiefComplaint(appt.reason); }}>
                        Consultation Check-in
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Closed Cases */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} style={{ color: 'var(--secondary)' }} />
              Treated & Closed Cases (Today)
            </h2>
            {completedAppts.length === 0 ? (
              <p style={{ color: 'var(--neutral-400)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No cases treated and closed yet today.</p>
            ) : (
              <div className="appointment-list">
                {completedAppts.map(appt => (
                  <div key={appt.id} className="appointment-item" style={{ borderLeft: '4px solid var(--secondary)' }}>
                    <div className="appt-info-main">
                      <div className="appt-status-icon status-completed-bg">
                        <CheckCircle size={20} />
                      </div>
                      <div className="appt-details">
                        <span className="appt-vet-name">Patient: {appt.pet?.name} (ID: {appt.petId})</span>
                        <span className="appt-sub-detail">Diagnosis: {appt.notes || 'Routine checkup completed'}</span>
                      </div>
                    </div>

                    <div className="appt-meta-info">
                      <div style={{ textAlign: 'right' }}>
                        <span className="appt-date" style={{ fontWeight: 'bold', display: 'block' }}>{appt.date}</span>
                        <span className="appt-time" style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Closed: {appt.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 2: Search Lookup files */}
      {vetDashboardTab === 'search' && (
        <div className="card">
          <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>Inspect Pet Medical History File</h2>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Search by Pet ID (e.g. `PET-782`), Pet Name, or Owner phone contact details to retrieve files.
          </p>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', maxWidth: '600px', marginBottom: '2.5rem' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search Pet Name, ID, or Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required 
            />
            <button type="submit" className="btn btn-primary">Retrieve File</button>
          </form>

          {/* Results list */}
          {searchLoading ? (
            <p>Searching records...</p>
          ) : searchResults ? (
            searchResults.length === 0 ? (
              <p style={{ color: 'var(--neutral-500)' }}>No matching pet records found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {searchResults.map(pet => {
                  const hasConsent = consentGranted[pet.id];
                  return (
                    <div key={pet.id} className="appointment-item" style={{ padding: '1.25rem', backgroundColor: 'var(--neutral-50)' }}>
                      <div className="appt-info-main">
                        <div className="appt-status-icon status-upcoming-bg">
                          <User size={18} />
                        </div>
                        <div className="appt-details">
                          <span className="appt-vet-name" style={{ color: 'var(--neutral-900)' }}>Patient: {pet.name} ({pet.breed})</span>
                          <span className="appt-sub-detail">Owner Name: {pet.owner?.name} • Microchip: {pet.microchip}</span>
                          <span className="appt-sub-detail" style={{ color: 'var(--accent-red)' }}>Allergies: {pet.allergies}</span>
                        </div>
                      </div>

                      <div className="appt-meta-info">
                        {hasConsent ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
                            <ShieldCheck size={16} /> Consent Verified
                          </span>
                        ) : (
                          <button className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }} onClick={() => handleRequestConsent(pet.id)}>
                            Request Consent <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : null}
        </div>
      )}

      {/* Subtab 3: Inventory */}
      {vetDashboardTab === 'inventory' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Monthly Stock & Inventory Registry</h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>
                Stocks decrement automatically upon consultation check-in. Restock lines to maintain clinic capacity.
              </p>
            </div>
            <button className="btn btn-teal" onClick={handleRestockAll} disabled={restockAllMutation.isPending}>
              🔄 Restock All Items (+10)
            </button>
          </div>

          {invLoading ? (
            <p>Loading inventory...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-650)' }}>
                    <th style={{ padding: '0.75rem' }}>Item Description</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Stock Level</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status Alert</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Consumption This Month</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory?.map(item => {
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
                          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleRestockSingle(item.id, item.name)} disabled={restockMutation.isPending}>
                            ➕ Restock 10
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
      )}

      {/* Modal: Check-in / Complete Consult */}
      {completingAppt && (
        <div className="modal-overlay" onClick={() => setCompletingAppt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Consultation Check-in: {completingAppt.pet?.name}</h2>
              <button className="modal-close" onClick={() => setCompletingAppt(null)}>✕</button>
            </div>
            
            <form onSubmit={handleConsultSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div className="form-group">
                  <label className="form-label">Chief Complaint (Reason for Visit)</label>
                  <input type="text" className="form-control" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Diagnosis & Findings</label>
                  <input type="text" className="form-control" placeholder="Describe symptoms or clinical finding..." value={clinicalDiagnosis} onChange={(e) => setClinicalDiagnosis(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Progress Notes</label>
                  <textarea className="form-control" rows={3} placeholder="Instill ear drops, booster admin notes..." value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} />
                </div>

                {/* Prescription drugs section */}
                <div style={{ border: '1px solid var(--neutral-200)', borderRadius: '12px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>💊 Prescribe Medications</span>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Medication Name (e.g. Otomax)" 
                      value={medInput.name} 
                      onChange={(e) => setMedInput(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Dosage (e.g. 4 drops)" 
                      value={medInput.dosage} 
                      onChange={(prev) => setMedInput(prev => ({ ...prev, dosage: prev.target.value }))}
                    />
                  </div>

                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem' }} onClick={handleAddMed}>
                    ➕ Add Drug to Prescription
                  </button>

                  {prescriptionMeds.length > 0 && (
                    <ul style={{ marginTop: '0.75rem', fontSize: '0.8rem', listStyle: 'none', paddingLeft: 0 }}>
                      {prescriptionMeds.map((med, idx) => (
                        <li key={idx} style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--neutral-100)' }}>
                          <strong>{med.name}</strong> - {med.dosage} ({med.days} days)
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Vaccines immunization section */}
                <div style={{ border: '1px solid var(--neutral-200)', borderRadius: '12px', padding: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={vaccineInput.administer} 
                      onChange={(e) => setVaccineInput(prev => ({ ...prev, administer: e.target.checked }))} 
                    />
                    💉 Administer Immunization Vaccine
                  </label>

                  {vaccineInput.administer && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Vaccine Name</label>
                        <select 
                          className="form-control" 
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                          value={vaccineInput.name}
                          onChange={(e) => setVaccineInput(prev => ({ ...prev, name: e.target.value }))}
                        >
                          <option value="DHPP Booster">DHPP Booster</option>
                          <option value="Rabies Booster">Rabies Booster</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Next Booster Date</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                          value={vaccineInput.dueDate}
                          onChange={(e) => setVaccineInput(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCompletingAppt(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addConsultMutation.isPending}>
                  {addConsultMutation.isPending ? 'Saving Record...' : 'Complete Consultation & Checkout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VetDashboard;
