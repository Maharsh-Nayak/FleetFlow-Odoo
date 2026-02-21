import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HiOutlineTruck, HiOutlineExclamation, HiOutlineTrendingUp, HiOutlineClipboardList } from 'react-icons/hi';

export default function Dashboard() {
    const { user } = useAuth();
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/dashboard/kpis', {
                    headers: { Authorization: `Bearer ${token}` },
                });
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

    const kpiData = kpis ? [
        { label: 'Active Fleet', value: kpis.inTransitVehicles, icon: <HiOutlineTruck />, color: 'fuchsia' },
        { label: 'Maintenance Vehicles', value: 0, icon: <HiOutlineExclamation />, color: 'amber' },
        { label: 'Utilization Rate', value: `${kpis.utilizationRate}%`, icon: <HiOutlineTrendingUp />, color: 'steel' },
        { label: 'Completed Trips', value: kpis.completedTrips, icon: <HiOutlineClipboardList />, color: 'green' },
    ] : [];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Welcome back, {user?.email || 'User'}!</h1>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 32 }}>
                {kpiData.map((kpi) => (
                    <div className="card" key={kpi.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className={`login-feature-icon ${kpi.color}`}>
                            {kpi.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{kpi.value}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{kpi.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats Summary */}
            {kpis && (
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>Fleet Summary</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>Total Vehicles</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{kpis.totalVehicles}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>Available</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{kpis.availableVehicles}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>Total Expenses</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>${kpis.totalExpenses.toFixed(2)}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>Fuel Used</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{kpis.totalFuelConsumed.toFixed(0)}L</p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '1rem', marginBottom: 8 }}>❌ {error}</p>
                </div>
            )}
        </div>
    );
}
