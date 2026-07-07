import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo-link">
          <Stethoscope className="logo-icon" size={28} />
          <span>JacoVet <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: '800', verticalAlign: 'super' }}>PRO</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Find Vets</Link>
          
          {isLoggedIn ? (
            <>
              {user.role === 'owner' && <Link to="/dashboard" className="nav-link">My Dashboard</Link>}
              {user.role === 'doctor' && <Link to="/doctor" className="nav-link">Consult Space</Link>}
              {user.role === 'admin' && <Link to="/admin" className="nav-link">Clinic Desk</Link>}
              {user.role === 'super-admin' && <Link to="/super" className="nav-link">Audit Command</Link>}

              <span className="role-badge">
                <User size={12} />
                <span>{user.name} ({user.role.toUpperCase()})</span>
              </span>

              <button className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={handleLogout}>
                <LogOut size={14} /> Log Out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
              Login / Signup 🐾
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
