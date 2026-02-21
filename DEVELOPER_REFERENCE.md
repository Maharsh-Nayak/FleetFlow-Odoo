# FleetFlow - Developer Reference Guide

## 🔑 Key Code Patterns

### 1. API Call Pattern (Frontend)

```javascript
import axios from 'axios';

const token = localStorage.getItem('token');

// GET request with token
const response = await axios.get('http://localhost:5000/api/vehicles', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// POST request
await axios.post('http://localhost:5000/api/vehicles', {
  model: 'Toyota Hiace',
  license_plate: 'ABC-1234',
  vehicle_type: 'VAN',
  max_capacity_kg: 2000
}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// Error handling
try {
  const data = await axios.get(url, { headers });
  setVehicles(data.data);
} catch (error) {
  setError(error.response?.data?.message || 'Error');
}
```

### 2. Controller Pattern (Backend)

```javascript
// List with pagination
exports.listVehicles = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const { count, rows } = await Vehicle.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    res.json({ total: count, vehicles: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create with validation
exports.createVehicle = async (req, res) => {
  try {
    const { model, license_plate, vehicle_type, max_capacity_kg } = req.body;
    
    // Validation
    if (!model) return res.status(400).json({ message: 'Model required' });
    
    // Create
    const vehicle = await Vehicle.create({
      model,
      license_plate: license_plate.toUpperCase(),
      vehicle_type,
      max_capacity_kg,
      status: 'AVAILABLE',
      odometer: 0
    });
    
    res.status(201).json(vehicle);
  } catch (error) {
    // Handle unique constraint
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'License plate already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update with validation
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Not found' });
    
    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Not found' });
    
    await vehicle.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### 3. Model Pattern (Sequelize)

```javascript
module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    license_plate: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    vehicle_type: {
      type: DataTypes.ENUM('TRUCK', 'VAN', 'CAR', 'TRAILER', 'CONTAINER'),
      allowNull: false
    },
    max_capacity_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    odometer: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'IN_TRANSIT', 'IN_MAINTENANCE', 'INACTIVE'),
      defaultValue: 'AVAILABLE'
    },
    // timestamps: true (automatic created_at, updated_at)
  }, {
    tableName: 'vehicles',
    timestamps: true
  });

  return Vehicle;
};
```

### 4. Route Pattern

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const vehicleController = require('../controllers/vehicle.controller');

// All routes protected with auth middleware
router.get('/', authenticate, vehicleController.listVehicles);
router.get('/:id', authenticate, vehicleController.getVehicle);
router.post('/', authenticate, vehicleController.createVehicle);
router.put('/:id', authenticate, vehicleController.updateVehicle);
router.delete('/:id', authenticate, vehicleController.deleteVehicle);

module.exports = router;
```

### 5. Complex Business Logic (Trip Dispatch)

```javascript
exports.dispatchTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    
    // Validate trip status
    if (trip.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Can only dispatch DRAFT trips' });
    }
    
    // Get vehicle and verify status
    const vehicle = await Vehicle.findByPk(trip.vehicle_id);
    if (vehicle.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Vehicle not available' });
    }
    
    // Update trip status
    await trip.update({ status: 'DISPATCHED' });
    
    // Update vehicle status
    await vehicle.update({ status: 'IN_TRANSIT' });
    
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### 6. Aggregation/Report Pattern

```javascript
exports.getFinancialSummary = async (req, res) => {
  try {
    // Sum expenses
    const totalExpenses = await Expense.sum('amount') || 0;
    
    // Sum fuel costs
    const fuelLogs = await FuelLog.findAll();
    const totalFuelCost = fuelLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    
    // Sum maintenance costs
    const totalMaintenance = await MaintenanceLog.sum('cost') || 0;
    
    // Sum trip revenue
    const totalRevenue = await Trip.sum('revenue') || 0;
    
    // Calculate net profit
    const netProfit = totalRevenue - (totalExpenses + totalFuelCost + totalMaintenance);
    
    res.json({
      totalRevenue,
      totalFuelCost,
      totalExpenses,
      totalMaintenance,
      netProfit,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### 7. Frontend State Management (React)

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVehicles(response.data.vehicles || response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [token]);

  // Create vehicle
  const handleCreate = async (formData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/vehicles', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles([response.data, ...vehicles]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating vehicle');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1>Vehicles</h1>
      <button onClick={() => handleCreate({...})}>Add Vehicle</button>
      <table>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id}>
              <td>{v.model}</td>
              <td>{v.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 8. Authentication Pattern

```javascript
// Login in Frontend
const handleLogin = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    
    // Store token
    localStorage.setItem('token', response.data.token);
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    setError(error.response?.data?.message);
  }
};

// Middleware in Backend
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

---

## 📋 Common Tasks

### Add a New Endpoint

1. **Create Controller Function** (`server/controllers/`)
```javascript
exports.myNewAction = async (req, res) => {
  // Your logic here
};
```

2. **Add Route** (`server/routes/`)
```javascript
router.get('/my-endpoint', authenticate, myController.myNewAction);
```

3. **Integrate in server.js**
```javascript
app.use('/api/myresource', require('./routes/myresource.routes'));
```

### Add a New Frontend Page

1. **Create Page** (`client/src/pages/`)
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MyPage() {
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    // Fetch data
  }, [token]);
  
  return <div>My Page</div>;
}
```

2. **Add Route** (`client/src/App.jsx`)
```javascript
<Route path="/mypage" element={<ProtectedRoute><AppLayout><MyPage /></AppLayout></ProtectedRoute>} />
```

### Query with Relationships

```javascript
// Get trip with vehicle and driver details
const trip = await Trip.findByPk(id, {
  include: ['Vehicle', 'Driver']
});

// Get vehicle with all trips
const vehicle = await Vehicle.findByPk(id, {
  include: ['Trips']
});

// With filtering
const trips = await Trip.findAll({
  include: ['Vehicle', 'Driver'],
  where: { status: 'COMPLETED' },
  order: [['trip_date', 'DESC']]
});
```

### Response Format Standards

**Success (200)**:
```json
{
  "id": "uuid",
  "name": "value",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**List Success (200)**:
```json
{
  "total": 10,
  "vehicles": [...]
}
```

**Error (4xx/5xx)**:
```json
{
  "message": "Human-readable error description"
}
```

---

## 🔍 Debugging Tips

1. **Backend Logs**: Check terminal where `npm run dev` is running
2. **Network Tab**: Browser DevTools → Network tab to see API calls
3. **Database**: Connect with `mysql -u fleetflow -p fleetflow` to verify data
4. **Console**: Check browser console and Redux DevTools

```javascript
// Add logging in controllers
console.log('Incoming request:', req.body);
console.log('User ID:', req.userId);
console.log('Results:', results);
```

---

## 📚 Model Relationships Map

```
User (1) ──→ (Many) Trip (as creator)
Vehicle (1) ──→ (Many) Trip
Vehicle (1) ──→ (Many) MaintenanceLog
Vehicle (1) ──→ (Many) FuelLog
Vehicle (1) ──→ (Many) Expense
Driver (1) ──→ (Many) Trip
Trip (1) ──→ (Many) Expense
```

---

## ✅ Testing Checklist

- [ ] Create endpoint in controller
- [ ] Add route in router
- [ ] Test with curl/Postman
- [ ] Add frontend page if needed
- [ ] Handle error cases
- [ ] Verify response format
- [ ] Check auth middleware

---

**Happy coding! 🚀**
