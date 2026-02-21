import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TripsPage() {
    const [trips, setTrips] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        driver_id: '',
        start_location: '',
        end_location: '',
        start_odometer: '',
        cargo_weight_kg: '',
        expected_revenue: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
        fetchVehicles();
        fetchDrivers();
    }, []);

    const fetchTrips = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/trips', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTrips(response.data.data);
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/vehicles', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVehicles(response.data.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/drivers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDrivers(response.data.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/trips', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({
                vehicle_id: '',
                driver_id: '',
                start_location: '',
                end_location: '',
                start_odometer: '',
                cargo_weight_kg: '',
                expected_revenue: '',
            });
            setShowForm(false);
            fetchTrips();
        } catch (error) {
            console.error('Error creating trip:', error);
        }
    };

    const dispatchTrip = async (tripId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/trips/${tripId}/dispatch`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTrips();
        } catch (error) {
            console.error('Error dispatching trip:', error);
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Trips</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    {showForm ? 'Cancel' : 'Create Trip'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <select
                                value={formData.vehicle_id}
                                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            >
                                <option value="">Select Vehicle</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>{v.model} - {v.license_plate}</option>
                                ))}
                            </select>
                            <select
                                value={formData.driver_id}
                                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            >
                                <option value="">Select Driver</option>
                                {drivers.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Start Location"
                                value={formData.start_location}
                                onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                            <input
                                type="text"
                                placeholder="End Location"
                                value={formData.end_location}
                                onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                            <input
                                type="number"
                                placeholder="Start Odometer"
                                value={formData.start_odometer}
                                onChange={(e) => setFormData({ ...formData, start_odometer: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                            <input
                                type="number"
                                placeholder="Cargo Weight (kg)"
                                value={formData.cargo_weight_kg}
                                onChange={(e) => setFormData({ ...formData, cargo_weight_kg: e.target.value })}
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>
                            Create Trip
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
                {trips.map((trip) => (
                    <div key={trip.id} className="card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h3>{trip.start_location} → {trip.end_location}</h3>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                    Trip Date: {trip.trip_date} • Status: {trip.status}
                                </p>
                                <p style={{ color: '#999', fontSize: '0.8rem' }}>
                                    Cargo: {trip.cargo_weight_kg}kg • Odometer: {trip.start_odometer}km
                                </p>
                            </div>
                            {trip.status === 'DRAFT' && (
                                <button
                                    onClick={() => dispatchTrip(trip.id)}
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.9rem' }}
                                >
                                    Dispatch
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
