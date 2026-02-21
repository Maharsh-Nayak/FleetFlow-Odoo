import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { HiOutlinePlus, HiOutlineArrowRight, HiOutlinePaperAirplane, HiOutlineLocationMarker, HiOutlineTruck, HiOutlineUser, HiOutlineSearch } from 'react-icons/hi';
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

export default function TripsPage() {
    const [trips, setTrips] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('default');
    const [groupBy, setGroupBy] = useState('none');
    const [formData, setFormData] = useState({
        vehicle_id: '', driver_id: '', start_location: '', end_location: '', start_odometer: '', cargo_weight_kg: '', expected_revenue: '',
    });
    const [loading, setLoading] = useState(true);

    const TRIP_FILTERS = [
        { key: 'status', label: 'Status', options: [
            { value: 'DRAFT', label: 'Draft' },
            { value: 'DISPATCHED', label: 'Dispatched' },
            { value: 'IN_TRANSIT', label: 'In Transit' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
        ]},
    ];

    const SORT_OPTIONS = [
        { value: 'date_asc', label: 'Date (Oldest)' },
        { value: 'date_desc', label: 'Date (Newest)' },
        { value: 'revenue_asc', label: 'Revenue (Low-High)' },
        { value: 'revenue_desc', label: 'Revenue (High-Low)' },
        { value: 'distance_asc', label: 'Distance (Short-Long)' },
        { value: 'distance_desc', label: 'Distance (Long-Short)' },
    ];

    const GROUP_OPTIONS = [
        { value: 'status', label: 'Status' },
    ];

    useEffect(() => { fetchTrips(); fetchVehicles(); fetchDrivers(); }, []);

    const fetchTrips = async () => {
        try {
            const response = await api.get('/trips');
            setTrips(response.data.data);
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles');
            setVehicles(response.data.data.filter(v => v.status === 'AVAILABLE'));
        } catch (error) { console.error('Error:', error); }
    };

    const fetchDrivers = async () => {
        try {
            const response = await api.get('/drivers');
            setDrivers(response.data.data.filter(d => d.status === 'AVAILABLE'));
        } catch (error) { console.error('Error:', error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trips', formData);
            setFormData({ vehicle_id: '', driver_id: '', start_location: '', end_location: '', start_odometer: '', cargo_weight_kg: '', expected_revenue: '' });
            setShowModal(false);
            fetchTrips();
            fetchVehicles();
            fetchDrivers();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Failed to create trip');
        }
    };

    const dispatchTrip = async (tripId) => {
        try {
            await api.patch(`/trips/₹{tripId}/dispatch`);
            fetchTrips();
            fetchVehicles();
            fetchDrivers();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Failed to dispatch trip');
        }
    };

    const completeTrip = async (tripId) => {
        try {
            const trip = trips.find(t => t.id === tripId);
            const endOdometer = prompt('Enter end odometer reading:', (trip.start_odometer + 100));
            if (!endOdometer) return;
            
            await api.patch(`/trips/₹{tripId}/complete`, { end_odometer: parseInt(endOdometer) });
            fetchTrips();
            fetchVehicles();
            fetchDrivers();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Failed to complete trip');
        }
    };

    const getStatusPill = (status) => {
        const map = { DRAFT: 'draft', DISPATCHED: 'dispatched', IN_TRANSIT: 'in_transit', COMPLETED: 'completed', CANCELLED: 'cancelled' };
        return <span className={`pill pill-₹{map[status] || 'draft'}`}>{status}</span>;
    };

    const getVehicle = (id) => vehicles.find(v => v.id === id) || trips.find(t => t.vehicle_id === id);
    const getDriver = (id) => drivers.find(d => d.id === id) || trips.find(t => t.driver_id === id);

    const processedData = useMemo(() => {
        let data = [...trips];

        if (search) {
            data = data.filter(t => 
                t.start_location?.toLowerCase().includes(search.toLowerCase()) ||
                t.end_location?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (filters.status && filters.status !== 'all') {
            data = data.filter(t => t.status === filters.status);
        }

        if (sortBy && sortBy !== 'default') {
            const [field, dir] = sortBy.split('_');
            data.sort((a, b) => {
                let aVal, bVal;
                if (field === 'date') {
                    aVal = new Date(a.trip_date || 0);
                    bVal = new Date(b.trip_date || 0);
                } else if (field === 'revenue') {
                    aVal = parseFloat(a.expected_revenue || 0);
                    bVal = parseFloat(b.expected_revenue || 0);
                } else if (field === 'distance') {
                    aVal = parseFloat(a.start_odometer || 0);
                    bVal = parseFloat(b.start_odometer || 0);
                }
                if (aVal < bVal) return dir === 'asc' ? -1 : 1;
                if (aVal > bVal) return dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [trips, search, filters, sortBy]);

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

    if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 400 }} /></div>;

    const renderTripCard = (trip) => (
        <div key={trip.id} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        {getStatusPill(trip.status)}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{trip.trip_date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineLocationMarker style={{ color: 'var(--primary-400)' }} />
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{trip.start_location}</span>
                        </div>
                        <HiOutlineArrowRight style={{ color: 'var(--text-muted)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineLocationMarker style={{ color: 'var(--success)' }} />
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{trip.end_location || 'In Transit'}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                            <HiOutlineTruck size={16} />
                            <span>{getVehicle(trip.vehicle_id)?.model || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                            <HiOutlineUser size={16} />
                            <span>{getDriver(trip.driver_id)?.name || 'N/A'}</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {trip.cargo_weight_kg}kg • {trip.start_odometer}km
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                    {trip.expected_revenue && (
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                            ₹{trip.expected_revenue}
                        </div>
                    )}
                    {trip.status === 'DRAFT' && (
                        <button onClick={() => dispatchTrip(trip.id)} className="btn btn-primary btn-sm">
                            <HiOutlinePaperAirplane /> Dispatch
                        </button>
                    )}
                    {trip.status === 'DISPATCHED' && (
                        <button onClick={() => completeTrip(trip.id)} className="btn btn-primary btn-sm">
                            Complete Trip
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Trips</h1>
                    <p className="page-subtitle">{processedData.length} trips scheduled</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <HiOutlinePlus /> Create Trip
                </button>
            </div>

            <div className="glass-card" style={{ padding: 16, marginBottom: 16, overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
                        <HiOutlineSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search trips..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: 42, width: '100%' }}
                        />
                    </div>
                    <FilterSortBar
                        filters={TRIP_FILTERS}
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

            <div style={{ display: 'grid', gap: 16 }}>
                {groupedData ? (
                    groupedData.map(([groupName, items]) => (
                        <div key={groupName}>
                            <div style={{ marginBottom: 8, fontWeight: 700, color: 'var(--warning)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                                {groupName} ({items.length})
                            </div>
                            {items.map(renderTripCard)}
                        </div>
                    ))
                ) : (
                    processedData.map(renderTripCard)
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Trip">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Vehicle</label>
                            <select className="form-select" value={formData.vehicle_id} onChange={e => setFormData({...formData, vehicle_id: e.target.value})} required>
                                <option value="">Select Vehicle</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} - {v.license_plate} (Max: {v.max_capacity_kg}kg)</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Driver</label>
                            <select className="form-select" value={formData.driver_id} onChange={e => setFormData({...formData, driver_id: e.target.value})} required>
                                <option value="">Select Driver</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Start Location</label>
                            <input type="text" className="form-input" placeholder="Warehouse A"
                                value={formData.start_location} onChange={e => setFormData({...formData, start_location: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Location</label>
                            <input type="text" className="form-input" placeholder="Warehouse B"
                                value={formData.end_location} onChange={e => setFormData({...formData, end_location: e.target.value})} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Start Odometer</label>
                            <input type="number" className="form-input" placeholder="0"
                                value={formData.start_odometer} onChange={e => setFormData({...formData, start_odometer: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cargo Weight (kg)</label>
                            <input type="number" className="form-input" placeholder="0"
                                value={formData.cargo_weight_kg} onChange={e => setFormData({...formData, cargo_weight_kg: e.target.value})} />
                        </div>
                    </div>
                    <div className="form-row single">
                        <div className="form-group">
                            <label className="form-label">Expected Revenue (₹)</label>
                            <input type="number" className="form-input" placeholder="0.00"
                                value={formData.expected_revenue} onChange={e => setFormData({...formData, expected_revenue: e.target.value})} />
                        </div>
                    </div>
                    <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Trip</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
