import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Lock } from 'lucide-react';
import { updatePassword } from '../utils/db';
import { supabase } from '../supabaseClient';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state change to ensure we have a recovery session
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Safe to reset
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-gradient)', margin: '0 auto 1rem', boxShadow: 'var(--shadow-glow)' }}>
            <HardHat size={32} color="white" />
          </div>
          <h1 className="heading-2 text-gradient">Set New Password</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Enter your new password below.</p>
        </div>

        <form onSubmit={handleReset}>
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

          <div className="input-group">
            <label className="input-label">New Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Confirm New Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading || !!success}>
            <Lock size={20} /> {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
