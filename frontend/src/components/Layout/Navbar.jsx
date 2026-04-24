import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, CheckSquare, BarChart2, Target, LogOut, User, Settings, Zap, Award, ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { to: '/', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
    { to: '/habits', icon: <CheckSquare size={22} />, label: 'Habits' },
    { to: '/analytics', icon: <BarChart2 size={22} />, label: 'Insights' },
    { to: '/goals', icon: <Target size={22} />, label: 'Objectives' },
  ];

  if (!user) return null;

  const xpProgress = (user.xp / (user.level * 100)) * 100;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-content">
          <Link to="/" className="nav-logo" onClick={() => setIsMobileMenuOpen(false)} style={{ fontFamily: 'var(--font-impact)', fontSize: '2rem' }}>
            <div className="logo-icon"></div>
            <span>TrackNrack</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-links">
            {menuItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            {/* XP Summary - Hide text on mobile for more space */}
            <div className="nav-xp-summary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 1rem 0.4rem 0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 10px var(--primary-glow)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-anime)' }}>{user.level}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-sans)' }}>{user.xp}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>XP</span>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                className="profile-trigger"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  padding: '0.25rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  hover: { background: 'var(--bg-glass)' }
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-focus)', background: 'var(--bg-card)' }}>
                  {user.profileImage ? (
                    <img 
                      src={API_BASE_URL + user.profileImage} 
                      alt={user.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={32}/></div>}
                </div>



                <span className="nav-user-name" style={{ fontWeight: 900, fontSize: '1rem', color: '#fff', fontFamily: 'var(--font-anime)', letterSpacing: '1px' }}>{user.name}</span>
                <ChevronDown size={18} color="var(--primary-light)" style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{ 
                      position: 'absolute', 
                      top: 'calc(100% + 1rem)', 
                      right: 0, 
                      width: '240px', 
                      backgroundColor: 'var(--bg-card)', 
                      border: '1px solid var(--border-focus)', 
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                      zIndex: 1001,
                      overflow: 'hidden',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                    
                    <div style={{ padding: '0.5rem' }}>
                        <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="menu-item-link">
                          <User size={18} /> View Profile
                        </Link>
                        <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="menu-item-link">
                          <Settings size={18} /> Settings
                        </Link>
                        <hr style={{ border: 'none', height: '1px', background: 'var(--border)', margin: '0.5rem 0' }} />
                        <button onClick={handleLogout} className="menu-item-link" style={{ color: 'var(--danger)', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                          <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0.5rem' }}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}

            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderBottom: '1px solid var(--border)', 
              overflow: 'hidden',
              backdropFilter: 'blur(20px)'
            }}
            className="mobile-menu"
          >
            <div style={{ padding: '1rem' }}>
              {menuItems.map((item) => (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start', margin: '0.25rem 0' }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .menu-item-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .menu-item-link:hover {
          background-color: var(--primary-glow);
          color: var(--text-main);
        }
        
        @media (max-width: 1024px) {
          .nav-user-name { display: none; }
          .mobile-menu-toggle { display: block !important; }
          .mobile-menu { 
            display: block !important; 
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            z-index: 1000;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          }
        }
        
        @media (max-width: 480px) {
           .nav-xp-summary { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
