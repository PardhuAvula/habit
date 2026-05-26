import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { CheckSquare, Square, Plus, Trash2, Calendar, Clock, Sword } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/tasks?date=${selectedDate}`);
            setTasks(res.data);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const res = await api.post('/tasks', { 
                title: newTaskTitle, 
                date: selectedDate 
            });
            setTasks([res.data, ...tasks]);
            setNewTaskTitle('');
        } catch (err) {
            console.error('Failed to add task:', err);
        }
    };

    const toggleTask = async (id) => {
        try {
            const res = await api.patch(`/tasks/${id}/toggle`);
            setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: res.data.isCompleted } : t));
        } catch (err) {
            console.error('Failed to toggle task:', err);
        }
    };

    const deleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    return (
        <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.75rem', fontWeight: 950, fontFamily: 'var(--font-anime)', letterSpacing: '2px' }}>
                    <Sword className="anime-aura" style={{ color: 'var(--primary)', width: '28px', height: '28px' }} /> Mission Log
                </h3>
                <div style={{ position: 'relative' }}>
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-field"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: '150px' }}
                    />
                </div>
            </div>

            <form onSubmit={addTask} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                    type="text" 
                    placeholder="Enter new mission..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="input-field"
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem' }}>
                    <Plus size={20} />
                </button>
            </form>

            <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Scanning missions...</p>
                    ) : tasks.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No missions for this cycle.</p>
                    ) : (
                        tasks.map(task => (
                            <motion.div 
                                key={task.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="glass-card"
                                style={{ 
                                    padding: '1.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1.25rem',
                                    background: task.isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    border: task.isCompleted ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '1rem'
                                }}
                            >
                                <button 
                                    onClick={() => toggleTask(task.id)}
                                    style={{ background: 'none', border: 'none', color: task.isCompleted ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    {task.isCompleted ? <CheckSquare size={24} /> : <Square size={24} />}
                                </button>
                                <span style={{ 
                                    flex: 1, 
                                    fontSize: '0.95rem',
                                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                                    color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                                    fontWeight: 500
                                }}>
                                    {task.title}
                                </span>
                                <button 
                                    onClick={() => deleteTask(task.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6 }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TaskManager;
