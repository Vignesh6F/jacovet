import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuditLogs, useUpdateVetPlan } from '../hooks/useAdmin';
import { useDirectories } from '../hooks/useDirectories';
import Toast from '../components/Toast';
import { Shield, Clock, Award, Star, List, ArrowLeft } from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  // Queries
  const { data: logs, isLoading: logsLoading } = useAuditLogs(isLoggedIn && user?.role === 'super-admin');
  const { data: directory, isLoading: dirLoading } = useDirectories(isLoggedIn && user?.role === 'super-admin');
  const updatePlanMutation = useUpdateVetPlan();

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  if (loading) {
    return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Loading application session...</div>;
  }

  if (!isLoggedIn || user?.role !== 'super-admin') {
    return <SuperLogin />;
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleUpdatePlan = (id, plan) => {
    updatePlanMutation.mutate(
      { id, plan },
      {
        onSuccess: () => {
          showToast(`Successfully upgraded partner listing to ${plan}!`);
        },
        onError: (err) => {
          showToast(err.response?.data?.message || 'Failed to update plan.', 'danger');
        }
      }
    );
  };

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={32} style={{ color: 'var(--primary)' }} />
            Operations Command Center
          </h1>
          <p style={{ color: 'var(--neutral-500)' }}>Central auditing desk. Monitor security records and manage practitioner premium plan statuses.</p>
        </div>
        <span className="role-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.15)', cursor: 'default' }}>
          Super-Admin Clearance
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
        
        {/* Partner Listing plan upgrade panel */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} style={{ color: 'var(--accent-amber)' }} />
            Practitioner Listing Subscriptions Control
          </h2>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Upgrade subscription tier models. Higher tiers display highlighted badges to clients on search results pages.
          </p>

          {dirLoading ? (
            <p>Loading vet profiles...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-650)' }}>
                    <th style={{ padding: '0.75rem' }}>Practitioner Name</th>
                    <th style={{ padding: '0.75rem' }}>Clinic & Location</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Active Rating</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Current Tier Plan</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Modify Plan status</th>
                  </tr>
                </thead>
                <tbody>
                  {directory?.vets?.map(vet => (
                    <tr key={vet.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: '700' }}>{vet.name}</td>
                      <td style={{ padding: '1rem 0.75rem' }}>{vet.clinic?.name} ({vet.location})</td>
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>⭐ {vet.rating}</td>
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: vet.plan === 'ProPremium' ? 'rgba(99, 102, 241, 0.15)' : vet.plan === 'ClinicGrowth' ? 'rgba(16, 185, 129, 0.15)' : 'var(--neutral-100)',
                          color: vet.plan === 'ProPremium' ? 'var(--primary)' : vet.plan === 'ClinicGrowth' ? 'var(--secondary)' : 'var(--neutral-500)',
                          padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' 
                        }}>
                          {vet.plan}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                        <select 
                          className="form-control"
                          style={{ width: '150px', display: 'inline-block', padding: '0.25rem', fontSize: '0.8rem' }}
                          value={vet.plan}
                          onChange={(e) => handleUpdatePlan(vet.id, e.target.value)}
                          disabled={updatePlanMutation.isPending}
                        >
                          <option value="FreeStarter">FreeStarter</option>
                          <option value="ClinicGrowth">ClinicGrowth</option>
                          <option value="ProPremium">ProPremium</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security Audit Trail log logs */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.45rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} style={{ color: 'var(--primary)' }} />
            Chronological Security Audit Log File
          </h2>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Permanent operations trail. Logs all patient data views, check-ins, registrations, and checkout actions.
          </p>

          {logsLoading ? (
            <p>Loading audit files...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-650)' }}>
                    <th style={{ padding: '0.75rem' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem' }}>Security Actor</th>
                    <th style={{ padding: '0.75rem' }}>Role Tier</th>
                    <th style={{ padding: '0.75rem' }}>Action Triggered</th>
                    <th style={{ padding: '0.75rem' }}>Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs?.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                      <td style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span style={{ color: 'var(--neutral-400)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} />
                          {new Date(log.timestamp).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 'bold' }}>{log.user}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{ 
                          backgroundColor: log.role === 'Super Admin' ? 'rgba(239, 68, 68, 0.1)' : log.role === 'Veterinarian' ? 'var(--primary-light)' : 'var(--neutral-100)',
                          color: log.role === 'Super Admin' ? 'var(--accent-red)' : log.role === 'Veterinarian' ? 'var(--primary)' : 'var(--neutral-600)',
                          padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'
                        }}>
                          {log.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700', color: 'var(--neutral-800)' }}>{log.action}</td>
                      <td style={{ padding: '0.85rem 0.75rem', color: 'var(--neutral-500)' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const SuperLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('super@jacovet.com');
  const [password, setPassword] = useState('super123');
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
    const res = await login(email, password, 'super-admin');
    if (res.success) {
      showToast('Successfully logged in! Opening command center...');
    } else {
      showToast(res.message, 'danger');
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', background: '#f8fafc' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '1.5rem', border: 'none' }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={12} /> Back to Search
        </button>

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: '800' }}>Operations Command Login</h2>
            <p style={{ color: 'var(--neutral-500)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Central auditing desk. Monitor security records and manage practitioner premium plan statuses.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Access Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="super@domain.com" 
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
            Access Workspace 🛡️
          </button>

          <div style={{ backgroundColor: 'var(--neutral-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--neutral-600)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div>🔑 <strong>Demo Email:</strong> <code>super@jacovet.com</code></div>
            <div>🔑 <strong>Demo Passcode:</strong> <code>super123</code></div>
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--neutral-200)', paddingTop: '1rem', textAlign: 'center' }}>
            <button type="button" style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => navigate('/login')}>
              ➔ Switch to Pet Owner Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
