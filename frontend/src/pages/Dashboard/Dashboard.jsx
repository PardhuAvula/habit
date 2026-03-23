import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Flame, CheckCircle, Circle, ArrowRight, TrendingUp, CheckSquare, Plus, Minus, Calendar, Zap, Award, Target, Activity, Clock } from 'lucide-react';

import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { user, refreshUser } = useAuth();
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, completed: 0, percentage: 0 });
    const [filter, setFilter] = useState('all');

    const [isUpdating, setIsUpdating] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timeInterval);
    }, []);

    useEffect(() => {
        fetchDashboardData();

        // Refresh when window gains focus
        const onFocus = () => fetchDashboardData();
        window.addEventListener('focus', onFocus);

        // Periodically check if the calendar day has changed
        let lastDay = new Date().getDate();
        const timer = setInterval(() => {
            const currentDay = new Date().getDate();
            if (currentDay !== lastDay) {
                lastDay = currentDay;
                fetchDashboardData();
            }
        }, 60000); // Check every minute

        return () => {
            window.removeEventListener('focus', onFocus);
            clearInterval(timer);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/habits');
            setHabits(res.data);
            
            const completedCount = res.data.filter(h => h.completedToday).length;
            const totalCount = res.data.length;
            
            setStats({
                total: totalCount,
                completed: completedCount,
                percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleHabitStatus = async (habitId, currentIsDone) => {
        if (isUpdating) return;
        setIsUpdating(true);

        try {
            const newStatus = currentIsDone ? 'missed' : 'completed';
            
            // Optimistic Update
            setHabits(prev => prev.map(h => 
                h.id === habitId ? { 
                    ...h, 
                    completedToday: !currentIsDone,
                    logs: [{ ...h.logs?.[0], value: currentIsDone ? 0 : 1, status: newStatus }],
                    streak: { 
                        ...h.streak, 
                        currentStreak: !currentIsDone ? (h.streak?.currentStreak || 0) + 1 : 
                                       Math.max(0, (h.streak?.currentStreak || 0) - 1)
                    } 
                } : h
            ));

            if (!currentIsDone) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#6366f1', '#10b981', '#f59e0b']
                });
            }

            const response = await api.post(`/habits/${habitId}/log`, { status: newStatus });

            // Update with full server state
            const updatedHabit = response.data;
            setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));

            if (response.data.leveledUp) {
                // Massive Level Up Celebration
                const duration = 5 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                const interval = setInterval(function() {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) return clearInterval(interval);
                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: Math.random() - 0.2, y: Math.random() - 0.3 } });
                    confetti({ ...defaults, particleCount, origin: { x: Math.random() + 0.2, y: Math.random() - 0.3 } });
                }, 250);
            }
            
            // Re-calculate stats from the newly updated habits list to ensure sync
            setHabits(currentHabits => {
                const completedCount = currentHabits.filter(h => h.completedToday).length;
                const totalCount = currentHabits.length;
                setStats({
                    total: totalCount,
                    completed: completedCount,
                    percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
                });
                return currentHabits;
            });

            await refreshUser(); 
        } catch (err) {
            console.error('Failed to update habit status:', err);
            await fetchDashboardData();
        } finally {
            setIsUpdating(false);
        }
    };




    if (loading) {
        return (
            <div className="fade-in">
                <div style={{ height: '40px', width: '200px', marginBottom: '2rem' }} className="skeleton" />
                <div className="dashboard-grid">
                    <div className="col-span-8 skeleton" style={{ height: '220px', borderRadius: 'var(--radius-xl)' }} />
                    <div className="col-span-4 skeleton" style={{ height: '220px', borderRadius: 'var(--radius-xl)' }} />
                    <div className="col-span-12 skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
                </div>
            </div>
        );
    }

    const xpProgress = user ? (user.xp / (user.level * 100)) * 100 : 0;

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fade-in"
        >
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem', fontSize: '2.5rem', fontWeight: 800 }}>Overview</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} />
                            <span style={{ fontSize: '1rem', fontWeight: 600 }}>{format(currentTime, 'EEEE, MMMM do yyyy')}</span>
                        </div>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-focus)' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-light)' }}>
                            <Clock size={18} />
                            <span style={{ fontSize: '1rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{format(currentTime, 'hh:mm:ss a')}</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/goals" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>
                        <Target size={18} /> Objectives
                    </Link>
                    <Link to="/habits" className="btn btn-primary">
                        <Plus size={18} /> New Habit
                    </Link>
                </div>
            </header>

            <div className="dashboard-grid">
                <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="col-span-8 glass-card" 
                    style={{ 
                        position: 'relative',
                        display: 'flex', 
                        gap: '2.5rem', 
                        alignItems: 'center', 
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                        border: '1px solid var(--primary-glow)',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ padding: '2.5rem', borderRadius: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <TrendingUp size={64} />
                    </div>
                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                             <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>{stats.percentage}%</h2>
                             <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Daily Momentum</span>
                        </div>
                        <p style={{ marginBottom: '2rem', fontSize: '1.125rem', color: 'var(--text-secondary)', fontWeight: 500, maxWidth: '480px' }}>
                            {stats.percentage >= 100 ? "Limitless! You've achieved perfection today." : 
                             stats.percentage >= 50 ? "Solid effort! You're dominating the second half." :
                             stats.total > 0 ? "Momentum is building. Take the next step." : 
                             "Silence is the canvas. Paint your day with habits!"}
                        </p>
                        <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--bg-dark)', borderRadius: '7px', overflow: 'hidden', border: '1px solid var(--border-focus)' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.percentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', boxShadow: '0 0 15px var(--primary-glow)' }}
                            />
                        </div>
                    </div>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                        <Zap size={200} fill="currentColor" />
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    className="col-span-4 glass-card" 
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between', 
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-focus)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        textAlign: 'center'
                    }}
                >
                    <div>
                        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '1.25rem', background: 'var(--accent-glow)', color: 'var(--accent)', marginBottom: '1rem', boxShadow: '0 0 15px var(--accent-glow)' }}>
                            <Award size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Level {user?.level || 1}</h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{user?.xp || 0} / {(user?.level || 1) * 100} XP to Next Rank</p>
                    </div>

                    <div style={{ width: '100%', padding: '1.5rem 0' }}>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${xpProgress}%` }}
                                transition={{ duration: 1.2 }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #10b981)' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.completed}</div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700 }}>DONE</div>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border)' }}></div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.total - stats.completed}</div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700 }}>LEFT</div>
                        </div>
                    </div>
                </motion.div>

                <div className="col-span-full">
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                             <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.4rem', background: 'linear-gradient(to right, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Daily Rituals</h2>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <span className="badge badge-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.7rem' }}>{habits.filter(h => !h.completedToday).length} PENDING</span>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isUpdating ? 'var(--primary)' : 'var(--success)' }}></div>
                                <span style={{ color: isUpdating ? 'var(--primary-light)' : 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.3s' }}>
                                    {isUpdating ? 'Synchronizing Rituals...' : 'Ritual state synchronized'}
                                </span>

                             </div>
                        </div>
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '1.25rem', border: '1px solid var(--border)' }}>
                             {['All', 'Pending', 'Done'].map(t => (
                                 <button 
                                    key={t}
                                    onClick={() => setFilter(t.toLowerCase())}
                                    style={{ 
                                        padding: '0.6rem 1.5rem', 
                                        borderRadius: '1rem', 
                                        border: 'none', 
                                        background: filter === t.toLowerCase() ? 'var(--primary)' : 'transparent',
                                        color: filter === t.toLowerCase() ? '#fff' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontSize: '0.8125rem',
                                        fontWeight: 800,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                 >
                                     {t}
                                 </button>
                             ))}
                        </div>
                    </header>

                    {habits.length === 0 ? (
                        <div className="glass-card" style={{ padding: '6rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
                             <Zap size={64} color="var(--border)" style={{ marginBottom: '2rem' }} />
                             <h3 style={{ marginBottom: '1rem' }}>No Active Rituals</h3>
                             <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>The secret of your future is hidden in your daily routine.</p>
                             <Link to="/habits" className="btn btn-primary" style={{ padding: '1rem 2.5rem' }}>Define New Ritual</Link>
                        </div>
                    ) : (
                        <div className="dashboard-grid">
                            <AnimatePresence mode="popLayout">
                                {habits.filter(h => {
                                    if (filter === 'pending') return !h.completedToday;
                                    if (filter === 'done') return h.completedToday;
                                    return true;
                                }).map(habit => {
                                    const isDone = habit.completedToday;
                                    return (
                                        <motion.div 
                                            key={habit.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                            className="col-span-4 glass-card"
                                            style={{ 
                                                position: 'relative',
                                                padding: '2rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1.5rem',
                                                background: isDone ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, var(--bg-card) 100%)' : 'var(--bg-glass)',
                                                border: isDone ? '2px solid var(--success)' : '1px solid var(--border)',
                                                boxShadow: isDone ? '0 10px 40px -10px rgba(16, 185, 129, 0.3)' : 'var(--shadow-lg)',
                                                overflow: 'visible'
                                            }}
                                        >
                                            {isDone && (
                                                <div style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--success)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)', zIndex: 10 }}>
                                                    COMPLETED
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ padding: '0.8rem', borderRadius: '1.25rem', background: isDone ? 'var(--success-glow)' : 'var(--primary-glow)', color: isDone ? 'var(--success)' : 'var(--primary)', border: '1px solid currentColor', opacity: 0.8 }}>
                                                    <Activity size={24} />
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDone ? 'var(--warning)' : 'var(--text-muted)' }}>
                                                        <Flame size={20} fill={isDone ? "var(--warning)" : "none"} strokeWidth={3} />
                                                        <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>{habit.streak?.currentStreak || 0}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>CURRENT STREAK</div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.6rem', color: isDone ? 'var(--text-muted)' : '#fff', textDecoration: isDone ? 'line-through' : 'none', letterSpacing: '-0.02em' }}>{habit.title}</h3>
                                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{habit.category}</span>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>{habit.frequency.toUpperCase()}</span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', marginTop: '0.5rem' }}>
                                                <button 
                                                    disabled={isUpdating}
                                                    onClick={() => toggleHabitStatus(habit.id, isDone)}
                                                    style={{ 
                                                        width: '100%',
                                                        padding: '1rem',
                                                        borderRadius: '1rem',
                                                        border: isDone ? '1px solid var(--success)' : '1px solid var(--primary)',
                                                        background: isDone ? 'var(--success-glow)' : 'var(--primary)',
                                                        color: isDone ? 'var(--success)' : '#fff',
                                                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                        transition: 'all 0.3s',
                                                        fontWeight: 800
                                                    }}
                                                >
                                                    {isDone ? (
                                                        <>
                                                            <CheckCircle size={20} />
                                                            Completed Today
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Circle size={20} />
                                                            Mark Complete
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};



export default Dashboard;
