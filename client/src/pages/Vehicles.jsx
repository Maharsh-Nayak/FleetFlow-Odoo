import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        model: '',
        license_plate: '',
        vehicle_type: 'TRUCK',
        max_capacity_kg: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/vehicles', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVehicles(response.data.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/vehicles', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({ model: '', license_plate: '', vehicle_type: 'TRUCK', max_capacity_kg: '' });
            setShowForm(false);
            fetchVehicles();
        } catch (error) {
            console.error('Error creating vehicle:', error);
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Vehicles</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    {showForm ? 'Cancel' : 'Add Vehicle'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <input
                                type="text"
                                placeholder="Model"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                            <input
                                type="text"
                                placeholder="License Plate"
                                value={formData.license_plate}
                                onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                            <select
                                value={formData.vehicle_type}
                                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            >
                                <option>TRUCK</option>
                                <option>VAN</option>
                                <option>CAR</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Max Capacity (kg)"
                                value={formData.max_capacity_kg}
                                onChange={(e) => setFormData({ ...formData, max_capacity_kg: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>
                            Create Vehicle
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3>{vehicle.model}</h3>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                {vehicle.license_plate} • {vehicle.vehicle_type} • Capacity: {vehicle.max_capacity_kg}kg
                            </p>
                            <p style={{ color: '#999', fontSize: '0.8rem' }}>Status: {vehicle.status}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 600 }}>Odometer: {vehicle.odometer}km</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
