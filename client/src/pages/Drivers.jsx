import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DriversPage() {
    const [drivers, setDrivers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        license_number: '',
        license_expiry: '',
        phone_number: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/drivers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDrivers(response.data.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/drivers', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({ name: '', license_number: '', license_expiry: '', phone_number: '' });
            setShowForm(false);
            fetchDrivers();
        } catch (error) {
            console.error('Error creating driver:', error);
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Drivers</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    {showForm ? 'Cancel' : 'Add Driver'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <input
                                type="text"
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                            <input
                                type="text"
                                placeholder="License Number"
                                value={formData.license_number}
                                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                            <input
                                type="date"
                                placeholder="License Expiry"
                                value={formData.license_expiry}
                                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                                required
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>
                            Create Driver
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
                {drivers.map((driver) => (
                    <div key={driver.id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3>{driver.name}</h3>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                {driver.license_number} • Expires: {driver.license_expiry}
                            </p>
                            <p style={{ color: '#999', fontSize: '0.8rem' }}>Status: {driver.status}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 600 }}>Safety Score: {driver.safety_score}/100</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
