import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPortal from './pages/LoginPortal';
import ClientDashboard from './pages/ClientDashboard';
import VetDashboard from './pages/VetDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PetTimeline from './pages/PetTimeline';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent aggressive automatic re-queries on window focus
      retry: 1
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            <Navbar />
            <div style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPortal />} />
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/doctor" element={<VetDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/super" element={<SuperAdminDashboard />} />
                <Route path="/pet/:petId" element={<PetTimeline />} />
              </Routes>
            </div>
            
            <footer style={{ borderTop: '1px solid var(--neutral-200)', padding: '1.5rem 0', textAlign: 'center', fontSize: '0.8rem', color: 'var(--neutral-400)', backgroundColor: 'white' }}>
              © {new Date().getFullYear()} JacoVet Pet Health Platform. All rights reserved.
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
