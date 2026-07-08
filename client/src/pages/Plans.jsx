import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionPlans } from '../mockData';
import { Check, ShieldAlert, ArrowLeft, UserPlus, Info } from 'lucide-react';
import Toast from '../components/Toast';

const Plans = () => {
  const { user, isLoggedIn, registerDoctor } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [selectedPlanForSignup, setSelectedPlanForSignup] = useState(null);

  // Doctor Registration Form State
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    specialty: 'General Medicine',
    experience: '3 years'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // If a plan was pre-selected from URL (e.g., /plans?select=ClinicGrowth)
  useEffect(() => {
    const preSelect = searchParams.get('select');
    if (preSelect && ['FreeStarter', 'ClinicGrowth', 'ProPremium'].includes(preSelect)) {
      if (!isLoggedIn) {
        setSelectedPlanForSignup(preSelect);
      }
    }
  }, [searchParams, isLoggedIn]);

  const handleSelectPlan = (planName) => {
    if (!isLoggedIn) {
      // Show signup form modal on plans page to register doctor with selected plan
      setSelectedPlanForSignup(planName);
      showToast(`Please register your Doctor account to activate the "${planName}" trial.`, 'info');
      return;
    }

    if (user.role === 'doctor') {
      showToast(`Upgrade request for "${planName}" submitted to the Operations Command Center for approval!`, 'success');
    } else {
      showToast('Subscription plans are only available for Veterinarian profiles.', 'danger');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, specialty, experience } = signupForm;
    if (!name || !email || !password || !specialty) {
      showToast('Please fill out all required fields.', 'danger');
      return;
    }

    // Call authentication context to register doctor
    const res = await registerDoctor(name, email, password, specialty, experience);
    if (res.success) {
      showToast(`Registered successfully! Activated 30-day Free Trial of ${selectedPlanForSignup || 'FreeStarter'}!`, 'success');
      setSelectedPlanForSignup(null);
      setTimeout(() => {
        navigate('/doctor');
      }, 2000);
    } else {
      showToast(res.message, 'danger');
    }
  };

  return (
    <div style={{ minHeight: '90vh', background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)', padding: '4rem 1.5rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div className="container" style={{ maxWidth: '1000px' }}>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '2rem', border: 'none' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={12} /> Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: 'var(--neutral-900)' }}>
            Practitioner Listing Subscriptions
          </h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Choose the perfect plan to grow your practice, gain top-tier local priority search ranking, and highlight your specialties.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
          {subscriptionPlans.map((plan) => {
            const isGrowth = plan.name === 'ClinicGrowth';
            const isPro = plan.name === 'ProPremium';

            return (
              <div 
                key={plan.name} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '2.25rem', 
                  borderRadius: '16px', 
                  position: 'relative',
                  border: isPro ? '2.5px solid var(--primary)' : '1px solid var(--neutral-200)',
                  boxShadow: isPro ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  backgroundColor: 'white'
                }}
              >
                {isPro && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-12px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Most Popular
                  </span>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--neutral-900)' }}>
                    {plan.name === 'FreeStarter' ? 'Standard Plan' : plan.name === 'ClinicGrowth' ? 'Growth Plan' : 'Pro Premium Plan'}
                  </h3>
                  <p style={{ color: 'var(--neutral-500)', fontSize: '0.82rem', minHeight: '40px' }}>
                    {plan.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: '850', color: 'var(--neutral-900)' }}>
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span style={{ color: 'var(--neutral-400)', fontSize: '0.85rem', marginLeft: '0.25rem' }}>
                    /{plan.billing}
                  </span>
                </div>

                <ul style={{ listStyle: 'none', paddingLeft: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--neutral-650)' }}>
                      <Check size={16} style={{ color: isPro ? 'var(--primary)' : isGrowth ? 'var(--secondary)' : 'var(--neutral-500)', flexShrink: 0, marginTop: '0.1rem' }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  type="button" 
                  className={`btn ${isPro ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', fontWeight: 'bold' }}
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  {plan.name === 'FreeStarter' ? 'Current Free Tier' : 'Request Upgrade'}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '3.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--accent-amber-light)', backgroundColor: 'var(--neutral-50)' }}>
          <ShieldAlert size={24} style={{ color: 'var(--accent-amber)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
            <strong>Administrator Control Note:</strong> Practitioner listing subscription plans determine veterinarian visibility weightings in the patient-facing search index. Active doctor statuses can be modified securely from the <a href="/super" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Operations Command Center</a>.
          </span>
        </div>
      </div>

      {/* Doctor Registration Modal for Plan Selection */}
      {selectedPlanForSignup && (
        <div className="modal-overlay" onClick={() => setSelectedPlanForSignup(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus style={{ color: 'var(--primary)' }} />
                Doctor Signup
              </h2>
              <button className="modal-close" onClick={() => setSelectedPlanForSignup(null)}>✕</button>
            </div>

            <form onSubmit={handleSignupSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={16} />
                  <span>You are signing up with the <strong>{selectedPlanForSignup}</strong> plan (1 Month Free Trial).</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Dr. Alexander Fleming"
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

                <div className="form-group">
                  <label className="form-label">Specialty Category</label>
                  <select 
                    className="form-control"
                    value={signupForm.specialty}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, specialty: e.target.value }))}
                    required
                  >
                    <option value="General Medicine">General Medicine & Diagnosis</option>
                    <option value="Surgery & Orthopedics">Surgery & Orthopedics</option>
                    <option value="Feline Specialist">Feline Specialist</option>
                    <option value="Avian & Exotic Animals">Avian & Exotic Animals</option>
                    <option value="Veterinary Dentistry">Veterinary Dentistry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. 5 years"
                    value={signupForm.experience} 
                    onChange={(e) => setSignupForm(prev => ({ ...prev, experience: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPlanForSignup(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Activate Trial & Register ➔</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
