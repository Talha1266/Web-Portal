import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, LogIn, RefreshCw, UserPlus, Mail } from 'lucide-react';
import { loginUser, registerUser, sendPasswordResetEmail, resetDB } from '../utils/db';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === 'login') {
        const userMatch = await loginUser(normalizedEmail, password);
        
        if (!userMatch) {
          setError(`Invalid email or password.`);
          setIsLoading(false);
          return;
        }
        
        // Success
        localStorage.setItem('currentUser', JSON.stringify(userMatch));
        
        if (userMatch.permissions?.root) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else if (mode === 'register') {
        await registerUser(normalizedEmail, password, name);
        setSuccess('Registration successful! Please check your email to verify your account before logging in.');
        setMode('login');
        setPassword('');
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(normalizedEmail);
        setSuccess('If an account exists with that email, a password reset link has been sent.');
        setMode('login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    resetDB();
    setError('Database has been reset to defaults! Try logging in now.');
    setEmail('admin@admin.com');
    setPassword('admin');
  };

  return (
    <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-gradient)', margin: '0 auto 1rem', boxShadow: 'var(--shadow-glow)' }}>
            <HardHat size={32} color="white" />
          </div>
          <h1 className="heading-2 text-gradient">ConstManage</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {mode === 'login' && 'Welcome back. Please enter your details.'}
            {mode === 'register' && 'Create a new account.'}
            {mode === 'forgot' && 'Reset your password.'}
          </p>
        </div>

        <form onSubmit={handleAuth}>
          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {success}
            </div>
          )}
          
          {mode === 'register' && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
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

          {mode !== 'forgot' && (
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Forgot Password?
                  </button>
                )}
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
          )}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {mode === 'login' && <><LogIn size={20} /> {isLoading ? 'Signing In...' : 'Sign In'}</>}
            {mode === 'register' && <><UserPlus size={20} /> {isLoading ? 'Creating Account...' : 'Sign Up'}</>}
            {mode === 'forgot' && <><Mail size={20} /> {isLoading ? 'Sending Link...' : 'Send Reset Link'}</>}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          {mode === 'login' && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                Sign Up
              </button>
            </p>
          )}
          {(mode === 'register' || mode === 'forgot') && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Back to{' '}
              <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                Login
              </button>
            </p>
          )}
        </div>
      </div>
      
      <button onClick={handleReset} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', textDecoration: 'underline' }}>
        <RefreshCw size={14} /> Reset Local Cache
      </button>
    </div>
  );
};

export default Login;
