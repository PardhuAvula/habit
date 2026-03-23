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
            const allHabits = res.data;
            
            // Filter habits based on frequency scheduling
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
            const todayStr = format(today, 'yyyy-MM-dd');
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            const filteredHabits = allHabits.filter(h => {
                if (h.frequency === 'daily') return true;
                if (h.frequency === 'weekly') return !isWeekend; // Show mon-fri
                if (h.frequency === 'custom' && h.customDate) {
                    return format(new Date(h.customDate), 'yyyy-MM-dd') === todayStr;
                }
                return true; // Fallback
            });

            setHabits(filteredHabits);
            
            const completedCount = filteredHabits.filter(h => h.completedToday).length;
            const totalCount = filteredHabits.length;
            
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '2rem' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <Activity size={40} className="pulse-icon" style={{ color: 'var(--primary-light)' }} />
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Syncing Neural Data...</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>The server is waking up from cryo-sleep. Please wait ⏳</p>
                </div>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    .pulse-icon { animation: pulse 2s infinite ease-in-out; }
                    @keyframes pulse { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.9); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
                `}</style>
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
            <header className="dashboard-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', fontWeight: 800 }}>Overview</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} />
                            <span style={{ fontSize: '1rem', fontWeight: 600 }}>{format(currentTime, 'EEEE, MMMM do yyyy')}</span>
                        </div>
                        <div className="dot-divider" style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-focus)' }}></div>
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
                    className="col-span-6 glass-card" 
                    style={{ 
                        position: 'relative',
                        display: 'flex', 
                        gap: '1.5rem', 
                        alignItems: 'center', 
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                        border: '1px solid var(--primary-glow)',
                        overflow: 'hidden',
                        padding: '1.5rem'
                    }}
                >
                    <div style={{ padding: '1.25rem', borderRadius: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <TrendingUp size={32} />
                    </div>
                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                             <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>{stats.percentage}%</h2>
                             <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Momentum</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-focus)', marginBottom: '0.5rem' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.percentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', boxShadow: '0 0 10px var(--primary-glow)' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stats.completed}/{stats.total} RITUALS SYNCED</p>
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="col-span-6 glass-card" 
                    style={{ 
                        position: 'relative',
                        display: 'flex', 
                        gap: '1.5rem', 
                        alignItems: 'center', 
                        background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                        border: '1px solid rgba(234, 88, 12, 0.3)',
                        overflow: 'hidden',
                        padding: '1.5rem'
                    }}
                >
                    <div style={{ padding: '1.25rem', borderRadius: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(234, 88, 12, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                        <Flame size={32} fill="#f97316" />
                    </div>
                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                             <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>{Math.max(0, ...habits.map(h => h.streak?.currentStreak || 0))}</h2>
                             <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Max Streak</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(234, 88, 12, 0.2)', marginBottom: '0.5rem' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (Math.max(0, ...habits.map(h => h.streak?.currentStreak || 0)) / 30) * 100)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #ea580c, #f59e0b)', boxShadow: '0 0 10px rgba(234, 88, 12, 0.4)' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>STREAK MASTERY ACTIVE</p>
                    </div>
                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, transform: 'rotate(-10deg)' }}>
                        <Flame size={100} fill="currentColor" />
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
                                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '0.4rem', 
                                                        color: (habit.streak?.currentStreak || 0) > 0 ? '#f59e0b' : 'var(--text-muted)',
                                                        filter: (habit.streak?.currentStreak || 0) > 0 ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))' : 'none'
                                                    }}>
                                                        <Flame size={24} fill={(habit.streak?.currentStreak || 0) > 0 ? "#f59e0b" : "none"} strokeWidth={2.5} />
                                                        <span style={{ fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 1 }}>{habit.streak?.currentStreak || 0}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: '0.2rem' }}>STREAK</div>
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
