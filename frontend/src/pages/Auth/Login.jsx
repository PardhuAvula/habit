import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [playIntro, setPlayIntro] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields');
    
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      setPlayIntro(true); // Trigger the intro video
      setTimeout(() => {
        navigate('/');
      }, 3500); // 3.5 seconds of intro
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (playIntro) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#020617', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video 
          autoPlay 
          muted 
          playsInline 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-elements-2041-large.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '0.2em', textTransform: 'uppercase', animation: 'blink 1.5s infinite' }}>Synchronizing Neural Data...</h2>
        </div>
        <style>{`
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Video */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="login-bg-video"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-digital-landscape-2410-large.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <div className="glass-card auth-card fade-in" style={{ padding: '2.5rem', position: 'relative', zIndex: 1, backdropFilter: 'blur(20px) saturate(180%)' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--primary-glow)', borderRadius: '1.25rem', color: 'var(--primary-light)', marginBottom: '1.5rem', boxShadow: '0 0 20px var(--primary-glow)', border: '1px solid var(--border-focus)' }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.04em', fontWeight: 900 }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Enter your credentials to access your tracker</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '4px', height: '20px', background: 'var(--danger)', borderRadius: '2px' }} />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="email" style={{ color: 'var(--text-main)', opacity: 0.8 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1.125rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-light)', pointerEvents: 'none', opacity: 0.6 }} />
              <input 
                id="email"
                type="email" 
                className="input-field"
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '3.25rem', width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
          
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" htmlFor="password" style={{ color: 'var(--text-main)', opacity: 0.8 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 700 }}>Recovery Key?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1.125rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-light)', pointerEvents: 'none', opacity: 0.6 }} />
              <input 
                id="password"
                type="password" 
                className="input-field"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '3.25rem', width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1.5rem', fontWeight: 800, letterSpacing: '0.05em' }} disabled={loading}>
            {loading ? (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    ESTABLISHING LINK...
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
                    INITIATE LOGIN <ArrowRight size={18} />
                </div>
            )}
          </button>
        </form>
        
        <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600 }}>
            New Operative? <Link to="/register" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: '800' }}>Register Protocol</Link>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-bg-video {
            position: absolute;
            top: 50%;
            left: 50%;
            min-width: 100%;
            min-height: 100%;
            width: auto;
            height: auto;
            transform: translate(-50%, -50%);
            z-index: 0;
            object-fit: cover;
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

export default Login;
