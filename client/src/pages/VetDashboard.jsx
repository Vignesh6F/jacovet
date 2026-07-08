import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { useSearchPets } from '../hooks/usePets';
import { useAddConsultRecord, usePetTimeline } from '../hooks/useRecords';
import { useInventory, useRestockItem, useRestockAll } from '../hooks/useInventory';
import { useDirectories } from '../hooks/useDirectories';
import Toast from '../components/Toast';
import { Stethoscope, Search, CheckCircle, Package, ArrowRight, ArrowLeft, User, ShieldCheck } from 'lucide-react';

const VetDashboard = () => {
  const { user, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  // Queries
  const { data: appointments, isLoading: apptsLoading } = useAppointments('doctor', isLoggedIn && user?.role === 'doctor');
  const { data: inventory, isLoading: invLoading } = useInventory(isLoggedIn && user?.role === 'doctor');
  const { data: directory } = useDirectories();
  
  const addConsultMutation = useAddConsultRecord();
  const restockMutation = useRestockItem();
  const restockAllMutation = useRestockAll();

  // States
  const [vetDashboardTab, setVetDashboardTab] = useState('appointments'); // 'appointments', 'search', 'inventory'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [viewingAppt, setViewingAppt] = useState(null);
  
  // Search query
  const { data: searchResults, isLoading: searchLoading } = useSearchPets(activeSearch, isLoggedIn && user?.role === 'doctor');

  // Consult Modal / Check-in states
  const [completingAppt, setCompletingAppt] = useState(null);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptionMeds, setPrescriptionMeds] = useState([]);
  const [medInput, setMedInput] = useState({ name: '', dosage: '', morning: true, afternoon: false, night: true, days: 5 });
  
  // Vaccines
  const [vaccineInput, setVaccineInput] = useState({ administer: false, name: 'DHPP Booster', batch: 'B-9021', manufacturer: 'Zoetis', dueDate: '' });

  // Vitals & base health states
  const [temp, setTemp] = useState('101.2 °F');
  const [weight, setWeight] = useState('');
  const [heartRate, setHeartRate] = useState('96 bpm');

  // Consent approval
  const [consentGranted, setConsentGranted] = useState({});

  // Notification
  const [toast, setToast] = useState({ message: '', type: 'success' });

  if (loading) {
    return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Loading application session...</div>;
  }

  if (!isLoggedIn || user?.role !== 'doctor') {
    return <DoctorLogin />;
  }

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
      temp,
      weight: weight || completingAppt.pet?.weight || 'Unknown',
      heartRate,
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
        setTemp('101.2 °F');
        setWeight('');
        setHeartRate('96 bpm');
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

  const currentVet = directory?.vets?.find(v => v.userId === user?.id);
  const activePlan = currentVet?.plan || 'FreeStarter';
  const vetPrice = currentVet?.price || 650;
  const clinicName = currentVet?.clinic?.name || 'JacoVet Clinic';
  const uniquePetsVisited = [...new Set(completedAppts.map(a => a.petId))].length;
  const totalEarned = completedAppts.reduce((sum, appt) => sum + (appt.vet?.price || vetPrice), 0);

  // Calculate registration trial days
  const createdDate = user?.createdAt ? new Date(user.createdAt) : new Date();
  const today = new Date();
  const diffTime = Math.max(0, today - createdDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const trialDaysRemaining = Math.max(0, 30 - diffDays);
  const trialExpired = diffDays >= 30;

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
          {clinicName}
        </span>
      </div>

      {/* Subscription Alert Banner */}
      {isLoggedIn && user?.role === 'doctor' && (
        <div style={{
          backgroundColor: trialExpired ? '#fef2f2' : '#f0fdf4',
          border: trialExpired ? '1px solid #fee2e2' : '1px solid #dcfce7',
          padding: '1.25rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: trialExpired ? '#991b1b' : '#166534', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {trialExpired ? '⚠️ Subscription Trial Expired' : '🚀 Free Tier Trial Active'}
              <span style={{ 
                fontSize: '0.75rem', 
                backgroundColor: trialExpired ? '#fee2e2' : '#dcfce7', 
                color: trialExpired ? '#b91c1c' : '#15803d', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '6px' 
              }}>
                Current Plan: {activePlan}
              </span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: trialExpired ? '#b91c1c' : '#15803d', margin: '0.25rem 0 0 0' }}>
              {trialExpired 
                ? 'Your 30-day FreeStarter trial has ended. Please upgrade your plan to maintain practitioner visibility ranking.'
                : `You are on the FreeStarter tier. You have ${trialDaysRemaining} days remaining in your trial. Upgrade for gold partner verification badges and priority indexing.`}
            </p>
          </div>
          <button 
            type="button" 
            className="btn" 
            style={{ 
              backgroundColor: trialExpired ? '#dc2626' : '#16a34a', 
              color: 'white', 
              border: 'none', 
              fontWeight: 'bold', 
              fontSize: '0.85rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px'
            }}
            onClick={() => navigate(`/plans?select=${activePlan}`)}
          >
            Upgrade Plan ➔
          </button>
        </div>
      )}

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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            <div 
              className="card" 
              style={{ padding: '1.25rem', marginBottom: 0, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => document.getElementById('pending-queue-section')?.scrollIntoView({ behavior: 'smooth' })}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <span className="stat-label">Pending Checks</span>
              <span className="stat-number" style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>{upcomingAppts.length}</span>
            </div>
            <div 
              className="card" 
              style={{ padding: '1.25rem', marginBottom: 0, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => document.getElementById('treated-cases-section')?.scrollIntoView({ behavior: 'smooth' })}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <span className="stat-label">Completed Checks</span>
              <span className="stat-number" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>{completedAppts.length}</span>
            </div>
            <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
              <span className="stat-label">Unique Patients Visited</span>
              <span className="stat-number" style={{ color: 'var(--primary-dark)', marginTop: '0.25rem' }}>{uniquePetsVisited}</span>
            </div>
            <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
              <span className="stat-label">My Consult Income</span>
              <span className="stat-number" style={{ color: 'var(--neutral-900)', marginTop: '0.25rem' }}>₹{totalEarned}</span>
            </div>
          </div>

          {/* Pending queue */}
          <div className="card" id="pending-queue-section" style={{ marginBottom: 0 }}>
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
                        <span className="appt-sub-detail">Owner Contact: {appt.ownerEmail} • Blood Group: <strong>{appt.pet?.bloodGroup || 'Unknown'}</strong></span>
                        <span className="appt-sub-detail" style={{ fontStyle: 'italic', marginTop: '0.1rem' }}>Reason: "{appt.reason}"</span>
                      </div>
                    </div>

                    <div className="appt-meta-info">
                      <div className="appt-date-time" style={{ textAlign: 'right' }}>
                        <span className="appt-date" style={{ fontWeight: 'bold', display: 'block' }}>{appt.date}</span>
                        <span className="appt-time" style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Slot: {appt.time}</span>
                      </div>
                      
                      <button className="btn btn-teal" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => { 
                        setCompletingAppt(appt); 
                        setChiefComplaint(appt.reason); 
                        setTemp('101.2 °F');
                        setHeartRate('96 bpm');
                        setWeight(appt.pet?.weight || '');
                      }}>
                        Consultation Check-in
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Closed Cases */}
          <div className="card" id="treated-cases-section" style={{ marginBottom: 0 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} style={{ color: 'var(--secondary)' }} />
              Treated & Closed Cases (Today)
            </h2>
            {completedAppts.length === 0 ? (
              <p style={{ color: 'var(--neutral-400)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No cases treated and closed yet today.</p>
            ) : (
              <div className="appointment-list">
                {completedAppts.map(appt => (
                  <div 
                    key={appt.id} 
                    className="appointment-item" 
                    style={{ borderLeft: '4px solid var(--secondary)', cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => setViewingAppt(appt)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-50)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
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
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
                        View Report 📄
                      </button>
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
                          <span className="appt-sub-detail">Owner Name: {pet.owner?.name} • Microchip: {pet.microchip} • Blood Group: <strong>{pet.bloodGroup || 'Unknown'}</strong></span>
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

                 {/* Vitals & Base Health Metrics */}
                 <div style={{ border: '1px solid var(--neutral-200)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block' }}>🩺 Vitals & Base Health Support</span>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                     <div className="form-group" style={{ marginBottom: 0 }}>
                       <label className="form-label" style={{ fontSize: '0.75rem' }}>Temperature</label>
                       <input 
                         type="text" 
                         className="form-control" 
                         style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                         value={temp} 
                         onChange={(e) => setTemp(e.target.value)} 
                         required 
                       />
                     </div>

                     <div className="form-group" style={{ marginBottom: 0 }}>
                       <label className="form-label" style={{ fontSize: '0.75rem' }}>Weight</label>
                       <input 
                         type="text" 
                         className="form-control" 
                         style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                         value={weight} 
                         onChange={(e) => setWeight(e.target.value)} 
                         required 
                       />
                     </div>

                     <div className="form-group" style={{ marginBottom: 0 }}>
                       <label className="form-label" style={{ fontSize: '0.75rem' }}>Heart Rate</label>
                       <input 
                         type="text" 
                         className="form-control" 
                         style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                         value={heartRate} 
                         onChange={(e) => setHeartRate(e.target.value)} 
                         required 
                       />
                     </div>
                   </div>
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
                      onChange={(e) => setMedInput(prev => ({ ...prev, dosage: e.target.value }))}
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

      {/* Modal: View Completed Consult Details */}
      {viewingAppt && (
        <div className="modal-overlay" onClick={() => setViewingAppt(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Completed Consultation Details</h2>
              <button className="modal-close" onClick={() => setViewingAppt(null)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem' }}>Patient: {viewingAppt.pet?.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Species/Breed: {viewingAppt.pet?.species} ({viewingAppt.pet?.breed || 'N/A'})</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 'bold', display: 'block' }}>Date: {viewingAppt.date}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Closed at: {viewingAppt.time}</span>
                </div>
              </div>

              {/* Record details with query fallback */}
              <ConsultRecordDetails 
                petId={viewingAppt.petId} 
                date={viewingAppt.date} 
                apptNotes={viewingAppt.notes} 
                apptPrescription={viewingAppt.prescription} 
                apptReason={viewingAppt.reason} 
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setViewingAppt(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const ConsultRecordDetails = ({ petId, date, apptNotes, apptPrescription, apptReason }) => {
  const { data: timelineData, isLoading } = usePetTimeline(petId);

  if (isLoading) {
    return <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--neutral-500)' }}>Retrieving treatment records...</p>;
  }

  const record = timelineData?.records?.find(r => r.visitDate === date);

  if (!record) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <strong>Chief Complaint:</strong>
          <p style={{ marginTop: '0.25rem', padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: '8px', border: '1px solid var(--neutral-150)', fontSize: '0.9rem' }}>
            "{apptReason || 'N/A'}"
          </p>
        </div>
        <div>
          <strong>Diagnosis / Findings:</strong>
          <p style={{ marginTop: '0.25rem', padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: '8px', border: '1px solid var(--neutral-150)', fontSize: '0.9rem' }}>
            {apptNotes || 'Routine checkup completed.'}
          </p>
        </div>
        {apptPrescription && (
          <div>
            <strong>Prescription:</strong>
            <pre style={{ marginTop: '0.25rem', padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: '8px', border: '1px solid var(--neutral-150)', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
              {apptPrescription}
            </pre>
          </div>
        )}
      </div>
    );
  }

  let prescriptions = [];
  try { prescriptions = JSON.parse(record.prescriptions || '[]'); } catch(e) {}
  
  let vaccinations = [];
  try { vaccinations = JSON.parse(record.vaccinations || '[]'); } catch(e) {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', backgroundColor: 'var(--neutral-50)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--neutral-200)', fontSize: '0.82rem' }}>
        <div>🌡️ Temp: <strong>{record.temp}</strong></div>
        <div>⚖️ Weight: <strong>{record.weight}</strong></div>
        <div>💓 Heart Rate: <strong>{record.heartRate}</strong></div>
      </div>

      <div>
        <strong>Chief Complaint:</strong>
        <p style={{ marginTop: '0.25rem', padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: '8px', border: '1px solid var(--neutral-150)', fontSize: '0.9rem' }}>
          "{record.chiefComplaint}"
        </p>
      </div>

      <div>
        <strong>Diagnosis:</strong>
        <p style={{ marginTop: '0.25rem', padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: '8px', border: '1px solid var(--neutral-150)', fontSize: '0.9rem' }}>
          {record.diagnosis}
        </p>
      </div>

      {record.notes && (
        <div>
          <strong>Clinical Notes:</strong>
          <p style={{ marginTop: '0.25rem', padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: '8px', border: '1px solid var(--neutral-150)', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--neutral-600)' }}>
            {record.notes}
          </p>
        </div>
      )}

      {prescriptions.length > 0 && (
        <div>
          <strong style={{ display: 'block', marginBottom: '0.5rem' }}>💊 Prescribed Medications:</strong>
          <div style={{ border: '1px solid var(--neutral-200)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--neutral-100)', borderBottom: '1px solid var(--neutral-200)' }}>
                  <th style={{ padding: '0.5rem' }}>Drug</th>
                  <th style={{ padding: '0.5rem' }}>Dosage</th>
                  <th style={{ padding: '0.5rem' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < prescriptions.length - 1 ? '1px solid var(--neutral-150)' : 'none' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{m.name}</td>
                    <td style={{ padding: '0.5rem' }}>{m.dosage} ({[m.morning && '☀️', m.afternoon && '🌤️', m.night && '🌙'].filter(Boolean).join(' ')})</td>
                    <td style={{ padding: '0.5rem' }}>{m.days} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vaccinations.length > 0 && (
        <div>
          <strong style={{ display: 'block', marginBottom: '0.5rem' }}>💉 Administered Vaccine:</strong>
          <div style={{ border: '1px solid var(--neutral-200)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem' }}>
            💉 <strong>{vaccinations[0].name}</strong> (Batch: {vaccinations[0].batch} • Manufacturer: {vaccinations[0].manufacturer})<br/>
            Next Booster Date: <strong style={{ color: 'var(--primary)' }}>{vaccinations[0].dueDate}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

const DoctorLogin = () => {
  const { login, registerDoctor } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  
  // Login fields
  const [email, setEmail] = useState('doctor@jacovet.com');
  const [password, setPassword] = useState('doctor123');
  
  // Signup fields
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    specialty: 'General Medicine',
    experience: '3 years'
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please specify credentials.', 'danger');
      return;
    }
    const res = await login(email, password, 'doctor');
    if (res.success) {
      showToast('Successfully logged in! Opening workspace...');
    } else {
      showToast(res.message, 'danger');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, specialty, experience } = signupForm;
    if (!name || !email || !password || !specialty) {
      showToast('Please fill out all required fields.', 'danger');
      return;
    }
    const res = await registerDoctor(name, email, password, specialty, experience);
    if (res.success) {
      showToast('Account registered successfully! Opening workspace...');
    } else {
      showToast(res.message, 'danger');
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', background: '#f8fafc' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '1.5rem', border: 'none' }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={12} /> Back to Search
        </button>

        {/* Tab switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginBottom: '1.5rem', backgroundColor: 'var(--neutral-100)', padding: '0.25rem', borderRadius: '8px' }}>
          <button 
            type="button"
            style={{ border: 'none', padding: '0.45rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', backgroundColor: tab === 'login' ? 'white' : 'transparent', color: tab === 'login' ? 'var(--primary)' : 'var(--neutral-500)' }}
            onClick={() => setTab('login')}
          >
            Doctor Log In
          </button>
          <button 
            type="button"
            style={{ border: 'none', padding: '0.45rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', backgroundColor: tab === 'signup' ? 'white' : 'transparent', color: tab === 'signup' ? 'var(--primary)' : 'var(--neutral-500)' }}
            onClick={() => setTab('signup')}
          >
            Register / Join
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: '800' }}>Doctor Workspace Login</h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Check-in patients, diagnose cases, and monitor clinic stock levels.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Access Email</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="doctor@domain.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Access Workspace 🩺
            </button>

            <div style={{ backgroundColor: 'var(--neutral-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--neutral-600)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>🔑 <strong>Demo Email:</strong> <code>doctor@jacovet.com</code></div>
              <div>🔑 <strong>Demo Passcode:</strong> <code>doctor123</code></div>
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--neutral-200)', paddingTop: '1rem', textAlign: 'center' }}>
              <button type="button" style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => navigate('/login')}>
                ➔ Switch to Pet Owner Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: '800' }}>Register Veterinarian</h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Join JacoVet to setup your consult queues, manage inventory, and track cases.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Dr. Rajesh Patel" 
                value={signupForm.name} 
                onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Access Email</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="doctor@domain.com" 
                value={signupForm.email} 
                onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={signupForm.password} 
                onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))} 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Specialty</label>
                <select 
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                  value={signupForm.specialty} 
                  onChange={(e) => setSignupForm(prev => ({ ...prev, specialty: e.target.value }))}
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Surgery & Orthopedics">Surgery & Ortho</option>
                  <option value="Feline Specialist">Feline Specialist</option>
                  <option value="Avian & Exotics">Avian & Exotics</option>
                  <option value="Dentistry & Hygiene">Dentistry & Hygiene</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Experience</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 5 years" 
                  value={signupForm.experience} 
                  onChange={(e) => setSignupForm(prev => ({ ...prev, experience: e.target.value }))} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Register & Access Workspace 🐾
            </button>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--neutral-200)', paddingTop: '1rem', textAlign: 'center' }}>
              <button type="button" style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => navigate('/login')}>
                ➔ Switch to Pet Owner Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VetDashboard;
