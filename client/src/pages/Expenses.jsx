import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineCurrencyDollar, HiOutlineTruck } from 'react-icons/hi';
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

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [trips, setTrips] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('date_desc');
    const [groupBy, setGroupBy] = useState('none');
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        vehicle_id: '', trip_id: '', expense_date: new Date().toISOString().split('T')[0], 
        description: '', amount: '', reference_number: ''
    });

    const EXPENSE_FILTERS = [
        { key: 'description', label: 'Type', options: [
            { value: 'Fuel', label: 'Fuel' },
            { value: 'Toll', label: 'Toll' },
            { value: 'Parking', label: 'Parking' },
            { value: 'Maintenance', label: 'Maintenance' },
            { value: 'Other', label: 'Other' },
        ]},
    ];

    const SORT_OPTIONS = [
        { value: 'date_desc', label: 'Date (Newest)' },
        { value: 'date_asc', label: 'Date (Oldest)' },
        { value: 'amount_asc', label: 'Amount (Low-High)' },
        { value: 'amount_desc', label: 'Amount (High-Low)' },
    ];

    const GROUP_OPTIONS = [
        { value: 'description', label: 'Type' },
    ];

    useEffect(() => { fetchExpenses(); fetchVehicles(); fetchTrips(); }, []);

    const fetchExpenses = async () => {
        try {
            const response = await api.get('/expenses');
            setExpenses(response.data.data);
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles');
            setVehicles(response.data.data);
        } catch (error) { console.error('Error:', error); }
    };

    const fetchTrips = async () => {
        try {
            const response = await api.get('/trips');
            setTrips(response.data.data.filter(t => t.status === 'COMPLETED'));
        } catch (error) { console.error('Error:', error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', formData);
            setFormData({ vehicle_id: '', trip_id: '', expense_date: new Date().toISOString().split('T')[0], description: '', amount: '', reference_number: '' });
            setShowModal(false);
            fetchExpenses();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Failed to create expense');
        }
    };

    const getVehicle = (id) => vehicles.find(v => v.id === id);
    const getTrip = (id) => trips.find(t => t.id === id);

    const processedData = useMemo(() => {
        let data = [...expenses];

        if (search) {
            const searchLower = search.toLowerCase();
            data = data.filter(e => {
                const vehicle = getVehicle(e.vehicle_id);
                return vehicle?.model?.toLowerCase().includes(searchLower) || e.description?.toLowerCase().includes(searchLower);
            });
        }

        if (filters.description && filters.description !== 'all') {
            data = data.filter(e => e.description === filters.description);
        }

        if (sortBy && sortBy !== 'default') {
            const [field, dir] = sortBy.split('_');
            data.sort((a, b) => {
                let aVal, bVal;
                if (field === 'date') {
                    aVal = new Date(a.expense_date || 0);
                    bVal = new Date(b.expense_date || 0);
                } else if (field === 'amount') {
                    aVal = parseFloat(a.amount || 0);
                    bVal = parseFloat(b.amount || 0);
                }
                if (aVal < bVal) return dir === 'asc' ? -1 : 1;
                if (aVal > bVal) return dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [expenses, search, filters, sortBy]);

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

    const totalExpenses = filtered.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const expensesByType = filtered.reduce((acc, e) => {
        const type = e.description?.toLowerCase().includes('fuel') ? 'Fuel' : e.description?.toLowerCase().includes('toll') ? 'Toll' : e.description?.toLowerCase().includes('parking') ? 'Parking' : 'Other';
        acc[type] = (acc[type] || 0) + parseFloat(e.amount || 0);
        return acc;
    }, {});

    if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 400 }} /></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Expenses & Fuel</h1>
                    <p className="page-subtitle">{expenses.length} expense records • Total: ₹{totalExpenses.toLocaleString()}</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <HiOutlinePlus /> Add Expense
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value" style={{ color: '#f472b6' }}>₹{totalExpenses.toLocaleString()}</div></div>
                <div className="stat-card"><div className="stat-label">Fuel</div><div className="stat-value" style={{ color: '#f59e0b' }}>₹{(expensesByType['Fuel'] || 0).toLocaleString()}</div></div>
                <div className="stat-card"><div className="stat-label">Toll</div><div className="stat-value" style={{ color: '#4ba8f0' }}>₹{(expensesByType['Toll'] || 0).toLocaleString()}</div></div>
                <div className="stat-card"><div className="stat-label">Other</div><div className="stat-value" style={{ color: '#10b981' }}>₹{(expensesByType['Other'] || 0).toLocaleString()}</div></div>
            </div>

            <div className="glass-card" style={{ padding: 16, marginBottom: 16, overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
                        <HiOutlineSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: 42, width: '100%' }} />
                    </div>
                    <FilterSortBar
                        filters={EXPENSE_FILTERS}
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
                        <thead><tr><th>Date</th><th>Vehicle</th><th>Trip</th><th>Description</th><th>Reference</th><th>Amount</th></tr></thead>
                        <tbody>
                            {filtered.map((e) => (
                                <tr key={e.id}>
                                    <td>{e.expense_date}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(70, 130, 180, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--steel-400)' }}><HiOutlineTruck size={18} /></div>
                                            <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{getVehicle(e.vehicle_id)?.model || 'N/A'}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{getVehicle(e.vehicle_id)?.license_plate}</div></div>
                                        </div>
                                    </td>
                                    <td>{e.trip_id ? <span style={{ fontSize: '0.85rem', color: 'var(--primary-400)' }}>{getTrip(e.trip_id)?.start_location} → {getTrip(e.trip_id)?.end_location}</span> : <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                                    <td>{e.description}</td>
                                    <td><code style={{ background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: 4, fontSize: '0.75rem' }}>{e.reference_number || '-'}</code></td>
                                    <td style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.1rem' }}>₹{parseFloat(e.amount || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Vehicle</label>
                            <select className="form-select" value={formData.vehicle_id} onChange={e => setFormData({...formData, vehicle_id: e.target.value, trip_id: ''})} required>
                                <option value="">Select Vehicle</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} - {v.license_plate}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Trip (Optional)</label>
                            <select className="form-select" value={formData.trip_id} onChange={e => setFormData({...formData, trip_id: e.target.value})}>
                                <option value="">Select Trip</option>
                                {trips.filter(t => t.vehicle_id === formData.vehicle_id).map(t => <option key={t.id} value={t.id}>{t.start_location} → {t.end_location}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input type="date" className="form-input" value={formData.expense_date} onChange={e => setFormData({...formData, expense_date: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Amount (₹)</label>
                            <input type="number" className="form-input" placeholder="0.00" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                        </div>
                    </div>
                    <div className="form-row single">
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <select className="form-select" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required>
                                <option value="">Select Type</option>
                                <option value="Fuel">Fuel</option>
                                <option value="Toll">Toll</option>
                                <option value="Parking">Parking</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Reference Number</label>
                        <input type="text" className="form-input" placeholder="Receipt/Invoice number" value={formData.reference_number} onChange={e => setFormData({...formData, reference_number: e.target.value})} />
                    </div>
                    <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Expense</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
