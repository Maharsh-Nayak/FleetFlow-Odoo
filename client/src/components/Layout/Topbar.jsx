import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
    '/dashboard': 'Command Center',
    '/vehicles': 'Vehicle Registry',
    '/trips': 'Trip Dispatcher',
    '/maintenance': 'Maintenance & Service Logs',
    '/expenses': 'Expenses & Fuel Logging',
    '/drivers': 'Driver Performance & Safety',
    '/analytics': 'Analytics & Reports',
};

export default function Topbar() {
    const location = useLocation();
    const { user } = useAuth();
    const pageTitle = PAGE_TITLES[location.pathname] || 'FleetFlow';

    return (
        <header className="topbar">
            <h2 className="topbar-title">{pageTitle}</h2>
        </header>
    );
}
