import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VehiclesPage from './pages/Vehicles';
import DriversPage from './pages/Drivers';
import TripsPage from './pages/Trips';
import MaintenancePage from './pages/Maintenance';
import ExpensesPage from './pages/Expenses';
import ReportsPage from './pages/Reports';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected — App Layout */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/vehicles" element={<VehiclesPage />} />
                        <Route path="/trips" element={<TripsPage />} />
                        <Route path="/maintenance" element={<MaintenancePage />} />
                        <Route path="/expenses" element={<ExpensesPage />} />
                        <Route path="/drivers" element={<DriversPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                    </Route>

                    {/* Redirects */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                theme="dark"
                toastStyle={{
                    background: 'var(--charcoal-800)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                }}
            />
        </AuthProvider>
    );
}
