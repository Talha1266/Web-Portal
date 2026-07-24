import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, LogIn, RefreshCw } from 'lucide-react';
import { getUsers, resetDB } from '../utils/db';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const users = await getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    
    // Find if user exists
    const userMatch = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    
    if (!userMatch) {
      setError(`User with email '${normalizedEmail}' not found.`);
      return;
    }
    
    // Check password
    if (userMatch.password !== password) {
      setError(`Incorrect password for '${normalizedEmail}'.`);
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
            <label className="input-label">Password</label>
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
          <p>Admin Login: <strong>admin@const.com</strong></p>
          <p>User Login: <strong>user@const.com</strong></p>
          <p style={{ marginTop: '0.5rem' }}>Password for both: <strong>password123</strong></p>
        </div>
      </div>
      
      <button onClick={handleReset} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', textDecoration: 'underline' }}>
        <RefreshCw size={14} /> Reset Database to Defaults
      </button>
    </div>
  );
};

export default Login;
