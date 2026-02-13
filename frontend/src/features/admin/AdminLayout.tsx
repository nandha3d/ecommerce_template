import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Menu,
    X,
    LogOut,
    Bell,
    Search,
    Layers,
    Percent,
    BarChart3,
    Globe,
    ShieldCheck,
    DollarSign,
    Box,
    Sun,
    Moon,
    MessageSquare,
    RotateCcw
} from 'lucide-react';

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
        { name: 'Products', icon: Package, path: '/admin/products' },
        { name: 'Inventory', icon: Layers, path: '/admin/inventory' },
        { name: 'Attributes', icon: Settings, path: '/admin/attributes' },
        { name: 'Pricing', icon: DollarSign, path: '/admin/pricing' },
        { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
        { name: 'Refunds', icon: RotateCcw, path: '/admin/refunds' },
        { name: 'Reviews', icon: MessageSquare, path: '/admin/reviews' },
        { name: 'Customers', icon: Users, path: '/admin/customers' },
        { name: 'Marketing', icon: Percent, path: '/admin/marketing' },
        { name: 'User Management', icon: Users, path: '/admin/users' },
        { name: 'Globalization', icon: Globe, path: '/admin/globalization' },
        { name: 'Modules', icon: Box, path: '/admin/modules' },
        { name: 'Security', icon: ShieldCheck, path: '/admin/security' },
        { name: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token'); // Just in case
        window.location.href = '/admin/login';
    };

    return (
        <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {/* Sidebar */}
            <aside
                className={`glass-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
                style={{
                    width: isSidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-width-collapsed)',
                    color: 'var(--text-on-sidebar)',
                    transition: 'var(--transition)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100,
                    position: 'fixed',
                    height: '100vh',
                    overflowX: 'hidden'
                }}
            >
                <div className="sidebar-header flex-between" style={{ padding: 'var(--space-lg) var(--space-md)', borderBottom: '1px solid var(--border)', height: 'var(--header-height)' }}>
                    {isSidebarOpen && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--primary)', color: 'var(--text-on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>SK</div>
                            <span style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-main)' }}>ShopKart</span>
                        </div>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'var(--transition)' }}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav style={{ flex: 1, padding: 'var(--space-md) var(--space-sm)', overflowY: 'auto' }}>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {menuItems.map((item: any) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <li key={item.name}>
                                    <Link
                                        to={item.path}
                                        className="flex-between group"
                                        style={{
                                            padding: '12px var(--space-md)',
                                            borderRadius: 'var(--radius-sm)',
                                            background: isActive ? 'var(--primary-light)' : 'transparent',
                                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                            justifyContent: isSidebarOpen ? 'space-between' : 'center',
                                            position: 'relative',
                                            transition: 'var(--transition)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
                                            {isSidebarOpen && <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9rem' }}>{item.name}</span>}
                                        </div>
                                        {isActive && <div style={{ position: 'absolute', right: 0, top: '20%', bottom: '20%', width: '3px', borderRadius: '4px 0 0 4px', background: 'var(--primary)' }} />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={handleLogout}
                        className="flex-center"
                        style={{ width: '100%', gap: 'var(--space-md)', color: 'var(--text-muted)', background: 'transparent', border: 'none', padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)' }}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span style={{ fontWeight: 500 }}>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    marginLeft: isSidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-width-collapsed)',
                    transition: 'var(--transition)',
                    backgroundColor: 'var(--bg-main)'
                }}
            >
                {/* Header */}
                <header
                    className="glass flex-between"
                    style={{
                        height: 'var(--header-height)',
                        padding: '0 var(--space-lg)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 90,
                        background: 'var(--bg-header)'
                    }}
                >
                    <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', backgroundColor: 'var(--bg-surface)', padding: 'var(--space-xs) var(--space-md)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input type="text" placeholder="Search..." style={{ border: 'none', background: 'none', outline: 'none', color: 'var(--text-main)' }} />
                    </div>

                    <div className="header-actions flex-center" style={{ gap: 'var(--space-lg)' }}>
                        <button
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '8px',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                borderRadius: 'var(--radius-md)',
                                transition: 'var(--transition)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button style={{ position: 'relative', background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer' }}>
                            <Bell size={20} color="var(--text-secondary)" />
                            <span style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'var(--error)', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '50%' }}>3</span>
                        </button>

                        <div className="user-profile flex-center" style={{ gap: 'var(--space-sm)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--text-on-primary)' }} className="flex-center">A</div>
                            <span style={{ fontWeight: 500 }}>Admin User</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div style={{ padding: 'var(--space-lg)' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
