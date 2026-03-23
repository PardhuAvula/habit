import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Target, Plus, Trash2, Edit2, CheckCircle2, X, Save, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        targetValue: '',
        deadline: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await api.get('/goals');
            setGoals(res.data);
        } catch (err) {
            console.error('Failed to fetch goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/goals', formData);
            
            // Goal Creation Sparkle
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#a855f7']
            });

            await fetchGoals();
            setShowForm(false);
            setFormData({ title: '', targetValue: '', deadline: '' });
        } catch (err) {
            console.error('Error creating goal:', err);
            alert('Failed to initialize objective. Please check your inputs and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteGoal = async (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            try {
                await api.delete(`/goals/${id}`);
                setGoals(goals.filter(g => g.id !== id));
            } catch (err) {
                console.error('Error deleting goal:', err);
            }
        }
    };

    const updateProgress = async (id, current, target) => {
        const newValue = window.prompt(`Update progress for this goal (Target: ${target}):`, current);
        if (newValue !== null && !isNaN(newValue)) {
            const val = parseFloat(newValue);
            try {
                await api.put(`/goals/${id}/progress`, { currentValue: val });
                
                if (val >= target && current < target) {
                    // Epic Goal Completion Celebration
                    const end = Date.now() + (3 * 1000);
                    const colors = ['#10b981', '#34d399', '#ffffff'];

                    (function frame() {
                      confetti({
                        particleCount: 3,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: colors
                      });
                      confetti({
                        particleCount: 3,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: colors
                      });

                      if (Date.now() < end) {
                        requestAnimationFrame(frame);
                      }
                    }());
                }

                fetchGoals();
            } catch (err) {
                console.error('Error updating progress:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="fade-in">
                <div style={{ height: '40px', width: '200px', marginBottom: '2rem' }} className="skeleton" />
                <div className="dashboard-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: '240px' }} className="skeleton" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Core Objectives</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Focus on the big picture and long-term targets</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={20} /> New Goal
                </button>
            </header>

            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            position: 'fixed', 
                            top: 0, left: 0, right: 0, bottom: 0, 
                            background: 'rgba(2, 6, 23, 0.85)', 
                            zIndex: 5000, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            padding: '2rem 1rem', 
                            backdropFilter: 'blur(12px)',
                            overflowY: 'auto'
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-card" 
                            style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', margin: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ margin: 0 }}>New Objective</h2>
                                <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ padding: '0.5rem' }}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label className="input-label">Objective Title</label>
                                    <input className="input-field" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Run a Marathon, Save $10k..." required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Target Milestone</label>
                                        <input type="number" className="input-field" value={formData.targetValue} onChange={(e) => setFormData({...formData, targetValue: e.target.value})} placeholder="Numeric value" required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Target Date</label>
                                        <input type="date" className="input-field" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                                    </div>
                                </div>
                                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1.5rem' }}>
                                    <Save size={18} /> {submitting ? 'Initializing...' : 'Initialize Objective'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="dashboard-grid">
                <AnimatePresence>
                    {goals.map(goal => {
                        const percentage = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
                        const isAchieved = goal.currentValue >= goal.targetValue;
                        
                        return (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={goal.id} 
                                className="col-span-4 glass-card" 
                                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: isAchieved ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 100%)' : 'var(--bg-glass)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ background: isAchieved ? 'var(--accent-glow)' : 'var(--primary-glow)', padding: '0.75rem', borderRadius: '1rem', color: isAchieved ? 'var(--accent)' : 'var(--primary)' }}>
                                        {isAchieved ? <CheckCircle2 size={24} /> : <Target size={24} />}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => updateProgress(goal.id, goal.currentValue, goal.targetValue)} className="btn btn-ghost" style={{ padding: '0.4rem', borderRadius: '0.5rem' }} title="Update Progress"><TrendingUp size={16}/></button>
                                        <button onClick={() => deleteGoal(goal.id)} className="btn btn-ghost" style={{ padding: '0.4rem', borderRadius: '0.5rem', color: 'var(--danger)' }} title="Delete Goal"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)' }}>{goal.title}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 600 }}>{goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} reached</span>
                                        <span style={{ fontWeight: 800, color: isAchieved ? 'var(--accent)' : 'var(--primary-light)' }}>{percentage}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-dark)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            style={{ 
                                                height: '100%', 
                                                background: isAchieved ? 'linear-gradient(90deg, var(--accent), #34d399)' : 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                                            }}
                                        ></motion.div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Clock size={14} /> {goal.deadline ? format(new Date(goal.deadline), 'MMM dd, yyyy') : 'No deadline'}
                                    </div>
                                    {isAchieved && (
                                        <span className="badge badge-success" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}>COMPLETED</span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {goals.length === 0 && (
                <div className="empty-state glass-card">
                    <Target size={64} className="empty-state-icon" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
                    <h2>No active goals</h2>
                    <p>What big achievement are you aiming for next?</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                        <Plus size={18} /> Define a new goal
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default Goals;
