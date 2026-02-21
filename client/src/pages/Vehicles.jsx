import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineTruck, HiOutlineSwitchHorizontal } from 'react-icons/hi';
import FilterSortBar from '../components/FilterSortBar';
import { useAuth } from '../context/AuthContext';

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

export default function VehiclesPage() {
    const { user } = useAuth();
    const isManager = user?.role === 'MANAGER';
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('default');
    const [groupBy, setGroupBy] = useState('none');
    const [formData, setFormData] = useState({
        model: '', license_plate: '', vehicle_type: 'TRUCK', max_capacity_kg: '', region: '', acquisition_cost: ''
    });
    const [loading, setLoading] = useState(true);

    const VEHICLE_FILTERS = [
        { key: 'status', label: 'Status', options: [
            { value: 'AVAILABLE', label: 'Available' },
            { value: 'ON_TRIP', label: 'On Trip' },
            { value: 'IN_TRANSIT', label: 'In Transit' },
            { value: 'IN_MAINTENANCE', label: 'In Maintenance' },
            { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
        ]},
        { key: 'vehicle_type', label: 'Type', options: [
            { value: 'TRUCK', label: 'Truck' },
            { value: 'VAN', label: 'Van' },
            { value: 'CAR', label: 'Car' },
        ]},
    ];

    const SORT_OPTIONS = [
        { value: 'model_asc', label: 'Model (A-Z)' },
        { value: 'model_desc', label: 'Model (Z-A)' },
        { value: 'capacity_asc', label: 'Capacity (Low-High)' },
        { value: 'capacity_desc', label: 'Capacity (High-Low)' },
        { value: 'odometer_asc', label: 'Odometer (Low-High)' },
        { value: 'odometer_desc', label: 'Odometer (High-Low)' },
    ];

    const GROUP_OPTIONS = [
        { value: 'status', label: 'Status' },
        { value: 'vehicle_type', label: 'Type' },
    ];

    const processedData = useMemo(() => {
        let data = [...vehicles];

        if (search) {
            data = data.filter(v => 
                v.model?.toLowerCase().includes(search.toLowerCase()) ||
                v.license_plate?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (filters.status && filters.status !== 'all') {
            data = data.filter(v => v.status === filters.status);
        }
        if (filters.vehicle_type && filters.vehicle_type !== 'all') {
            data = data.filter(v => v.vehicle_type === filters.vehicle_type);
        }

        if (sortBy && sortBy !== 'default') {
            const [field, dir] = sortBy.split('_');
            data.sort((a, b) => {
                let aVal = field === 'capacity' ? parseFloat(a.max_capacity_kg || 0) : a[field];
                let bVal = field === 'capacity' ? parseFloat(b.max_capacity_kg || 0) : b[field];
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();
                if (aVal < bVal) return dir === 'asc' ? -1 : 1;
                if (aVal > bVal) return dir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [vehicles, search, filters, sortBy]);

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

    useEffect(() => { fetchVehicles(); }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles');
            setVehicles(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vehicles', formData);
            setFormData({ model: '', license_plate: '', vehicle_type: 'TRUCK', max_capacity_kg: '', region: '', acquisition_cost: '' });
            setShowModal(false);
            fetchVehicles();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Failed to create vehicle');
        }
    };

    const toggleOutOfService = async (vehicle) => {
        try {
            const newStatus = vehicle.status === 'OUT_OF_SERVICE' ? 'AVAILABLE' : 'OUT_OF_SERVICE';
            await api.put(`/vehicles/${vehicle.id}`, { ...vehicle, status: newStatus });
            fetchVehicles();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update vehicle status');
        }
    };

    const filtered = processedData;

    const getStatusPill = (status) => {
        const map = { 
            AVAILABLE: 'available', 
            ON_TRIP: 'on_trip', 
            IN_TRANSIT: 'in_transit',
            IN_MAINTENANCE: 'in_shop', 
            OUT_OF_SERVICE: 'retired',
            RETIRED: 'retired' 
        };
        return <span className={`pill pill-${map[status] || 'draft'}`}>{status?.replace(/_/g, ' ')}</span>;
    };

    const renderVehicleRow = (vehicle) => (
        <tr key={vehicle.id}>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                        width: 40, height: 40, borderRadius: 10, 
                        background: 'rgba(217, 70, 168, 0.15)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary-400)'
                    }}>
                        <HiOutlineTruck size={20} />
                    </div>
                    <span style={{ fontWeight: 600 }}>{vehicle.model}</span>
                </div>
            </td>
            <td><code style={{ background: 'var(--bg-glass)', padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem' }}>{vehicle.license_plate}</code></td>
            <td>{vehicle.vehicle_type}</td>
            <td>{vehicle.max_capacity_kg}kg</td>
            <td>{vehicle.odometer?.toLocaleString()}km</td>
            <td>{getStatusPill(vehicle.status)}</td>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isManager && (
                        <button 
                            className={`btn btn-sm ${vehicle.status === 'OUT_OF_SERVICE' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => toggleOutOfService(vehicle)}
                            title={vehicle.status === 'OUT_OF_SERVICE' ? 'Put in service' : 'Take out of service'}
                            disabled={vehicle.status === 'IN_TRANSIT' || vehicle.status === 'IN_MAINTENANCE'}
                        >
                            <HiOutlineSwitchHorizontal /> {vehicle.status === 'OUT_OF_SERVICE' ? 'Activate' : 'Out of Service'}
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );

    if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 400 }} /></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Vehicles</h1>
                    <p className="page-subtitle">{filtered.length} vehicles in your fleet</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: isManager ? 'inline-flex' : 'none' }}>
                    <HiOutlinePlus /> Add Vehicle
                </button>
            </div>

            <div className="glass-card" style={{ padding: 16, marginBottom: 16, overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
                        <HiOutlineSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search vehicles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: 42, width: '100%' }}
                        />
                    </div>
                    <FilterSortBar
                        filters={VEHICLE_FILTERS}
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
                                <th>Vehicle</th>
                                <th>License Plate</th>
                                <th>Type</th>
                                <th>Capacity</th>
                                <th>Odometer</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedData ? (
                                groupedData.map(([groupName, items]) => (
                                    <React.Fragment key={groupName}>
                                        <tr className="group-header">
                                            <td colSpan={7} style={{ background: 'var(--bg-glass)', fontWeight: 700, color: 'var(--primary-400)' }}>
                                                {groupName.replace(/_/g, ' ')} ({items.length})
                                            </td>
                                        </tr>
                                        {items.map(renderVehicleRow)}
                                    </React.Fragment>
                                ))
                            ) : (
                                filtered.map(renderVehicleRow)
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Vehicle">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Model</label>
                            <input type="text" className="form-input" placeholder="e.g. Volvo FH16"
                                value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Plate</label>
                            <input type="text" className="form-input" placeholder="e.g. ABC-1234"
                                value={formData.license_plate} onChange={e => setFormData({...formData, license_plate: e.target.value})} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-select" value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})}>
                                <option>TRUCK</option>
                                <option>VAN</option>
                                <option>CAR</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Capacity (kg)</label>
                            <input type="number" className="form-input" placeholder="e.g. 10000"
                                value={formData.max_capacity_kg} onChange={e => setFormData({...formData, max_capacity_kg: e.target.value})} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Region</label>
                            <select className="form-select" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                                <option value="">Select Region</option>
                                <option value="North">North</option>
                                <option value="South">South</option>
                                <option value="East">East</option>
                                <option value="West">West</option>
                                <option value="Central">Central</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Acquisition Cost (₹)</label>
                            <input type="number" className="form-input" placeholder="e.g. 500000"
                                value={formData.acquisition_cost} onChange={e => setFormData({...formData, acquisition_cost: e.target.value})} />
                        </div>
                    </div>
                    <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Vehicle</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
