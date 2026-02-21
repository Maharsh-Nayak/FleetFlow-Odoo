import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineCheck, HiOutlineCog, HiOutlineTruck } from 'react-icons/hi';
import FilterSortBar from '../components/FilterSortBar';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

export default function MaintenancePage() {
    const [maintenance, setMaintenance] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('date_desc');
    const [groupBy, setGroupBy] = useState('none');
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        vehicle_id: '', maintenance_type: 'OIL_CHANGE', maintenance_date: new Date().toISOString().split('T')[0], odometer_reading: '', description: '', cost: ''
    });

    const MAINTENANCE_FILTERS = [
        { key: 'status', label: 'Status', options: [
            { value: 'PENDING', label: 'Pending' },
            { value: 'COMPLETED', label: 'Completed' },
        ]},
        { key: 'maintenance_type', label: 'Service Type', options: [
            { value: 'OIL_CHANGE', label: 'Oil Change' },
            { value: 'TIRE_ROTATION', label: 'Tire Rotation' },
            { value: 'BRAKE_SERVICE', label: 'Brake Service' },
            { value: 'ENGINE_REPAIR', label: 'Engine Repair' },
            { value: 'INSPECTION', label: 'Inspection' },
        ]},
    ];

    const SORT_OPTIONS = [
        { value: 'date_desc', label: 'Date (Newest)' },
        { value: 'date_asc', label: 'Date (Oldest)' },
        { value: 'cost_asc', label: 'Cost (Low-High)' },
        { value: 'cost_desc', label: 'Cost (High-Low)' },
    ];

    const GROUP_OPTIONS = [
        { value: 'status', label: 'Status' },
        { value: 'maintenance_type', label: 'Service Type' },
    ];

    useEffect(() => { fetchMaintenance(); fetchVehicles(); }, []);

    const fetchMaintenance = async () => {
        try {
            const response = await api.get('/maintenance');
            setMaintenance(response.data.data);
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles');
            setVehicles(response.data.data);
        } catch (error) { console.error('Error:', error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/maintenance', formData);
            setFormData({ vehicle_id: '', maintenance_type: 'OIL_CHANGE', maintenance_date: new Date().toISOString().split('T')[0], odometer_reading: '', description: '', cost: '' });
            setShowModal(false);
            fetchMaintenance();
            fetchVehicles();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Failed to create maintenance log');
        }
    };

    const completeMaintenance = async (id) => {
        try {
            await api.patch(`/maintenance/₹{id}/complete`);
            fetchMaintenance();
            fetchVehicles();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Failed to complete maintenance');
        }
    };

    const getVehicle = (id) => vehicles.find(v => v.id === id);

    const getStatusPill = (status) => {
        const map = { PENDING: 'in_shop', COMPLETED: 'available' };
        return <span className={`pill pill-₹{map[status] || 'draft'}`}>{status}</span>;
    };

    const getTypeIcon = (type) => {
        const icons = { OIL_CHANGE: '🛢️', TIRE_ROTATION: '🔄', BRAKE_SERVICE: '🛑', ENGINE_REPAIR: '⚙️', INSPECTION: '📋' };
        return icons[type] || '🔧';
    };

    const processedData = useMemo(() => {
        let data = [...maintenance];

        if (search) {
            const searchLower = search.toLowerCase();
            data = data.filter(m => {
                const vehicle = getVehicle(m.vehicle_id);
                return vehicle?.model?.toLowerCase().includes(searchLower) || vehicle?.license_plate?.toLowerCase().includes(searchLower);
            });
        }

        if (filters.status && filters.status !== 'all') {
            data = data.filter(m => m.status === filters.status);
        }
        if (filters.maintenance_type && filters.maintenance_type !== 'all') {
            data = data.filter(m => m.maintenance_type === filters.maintenance_type);
        }

        if (sortBy && sortBy !== 'default') {
            const [field, dir] = sortBy.split('_');
            data.sort((a, b) => {
                let aVal, bVal;
                if (field === 'date') {
                    aVal = new Date(a.maintenance_date || 0);
                    bVal = new Date(b.maintenance_date || 0);
                } else if (field === 'cost') {
                    aVal = parseFloat(a.cost || 0);
                    bVal = parseFloat(b.cost || 0);
                }
                if (aVal < bVal) return dir === 'asc' ? -1 : 1;
                if (aVal > bVal) return dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [maintenance, search, filters, sortBy]);

    const groupedData = useMemo(() => {
        if (groupBy === 'none') return null;
        const groups = {};
        processedData.forEach(item => {
            const key = item[groupBy] || 'Unknown';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [processedData, groupBy]);

    const filtered = processedData;

    const totalCost = filtered.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);

    if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 400 }} /></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Maintenance & Service</h1>
                    <p className="page-subtitle">{maintenance.length} service records • Total: ₹{totalCost.toLocaleString()}</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <HiOutlinePlus /> Add Service Log
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value" style={{ color: '#f59e0b' }}>{maintenance.filter(m => m.status === 'PENDING').length}</div></div>
                <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value" style={{ color: '#10b981' }}>{maintenance.filter(m => m.status === 'COMPLETED').length}</div></div>
                <div className="stat-card"><div className="stat-label">In Shop</div><div className="stat-value" style={{ color: '#f472b6' }}>{vehicles.filter(v => v.status === 'IN_MAINTENANCE').length}</div></div>
                <div className="stat-card"><div className="stat-label">Total Cost</div><div className="stat-value" style={{ color: '#4ba8f0' }}>₹{totalCost.toLocaleString()}</div></div>
            </div>

            <div className="glass-card" style={{ padding: 16, marginBottom: 16, overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
                        <HiOutlineSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: 42, width: '100%' }} />
                    </div>
                    <FilterSortBar
                        filters={MAINTENANCE_FILTERS}
                        sortOptions={SORT_OPTIONS}
                        groupOptions={GROUP_OPTIONS}
                        activeFilters={filters}
                        activeSort={sortBy}
                        activeGroup={groupBy}
                        onFilterChange={setFilters}
                        onSortChange={setSortBy}
                        onGroupChange={setGroupBy}
                    />
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Vehicle</th><th>Service Type</th><th>Date</th><th>Odometer</th><th>Description</th><th>Cost</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                            {groupedData ? (
                                groupedData.map(([groupName, items]) => (
                                    <React.Fragment key={groupName}>
                                        <tr className="group-header">
                                            <td colSpan={8} style={{ background: 'var(--bg-glass)', fontWeight: 700, color: 'var(--warning)' }}>
                                                {groupName.replace('_', ' ')} ({items.length})
                                            </td>
                                        </tr>
                                        {items.map((m) => (
                                            <tr key={m.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}><HiOutlineTruck size={20} /></div>
                                                        <div><div style={{ fontWeight: 600 }}>{getVehicle(m.vehicle_id)?.model || 'N/A'}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getVehicle(m.vehicle_id)?.license_plate}</div></div>
                                                    </div>
                                                </td>
                                                <td><span style={{ fontSize: '1.2rem', marginRight: 8 }}>{getTypeIcon(m.maintenance_type)}</span>{m.maintenance_type?.replace('_', ' ')}</td>
                                                <td>{m.maintenance_date}</td>
                                                <td>{m.odometer_reading ? `₹{m.odometer_reading}km` : '-'}</td>
                                                <td style={{ maxWidth: 200 }}>{m.description || '-'}</td>
                                                <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{parseFloat(m.cost || 0).toLocaleString()}</td>
                                                <td>{getStatusPill(m.status)}</td>
                                                <td>{m.status === 'PENDING' && <button onClick={() => completeMaintenance(m.id)} className="btn btn-primary btn-sm"><HiOutlineCheck /> Complete</button>}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))
                            ) : (
                                filtered.map((m) => (
                                    <tr key={m.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}><HiOutlineTruck size={20} /></div>
                                                <div><div style={{ fontWeight: 600 }}>{getVehicle(m.vehicle_id)?.model || 'N/A'}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getVehicle(m.vehicle_id)?.license_plate}</div></div>
                                            </div>
                                        </td>
                                        <td><span style={{ fontSize: '1.2rem', marginRight: 8 }}>{getTypeIcon(m.maintenance_type)}</span>{m.maintenance_type?.replace('_', ' ')}</td>
                                        <td>{m.maintenance_date}</td>
                                        <td>{m.odometer_reading ? `₹{m.odometer_reading}km` : '-'}</td>
                                        <td style={{ maxWidth: 200 }}>{m.description || '-'}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{parseFloat(m.cost || 0).toLocaleString()}</td>
                                        <td>{getStatusPill(m.status)}</td>
                                        <td>{m.status === 'PENDING' && <button onClick={() => completeMaintenance(m.id)} className="btn btn-primary btn-sm"><HiOutlineCheck /> Complete</button>}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Service Log">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Adding a service log will automatically set the vehicle status to "In Shop".</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Vehicle</label>
                            <select className="form-select" value={formData.vehicle_id} onChange={e => setFormData({...formData, vehicle_id: e.target.value})} required>
                                <option value="">Select Vehicle</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} - {v.license_plate}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Service Type</label>
                            <select className="form-select" value={formData.maintenance_type} onChange={e => setFormData({...formData, maintenance_type: e.target.value})}>
                                <option value="OIL_CHANGE">Oil Change</option>
                                <option value="TIRE_ROTATION">Tire Rotation</option>
                                <option value="BRAKE_SERVICE">Brake Service</option>
                                <option value="ENGINE_REPAIR">Engine Repair</option>
                                <option value="INSPECTION">Inspection</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input type="date" className="form-input" value={formData.maintenance_date} onChange={e => setFormData({...formData, maintenance_date: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Odometer</label>
                            <input type="number" className="form-input" placeholder="Current km" value={formData.odometer_reading} onChange={e => setFormData({...formData, odometer_reading: e.target.value})} />
                        </div>
                    </div>
                    <div className="form-row single">
                        <div className="form-group">
                            <label className="form-label">Cost (₹)</label>
                            <input type="number" className="form-input" placeholder="0.00" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input form-textarea" placeholder="Describe the service..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Service Log</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
