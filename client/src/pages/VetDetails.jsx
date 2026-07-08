import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDirectories } from '../hooks/useDirectories';
import { useMyPets } from '../hooks/usePets';
import { useBookAppointment, useBookedSlots } from '../hooks/useAppointments';
import Toast from '../components/Toast';
import { Star, ArrowLeft, MapPin, Calendar, DollarSign, Clock, Info, CheckCircle2 } from 'lucide-react';

const VetDetails = () => {
  const { vetId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, user } = useAuth();
  
  // Queries
  const { data: directoryData, isLoading: dirLoading } = useDirectories();
  const { data: myPets } = useMyPets(isLoggedIn && user?.role === 'owner');
  const bookApptMutation = useBookAppointment();

  // Find active veterinarian details
  const vet = directoryData?.vets?.find(v => v.id === vetId);

  // States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [bookingForm, setBookingForm] = useState({
    petId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    reason: ''
  });

  // Fetch booked slots for conflicts checking
  const { data: bookedSlots } = useBookedSlots(vetId, bookingForm.date, !!vetId);

  // Auto-fill first pet if user has pets
  useEffect(() => {
    if (myPets && myPets.length > 0 && !bookingForm.petId) {
      setBookingForm(prev => ({ ...prev, petId: myPets[0].id }));
    }
  }, [myPets, bookingForm.petId]);

  // Handle URL param ?book=true to auto-trigger scheduling modal
  useEffect(() => {
    if (searchParams.get('book') === 'true' && vet) {
      if (!isLoggedIn) {
        showToast('Please log in first to schedule a consultation.', 'warning');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setShowBookingModal(true);
      }
    }
  }, [searchParams, vet, isLoggedIn, navigate]);

  // Conflict timing auto-shift logic
  useEffect(() => {
    if (bookedSlots && bookingForm.time) {
      const isCurrentBooked = bookedSlots.some(b => b.time === bookingForm.time);
      if (isCurrentBooked) {
        const available = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].find(
          slot => !bookedSlots.some(b => b.time === slot)
        );
        setBookingForm(prev => ({ ...prev, time: available || '' }));
      }
    }
  }, [bookedSlots, bookingForm.time]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!bookingForm.petId) {
      showToast('Please select a pet to register this visit.', 'danger');
      return;
    }

    if (!bookingForm.time) {
      showToast('All slots are booked for this date. Please select another date.', 'danger');
      return;
    }

    bookApptMutation.mutate(
      {
        vetId: vet.id,
        petId: bookingForm.petId,
        date: bookingForm.date,
        time: bookingForm.time,
        reason: bookingForm.reason || 'General health consultation.'
      },
      {
        onSuccess: () => {
          showToast(`Successfully booked appointment with ${vet.name} for ${bookingForm.date} at ${bookingForm.time}!`, 'success');
          setShowBookingModal(false);
          setBookingForm(prev => ({
            ...prev,
            reason: ''
          }));
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        },
        onError: (err) => {
          showToast(err.response?.data?.message || 'Failed to submit booking.', 'danger');
        }
      }
    );
  };

  if (dirLoading) {
    return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Loading doctor details...</div>;
  }

  if (!vet) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2>Practitioner Not Found</h2>
        <p style={{ color: 'var(--neutral-500)' }}>The requested vet profile does not exist in the directories.</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
          Return to Registry
        </button>
      </div>
    );
  }

  // Fallback reviews if not seeded or mock reviews from directories
  const reviews = vet.reviews || [
    { id: 'rev-1', author: 'Vikram Singh', rating: 5, comment: `Dr. ${vet.name.split(' ').slice(1).join(' ')} is amazing, explained everything clearly, and is highly professional!`, date: '2026-06-28' },
    { id: 'rev-2', author: 'Ananya Rao', rating: 4, comment: 'Very professional clinic and super gentle with pets. Highly recommend.', date: '2026-07-01' }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '3rem 1.5rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Back navigation link */}
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '2rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} /> Return to Search
        </button>

        {/* Profile Card Hero */}
        <div className="card" style={{ padding: '2.5rem', borderRadius: '16px', marginBottom: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <img 
            src={vet.image} 
            alt={vet.name} 
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--neutral-100)', boxShadow: 'var(--shadow-sm)' }} 
          />
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="role-badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.15)', cursor: 'default' }}>
                Verified Partner
              </span>
              {vet.plan === 'ProPremium' && (
                <span className="role-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.15)', cursor: 'default' }}>
                  ★ Premium Member
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '850', color: 'var(--neutral-900)', margin: '0 0 0.25rem 0' }}>{vet.name}</h1>
            <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{vet.specialty}</p>
            
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
              <div>🎓 <strong>{vet.experience} experience</strong></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={14} fill="var(--accent-amber)" style={{ color: 'var(--accent-amber)' }} />
                <strong>{vet.rating} rating</strong> (Based on {reviews.length} client reviews)
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '2rem' }}>
          
          {/* Left Column: Biography & Client Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Bio Card */}
            <div className="card" style={{ padding: '2rem', borderRadius: '12px', marginBottom: 0 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--neutral-900)' }}>Professional Biography</h2>
              <p style={{ color: 'var(--neutral-650)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {vet.bio}
              </p>
            </div>

            {/* Reviews Card */}
            <div className="card" style={{ padding: '2rem', borderRadius: '12px', marginBottom: 0 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--neutral-900)' }}>Client Feedback & Reviews</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid var(--neutral-150)', paddingBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <strong style={{ color: 'var(--neutral-800)' }}>{rev.author}</strong>
                      <span style={{ color: 'var(--neutral-400)' }}>{rev.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < rev.rating ? "var(--accent-amber)" : "transparent"} style={{ color: i < rev.rating ? 'var(--accent-amber)' : 'var(--neutral-300)' }} />
                      ))}
                    </div>
                    <p style={{ color: 'var(--neutral-600)', fontSize: '0.88rem', margin: 0, fontStyle: 'italic' }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Pricing & Scheduling Action Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Booking Action Box */}
            <div className="card" style={{ padding: '2rem', borderRadius: '12px', marginBottom: 0, border: '1.5px solid var(--primary-light)', backgroundColor: 'white', textAlign: 'center' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--neutral-400)' }}>Consultation Fee</span>
                <div style={{ fontSize: '2.5rem', fontWeight: '850', color: 'var(--neutral-900)', marginTop: '0.25rem' }}>
                  ₹{vet.price}
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 'bold', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => {
                  if (!isLoggedIn) {
                    showToast('Please log in first to book a schedule.', 'warning');
                    setTimeout(() => navigate('/login'), 1500);
                  } else {
                    setShowBookingModal(true);
                  }
                }}
              >
                <Calendar size={18} /> Book Consultation
              </button>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--neutral-150)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', fontSize: '0.82rem', color: 'var(--neutral-500)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>{vet.clinic?.name || 'Clinic Center'} ({vet.location})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                  <span>Slots available today & tomorrow</span>
                </div>
              </div>
            </div>

            {/* Clinic Info Box */}
            <div className="card" style={{ padding: '2rem', borderRadius: '12px', marginBottom: 0 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--neutral-900)' }}>Affiliated Clinic</h3>
              <strong style={{ fontSize: '0.9rem', color: 'var(--neutral-800)', display: 'block', marginBottom: '0.25rem' }}>{vet.clinic?.name || 'Clinic Center'}</strong>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.82rem', margin: '0 0 1rem 0' }}>{vet.clinic?.location || 'Madurai Center'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 'bold' }}>
                <Star size={14} fill="currentColor" /> {vet.clinic?.rating || '4.8'} Clinic Rating
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modal: Book Schedule */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Consultation</h2>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}>✕</button>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--neutral-50)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--neutral-150)' }}>
                  <img src={vet.image} alt={vet.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--neutral-900)' }}>{vet.name}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 'bold' }}>{vet.specialty}</span>
                  </div>
                </div>

                {/* Pet Selection */}
                <div className="form-group">
                  <label className="form-label">Patient Pet</label>
                  {myPets && myPets.length > 0 ? (
                    <select 
                      className="form-control"
                      value={bookingForm.petId}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, petId: e.target.value }))}
                      required
                    >
                      <option value="" disabled>-- Select Pet Parent's Registered Pet --</option>
                      {myPets.map(pet => (
                        <option key={pet.id} value={pet.id}>{pet.name} ({pet.species} - {pet.breed})</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: '0.75rem', border: '1.5px dashed var(--neutral-200)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--neutral-500)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>No registered pets found.</span>
                      <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => navigate('/dashboard')}>
                        Add Pet +
                      </button>
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                <div className="form-group">
                  <label className="form-label">Appointment Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                {/* Time Slot Selection */}
                <div className="form-group">
                  <label className="form-label">Available Timing Slots</label>
                  <div className="slot-grid">
                    {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(slot => {
                      const isBooked = bookedSlots && bookedSlots.some(b => b.time === slot);
                      return (
                        <div 
                          key={slot}
                          className={`slot-item ${bookingForm.time === slot ? 'active' : ''} ${isBooked ? 'disabled' : ''}`}
                          onClick={() => {
                            if (!isBooked) {
                              setBookingForm(prev => ({ ...prev, time: slot }));
                            }
                          }}
                        >
                          {slot}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reason for Appointment */}
                <div className="form-group">
                  <label className="form-label">Reason for Visit</label>
                  <textarea 
                    className="form-control"
                    placeholder="Describe symptoms, vaccination booster request, or checkup reason..."
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookingModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={bookApptMutation.isPending}>
                  {bookApptMutation.isPending ? 'Scheduling...' : 'Confirm Appointment 🩺'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VetDetails;
