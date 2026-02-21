import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('financial');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportData(activeTab);
    }, [activeTab]);

    const fetchReportData = async (reportType) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = {
                financial: '/api/reports/financial-summary',
                fuel: '/api/reports/fuel-efficiency',
                costliest: '/api/reports/top-costliest',
                drivers: '/api/reports/driver-performance',
                utilization: '/api/reports/fleet-utilization',
            }[reportType];

            const response = await axios.get(`http://localhost:5000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/reports/export-csv', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'fleetflow_trips.csv');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Reports & Analytics</h1>
                <button onClick={exportCSV} className="btn btn-primary">
                    Export CSV
                </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>
                {[
                    { id: 'financial', label: 'Financial Summary' },
                    { id: 'fuel', label: 'Fuel Efficiency' },
                    { id: 'costliest', label: 'Top Costliest' },
                    { id: 'drivers', label: 'Driver Performance' },
                    { id: 'utilization', label: 'Fleet Utilization' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 4,
                            border: 'none',
                            backgroundColor: activeTab === tab.id ? '#4f46e5' : '#e5e7eb',
                            color: activeTab === tab.id ? 'white' : '#374151',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="card">Loading...</div>
            ) : (
                <div className="card" style={{ padding: 24 }}>
                    {activeTab === 'financial' && data && (
                        <div>
                            <h2>Financial Summary</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16 }}>
                                <div>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Total Revenue</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>${data.totalRevenue?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Fuel Cost</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>${data.totalFuelCost?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Total Expenses</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>${data.totalExpenses?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Maintenance</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>${data.totalMaintenance?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Net Profit</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600, color: data.netProfit > 0 ? '#10b981' : '#ef4444' }}>
                                        ${data.netProfit?.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fuel' && data && (
                        <div>
                            <h2>Fuel Efficiency</h2>
                            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                                {data.map((vehicle, idx) => (
                                    <div key={idx} style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 4 }}>
                                        <p style={{ fontWeight: 600 }}>{vehicle.model} ({vehicle.license_plate})</p>
                                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                            {vehicle.km_per_liter} km/L • Distance: {vehicle.total_distance}km • Fuel: {vehicle.total_fuel}L
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'costliest' && data && (
                        <div>
                            <h2>Top Costliest Vehicles</h2>
                            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                                {data.map((vehicle, idx) => (
                                    <div key={idx} style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 4 }}>
                                        <p style={{ fontWeight: 600 }}>{vehicle.model} ({vehicle.license_plate})</p>
                                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                            Total: ${vehicle.total_cost?.toFixed(2)} • Maintenance: ${vehicle.maintenance_cost?.toFixed(2)} • Fuel: ${vehicle.fuel_cost?.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'drivers' && data && (
                        <div>
                            <h2>Driver Performance</h2>
                            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                                {data.map((driver, idx) => (
                                    <div key={idx} style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 4 }}>
                                        <p style={{ fontWeight: 600 }}>{driver.name}</p>
                                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                            Trips: {driver.total_trips} (Completed: {driver.completed_trips}) • Completion: {driver.completion_rate}% • Safety: {driver.safety_score}/100
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'utilization' && data && (
                        <div>
                            <h2>Fleet Utilization</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 16 }}>
                                <div>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Total Vehicles</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.total_vehicles}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Active</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.active_vehicles}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>In Transit</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.in_transit_vehicles}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>In Maintenance</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.in_maintenance_vehicles}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Utilization Rate</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.utilization_rate}%</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
