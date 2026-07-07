import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePetTimeline } from '../hooks/useRecords';
import Toast from '../components/Toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Award, FileText, Info, CheckCircle, Stethoscope } from 'lucide-react';

const PetTimeline = () => {
  const { petId } = useParams();
  const navigate = useNavigate();

  // Queries
  const { data: timelineData, isLoading, isError } = usePetTimeline(petId);

  // States
  const [printCertificate, setPrintCertificate] = useState(null);
  
  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <p>Retrieving lifelong medical record timeline file...</p>
      </div>
    );
  }

  if (isError || !timelineData) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h3>Failed to Retrieve Records</h3>
        <p style={{ color: 'var(--neutral-500)', marginBottom: '1.5rem' }}>Verify your search query details or check authentication permissions.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const { pet, records } = timelineData;

  // Process Recharts Weight History data
  // We parse the weight fields from history (e.g. "28.5 kg" -> 28.5) and order them chronologically
  const weightData = [...records]
    .filter(r => r.weight && !isNaN(parseFloat(r.weight)))
    .map(r => ({
      date: new Date(r.visitDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      weight: parseFloat(r.weight),
      rawDate: new Date(r.visitDate)
    }))
    .sort((a, b) => a.rawDate - b.rawDate);

  // Filter immunization vaccines
  const vaccineRecords = records.filter(r => {
    try {
      const vacs = JSON.parse(r.vaccinations || '[]');
      return vacs && vacs.length > 0;
    } catch (e) {
      return false;
    }
  });

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
            {pet.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '850', color: 'var(--neutral-900)' }}>Medical History: {pet.name}</h1>
            <span style={{ fontSize: '0.9rem', color: 'var(--neutral-650)' }}>Species: {pet.species} • Breed: {pet.breed} • Tag Tag: {pet.microchip}</span>
          </div>
        </div>
        
        {/* Redirect to homepage on exit */}
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Back to Search
        </button>
      </div>

      {/* Vitals Summary Row */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem', backgroundColor: 'white' }}>
        <div>
          <span className="stat-label">Blood Group</span>
          <span className="stat-number" style={{ fontSize: '1.5rem', color: 'var(--accent-red)', marginTop: '0.25rem' }}>{pet.bloodGroup}</span>
        </div>
        <div>
          <span className="stat-label">Active Allergies</span>
          <span className="stat-number" style={{ fontSize: '1.15rem', color: 'var(--neutral-850)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pet.allergies}</span>
        </div>
        <div>
          <span className="stat-label">Last Recorded Weight</span>
          <span className="stat-number" style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>{pet.weight}</span>
        </div>
        <div>
          <span className="stat-label">Emergency Phone Contact</span>
          <span className="stat-number" style={{ fontSize: '1.25rem', color: 'var(--neutral-900)', marginTop: '0.25rem' }}>{pet.emergencyContact}</span>
        </div>
      </div>

      {/* Weight History Analytics Graph */}
      {weightData.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '1.5rem' }}>Weight Change Analytics (Recharts Graph)</h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={weightData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neutral-200)" />
                <XAxis dataKey="date" stroke="var(--neutral-500)" style={{ fontSize: '0.8rem' }} />
                <YAxis stroke="var(--neutral-500)" style={{ fontSize: '0.8rem' }} unit=" kg" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--neutral-200)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }} />
                <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 8 }} name="Weight" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Active Immunization Booster Schedule */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.45rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          💉 Active Immunization Booster Schedule
        </h2>
        
        {vaccineRecords.length === 0 ? (
          <p style={{ color: 'var(--neutral-400)', fontSize: '0.9rem' }}>No vaccination records logged for this pet yet.</p>
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
                {vaccineRecords.map(record => {
                  const vaccine = JSON.parse(record.vaccinations)[0];
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
                      <td style={{ padding: '0.75rem 0.5rem' }}>{record.visitDate}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{record.clinicName}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700' }}>{vaccine.dueDate}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ backgroundColor: statusBg, color: statusColor, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {statusText}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setPrintCertificate({ pet, record, vaccine })}>
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

      {/* Lifelong Chronological Medical timeline list */}
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.75rem' }}>Lifelong Health Timeline</h2>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Info size={32} style={{ color: 'var(--neutral-300)', marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--neutral-600)', fontStyle: 'italic' }}>Timeline is empty. Record consult visits to populate this chart.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', paddingLeft: '2rem', borderLeft: '3px solid var(--primary-light)' }}>
            {records.map(record => {
              const meds = JSON.parse(record.prescriptions || '[]');
              const vacs = JSON.parse(record.vaccinations || '[]');

              return (
                <div key={record.id} className="timeline-card" style={{ position: 'relative', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--neutral-200)' }}>
                  
                  {/* Timeline dot marker */}
                  <div style={{ position: 'absolute', left: '-2.45rem', top: '1.75rem', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '4px solid white', boxShadow: 'var(--shadow-sm)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', fontWeight: 'bold', display: 'block' }}>CONSULTATION TICKET: {record.id}</span>
                      <h3 style={{ fontSize: '1.25rem', marginTop: '0.15rem' }}>{record.type} Report</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 'bold' }}>{record.clinicName} (Attending: {record.doctorName})</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: 'var(--neutral-700)', fontSize: '0.85rem' }}>📅 {record.visitDate}</span>
                  </div>

                  {/* Chief complaint, vitals, diagnosis */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                    <div><strong>Chief Complaint:</strong> "{record.chiefComplaint}"</div>
                    <div><strong>Diagnosis findings:</strong> {record.diagnosis}</div>
                    {record.notes && <div style={{ fontStyle: 'italic', color: 'var(--neutral-500)' }}><strong>Clinical Notes:</strong> {record.notes}</div>}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', backgroundColor: 'white', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', marginTop: '0.5rem', maxWidth: '460px' }}>
                      <span style={{ fontSize: '0.8rem' }}>🌡️ Temp: <strong>{record.temp}</strong></span>
                      <span style={{ fontSize: '0.8rem' }}>⚖️ Weight: <strong>{record.weight}</strong></span>
                      <span style={{ fontSize: '0.8rem' }}>💓 Heart: <strong>{record.heartRate}</strong></span>
                    </div>
                  </div>

                  {/* Medicines list details */}
                  {meds.length > 0 && (
                    <div style={{ marginTop: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--neutral-500)', display: 'block', marginBottom: '0.5rem' }}>💊 Prescribed Medicines</span>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--neutral-200)', textAlign: 'left', color: 'var(--neutral-400)' }}>
                            <th style={{ padding: '0.25rem' }}>Drug</th>
                            <th style={{ padding: '0.25rem' }}>Dosage</th>
                            <th style={{ padding: '0.25rem' }}>Schedule</th>
                            <th style={{ padding: '0.25rem' }}>Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {meds.map((med, i) => (
                            <tr key={i}>
                              <td style={{ padding: '0.4rem 0.25rem', fontWeight: 'bold' }}>{med.name}</td>
                              <td style={{ padding: '0.4rem 0.25rem' }}>{med.dosage}</td>
                              <td style={{ padding: '0.4rem 0.25rem' }}>
                                {med.morning && '☀️'} {med.afternoon && '🌤️'} {med.night && '🌙'}
                              </td>
                              <td style={{ padding: '0.4rem 0.25rem' }}>{med.days} days</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Vaccine logs details */}
                  {vacs.length > 0 && (
                    <div style={{ marginTop: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--neutral-500)', display: 'block', marginBottom: '0.25rem' }}>💉 Administered Vaccine Details</span>
                        <span style={{ fontSize: '0.82rem' }}>
                          <strong>{vacs[0].name}</strong> (Batch: {vacs[0].batch} • Manufacturer: {vacs[0].manufacturer})<br/>
                          Next dose due: <strong style={{ color: 'var(--primary)' }}>{vacs[0].dueDate}</strong>
                        </span>
                      </div>
                      
                      <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setPrintCertificate({ pet, record, vaccine: vacs[0] })}>
                        <Award size={12} /> Vaccine Certificate
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Printable Vaccine Certificate */}
      {printCertificate && (
        <div className="modal-overlay" onClick={() => setPrintCertificate(null)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Official Immunization Certificate</h2>
              <button className="modal-close" onClick={() => setPrintCertificate(null)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ padding: '2rem' }}>
              <div style={{ border: '4px double var(--neutral-300)', padding: '1.75rem', borderRadius: '16px', backgroundColor: 'var(--neutral-50)', textAlign: 'center', fontFamily: 'serif' }}>
                <Award size={48} style={{ color: 'var(--accent-amber)', marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>JACOVET IMMUNIZATION PASS</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.1em' }}>MADURAI ANIMAL CLINICAL NETWORK</span>
                
                <hr style={{ border: 'none', borderBottom: '1px solid var(--neutral-300)', margin: '1rem 0' }} />

                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: '1.5rem 0', color: 'var(--neutral-800)' }}>
                  This official clinical record certifies that the patient pet <strong>{printCertificate.pet.name}</strong> has been successfully administered the following immunization booster vaccine:
                </p>

                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', display: 'inline-block', textAlign: 'left', minWidth: '320px', fontSize: '0.85rem', fontFamily: 'var(--font-body)', marginBottom: '1.5rem' }}>
                  <strong>Vaccine Administered:</strong> {printCertificate.vaccine.name}<br/>
                  <strong>Batch Serial No:</strong> {printCertificate.vaccine.batch}<br/>
                  <strong>Manufacturer:</strong> {printCertificate.vaccine.manufacturer}<br/>
                  <strong>Date of Injection:</strong> {printCertificate.record.visitDate}<br/>
                  <strong>Next Dose Due:</strong> <strong style={{ color: 'var(--primary)' }}>{printCertificate.vaccine.dueDate}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--neutral-500)', fontFamily: 'var(--font-body)' }}>
                  <div style={{ textAlign: 'left' }}>
                    <strong>Clinic:</strong><br/>
                    {printCertificate.record.clinicName}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>Attending Doctor:</strong><br/>
                    {printCertificate.record.doctorName}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPrintCertificate(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Certificate</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PetTimeline;
