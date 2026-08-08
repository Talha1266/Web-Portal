import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import OneSignal from 'react-onesignal';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ResetPassword from './pages/ResetPassword';
import { supabase } from './supabaseClient';

const AuthListener = ({ children }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  return children;
};

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const localUser = localStorage.getItem('currentUser');
      
      if (!session || !localUser) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Verifying secure session...</div>;
  if (isAuthenticated === false) return <Navigate to="/login" replace />;
  return children;
};

import { DashboardProvider } from './context/DashboardContext';

function App() {
  return (
    <BrowserRouter>
      <AuthListener>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardProvider>
                <UserDashboard />
              </DashboardProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthListener>
    </BrowserRouter>
  );
}

export default App;
