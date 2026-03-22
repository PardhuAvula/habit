import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, Check, Save, Target, Layout, Clock, BarChart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';


const HabitList = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Productivity',
        frequency: 'daily',
        targetValue: '',
        difficulty: 'medium'
    });

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await api.get('/habits');
            setHabits(res.data);
        } catch (err) {
            console.error('Failed to fetch habits:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            fetchHabits();
            closeForm();

        } catch (err) {
            console.error('Error saving habit:', err);
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
                difficulty: habit.difficulty
            });
        } else {
            setEditingHabit(null);
            setFormData({
                title: '',
                description: '',
                category: 'Productivity',
                frequency: 'daily',
                targetValue: '',
                difficulty: 'medium'
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
            <div className="container">
                <div className="fade-in">
                    <div style={{ height: '40px', width: '200px', marginBottom: '2rem' }} className="skeleton" />
                    <div className="dashboard-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ height: '220px' }} className="skeleton" />
                        ))}
                    </div>
                </div>
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
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2, 6, 23, 0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(8px)' }}>
                        <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-card)', border: '1px solid var(--border-focus)', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{editingHabit ? 'Edit Behavior' : 'New Habit'}</h2>
                                <button onClick={closeForm} className="btn btn-ghost" style={{ padding: '0.5rem' }}><X size={24} /></button>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label className="input-label">What do you want to achieve?</label>
                                    <input className="input-field" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. 5am Morning Run" required />
                                </div>
                                
                                <div className="input-group">
                                    <label className="input-label">Description (Optional)</label>
                                    <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Why is this habit important to you?"></textarea>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="input-group">
                                        <label className="input-label"><Layout size={14} style={{ marginRight: '0.4rem' }}/> Category</label>
                                        <select className="input-field" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                            <option>Productivity</option>
                                            <option>Health</option>
                                            <option>Social</option>
                                            <option>Finance</option>
                                            <option>Education</option>
                                            <option>Personal Development</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label"><Clock size={14} style={{ marginRight: '0.4rem' }}/> Frequency</label>
                                        <select className="input-field" value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})}>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>
                                </div>
                                

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1.5rem' }}>
                                    <Save size={18} /> {editingHabit ? 'Save Changes' : 'Create Habit'}
                                </button>
                            </form>
                        </div>
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
