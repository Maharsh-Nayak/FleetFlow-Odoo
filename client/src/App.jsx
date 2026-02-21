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

function RoleRoute({ element, roles }) {
    return (
        <ProtectedRoute roles={roles}>
            {element}
        </ProtectedRoute>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes with AppLayout */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/vehicles" element={<RoleRoute element={<VehiclesPage />} roles={['MANAGER', 'DISPATCHER']} />} />
                        <Route path="/trips" element={<RoleRoute element={<TripsPage />} roles={['DISPATCHER', 'SAFETY']} />} />
                        <Route path="/maintenance" element={<RoleRoute element={<MaintenancePage />} roles={['MANAGER']} />} />
                        <Route path="/expenses" element={<RoleRoute element={<ExpensesPage />} roles={['FINANCE']} />} />
                        <Route path="/drivers" element={<RoleRoute element={<DriversPage />} roles={['DISPATCHER', 'SAFETY']} />} />
                        <Route path="/reports" element={<RoleRoute element={<ReportsPage />} roles={['MANAGER', 'FINANCE']} />} />
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
