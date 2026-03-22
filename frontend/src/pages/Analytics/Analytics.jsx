import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { BarChart as BarIcon, Calendar, TrendingUp, Info, Activity } from 'lucide-react';
import { subDays, format } from 'date-fns';

const Analytics = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const hRes = await api.get('/analytics/heatmap');
            setHeatmapData(hRes.data);

            const wRes = await api.get('/analytics/weekly');
            setWeeklyData(wRes.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fade-in">
                <div style={{ height: '40px', width: '200px', marginBottom: '2rem' }} className="skeleton" />
                <div className="dashboard-grid">
                    <div className="col-span-full skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)' }} />
                    <div className="col-span-8 skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
                    <div className="col-span-4 skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Insights</h1>
                <p style={{ color: 'var(--text-muted)' }}>Visualize your progress and consistency over time</p>
            </header>

            <div className="dashboard-grid">
                <div className="col-span-full glass-card">
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Activity size={22} color="var(--primary)" /> Activity Timeline
                    </h3>
                    <div className="heatmap-container" style={{ padding: '1.5rem', background: 'var(--bg-dark)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <CalendarHeatmap
                            startDate={subDays(new Date(), 365)}
                            endDate={new Date()}
                            values={heatmapData}
                            classForValue={(value) => {
                                if (!value) return 'color-empty';
                                return `color-scale-${Math.min(value.count, 4)}`;
                            }}
                            transformDayElement={(element, value, index) => {
                                if (value && value.count > 0) {
                                    return (
                                        <g key={index}>
                                            {element}
                                            <text
                                                x={element.props.x + 5}
                                                y={element.props.y + 5}
                                                fontSize="6"
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                alignmentBaseline="central"
                                            >🔥</text>
                                        </g>
                                    );
                                }
                                return React.cloneElement(element, { key: index });
                            }}
                        />
                        <style>{`
                            .react-calendar-heatmap .color-empty { fill: rgba(255,255,255,0.03); }
                            .react-calendar-heatmap .color-scale-1 { fill: var(--primary); opacity: 0.3; }
                            .react-calendar-heatmap .color-scale-2 { fill: var(--primary); opacity: 0.5; }
                            .react-calendar-heatmap .color-scale-3 { fill: var(--primary); opacity: 0.7; }
                            .react-calendar-heatmap .color-scale-4 { fill: var(--primary); opacity: 1; }
                            .react-calendar-heatmap rect { rx: 2px; ry: 2px; }
                        `}</style>
                    </div>
                </div>

                <div className="col-span-8 glass-card">
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BarIcon size={22} color="var(--primary)" /> Success Metrics
                    </h3>
                    <div style={{ height: '340px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="title" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.75rem', boxShadow: 'var(--shadow-lg)' }}
                                    itemStyle={{ color: 'var(--primary)', fontWeight: 600 }}
                                />
                                <Bar dataKey="completionRate" radius={[6, 6, 0, 0]} barSize={40}>
                                    {weeklyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.completionRate > 80 ? 'var(--success)' : 'var(--primary)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-span-4 glass-card">
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <TrendingUp size={22} color="var(--primary)" /> Top Performers
                    </h3>
                    
                    {weeklyData.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No habit data available for the last 7 days.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {weeklyData.slice(0, 4).sort((a,b) => b.completionRate - a.completionRate).map(hw => (
                                <div key={hw.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{hw.title}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: hw.completionRate > 80 ? 'var(--success)' : 'var(--text-main)' }}>{Math.round(hw.completionRate)}%</span>
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <div style={{ 
                                            width: `${hw.completionRate}%`, 
                                            height: '100%', 
                                            background: hw.completionRate > 80 ? 'linear-gradient(90deg, var(--success), #6ee7b7)' : 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                                            transition: 'width 1s ease-out'
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                        <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary-glow)', border: '1px solid var(--border-focus)', display: 'flex', gap: '1rem' }}>
                            <Info size={20} color="var(--primary-light)" style={{ flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Consistency is measured by your activity over the last 7 days. Your current top performer is <strong>{weeklyData.sort((a,b) => b.completionRate - a.completionRate)[0]?.title || '...'}</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
