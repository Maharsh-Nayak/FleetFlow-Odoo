import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { HiOutlineDownload, HiOutlineCurrencyDollar, HiOutlineTruck, HiOutlineUser, HiOutlineChartPie, HiOutlineTrendingUp, HiOutlineSwitchHorizontal } from 'react-icons/hi';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TABS = [
    { id: 'overview', label: 'Overview', icon: <HiOutlineChartPie /> },
    { id: 'financial', label: 'Financial', icon: <HiOutlineCurrencyDollar /> },
    { id: 'vehicles', label: 'Vehicles', icon: <HiOutlineTruck /> },
    { id: 'drivers', label: 'Drivers', icon: <HiOutlineUser /> },
    { id: 'trips', label: 'Trips', icon: <HiOutlineSwitchHorizontal /> },
    { id: 'maintenance', label: 'Maintenance', icon: <HiOutlineTrendingUp /> },
];

const COLORS = ['#10b981', '#f472b6', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444'];
const PIE_COLORS = ['#10b981', '#f472b6', '#f59e0b', '#06b6d4', '#8b5cf6'];

const glassCardStyle = { padding: 24 };

const formatCurrency = (value) => `₹${(parseFloat(value) || 0).toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(15, 15, 20, 0.95)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '12px 16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>{label}</p>
                {payload.map((p, i) => {
                    // Smart check to format financial data as currency, but leave trip counts as plain numbers
                    const isFinancial = ['Revenue', 'Expenses', 'Maintenance', 'Profit', 'Amount', 'Cost', 'Total Costs'].includes(p.name);
                    const displayValue = typeof p.value === 'number'
                        ? (isFinancial ? formatCurrency(p.value) : p.value.toLocaleString())
                        : p.value;

                    return (
                        <p key={i} style={{ color: p.color || '#fff', fontWeight: 600, fontSize: '0.85rem', margin: '2px 0' }}>
                            {p.name}: {displayValue}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

const StatCard = ({ label, value, color, subValue }) => (
    <div className="stat-card">
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
        {subValue && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>{subValue}</div>}
    </div>
);

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [financial, setFinancial] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [vehiclesRes, driversRes, tripsRes, expensesRes, maintRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/drivers'),
                api.get('/trips'),
                api.get('/expenses'),
                api.get('/maintenance'),
                // Skipping the financial-summary API entirely since it's returning corrupted string data
            ]);

            const fetchedVehicles = vehiclesRes.data.data || [];
            const fetchedDrivers = driversRes.data.data || [];
            const fetchedTrips = tripsRes.data.data || [];
            const fetchedExpenses = expensesRes.data.data || [];
            const fetchedMaintenance = maintRes.data.data || [];

            setVehicles(fetchedVehicles);
            setDrivers(fetchedDrivers);
            setTrips(fetchedTrips);
            setExpenses(fetchedExpenses);
            setMaintenance(fetchedMaintenance);

            // CALCULATING ACCURATE FINANCIALS FRONTEND-SIDE
            const calcRevenue = fetchedTrips.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + parseFloat(t.revenue || 0), 0);
            const calcExpenses = fetchedExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
            const calcMaintenance = fetchedMaintenance.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);
            const calcProfit = calcRevenue - calcExpenses - calcMaintenance;

            setFinancial({
                totalRevenue: calcRevenue,
                totalExpenses: calcExpenses,
                totalMaintenance: calcMaintenance,
                netProfit: calcProfit
            });

            setOverview({
                totalVehicles: fetchedVehicles.length,
                activeVehicles: fetchedVehicles.filter(v => v.status === 'AVAILABLE').length,
                totalDrivers: fetchedDrivers.length,
                totalTrips: fetchedTrips.length,
                completedTrips: fetchedTrips.filter(t => t.status === 'COMPLETED').length,
                totalExpenses: calcExpenses,
                totalRevenue: calcRevenue,
                netProfit: calcProfit,
            });
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load reports data');
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = async () => {
        try {
            const response = await api.get('/reports/export-csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'fleetflow_report.csv');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const getVehicleStats = () => {
        return vehicles.map(v => {
            const vehicleTrips = trips.filter(t => t.vehicle_id === v.id);
            const vehicleExpenses = expenses.filter(e => e.vehicle_id === v.id);
            const vehicleMaint = maintenance.filter(m => m.vehicle_id === v.id);

            const revenue = vehicleTrips.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + parseFloat(t.revenue || 0), 0);
            const fuelCosts = vehicleExpenses.filter(e => e.description?.toLowerCase().includes('fuel')).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
            const otherCosts = vehicleExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
            const maintCosts = vehicleMaint.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);
            
            const totalCosts = otherCosts + maintCosts;
            const profit = revenue - totalCosts;
            const acquisitionCost = parseFloat(v.acquisition_cost) || 0;
            
            // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost * 100
            const roi = acquisitionCost > 0 ? ((revenue - (maintCosts + fuelCosts)) / acquisitionCost * 100).toFixed(2) : 0;

            return {
                ...v,
                totalTrips: vehicleTrips.length,
                revenue,
                fuelCosts,
                totalCosts,
                profit,
                acquisitionCost,
                roi,
            };
        }).sort((a, b) => b.profit - a.profit);
    };

    const getDriverStats = () => {
        return drivers.map(d => {
            const driverTrips = trips.filter(t => t.driver_id === d.id);
            const completed = driverTrips.filter(t => t.status === 'COMPLETED');
            return {
                ...d,
                totalTrips: driverTrips.length,
                completedTrips: completed.length,
                completionRate: driverTrips.length > 0 ? Math.round((completed.length / driverTrips.length) * 100) : 0,
            };
        }).sort((a, b) => b.totalTrips - a.totalTrips);
    };

    const getTripStats = () => {
        const statusCounts = trips.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {});

        const routeStats = trips.reduce((acc, t) => {
            if (t.start_location && t.end_location) {
                const route = `${t.start_location} → ${t.end_location}`;
                if (!acc[route]) {
                    acc[route] = { count: 0, revenue: 0 };
                }
                acc[route].count += 1;
                acc[route].revenue += parseFloat(t.revenue || 0);
            }
            return acc;
        }, {});

        return {
            statusCounts,
            totalTrips: trips.length,
            completedTrips: statusCounts.COMPLETED || 0,
            completionRate: trips.length > 0 ? Math.round((statusCounts.COMPLETED || 0) / trips.length * 100) : 0,
            topRoutes: Object.entries(routeStats)
                .map(([route, data]) => ({ route, ...data }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5),
        };
    };

    const getExpenseBreakdown = () => {
        const breakdown = expenses.reduce((acc, e) => {
            const type = e.description || 'Other';
            acc[type] = (acc[type] || 0) + parseFloat(e.amount || 0);
            return acc;
        }, {});

        return Object.entries(breakdown)
            .map(([name, value]) => ({ name, value: Math.round(value) }))
            .sort((a, b) => b.value - a.value);
    };

    const getMaintenanceStats = () => {
        const typeCounts = maintenance.reduce((acc, m) => {
            acc[m.maintenance_type] = (acc[m.maintenance_type] || 0) + 1;
            return acc;
        }, {});

        return {
            totalCost: maintenance.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0),
            byType: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
            pending: maintenance.filter(m => m.status === 'PENDING').length,
            completed: maintenance.filter(m => m.status === 'COMPLETED').length,
        };
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Reports & Analytics</h1>
                        <p className="page-subtitle">Loading data...</p>
                    </div>
                </div>
                <div className="skeleton" style={{ height: 400 }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Reports & Analytics</h1>
                        <p className="page-subtitle" style={{ color: '#ef4444' }}>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const vehicleStats = getVehicleStats();
    const driverStats = getDriverStats();
    const tripStats = getTripStats();
    const expenseBreakdown = getExpenseBreakdown();
    const maintStats = getMaintenanceStats();

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Comprehensive fleet insights</p>
                </div>
                <button onClick={exportCSV} className="btn btn-primary">
                    <HiOutlineDownload /> Export CSV
                </button>
            </div>

            <div className="tabs" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
                {TABS.map(tab => (
                    <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <StatCard label="Total Revenue" value={formatCurrency(financial?.totalRevenue || 0)} color="#10b981" />
                        <StatCard label="Net Profit" value={formatCurrency(financial?.netProfit || 0)} color={financial?.netProfit > 0 ? '#10b981' : '#ef4444'} />
                        <StatCard label="Total Vehicles" value={overview?.totalVehicles || 0} subValue={`${overview?.activeVehicles || 0} active`} color="#06b6d4" />
                        <StatCard label="Total Trips" value={overview?.totalTrips || 0} subValue={`${overview?.completedTrips || 0} completed`} color="#f472b6" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div className="glass-card" style={glassCardStyle}>
                            <h3 style={{ marginBottom: 16 }}>Financial Overview</h3>
                            <div style={{ height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'Revenue', value: financial?.totalRevenue || 0, fill: '#10b981' },
                                        { name: 'Expenses', value: financial?.totalExpenses || 0, fill: '#f59e0b' },
                                        { name: 'Maintenance', value: financial?.totalMaintenance || 0, fill: '#f472b6' },
                                        { name: 'Profit', value: financial?.netProfit || 0, fill: financial?.netProfit > 0 ? '#10b981' : '#ef4444' },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card" style={glassCardStyle}>
                            <h3 style={{ marginBottom: 16 }}>Fleet Status</h3>
                            <div style={{ height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Available', value: vehicles.filter(v => v.status === 'AVAILABLE').length },
                                                { name: 'On Trip', value: vehicles.filter(v => v.status === 'ON_TRIP' || v.status === 'IN_TRANSIT').length },
                                                { name: 'Maintenance', value: vehicles.filter(v => v.status === 'IN_MAINTENANCE' || v.status === 'OUT_OF_SERVICE').length },
                                            ]}
                                            cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {[0, 1, 2].map((i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div className="glass-card" style={glassCardStyle}>
                            <h3 style={{ marginBottom: 16 }}>Top Vehicles by Revenue</h3>
                            <div style={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={vehicleStats.slice(0, 5)} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                        <YAxis type="category" dataKey="model" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={70} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="revenue" fill="#10b981" radius={[0, 8, 8, 0]} name="Revenue" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card" style={glassCardStyle}>
                            <h3 style={{ marginBottom: 16 }}>Top Drivers</h3>
                            <div style={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={driverStats.slice(0, 5)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="totalTrips" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Total Trips" />
                                        <Bar dataKey="completedTrips" fill="#10b981" radius={[8, 8, 0, 0]} name="Completed" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FINANCIAL TAB */}
            {activeTab === 'financial' && (
                <div style={{ display: 'grid', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <StatCard label="Total Revenue" value={formatCurrency(financial?.totalRevenue || 0)} color="#10b981" />
                        <StatCard label="Expenses" value={formatCurrency(financial?.totalExpenses || 0)} color="#f59e0b" />
                        <StatCard label="Maintenance" value={formatCurrency(financial?.totalMaintenance || 0)} color="#f472b6" />
                        <StatCard label="Net Profit" value={formatCurrency(financial?.netProfit || 0)} color={financial?.netProfit > 0 ? '#10b981' : '#ef4444'} />
                    </div>

                    <div className="glass-card" style={glassCardStyle}>
                        <h3 style={{ marginBottom: 16 }}>Expense Breakdown</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdown}
                                        cx="50%" cy="50%" outerRadius={100}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {expenseBreakdown.map((entry, index) => (
                                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card" style={glassCardStyle}>
                        <h3 style={{ marginBottom: 16 }}>Expense Details</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseBreakdown.map((item, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{item.name}</td>
                                            <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(item.value)}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div className="progress-bar" style={{ width: 100 }}>
                                                        <div className="progress-fill" style={{
                                                            width: `${(item.value / (expenseBreakdown.reduce((s, e) => s + e.value, 0) || 1)) * 100}%`,
                                                            background: PIE_COLORS[i % PIE_COLORS.length]
                                                        }} />
                                                    </div>
                                                    <span>{((item.value / (expenseBreakdown.reduce((s, e) => s + e.value, 0) || 1)) * 100).toFixed(1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* VEHICLES TAB */}
            {activeTab === 'vehicles' && (
                <div style={{ display: 'grid', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <StatCard label="Total Vehicles" value={vehicles.length} color="#06b6d4" />
                        <StatCard label="Total Revenue" value={formatCurrency(vehicleStats.reduce((s, v) => s + v.revenue, 0))} color="#10b981" />
                        <StatCard label="Total Costs" value={formatCurrency(vehicleStats.reduce((s, v) => s + v.costs, 0))} color="#f472b6" />
                        <StatCard label="Net Profit" value={formatCurrency(vehicleStats.reduce((s, v) => s + v.profit, 0))} color="#10b981" />
                    </div>

                    <div className="glass-card" style={glassCardStyle}>
                        <h3 style={{ marginBottom: 16 }}>Vehicle Performance</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={vehicleStats.slice(0, 6)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                    <YAxis type="category" dataKey="model" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={70} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} name="Revenue" />
                                    <Bar dataKey="costs" fill="#f472b6" radius={[0, 4, 4, 0]} name="Total Costs" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card" style={glassCardStyle}>
                        <h3 style={{ marginBottom: 16 }}>Vehicle Details</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Vehicle</th>
                                        <th>Status</th>
                                        <th>Trips</th>
                                        <th>Revenue</th>
                                        <th>Costs</th>
                                        <th>Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicleStats.map((v, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{v.model}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.license_plate}</div>
                                            </td>
                                            <td><span className={`pill pill-${v.status?.toLowerCase().replace('_', '')}`}>{v.status}</span></td>
                                            <td>{v.totalTrips}</td>
                                            <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(v.revenue)}</td>
                                            <td style={{ color: '#f472b6' }}>{formatCurrency(v.costs)}</td>
                                            <td style={{ color: v.profit > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{formatCurrency(v.profit)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* DRIVERS TAB */}
            {activeTab === 'drivers' && (
                <div style={{ display: 'grid', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <StatCard label="Total Drivers" value={drivers.length} color="#06b6d4" />
                        <StatCard label="Total Trips" value={driverStats.reduce((s, d) => s + d.totalTrips, 0)} color="#10b981" />
                        <StatCard label="Completed" value={driverStats.reduce((s, d) => s + d.completedTrips, 0)} color="#10b981" />
                        <StatCard label="Avg Completion" value={`${Math.round(driverStats.reduce((s, d) => s + d.completionRate, 0) / (drivers.length || 1))}%`} color="#f59e0b" />
                    </div>

                    <div className="glass-card" style={glassCardStyle}>
                        <h3 style={{ marginBottom: 16 }}>Driver Performance</h3>
                        <div style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={driverStats.slice(0, 6)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={60} />
                                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="totalTrips" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Total Trips" />
                                    <Bar dataKey="completedTrips" fill="#10b981" radius={[8, 8, 0, 0]} name="Completed" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card" style={glassCardStyle}>
                        <h3 style={{ marginBottom: 16 }}>Driver Details</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Driver</th>
                                        <th>Status</th>
                                        <th>Total Trips</th>
                                        <th>Completed</th>
                                        <th>Completion Rate</th>
                                        <th>Safety Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {driverStats.map((d, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{d.name}</td>
                                            <td><span className={`pill pill-${d.status?.toLowerCase().replace('_', '')}`}>{d.status}</span></td>
                                            <td>{d.totalTrips}</td>
                                            <td>{d.completedTrips}</td>
                                            <td>
                                                <span style={{
                                                    color: d.completionRate >= 80 ? '#10b981' : d.completionRate >= 50 ? '#f59e0b' : '#ef4444',
                                                    fontWeight: 600
                                                }}>{d.completionRate}%</span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    color: d.safety_score >= 90 ? '#10b981' : d.safety_score >= 70 ? '#f59e0b' : '#ef4444',
                                                    fontWeight: 600
                                                }}>{d.safety_score}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TRIPS TAB */}
            {activeTab === 'trips' && (
                <div style={{ display: 'grid', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <StatCard label="Total Trips" value={tripStats.totalTrips} color="#06b6d4" />
                        <StatCard label="Completed" value={tripStats.completedTrips} color="#10b981" />
                        <StatCard label="In Transit" value={tripStats.statusCounts.IN_TRANSIT || 0} color="#f59e0b" />
                        <StatCard label="Completion Rate" value={`${tripStats.completionRate}%`} color="#f472b6" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div className="glass-card" style={glassCardStyle}>
                            <h3 style={{ marginBottom: 16 }}>Trip Status</h3>
                            <div style={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(tripStats.statusCounts).map(([name, value]) => ({ name, value }))}
                                            cx="50%" cy="50%" outerRadius={80}
                                            dataKey="value"
                                            nameKey="name"
                                            label
                                        >
                                            {Object.keys(tripStats.statusCounts).map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card" style={glassCardStyle}>
                            <h3 style={{ marginBottom: 16 }}>Top Routes</h3>
                            <div style={{ height: 250, overflowY: 'auto' }}>
                                {tripStats.topRoutes.map((route, i) => (
                                    <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{route.route}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{route.count} trips</div>
                                            </div>
                                            <div style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(route.revenue)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MAINTENANCE TAB */}
            {activeTab === 'maintenance' && (
                <div style={{ display: 'grid', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <StatCard label="Total Records" value={maintenance.length} color="#06b6d4" />
                        <StatCard label="Total Cost" value={formatCurrency(maintStats.totalCost)} color="#f472b6" />
                        <StatCard label="Pending" value={maintStats.pending} color="#f59e0b" />
                        <StatCard label="Completed" value={maintStats.completed} color="#10b981" />
                    </div>

                    <div className="glass-card" style={glassCardStyle}>
                        <h3 style={{ marginBottom: 16 }}>Service Type Distribution</h3>
                        <div style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={maintStats.byType}
                                        cx="50%" cy="50%" outerRadius={100}
                                        dataKey="count"
                                        nameKey="type"
                                        label={({ type, count }) => `${type}: ${count}`}
                                    >
                                        {maintStats.byType.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card" style={glassCardStyle}>
                        <h3 style={{ marginBottom: 16 }}>Maintenance Records</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Vehicle</th>
                                        <th>Service Type</th>
                                        <th>Date</th>
                                        <th>Cost</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {maintenance.map((m, i) => {
                                        const vehicle = vehicles.find(v => v.id === m.vehicle_id);
                                        return (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 600 }}>{vehicle?.model || 'N/A'}</td>
                                                <td>{m.maintenance_type}</td>
                                                <td>{m.maintenance_date}</td>
                                                <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(m.cost)}</td>
                                                <td><span className={`pill pill-${m.status?.toLowerCase()}`}>{m.status}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}