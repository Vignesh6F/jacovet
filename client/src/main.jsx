import React, { Component } from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3rem',
            borderRadius: '24px',
            maxWidth: '560px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem'
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.75rem', color: '#f8fafc' }}>
              Platform Launch Interrupted
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              The application encountered a startup cache error. This is usually caused by outdated database schemas cached in your browser.
            </p>
            
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              color: '#f87171',
              textAlign: 'left',
              marginBottom: '2rem',
              maxHeight: '120px',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              {this.state.error ? this.state.error.toString() : "Unknown Initialization Error"}
            </div>

            <button
              onClick={this.handleReset}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: 'white',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Reset Database Cache & Reload Platform 🐾
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
