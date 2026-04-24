import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, Check, Save, Target, Layout, Clock, BarChart, Zap, Activity, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';


const HabitList = () => {
    const [habits, setHabits] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Productivity',
        frequency: 'daily',
        targetValue: '',
        difficulty: 'medium',
        goalId: '',
        customDate: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [habitsRes, goalsRes] = await Promise.all([
                api.get('/habits'),
                api.get('/goals')
            ]);
            setHabits(habitsRes.data);
            setGoals(goalsRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingHabit) {
                await api.put(`/habits/${editingHabit.id}`, formData);
            } else {
                await api.post('/habits', formData);
            }
            if (!editingHabit) {
                confetti({
                    particleCount: 150,
                    origin: { y: 0.7 },
                    colors: ['#6366f1', '#10b981', '#f59e0b']
                });
            }
            await fetchData();
            closeForm();

        } catch (err) {
            console.error('Error saving habit:', err);
            alert('Failed to save habit. Please check your inputs and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this habit? This cannot be undone.')) {
            try {
                await api.delete(`/habits/${id}`);
                setHabits(habits.filter(h => h.id !== id));
            } catch (err) {
                console.error('Error deleting habit:', err);
            }
        }
    };

    const openForm = (habit = null) => {
        if (habit) {
            setEditingHabit(habit);
            setFormData({
                title: habit.title,
                description: habit.description || '',
                category: habit.category,
                frequency: habit.frequency,
                targetValue: habit.targetValue || '',
                difficulty: habit.difficulty,
                goalId: habit.goalId || '',
                customDate: habit.customDate ? format(new Date(habit.customDate), 'yyyy-MM-dd') : ''
            });
        } else {
            setEditingHabit(null);
            setFormData({
                title: '',
                description: '',
                category: 'Productivity',
                frequency: 'daily',
                targetValue: '',
                difficulty: 'medium',
                goalId: '',
                customDate: ''
            });
        }
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingHabit(null);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }}></div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Decrypting Habits...</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Waking server... this may take up to 30s ⏳</p>
                </div>
                <style>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
            </div>
        );
    }


    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="fade-in">


                <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.25rem' }}>Habit Management</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Configure and track your long-term behaviors</p>
                    </div>
                    <button onClick={() => openForm()} className="btn btn-primary">
                        <Plus size={20} /> Create New Habit
                    </button>
                </header>

                {showForm && (
                     <div className="modal-overlay" style={{ 
                        position: 'fixed', 
                        top: 0, left: 0, right: 0, bottom: 0, 
                        zIndex: 5000, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: '1rem', 
                    }}>
                        <motion.div 
                            initial={{ scale: 0.9, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 30, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="glass-card" 
                            style={{ 
                                width: '100%', 
                                maxWidth: '700px', 
                                maxHeight: 'calc(100vh - 4rem)',
                                padding: '3.5rem', 
                                background: 'rgba(15, 12, 25, 0.98)', 
                                border: '2px solid var(--primary-glow)',
                                boxShadow: '0 0 60px rgba(255, 140, 0, 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: '2.5rem',
                                color: '#fff',
                                overflowY: 'auto'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '2.25rem', fontFamily: 'var(--font-anime)', letterSpacing: '2px', background: 'linear-gradient(to right, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{editingHabit ? 'Edit Protocol' : 'Initialize Protocol'}</h2>
                                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Define a new sequence for neural growth</p>
                                </div>
                                <button onClick={closeForm} className="btn btn-ghost" style={{ padding: '0.6rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}><X size={28} /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="input-group">
                                    <label className="input-label" style={{ fontSize: '0.96rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--primary-light)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                       <Activity size={16} /> Protocol Designation
                                    </label>
                                    <input className="input-field" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. 5AM Neural Sync, Heavy Gravity Sprints..." required style={{ width: '100%', padding: '1.25rem 1.75rem', fontSize: '1.15rem' }} />
                                </div>

                                <div className="input-group">
                                    <label className="input-label" style={{ fontSize: '0.96rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'block' }}>Operational Details</label>
                                    <textarea className="input-field" style={{ minHeight: '100px', resize: 'none', padding: '1.25rem 1.75rem', fontSize: '1.05rem', lineHeight: 1.6 }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Define the parameters of this ritual..."></textarea>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div className="input-group">
                                        <label className="input-label" style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Category Cluster</label>
                                        <select className="input-field" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '1.1rem 1.5rem' }}>
                                            <option>Productivity</option>
                                            <option>Health</option>
                                            <option>Social</option>
                                            <option>Finance</option>
                                            <option>Education</option>
                                            <option>Personal Development</option>
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label" style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Target Objective</label>
                                        <select className="input-field" value={formData.goalId} onChange={(e) => setFormData({...formData, goalId: e.target.value})} style={{ width: '100%', padding: '1.1rem 1.5rem' }}>
                                            <option value="">-- No Link --</option>
                                            {(goals || []).map(g => (
                                                <option key={g.id} value={g.id}>{g.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label" style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Rhythm Cypher</label>
                                        <select className="input-field" value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})} style={{ width: '100%', padding: '1.1rem 1.5rem' }}>
                                            <option value="daily">Daily Cycle</option>
                                            <option value="weekly">Hyperbolic Week (Mon-Fri)</option>
                                            <option value="custom">Singular Instance (Custom)</option>
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label" style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Energy Required</label>
                                        <select className="input-field" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} style={{ width: '100%', padding: '1.1rem 1.5rem' }}>
                                            <option value="easy">Easy Mastery (+10 XP)</option>
                                            <option value="medium">Standard Training (+25 XP)</option>
                                            <option value="hard">Elite Conditioning (+50 XP)</option>
                                        </select>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {formData.frequency === 'custom' && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="input-group" 
                                            style={{ padding: '2rem', background: 'rgba(255, 140, 0, 0.05)', borderRadius: '1.5rem', border: '1px dashed var(--primary-glow)' }}
                                        >
                                            <label className="input-label" style={{ fontSize: '0.96rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={16} /> Activation Timestamp
                                            </label>
                                            <input 
                                                type="date" 
                                                className="input-field" 
                                                value={formData.customDate} 
                                                onChange={(e) => setFormData({...formData, customDate: e.target.value})} 
                                                required 
                                                style={{ width: '100%', padding: '1.1rem' }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '1.6rem', fontSize: '1.3rem', borderRadius: '1.5rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', boxShadow: '0 10px 40px var(--primary-glow)' }}>
                                    {submitting ? 'Synchronizing Archive...' : <><Save size={24} /> {editingHabit ? 'Confirm Modification' : 'Initialize Protocol'}</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {habits.length === 0 ? (
                    <div className="empty-state glass-card">
                        <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            <Layout size={48} />
                        </div>
                        <h2>No Habits Tracked</h2>
                        <p>Building positive habits is the secret to compound growth.</p>
                        <button onClick={() => openForm()} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                            <Plus size={18} /> Add first habit
                        </button>
                    </div>
                ) : (
                <div className="dashboard-grid">
                    <AnimatePresence>

                        {habits.map(habit => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                key={habit.id} 
                                className="col-span-4 glass-card" 
                                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: habit.difficulty === 'hard' ? '4px solid var(--danger)' : habit.difficulty === 'medium' ? '4px solid var(--warning)' : '4px solid var(--success)' }}
                            >

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-light)', padding: '0.25rem 0.6rem', background: 'var(--primary-glow)', borderRadius: '0.5rem' }}>{habit.category}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openForm(habit)} className="btn btn-ghost" style={{ padding: '0.4rem', borderRadius: '0.5rem', color: 'var(--text-muted)' }}><Edit2 size={16}/></button>
                                            <button onClick={() => handleDelete(habit.id)} className="btn btn-ghost" style={{ padding: '0.4rem', borderRadius: '0.5rem', color: 'var(--danger)' }}><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <h3 style={{ marginBottom: '0.75rem' }}>{habit.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{habit.description || "No description provided."}</p>
                                    
                                    {habit.goalId && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--accent-glow)', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid var(--accent)' }}>
                                            <Target size={14} color="var(--accent)" />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>Linked to: {goals.find(g => g.id === habit.goalId)?.title || 'Objective'}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em' }}>FREQUENCY</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 600 }}>{habit.frequency}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
                                            <Check size={18} /> <span style={{ fontSize: '1rem', fontWeight: 800 }}>{habit._count?.logs || 0}</span>
                                        </div>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRIES</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                )}
        </motion.div>
    );



};

export default HabitList;
