import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineUser } from 'react-icons/hi';
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

export default function DriversPage() {
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('default');
    const [groupBy, setGroupBy] = useState('none');
    const [formData, setFormData] = useState({ name: '', license_number: '', license_expiry: '', phone_number: '' });
    const [loading, setLoading] = useState(true);

    const DRIVER_FILTERS = [
        { key: 'status', label: 'Status', options: [
            { value: 'AVAILABLE', label: 'Available' },
            { value: 'ON_DUTY', label: 'On Duty' },
            { value: 'OFF_DUTY', label: 'Off Duty' },
            { value: 'SUSPENDED', label: 'Suspended' },
        ]},
    ];

    const SORT_OPTIONS = [
        { value: 'name_asc', label: 'Name (A-Z)' },
        { value: 'name_desc', label: 'Name (Z-A)' },
        { value: 'safety_asc', label: 'Safety Score (Low-High)' },
        { value: 'safety_desc', label: 'Safety Score (High-Low)' },
    ];

    const GROUP_OPTIONS = [
        { value: 'status', label: 'Status' },
    ];

    const processedData = useMemo(() => {
        let data = [...drivers];

        if (search) {
            data = data.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()));
        }

        if (filters.status && filters.status !== 'all') {
            data = data.filter(d => d.status === filters.status);
        }

        if (sortBy && sortBy !== 'default') {
            const [field, dir] = sortBy.split('_');
            data.sort((a, b) => {
                let aVal = field === 'safety' ? a.safety_score : a[field];
                let bVal = field === 'safety' ? b.safety_score : b[field];
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();
                if (aVal < bVal) return dir === 'asc' ? -1 : 1;
                if (aVal > bVal) return dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [drivers, search, filters, sortBy]);

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

    useEffect(() => { fetchDrivers(); }, []);

    const fetchDrivers = async () => {
        try {
            const response = await api.get('/drivers');
            setDrivers(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/drivers', formData);
            setFormData({ name: '', license_number: '', license_expiry: '', phone_number: '' });
            setShowModal(false);
            fetchDrivers();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Failed to create driver');
        }
    };

    const filtered = processedData;

    const getStatusPill = (status) => {
        const map = { AVAILABLE: 'available', ON_DUTY: 'on_duty', OFF_DUTY: 'off_duty', SUSPENDED: 'suspended' };
        return <span className={`pill pill-${map[status] || 'draft'}`}>{status?.replace('_', ' ')}</span>;
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'var(--success)';
        if (score >= 70) return 'var(--warning)';
        return 'var(--danger)';
    };

    const renderDriverRow = (driver) => (
        <tr key={driver.id}>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                        width: 40, height: 40, borderRadius: 10, 
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)'
                    }}>
                        <HiOutlineUser size={20} />
                    </div>
                    <span style={{ fontWeight: 600 }}>{driver.name}</span>
                </div>
            </td>
            <td><code style={{ background: 'var(--bg-glass)', padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem' }}>{driver.license_number}</code></td>
            <td>{driver.license_expiry}</td>
            <td>{driver.phone_number || '-'}</td>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${driver.safety_score}%`, background: getScoreColor(driver.safety_score) }} />
                    </div>
                    <span style={{ fontWeight: 600, color: getScoreColor(driver.safety_score) }}>{driver.safety_score}</span>
                </div>
            </td>
            <td>{getStatusPill(driver.status)}</td>
        </tr>
    );

    if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 400 }} /></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Drivers</h1>
                    <p className="page-subtitle">{filtered.length} drivers in your fleet</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <HiOutlinePlus /> Add Driver
                </button>
            </div>

            <div className="glass-card" style={{ padding: 16, marginBottom: 16, overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
                        <HiOutlineSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)}
                            className="form-input" style={{ paddingLeft: 42, width: '100%' }} />
                    </div>
                    <FilterSortBar
                        filters={DRIVER_FILTERS}
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
                        <thead>
                            <tr>
                                <th>Driver</th>
                                <th>License Number</th>
                                <th>License Expiry</th>
                                <th>Phone</th>
                                <th>Safety Score</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedData ? (
                                groupedData.map(([groupName, items]) => (
                                    <React.Fragment key={groupName}>
                                        <tr className="group-header">
                                            <td colSpan={6} style={{ background: 'var(--bg-glass)', fontWeight: 700, color: 'var(--info)' }}>
                                                {groupName.replace('_', ' ')} ({items.length})
                                            </td>
                                        </tr>
                                        {items.map(renderDriverRow)}
                                    </React.Fragment>
                                ))
                            ) : (
                                filtered.map(renderDriverRow)
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Driver">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" className="form-input" placeholder="John Doe"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Number</label>
                            <input type="text" className="form-input" placeholder="DL-12345678"
                                value={formData.license_number} onChange={e => setFormData({...formData, license_number: e.target.value})} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">License Expiry</label>
                            <input type="date" className="form-input"
                                value={formData.license_expiry} onChange={e => setFormData({...formData, license_expiry: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input type="tel" className="form-input" placeholder="+1 234 567 8900"
                                value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                        </div>
                    </div>
                    <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Driver</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
