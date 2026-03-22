import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/api';
import api from '../../services/api';
import { User, Shield, Mail, Calendar, Settings, ChevronRight, Award, Zap, Camera, X, Save, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'info', 'password'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [infoForm, setInfoForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passForm, setPassForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef();

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const response = await api.put('/users/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(response.data);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload profile photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await api.put('/users/profile', infoForm);
      updateUser(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/users/change-password', {
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Password change failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const userLevel = user.level || 1;
  const userXP = user.xp || 0;
  const xpProgress = Math.min(100, Math.max(0, (userXP / (userLevel * 100)) * 100));

  const Modal = ({ title, children, onClose }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2, 6, 23, 0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(8px)' }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem' }}><X size={24} /></button>
        </div>
        
        {message.text && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1.5rem', 
            backgroundColor: message.type === 'success' ? 'var(--accent-glow)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? 'var(--accent)' : 'var(--danger)',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: `1px solid ${message.type === 'success' ? 'var(--accent)' : 'var(--danger)'}`
          }}>
            {message.text}
          </div>
        )}
        
        {children}
      </motion.div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="col-span-4 glass-card" style={{ height: 'fit-content' }}>
          <div style={{ textAlign: 'center', position: 'relative', marginBottom: '1.5rem' }}>
            <div 
              onClick={handlePhotoClick}
              style={{ 
                width: '140px', 
                height: '140px', 
                borderRadius: '50%', 
                margin: '0 auto 1.5rem',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
                border: '4px solid var(--primary-glow)',
                boxShadow: '0 0 30px var(--primary-glow)',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {user.profileImage ? (
                <img 
                  src={API_BASE_URL + user.profileImage} 
                  alt={user.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-muted)' }}>
                  <User size={60} />
                </div>
              )}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                color: 'white', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s',
                zIndex: 2
              }} className="photo-overlay">
                <Camera size={28} style={{ marginBottom: '0.25rem' }} />
                <span style={{ fontWeight: 800, fontSize: '0.75rem' }}>CHANGE PHOTO</span>
              </div>
            </div>
            <style>{`.photo-overlay:hover { opacity: 1 !important; }`}</style>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/*"
            />
            
            {uploading && <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, animation: 'pulse 1.5s infinite' }}>SYNCING IMAGE...</div>}
            
            <h2 style={{ marginBottom: '0.25rem', fontSize: '1.75rem' }}>{user.name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Award size={16} color="var(--warning)" /> Master Artisan
            </div>
          </div>

          <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-dark)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={18} color="var(--accent)" />
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Level {userLevel}</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{userXP} / {userLevel * 100} XP</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-dark)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #34d399)' }}
                />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <Mail size={18} color="var(--text-muted)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <Calendar size={18} color="var(--text-muted)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="col-span-8">
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Settings size={22} color="var(--primary)" /> Profile Management
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button 
                      onClick={() => { setActiveModal('info'); setMessage({type:'', text:''}); }}
                      style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-dark)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left' }} 
                      className="setting-item"
                    >
                        <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '0.75rem', marginRight: '1rem', color: 'var(--primary)' }}>
                            <User size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.2rem', color: 'var(--text-main)' }}>Personal Information</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Update your name and primary email address</div>
                        </div>
                        <ChevronRight size={18} color="var(--text-muted)" />
                    </button>

                    <button 
                      onClick={() => { setActiveModal('password'); setMessage({type:'', text:''}); }}
                      style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-dark)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left' }} 
                      className="setting-item"
                    >
                        <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '0.75rem', marginRight: '1rem', color: 'var(--primary)' }}>
                            <Shield size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.2rem', color: 'var(--text-main)' }}>Security & Shield</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Change your account password to verify integrity</div>
                        </div>
                        <ChevronRight size={18} color="var(--text-muted)" />
                    </button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-dark)', border: '1px solid var(--border)', opacity: 0.6 }} className="setting-item">
                        <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '0.75rem', marginRight: '1rem', color: 'var(--primary)' }}>
                            <Zap size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.2rem', color: 'var(--text-main)' }}>Gamification Settings</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customize XP multipliers and badge alerts (Coming Soon)</div>
                        </div>
                        <Lock size={16} color="var(--text-muted)" />
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, #1e1b4b 100%)', minHeight: '280px' }}>
                <h3 style={{ marginBottom: '1rem' }}>Achievement Summary</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '2.5rem', maxWidth: '500px' }}>Your progress and consistency earn you unique digital accolades. How many can you collect?</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1.5rem' }}>
                    {user.achievements?.map(ach => (
                        <div key={ach.id} style={{ textAlign: 'center' }}>
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                background: ach.unlocked ? 'var(--primary-glow)' : 'rgba(0,0,0,0.3)', 
                                border: ach.unlocked ? '2px solid var(--primary)' : '2px dashed var(--border)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: ach.unlocked ? 'var(--text-main)' : 'var(--text-muted)', 
                                fontSize: '2.5rem',
                                margin: '0 auto 0.75rem',
                                boxShadow: ach.unlocked ? '0 0 20px var(--primary-glow)' : 'none',
                                filter: ach.unlocked ? 'none' : 'grayscale(1)',
                                transition: 'all 0.3s'
                            }}>
                                {ach.icon}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: ach.unlocked ? 'var(--text-main)' : 'var(--text-muted)' }}>{ach.title}</div>
                        </div>
                    ))}
                    {[1, 2].map(i => (
                        <div key={`lock-${i}`} style={{ textAlign: 'center', opacity: 0.4 }}>
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                background: 'rgba(0,0,0,0.2)', 
                                border: '2px dashed var(--border)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: 'var(--text-muted)', 
                                fontSize: '1.5rem',
                                margin: '0 auto 0.75rem'
                            }}>
                                <Lock size={24} />
                            </div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>???</div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>

      <style>{`.setting-item:hover { transform: translateX(8px); border-color: var(--primary) !important; background: var(--bg-card) !important; }`}</style>
      
      <AnimatePresence>
        {activeModal === 'info' && (
          <Modal title="Update Details" onClose={() => setActiveModal(null)}>
            <form onSubmit={handleInfoSubmit}>
              <div className="input-group">
                <label className="input-label">Display Name</label>
                <input className="input-field" value={infoForm.name} onChange={e => setInfoForm({...infoForm, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" className="input-field" value={infoForm.email} onChange={e => setInfoForm({...infoForm, email: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Saving...' : <><Save size={18}/> Save Changes</>}
              </button>
            </form>
          </Modal>
        )}

        {activeModal === 'password' && (
          <Modal title="Secure Access" onClose={() => setActiveModal(null)}>
            <form onSubmit={handlePassSubmit}>
              <div className="input-group">
                <label className="input-label">Current Password</label>
                <input type="password" className="input-field" value={passForm.oldPassword} onChange={e => setPassForm({...passForm, oldPassword: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">New Secure Password</label>
                <input type="password" className="input-field" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input type="password" className="input-field" value={passForm.confirmPassword} onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Processing...' : <><Shield size={18}/> Verify & Change</>}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
