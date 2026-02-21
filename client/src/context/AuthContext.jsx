import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('fleetflow_token');
        const storedUser = localStorage.getItem('fleetflow_user');
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('fleetflow_token');
                localStorage.removeItem('fleetflow_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password, role) => {
        const res = await api.post('/auth/login', { email, password, role });
        const { token, user: userData } = res.data;
        localStorage.setItem('fleetflow_token', token);
        localStorage.setItem('fleetflow_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const register = async (name, email, password, role) => {
        const res = await api.post('/auth/register', { name, email, password, role });
        const { token, user: userData } = res.data;
        localStorage.setItem('fleetflow_token', token);
        localStorage.setItem('fleetflow_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('fleetflow_token');
        localStorage.removeItem('fleetflow_user');
        setUser(null);
    };

    const isAuthenticated = !!user;

    const hasRole = (...roles) => {
        return user && roles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
