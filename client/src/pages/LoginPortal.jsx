import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { ShieldCheck, UserCheck, KeyRound, ArrowLeft } from 'lucide-react';

const LoginPortal = () => {
  const { login, register, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // Tab: 'owner-login', 'owner-signup', 'doctor-login', 'admin-login', 'super-login'
  const [authTab, setAuthTab] = useState('owner-login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Signup fields
  const [signupForm, setSignupForm] = useState({
    petName: '',
    petCategory: 'Dog',
    petBreed: '',
    petAge: ''
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === 'owner') navigate('/dashboard');
      if (user.role === 'doctor') navigate('/doctor');
      if (user.role === 'admin') navigate('/admin');
      if (user.role === 'super-admin') navigate('/super');
    }
  }, [isLoggedIn, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide your email and credentials.', 'danger');
      return;
    }

    if (authTab === 'owner-signup') {
      const res = await register(
        name,
        email,
        password,
        signupForm.petName,
        signupForm.petCategory,
        signupForm.petBreed,
        signupForm.petAge
      );
      if (res.success) {
        showToast('Account registered successfully! Redirecting...');
      } else {
        showToast(res.message, 'danger');
      }
    } else {
      let role = 'owner';
      if (authTab === 'doctor-login') role = 'doctor';
      if (authTab === 'admin-login') role = 'admin';
      if (authTab === 'super-login') role = 'super-admin';

      const res = await login(email, password, role);
      if (res.success) {
        showToast('Login successful! Redirecting...');
      } else {
        showToast(res.message, 'danger');
      }
    }
  };

  // Helper autofills for testing
  const handleAutofill = (type) => {
    if (type === 'doctor') {
      setEmail('doctor@jacovet.com');
      setPassword('doctor123');
      setAuthTab('doctor-login');
    } else if (type === 'admin') {
      setEmail('admin@jacovet.com');
      setPassword('admin123');
      setAuthTab('admin-login');
    } else if (type === 'super') {
      setEmail('super@jacovet.com');
      setPassword('super123');
      setAuthTab('super-login');
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', background: '#f8fafc' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '1.5rem', border: 'none' }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={12} /> Back to Search
        </button>

        {/* Tab switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.25rem', marginBottom: '2rem', backgroundColor: 'var(--neutral-100)', padding: '0.25rem', borderRadius: '10px' }}>
          <button 
            style={{ border: 'none', padding: '0.5rem 0.2rem', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', backgroundColor: (authTab === 'owner-login' || authTab === 'owner-signup') ? 'white' : 'transparent', color: (authTab === 'owner-login' || authTab === 'owner-signup') ? 'var(--primary)' : 'var(--neutral-500)' }}
            onClick={() => { setAuthTab('owner-login'); setEmail(''); setPassword(''); }}
          >
            Pet Owner
          </button>
          <button 
            style={{ border: 'none', padding: '0.5rem 0.2rem', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', backgroundColor: authTab === 'doctor-login' ? 'white' : 'transparent', color: authTab === 'doctor-login' ? 'var(--primary)' : 'var(--neutral-500)' }}
            onClick={() => handleAutofill('doctor')}
          >
            Veterinarian
          </button>
          <button 
            style={{ border: 'none', padding: '0.5rem 0.2rem', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', backgroundColor: authTab === 'admin-login' ? 'white' : 'transparent', color: authTab === 'admin-login' ? 'var(--primary)' : 'var(--neutral-500)' }}
            onClick={() => handleAutofill('admin')}
          >
            Desk Admin
          </button>
          <button 
            style={{ border: 'none', padding: '0.5rem 0.2rem', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', backgroundColor: authTab === 'super-login' ? 'white' : 'transparent', color: authTab === 'super-login' ? 'var(--primary)' : 'var(--neutral-500)' }}
            onClick={() => handleAutofill('super')}
          >
            Operations
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
              {authTab === 'owner-login' && 'Welcome Back'}
              {authTab === 'owner-signup' && 'Register Pet Parent'}
              {authTab === 'doctor-login' && 'Doctor Workspace'}
              {authTab === 'admin-login' && 'Desk Administration'}
              {authTab === 'super-login' && 'Command Audit Center'}
            </h2>
            <p style={{ color: 'var(--neutral-500)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              {authTab === 'owner-login' && 'Log in to book appointments and track timelines.'}
              {authTab === 'owner-signup' && 'Create your profile to register your family pets.'}
              {authTab === 'doctor-login' && 'Check-in patients, diagnose, and maintain stocks.'}
              {authTab === 'admin-login' && 'Manage appointment calendars and billing.'}
              {authTab === 'super-login' && 'Operations desk for security auditing.'}
            </p>
          </div>

          {authTab === 'owner-signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Access Email</label>
            <input type="email" className="form-control" placeholder="e.g. name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {/* If Owner Signup: Optional Pet Registration */}
          {authTab === 'owner-signup' && (
            <div style={{ border: '1px dashed var(--neutral-200)', borderRadius: '12px', padding: '1rem', marginTop: '0.5rem', backgroundColor: 'var(--neutral-50)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--neutral-500)', display: 'block', marginBottom: '0.75rem' }}>🐾 Register First Pet (Optional)</span>
              
              <div className="form-group">
                <label className="form-label">Pet Name</label>
                <input type="text" className="form-control" style={{ padding: '0.5rem' }} placeholder="Rocky" value={signupForm.petName} onChange={(e) => setSignupForm(prev => ({ ...prev, petName: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Species</label>
                  <select className="form-control" style={{ padding: '0.5rem', fontSize: '0.85rem' }} value={signupForm.petCategory} onChange={(e) => setSignupForm(prev => ({ ...prev, petCategory: e.target.value }))}>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Exotic">Exotic</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Breed</label>
                  <input type="text" className="form-control" style={{ padding: '0.5rem' }} placeholder="Golden Retriever" value={signupForm.petBreed} onChange={(e) => setSignupForm(prev => ({ ...prev, petBreed: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {authTab === 'owner-signup' ? 'Create Account & Sign In' : 'Access Workspace'}
          </button>

          {/* Toggle register option for owners */}
          {authTab === 'owner-login' && (
            <span style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
              Don't have an account?{' '}
              <button type="button" style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setAuthTab('owner-signup')}>
                Sign up here
              </button>
            </span>
          )}

          {authTab === 'owner-signup' && (
            <span style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
              Already registered?{' '}
              <button type="button" style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setAuthTab('owner-login')}>
                Log in here
              </button>
            </span>
          )}

          {/* Autofill testing helpers */}
          {(authTab === 'doctor-login' || authTab === 'admin-login' || authTab === 'super-login') && (
            <div style={{ backgroundColor: 'var(--neutral-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
              🔑 <strong>Access Credentials:</strong> <code style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{email}</code> / <code style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{password}</code>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPortal;
