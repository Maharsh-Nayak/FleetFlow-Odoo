import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    HiOutlineTruck,
    HiOutlineMap,
    HiOutlineChartBar,
    HiOutlineShieldCheck
} from 'react-icons/hi';

const ROLES = [
    { value: 'MANAGER', label: 'Fleet Manager', desc: 'Oversee vehicle health, asset lifecycle, and scheduling' },
    { value: 'DISPATCHER', label: 'Dispatcher', desc: 'Create trips, assign drivers, and validate cargo loads' },
    { value: 'SAFETY', label: 'Safety Officer', desc: 'Monitor driver compliance, license expirations, and safety scores' },
    { value: 'FINANCE', label: 'Financial Analyst', desc: 'Audit fuel spend, maintenance ROI, and operational costs' },
];

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DISPATCHER' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotMessage('');
        try {
            await api.post('/auth/forgot-password', { email: forgotEmail });
            setForgotMessage('If an account exists, a reset link has been sent to your email.');
        } catch (err) {
            setForgotMessage('If an account exists, a reset link has been sent to your email.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                if (!form.name.trim()) {
                    setError('Name is required.');
                    setLoading(false);
                    return;
                }
                await register(form.name, form.email, form.password, form.role);
            } else {
                await login(form.email, form.password, form.role);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* ─── Left: Form ─── */}
            <div className="login-left">
                <div className="login-form-wrapper">
                    <div className="login-logo">
                        <div className="login-logo-icon">FF</div>
                        <div className="login-logo-text">FleetFlow</div>
                    </div>
                    <p className="login-subtitle">
                        {isRegister
                            ? 'Create your account to start managing your fleet.'
                            : 'Sign in to your fleet management dashboard.'}
                    </p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    className="form-input"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-input"
                                placeholder="you@company.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoComplete={isRegister ? 'new-password' : 'current-password'}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="role">
                                {isRegister ? 'Select Your Role' : 'Select Your Role'}
                            </label>
                            <select
                                id="role"
                                name="role"
                                className="form-select"
                                value={form.role}
                                onChange={handleChange}
                            >
                                {ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                {ROLES.find(r => r.value === form.role)?.desc}
                            </p>
                        </div>

                        {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

                        {!isRegister && !showForgotPassword && (
                            <p style={{ textAlign: 'center', marginBottom: 12 }}>
                                <a
                                    onClick={() => setShowForgotPassword(true)}
                                    style={{ color: 'var(--primary-400)', cursor: 'pointer', fontSize: '0.9rem' }}
                                >
                                    Forgot Password?
                                </a>
                            </p>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary login-btn"
                            disabled={loading}
                        >
                            {loading
                                ? (isRegister ? 'Creating Account...' : 'Signing In...')
                                : (isRegister ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="login-divider">or</div>

                    <p className="login-toggle">
                        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                        <a onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                            {isRegister ? 'Sign in' : 'Create one'}
                        </a>
                    </p>
                </div>
            </div>

            {/* ─── Right: Branding ─── */}
            <div className="login-right">
                <div className="login-info">
                    <h1 className="login-info-title">
                        <span>Streamline</span> your fleet operations
                    </h1>
                    <p className="login-info-desc">
                        Real-time tracking, maintenance scheduling, expense analytics, and
                        role-based dispatch — all from one unified command center.
                    </p>

                    <div className="login-feature-cards">
                        <div className="login-feature-card">
                            <div className="login-feature-icon fuchsia">
                                <HiOutlineTruck />
                            </div>
                            <div>
                                <div className="login-feature-label">Fleet Registry</div>
                                <div className="login-feature-sublabel">Track vehicles, status, capacity & regions</div>
                            </div>
                        </div>
                        <div className="login-feature-card">
                            <div className="login-feature-icon steel">
                                <HiOutlineMap />
                            </div>
                            <div>
                                <div className="login-feature-label">Trip Dispatcher</div>
                                <div className="login-feature-sublabel">Validated assignments with live state machine</div>
                            </div>
                        </div>
                        <div className="login-feature-card">
                            <div className="login-feature-icon green">
                                <HiOutlineChartBar />
                            </div>
                            <div>
                                <div className="login-feature-label">Analytics & Reports</div>
                                <div className="login-feature-sublabel">Fuel efficiency, ROI, CSV/PDF exports</div>
                            </div>
                        </div>
                        <div className="login-feature-card">
                            <div className="login-feature-icon amber">
                                <HiOutlineShieldCheck />
                            </div>
                            <div>
                                <div className="login-feature-label">Role-Based Access</div>
                                <div className="login-feature-sublabel">Manager, Dispatcher, Safety, Analyst</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Reset Password</h3>
                            <button className="modal-close" onClick={() => setShowForgotPassword(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            <form onSubmit={handleForgotPassword}>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="you@company.com"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                {forgotMessage && (
                                    <p style={{
                                        marginBottom: 12,
                                        color: forgotMessage.includes('sent') ? 'var(--success)' : 'var(--warning)',
                                        fontSize: '0.9rem'
                                    }}>
                                        {forgotMessage}
                                    </p>
                                )}
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={forgotLoading}>
                                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
