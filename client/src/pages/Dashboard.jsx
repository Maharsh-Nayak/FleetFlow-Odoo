import { useAuth } from '../context/AuthContext';
import { HiOutlineTruck, HiOutlineExclamation, HiOutlineTrendingUp, HiOutlineClipboardList } from 'react-icons/hi';

const PLACEHOLDER_KPIS = [
    { label: 'Active Fleet', value: '—', icon: <HiOutlineTruck />, color: 'fuchsia' },
    { label: 'Maintenance Alerts', value: '—', icon: <HiOutlineExclamation />, color: 'amber' },
    { label: 'Utilization Rate', value: '—%', icon: <HiOutlineTrendingUp />, color: 'steel' },
    { label: 'Pending Cargo', value: '—', icon: <HiOutlineClipboardList />, color: 'green' },
];

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 32 }}>
                {PLACEHOLDER_KPIS.map((kpi) => (
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

            {/* Placeholder table */}
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1rem', marginBottom: 8 }}>📊 Dashboard data will be populated in Phase 5</p>
                <p style={{ fontSize: '0.82rem' }}>Vehicle activity, recent trips, and maintenance alerts will appear here.</p>
            </div>
        </div>
    );
}
