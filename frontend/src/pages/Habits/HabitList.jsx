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
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(2, 6, 23, 0.85)', 
                        zIndex: 5000, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: '1rem', 
                        backdropFilter: 'blur(12px)',
                    }}>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-card modal-content" 
                            style={{ 
                                width: '100%', 
                                maxWidth: '580px', 
                                maxHeight: 'calc(100vh - 2rem)',
                                background: 'var(--bg-card)', 
                                border: '1px solid var(--border-focus)', 
                                padding: '1.5rem 2rem', 
                                margin: 'auto',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{editingHabit ? 'Edit Protocol' : 'New Habit'}</h2>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.125rem 0 0' }}>Step towards your excellence</p>
                                </div>
                                <button onClick={closeForm} className="btn btn-ghost" style={{ padding: '0.4rem', borderRadius: '50%' }}><X size={20} /></button>
                            </div>
                            
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div className="modal-grid">
                                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}><Activity size={12} /> Protocol Name</label>
                                        <input className="input-field" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. 5am Bio-Optimization" required style={{ padding: '0.75rem 1rem' }} />
                                    </div>

                                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>Protocol Details (Optional)</label>
                                        <textarea className="input-field" style={{ minHeight: '60px', resize: 'none', padding: '0.75rem 1rem' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Define core purpose..."></textarea>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}><Layout size={12} /> Category</label>
                                        <select className="input-field" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ padding: '0.75rem 1rem' }}>
                                            <option>Productivity</option>
                                            <option>Health</option>
                                            <option>Social</option>
                                            <option>Finance</option>
                                            <option>Education</option>
                                            <option>Personal Development</option>
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}><Target size={12} /> Link Objective</label>
                                        <select className="input-field" value={formData.goalId} onChange={(e) => setFormData({...formData, goalId: e.target.value})} style={{ padding: '0.75rem 1rem' }}>
                                            <option value="">-- None --</option>
                                            {(goals || []).map(g => (
                                                <option key={g.id} value={g.id}>{g.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}><Clock size={12} /> Frequency</label>
                                        <select className="input-field" value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})} style={{ padding: '0.75rem 1rem' }}>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly (Mon-Fri)</option>
                                            <option value="custom">Custom Date</option>
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}><Zap size={12} /> Effort Tier</label>
                                        <select className="input-field" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} style={{ padding: '0.75rem 1rem' }}>
                                            <option value="easy">Easy (10 XP)</option>
                                            <option value="medium">Medium (25 XP)</option>
                                            <option value="hard">Hard (50 XP)</option>
                                        </select>
                                    </div>

                                    {formData.frequency === 'custom' && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="input-group" 
                                            style={{ gridColumn: 'span 2' }}
                                        >
                                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}><Calendar size={12} /> Activation Date</label>
                                            <input 
                                                type="date" 
                                                className="input-field" 
                                                value={formData.customDate} 
                                                onChange={(e) => setFormData({...formData, customDate: e.target.value})} 
                                                required 
                                                style={{ padding: '0.75rem 1rem' }}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                                

                                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '0.9375rem', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}>
                                    {submitting ? (
                                        <>Synchronizing...</>
                                    ) : (
                                        <><Save size={16} /> {editingHabit ? 'Update Protocol' : 'Initialize Protocol'}</>
                                    )}
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
