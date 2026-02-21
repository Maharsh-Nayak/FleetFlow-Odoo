import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineTruck, HiOutlineExclamation, HiOutlineTrendingUp, HiOutlineClipboardList,
    HiOutlineArrowRight, HiOutlineClock, HiOutlineCurrencyDollar, HiOutlineLocationMarker,
    HiOutlineSparkles
} from 'react-icons/hi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const AnimatedCounter = ({ value, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        const duration = 1500;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) { setCount(value); clearInterval(timer); }
            else setCount(Math.floor(current));
        }, duration / steps);
        return () => clearInterval(timer);
    }, [value, isVisible]);

    return <span ref={ref}>{count}{suffix}</span>;
};

const KPICard = ({ label, value, suffix, icon, color, trend }) => {
    const iconMap = {
        fuchsia: { bg: 'rgba(217, 70, 168, 0.15)', color: '#f472b6', glow: '0 0 24px rgba(217, 70, 168, 0.3)' },
        steel: { bg: 'rgba(70, 130, 180, 0.15)', color: '#4ba8f0', glow: '0 0 24px rgba(70, 130, 180, 0.3)' },
        green: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', glow: '0 0 24px rgba(16, 185, 129, 0.3)' },
        amber: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', glow: '0 0 24px rgba(245, 158, 11, 0.3)' },
    };
    const style = iconMap[color] || iconMap.fuchsia;

    return (
        <div className="kpi-card">
            <div className="kpi-card-icon" style={{ background: style.bg, color: style.color, boxShadow: style.glow }}>
                {icon}
            </div>
            <div className="kpi-card-value"><AnimatedCounter value={value} suffix={suffix} /></div>
            <div className="kpi-card-label">{label}</div>
            {trend && <div className={`kpi-card-trend ₹{trend > 0 ? 'up' : 'down'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week</div>}
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'rgba(30, 31, 37, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>{label}</p>
                <p style={{ color: '#f472b6', fontWeight: 600 }}>{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const { user } = useAuth();
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                const response = await api.get('/dashboard/kpis');
                setKpis(response.data);
            } catch (err) {
                setError('Failed to load KPIs');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchKPIs();
    }, []);

    const mockRevenueData = [
        { name: 'Mon', revenue: 4200, expenses: 2800 },
        { name: 'Tue', revenue: 3800, expenses: 2200 },
        { name: 'Wed', revenue: 5100, expenses: 3100 },
        { name: 'Thu', revenue: 4600, expenses: 2900 },
        { name: 'Fri', revenue: 5800, expenses: 3400 },
        { name: 'Sat', revenue: 6200, expenses: 3600 },
        { name: 'Sun', revenue: 4900, expenses: 2800 },
    ];

    const mockVehicleStatus = [
        { name: 'Available', value: 12, color: '#10b981' },
        { name: 'On Trip', value: 8, color: '#06b6d4' },
        { name: 'Maintenance', value: 3, color: '#f59e0b' },
        { name: 'Retired', value: 2, color: '#64748b' },
    ];

    const mockActivity = [
        { id: 1, type: 'trip', title: 'Trip Completed', desc: 'Truck-001 → Warehouse B', time: '5 min ago', icon: <HiOutlineTruck />, color: '#10b981' },
        { id: 2, type: 'maintenance', title: 'Maintenance Alert', desc: 'Van-003 scheduled for service', time: '15 min ago', icon: <HiOutlineExclamation />, color: '#f59e0b' },
        { id: 3, type: 'driver', title: 'Driver On Duty', desc: 'John D. started shift', time: '32 min ago', icon: <HiOutlineClipboardList />, color: '#06b6d4' },
        { id: 4, type: 'expense', title: 'Fuel Expense', desc: '₹145.50 - Gas Station A', time: '1 hr ago', icon: <HiOutlineCurrencyDollar />, color: '#f472b6' },
    ];

    if (loading) return (
        <div className="page-container">
            <div className="page-header"><div><div className="skeleton" style={{ width: 200, height: 32, marginBottom: 8 }} /><div className="skeleton" style={{ width: 150, height: 16 }} /></div></div>
            <div className="kpi-grid">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 24 }} />)}</div>
        </div>
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}!</h1>
                    <p className="page-subtitle">Here's what's happening with your fleet today</p>
                </div>
                <button className="btn btn-secondary"><HiOutlineClipboardList /> View Reports</button>
            </div>

            <div className="kpi-grid">
                <KPICard label="Active Fleet" value={kpis?.inTransitVehicles || 0} icon={<HiOutlineTruck />} color="fuchsia" trend={12} />
                <KPICard label="Maintenance" value={0} icon={<HiOutlineExclamation />} color="amber" trend={-5} />
                <KPICard label="Utilization Rate" value={kpis?.utilizationRate || 0} suffix="%" icon={<HiOutlineTrendingUp />} color="steel" trend={8} />
                <KPICard label="Completed Trips" value={kpis?.completedTrips || 0} icon={<HiOutlineClipboardList />} color="green" trend={24} />
            </div>

            <div className="dashboard-grid">
                <div className="chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Fleet Revenue & Expenses</h3>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d946a8" stopOpacity={0.3} /><stop offset="95%" stopColor="#d946a8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4682b4" stopOpacity={0.3} /><stop offset="95%" stopColor="#4682b4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#d946a8" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="expenses" stroke="#4682b4" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Recent Activity</h3>
                    </div>
                    <div className="activity-list">
                        {mockActivity.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-icon" style={{ background: `₹{activity.color}20`, color: activity.color }}>{activity.icon}</div>
                                <div className="activity-content">
                                    <div className="activity-title">{activity.title}</div>
                                    <div className="activity-meta">{activity.desc}</div>
                                </div>
                                <div className="activity-time">{activity.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {kpis && (
                <div className="dashboard-grid" style={{ marginTop: 24 }}>
                    <div className="chart-container">
                        <div className="chart-header"><h3 className="chart-title">Fleet Status</h3></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <div style={{ width: 180, height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={mockVehicleStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                            {mockVehicleStatus.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ flex: 1 }}>
                                {mockVehicleStatus.map((status) => (
                                    <div key={status.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 4, background: status.color }} />
                                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{status.name}</span>
                                        <span style={{ fontWeight: 600 }}>{status.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="gradient-card">
                        <div className="chart-header">
                            <h3 className="chart-title">Fleet Summary</h3>
                            <HiOutlineSparkles style={{ color: '#f472b6', fontSize: '1.2rem' }} />
                        </div>
                        <div style={{ display: 'grid', gap: 16 }}>
                            <div className="stat-card"><div className="stat-label">Total Vehicles</div><div className="stat-value" style={{ color: '#f472b6' }}>{kpis.totalVehicles}</div></div>
                            <div className="stat-card"><div className="stat-label">Available</div><div className="stat-value" style={{ color: '#10b981' }}>{kpis.availableVehicles}</div></div>
                            <div className="stat-card"><div className="stat-label">Total Expenses</div><div className="stat-value" style={{ color: '#f59e0b' }}>₹{kpis.totalExpenses?.toLocaleString()}</div></div>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="glass-card" style={{ textAlign: 'center', padding: 48, marginTop: 24 }}><p style={{ color: 'var(--danger)' }}>{error}</p></div>}
        </div>
    );
}
