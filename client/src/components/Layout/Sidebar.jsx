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
    { label: 'Dashboard', path: '/dashboard', icon: <HiOutlineViewGrid /> },
    { label: 'Vehicles', path: '/vehicles', icon: <HiOutlineTruck /> },
    { label: 'Trips', path: '/trips', icon: <HiOutlineMap /> },
    { label: 'Maintenance', path: '/maintenance', icon: <HiOutlineCog /> },
    { label: 'Expenses', path: '/expenses', icon: <HiOutlineCash /> },
    { label: 'Drivers', path: '/drivers', icon: <HiOutlineUsers /> },
    { label: 'Reports', path: '/reports', icon: <HiOutlineChartBar /> },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    const roleLabel = user?.role?.replace('_', ' ') || 'User';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">FF</div>
                    <div className="sidebar-logo-text">FleetFlow</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => {
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
