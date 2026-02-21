import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineViewGrid,
    HiOutlineTruck,
    HiOutlineMap,
    HiOutlineCog,
    HiOutlineCash,
    HiOutlineUsers,
    HiOutlineChartBar,
    HiOutlineLogout
} from 'react-icons/hi';

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/dashboard', icon: <HiOutlineViewGrid />, roles: ['MANAGER', 'DISPATCHER', 'SAFETY', 'FINANCE'] },
    { label: 'Vehicles', path: '/vehicles', icon: <HiOutlineTruck />, roles: ['MANAGER'] },
    { label: 'Trips', path: '/trips', icon: <HiOutlineMap />, roles: ['DISPATCHER', 'SAFETY'] },
    { label: 'Maintenance', path: '/maintenance', icon: <HiOutlineCog />, roles: ['MANAGER'] },
    { label: 'Expenses', path: '/expenses', icon: <HiOutlineCash />, roles: ['FINANCE'] },
    { label: 'Drivers', path: '/drivers', icon: <HiOutlineUsers />, roles: ['DISPATCHER', 'SAFETY'] },
    { label: 'Reports', path: '/reports', icon: <HiOutlineChartBar />, roles: ['MANAGER', 'FINANCE'] },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const visibleNavItems = NAV_ITEMS.filter(item => 
        user && item.roles.includes(user.role)
    );

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    const roleLabels = {
        MANAGER: 'Fleet Manager',
        DISPATCHER: 'Dispatcher',
        SAFETY: 'Safety Officer',
        FINANCE: 'Financial Analyst',
    };
    const roleLabel = roleLabels[user?.role] || 'User';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">FF</div>
                    <div className="sidebar-logo-text">FleetFlow</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {visibleNavItems.map((item) => {
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name || 'User'}</div>
                        <div className="sidebar-user-role">{roleLabel}</div>
                    </div>
                    <button
                        className="topbar-btn"
                        onClick={logout}
                        title="Logout"
                        style={{ marginLeft: 'auto' }}
                    >
                        <HiOutlineLogout />
                    </button>
                </div>
            </div>
        </aside>
    );
}
