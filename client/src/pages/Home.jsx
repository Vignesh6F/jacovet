import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDirectories } from '../hooks/useDirectories';
import { useMyPets } from '../hooks/usePets';
import { useBookAppointment, useBookedSlots } from '../hooks/useAppointments';
import Toast from '../components/Toast';
import { MapPin, Search, Calendar, Star, Info, Shield, CheckCircle } from 'lucide-react';

const userLocationPresets = [
  { name: 'Madurai East (Anna Nagar)', lat: 9.9272, lng: 78.1438 },
  { name: 'Madurai West (J Junction)', lat: 9.9192, lng: 78.1120 },
  { name: 'Madurai South (K.K. Nagar)', lat: 9.9295, lng: 78.1565 },
];

const calculateProximity = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // distance in km
};

const Home = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // Queries
  const { data: directoryData, isLoading: dirLoading } = useDirectories();
  const { data: myPets } = useMyPets(isLoggedIn && user?.role === 'owner');
  const bookApptMutation = useBookAppointment();

  // States
  const [selectedCategory, setSelectedCategory] = useState('All Specialties');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserLocation, setCurrentUserLocation] = useState(userLocationPresets[0]);
  const [customLat, setCustomLat] = useState('9.9192');
  const [customLng, setCustomLng] = useState('78.1120');
  const [isCustomLoc, setIsCustomLoc] = useState(false);
  const [sortBy, setSortBy] = useState('proximity');
  const [bookingVet, setBookingVet] = useState(null);
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({ 
    petId: '', 
    date: new Date().toISOString().split('T')[0], 
    time: '09:00 AM', 
    reason: '' 
  });

  const { data: bookedSlots } = useBookedSlots(bookingVet?.id, bookingForm.date, !!bookingVet);

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
  
  // Notifications
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleGeoDetect = () => {
    if (!navigator.geolocation) {
      showToast('HTML5 Geolocation is not supported by your browser.', 'danger');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = {
          name: 'Detected Coordinates 📍',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setCurrentUserLocation(detected);
        setCustomLat(pos.coords.latitude.toFixed(4));
        setCustomLng(pos.coords.longitude.toFixed(4));
        setIsCustomLoc(true);
        showToast('Successfully synchronized with your browser GPS coordinates!');
      },
      (err) => {
        console.error('Geo detect error:', err);
        showToast(`GPS Access Denied: ${err.message}. Defaulting to Anna Nagar.`, 'danger');
      }
    );
  };

  const triggerBookingGate = (vet) => {
    if (!isLoggedIn) {
      // Save pending booking vet
      sessionStorage.setItem('pending_booking_vet', JSON.stringify(vet));
      navigate('/login');
    } else if (user.role !== 'owner') {
      showToast('Only authenticated Pet Owners can book appointments.', 'danger');
    } else {
      setBookingVet(vet);
      setBookingForm(prev => ({
        ...prev,
        petId: myPets && myPets.length > 0 ? myPets[0].id : ''
      }));
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.petId || !bookingForm.date || !bookingForm.time || !bookingForm.reason) {
      showToast('Please fill out all booking fields.', 'danger');
      return;
    }

    bookApptMutation.mutate(
      {
        vetId: bookingVet.id,
        petId: bookingForm.petId,
        date: bookingForm.date,
        time: bookingForm.time,
        reason: bookingForm.reason
      },
      {
        onSuccess: () => {
          showToast(`Successfully scheduled appointment with ${bookingVet.name}!`);
          setBookingVet(null);
          setBookingForm({ 
            petId: '', 
            date: new Date().toISOString().split('T')[0], 
            time: '09:00 AM', 
            reason: '' 
          });
        },
        onError: (err) => {
          const errMsg = err.response?.data?.message || 'Failed to book slot. It might be conflicts.';
          showToast(errMsg, 'danger');
        }
      }
    );
  };

  // Process sorting & filtering
  const processVets = () => {
    if (!directoryData || !directoryData.vets) return [];
    
    let list = [...directoryData.vets];

    // Filter by Specialty
    if (selectedCategory !== 'All Specialties') {
      list = list.filter(v => v.specialty.toLowerCase().includes(selectedCategory.split(' ')[0].toLowerCase()));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        v.name.toLowerCase().includes(q) || 
        v.specialty.toLowerCase().includes(q) || 
        v.location.toLowerCase().includes(q)
      );
    }

    // Proximity mapping
    const originLat = isCustomLoc ? parseFloat(customLat) : currentUserLocation.lat;
    const originLng = isCustomLoc ? parseFloat(customLng) : currentUserLocation.lng;

    list = list.map(v => {
      const distance = calculateProximity(originLat, originLng, v.lat, v.lng);
      return { ...v, distance: parseFloat(distance) };
    });

    // Sort list
    if (sortBy === 'proximity') {
      list.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'fee') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  };

  const vetsList = processVets();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Hero section */}
      <header className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-tag">
              <Shield size={14} /> Lifelong Secure Pet Medical Records
            </div>
            <h1 className="hero-title">
              Instant Veterinary Care & <span>Cross-Clinic History</span>
            </h1>
            <p className="hero-desc">
              Book professional appointments dynamically. Access your pet's complete immunization calendar, vaccines, and clinical history folder instantly at any clinic.
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Accessible Anywhere</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Secure Access</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15+</span>
                <span className="stat-label">Exotic Specialties</span>
              </div>
            </div>
          </div>

          <div className="hero-image-wrapper">
            <div className="hero-image-bg" />
            <img 
              className="hero-img" 
              src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=500&q=80" 
              alt="JacoVet Professional Care" 
            />
          </div>
        </div>
      </header>

      {/* Filter and listings */}
      <main className="container" style={{ padding: '4rem 0' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Verified Veterinary Registry</h2>
            <span className="section-subtitle">Find practitioners in Madurai sorted by proximity distance.</span>
          </div>

          {/* Location sync controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--neutral-100)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.85rem' }}>
              <MapPin size={14} style={{ color: 'var(--primary)' }} />
              <strong>Base Location:</strong>
              <select 
                style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: 'var(--neutral-850)', cursor: 'pointer' }}
                value={isCustomLoc ? 'custom' : currentUserLocation.name}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomLoc(true);
                  } else {
                    setIsCustomLoc(false);
                    const sel = userLocationPresets.find(p => p.name === e.target.value);
                    if (sel) setCurrentUserLocation(sel);
                  }
                }}
              >
                {userLocationPresets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                <option value="custom">Custom Coordinates...</option>
              </select>
            </div>

            {isCustomLoc && (
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <input type="text" className="form-control" style={{ width: '80px', padding: '0.35rem', fontSize: '0.8rem' }} placeholder="Lat" value={customLat} onChange={(e) => setCustomLat(e.target.value)} />
                <input type="text" className="form-control" style={{ width: '80px', padding: '0.35rem', fontSize: '0.8rem' }} placeholder="Lng" value={customLng} onChange={(e) => setCustomLng(e.target.value)} />
              </div>
            )}

            <button className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={handleGeoDetect}>
              📍 GPS Detect
            </button>
          </div>
        </div>

        {/* Filter Pill Controls & Sort Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div className="category-pills">
            {['All Specialties', 'Surgery Vet', 'Feline Specialist', 'Avian & Exotic'].map(cat => (
              <button 
                key={cat} 
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box">
              <Search size={18} style={{ color: 'var(--neutral-400)', alignSelf: 'center', marginLeft: '0.5rem' }} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search Vet Name, Specialty, Clinic..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Sort:</span>
              <select 
                className="form-control" 
                style={{ width: '130px', padding: '0.35rem', fontSize: '0.85rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="proximity">Proximity Distance</option>
                <option value="fee">Consultation Fee</option>
                <option value="rating">Doctor Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Listings */}
        {dirLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p>Retrieving clinic records registry...</p>
          </div>
        ) : vetsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 'var(--radius-lg)' }}>
            <Info size={36} style={{ color: 'var(--neutral-400)', marginBottom: '0.5rem' }} />
            <h3>No Vet Services Found</h3>
            <p style={{ color: 'var(--neutral-500)' }}>Try adjusting your specialty filters or search terms.</p>
          </div>
        ) : (
          <div className="vets-grid">
            {vetsList.map(vet => (
              <div key={vet.id} className="vet-card">
                <div className="vet-card-header">
                  <img className="vet-avatar" src={vet.image} alt={vet.name} />
                  <div className="vet-name-spec">
                    <span className="vet-rating">
                      <Star size={14} fill="currentColor" /> {vet.rating}
                    </span>
                    <h3 className="vet-card-title">{vet.name}</h3>
                    <span className="vet-card-spec">{vet.specialty}</span>
                    <span className="vet-card-exp">{vet.experience} experience</span>
                  </div>
                </div>

                <p className="vet-card-bio">{vet.bio}</p>

                <div className="vet-card-details">
                  <div className="vet-detail-item">
                    <span className="vet-detail-label">Affiliated Clinic</span>
                    <span className="vet-detail-value">{vet.clinic?.name || 'Independent Practice'}</span>
                  </div>
                  <div className="vet-detail-item">
                    <span className="vet-detail-label">Distance Proximity</span>
                    <span className="vet-detail-value" style={{ color: 'var(--primary)' }}>🚗 {vet.distance} km away</span>
                  </div>
                </div>

                <div className="vet-card-footer">
                  <div className="vet-price-tag">
                    <span className="vet-detail-label">Consultation Fee</span>
                    <span className="vet-price-amount">₹{vet.price}</span>
                  </div>
                  
                  <button className="btn btn-primary" onClick={() => triggerBookingGate(vet)}>
                    {isLoggedIn ? 'Book Visit 🩺' : 'Login to Book'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingVet && (
        <div className="modal-overlay" onClick={() => setBookingVet(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Consultation: {bookingVet.name}</h2>
              <button className="modal-close" onClick={() => setBookingVet(null)}>✕</button>
            </div>
            
            <form onSubmit={handleBookingSubmit}>
              <div className="modal-body">
                {/* Select Pet */}
                <div className="form-group">
                  <label className="form-label">Select Patient Pet</label>
                  {myPets && myPets.length > 0 ? (
                    <select 
                      className="form-control"
                      value={bookingForm.petId}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, petId: e.target.value }))}
                      required
                    >
                      <option value="">-- Choose registered pet --</option>
                      {myPets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                    </select>
                  ) : (
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--accent-red)', borderRadius: '8px', fontSize: '0.85rem' }}>
                      ⚠️ No registered pets found. Please create a pet profile first in your Owner Dashboard.
                    </div>
                  )}
                </div>

                {/* Date */}
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
                  <label className="form-label">Time Timing Slot</label>
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

                {/* Reason for Visit */}
                <div className="form-group">
                  <label className="form-label">Reason for Visit</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Chief symptoms or vaccines needed..."
                    rows={3}
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, reason: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setBookingVet(null)}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!bookingForm.petId || bookApptMutation.isPending}
                >
                  {bookApptMutation.isPending ? 'Confirming...' : 'Schedule Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
