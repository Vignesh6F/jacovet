import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { useCompleteCheckout } from '../hooks/useAdmin';
import Toast from '../components/Toast';
import { DollarSign, Clock, Calendar, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Queries
  const { data: appointments, isLoading: apptsLoading } = useAppointments('admin');
  const checkoutMutation = useCompleteCheckout();

  // States
  const [checkoutAppt, setCheckoutAppt] = useState(null);
  const [billAmount, setBillAmount] = useState('650');
  
  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!billAmount || isNaN(billAmount)) {
      showToast('Please specify a valid bill amount.', 'danger');
      return;
    }

    checkoutMutation.mutate(
      {
        id: checkoutAppt.id,
        billAmount
      },
      {
        onSuccess: () => {
          showToast(`Invoice generated for ₹${billAmount}! Closed checkout ticket.`);
          setCheckoutAppt(null);
          setBillAmount('650');
        },
        onError: (err) => {
          showToast(err.response?.data?.message || 'Failed to complete checkout.', 'danger');
        }
      }
    );
  };

  const upcomingAppts = appointments ? appointments.filter(a => a.status === 'upcoming') : [];
  const completedAppts = appointments ? appointments.filter(a => a.status === 'completed') : [];
  const billedAppts = appointments ? appointments.filter(a => a.billed) : [];
  
  const totalBilled = billedAppts.reduce((sum, a) => sum + a.billAmount, 0);

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '850' }}>Clinic Desk Administration</h1>
          <p style={{ color: 'var(--neutral-500)' }}>Manage consultation scheduling, doctor calendars, and client billing checkouts.</p>
        </div>
        <span className="role-badge" style={{ cursor: 'default' }}>
          Operations Office
        </span>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
          <span className="stat-label">Pending Bookings</span>
          <span className="stat-number" style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>{upcomingAppts.length}</span>
        </div>
        <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
          <span className="stat-label">Completed Consults</span>
          <span className="stat-number" style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>{completedAppts.length}</span>
        </div>
        <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
          <span className="stat-label">Pending Invoices</span>
          <span className="stat-number" style={{ color: 'var(--accent-amber)', marginTop: '0.25rem' }}>{completedAppts.filter(a => !a.billed).length}</span>
        </div>
        <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
          <span className="stat-label">Total Cash Flow</span>
          <span className="stat-number" style={{ color: 'var(--neutral-900)', marginTop: '0.25rem' }}>₹{totalBilled}</span>
        </div>
      </div>

      {/* Calendar Queue and Invoicing list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        
        {/* Calendar Queue */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '1.5rem' }}>Scheduling Calendar Queue</h2>
          
          {apptsLoading ? (
            <p>Loading appointments registry...</p>
          ) : appointments?.length === 0 ? (
            <p style={{ color: 'var(--neutral-500)' }}>No appointments booked in the system.</p>
          ) : (
            <div className="appointment-list">
              {appointments?.map(appt => (
                <div key={appt.id} className="appointment-item">
                  <div className="appt-info-main">
                    <div className={`appt-status-icon ${appt.status === 'completed' ? 'status-completed-bg' : 'status-upcoming-bg'}`}>
                      <Calendar size={18} />
                    </div>
                    <div className="appt-details">
                      <span className="appt-vet-name" style={{ color: 'var(--neutral-900)' }}>{appt.vet?.name} ({appt.vet?.specialty})</span>
                      <span className="appt-sub-detail">Patient: <strong>{appt.pet?.name}</strong> (Owner Contact: {appt.ownerEmail})</span>
                      <span className="appt-sub-detail" style={{ fontStyle: 'italic', marginTop: '0.1rem' }}>Reason: "{appt.reason}"</span>
                    </div>
                  </div>

                  <div className="appt-meta-info" style={{ textAlign: 'right' }}>
                    <span className="appt-date" style={{ fontWeight: 'bold', display: 'block' }}>{appt.date}</span>
                    <span className="appt-time" style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Slot: {appt.time}</span>
                    <span className={`appt-badge badge-${appt.status}`} style={{ marginTop: '0.25rem' }}>
                      {appt.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoicing Billing Desk */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} style={{ color: 'var(--primary)' }} />
            Billing Checkout desk
          </h2>

          {apptsLoading ? (
            <p>Loading billing lines...</p>
          ) : completedAppts.filter(a => !a.billed).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle size={32} style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }} />
              <p style={{ color: 'var(--neutral-500)' }}>All completed consultations are fully billed!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {completedAppts
                .filter(a => !a.billed)
                .map(appt => (
                  <div key={appt.id} className="appointment-item" style={{ padding: '1rem', backgroundColor: 'var(--neutral-50)', border: '1px solid var(--neutral-200)' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', color: 'var(--neutral-900)' }}>{appt.pet?.name} Checkup invoice</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--neutral-500)', display: 'block' }}>Doctor: {appt.vet?.name}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--neutral-500)', display: 'block' }}>Slot: {appt.time} ({appt.date})</span>
                    </div>
                    
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setCheckoutAppt(appt)}>
                      Checkout
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal: Checkout invoice generation */}
      {checkoutAppt && (
        <div className="modal-overlay" onClick={() => setCheckoutAppt(null)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generate Consultation Invoice</h2>
              <button className="modal-close" onClick={() => setCheckoutAppt(null)}>✕</button>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
                  Confirm payment checkout and calculate consultation fees for <strong>{checkoutAppt.pet?.name}</strong>.
                </p>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="650"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCheckoutAppt(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={checkoutMutation.isPending}>
                  {checkoutMutation.isPending ? 'Processing...' : 'Confirm Checkout & Print'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
