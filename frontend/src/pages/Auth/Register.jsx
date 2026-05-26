import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { usePageMeta } from '../../hooks/usePageMeta';

const Register = () => {
  usePageMeta({
    title: 'Sign up | TracknRack Student Habit Tracker',
    description:
      'Create a free TracknRack account to build better habits, track fitness, and manage daily routines as a student.',
    path: '/register',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password) return setError('Please fill in all required fields');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    
    setError('');
    setLoading(true);
    
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="login-bg-video" aria-hidden="true" />
      <div className="video-overlay" />

      <div className="glass-card auth-card fade-in" style={{ padding: '2.5rem', position: 'relative', zIndex: 1, backdropFilter: 'blur(20px) saturate(180%)' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--accent-glow)', borderRadius: '1.25rem', color: 'var(--accent)', marginBottom: '1.5rem', boxShadow: '0 0 20px var(--accent-glow)', border: '1px solid var(--accent)' }}>
            <UserPlus size={32} />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.04em', fontWeight: 900 }}>Join TrackNrack</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Start your journey to self-improvement today</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '4px', height: '20px', background: 'var(--danger)', borderRadius: '2px' }} />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="name" style={{ color: 'var(--text-main)', opacity: 0.8 }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1.125rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', pointerEvents: 'none', opacity: 0.6 }} />
              <input 
                id="name"
                name="name"
                type="text" 
                className="input-field"
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required
                style={{ paddingLeft: '3.25rem', width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email" style={{ color: 'var(--text-main)', opacity: 0.8 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1.125rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', pointerEvents: 'none', opacity: 0.6 }} />
              <input 
                id="email"
                name="email"
                type="email" 
                className="input-field"
                placeholder="john@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
                style={{ paddingLeft: '3.25rem', width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
          
          <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label" htmlFor="password" style={{ color: 'var(--text-main)', opacity: 0.8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1.125rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', pointerEvents: 'none', opacity: 0.6 }} />
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  className="input-field"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '3.25rem', width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>
            <div>
              <label className="input-label" htmlFor="confirmPassword" style={{ color: 'var(--text-main)', opacity: 0.8 }}>Confirm</label>
              <div style={{ position: 'relative' }}>
                <CheckCircle2 size={18} style={{ position: 'absolute', left: '1.125rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', pointerEvents: 'none', opacity: 0.6 }} />
                <input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password" 
                  className="input-field"
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '3.25rem', width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent), #059669)' }} disabled={loading}>
            {loading ? (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    INITIALIZING ACCOUNT...
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
                    INITIATE PROTOCOL <ArrowRight size={18} />
                </div>
            )}
          </button>
        </form>
        
        <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600 }}>
            Already Authorized? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '800' }}>Login instead</Link>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-bg-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            background:
              radial-gradient(ellipse at 70% 30%, rgba(255, 0, 0, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse at 20% 70%, rgba(255, 140, 0, 0.2) 0%, transparent 45%),
              linear-gradient(200deg, #020617 0%, #1a0a2e 100%);
        }
        .video-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(2,6,23,0.4) 0%, rgba(2,6,23,0.9) 100%);
            z-index: 0;
        }
      `}</style>
    </div>
  );
};

export default Register;
