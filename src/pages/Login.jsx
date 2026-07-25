import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, LogIn, RefreshCw } from 'lucide-react';
import { loginUser, resetDB } from '../utils/db';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const normalizedEmail = email.trim().toLowerCase();
    const userMatch = await loginUser(normalizedEmail, password);
    
    if (!userMatch) {
      setError(`Invalid email or password.`);
      return;
    }
    
    // Success
    localStorage.setItem('currentUser', JSON.stringify(userMatch));
    
    if (userMatch.permissions?.root) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleReset = async () => {
    resetDB();
    setError('Database has been reset to defaults! Try logging in now.');
    setEmail('admin@const.com');
    setPassword('password123');
  };

  return (
    <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-gradient)', margin: '0 auto 1rem', boxShadow: 'var(--shadow-glow)' }}>
            <HardHat size={32} color="white" />
          </div>
          <h1 className="heading-2 text-gradient">ConstManage</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Welcome back. Please enter your details.</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Forgot Password?
              </button>
            </div>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            <LogIn size={20} /> Sign In
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p>Super Admin: <strong>admin@admin.com</strong></p>
          <p style={{ marginTop: '0.5rem' }}>Password: <strong>admin</strong></p>
        </div>
      </div>
      
      <button onClick={handleReset} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', textDecoration: 'underline' }}>
        <RefreshCw size={14} /> Reset Local Cache
      </button>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h2 className="heading-3" style={{ marginBottom: '1rem' }}>Password Recovery</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
              For security purposes, automated password resets are disabled. Please contact your <strong>System Administrator</strong> to have your password manually reset via the Admin Dashboard.
            </p>
            <button className="btn btn-primary" onClick={() => setShowForgotModal(false)} style={{ width: '100%' }}>
              Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
