import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Tag,
    BarChart3,
    Settings,
    Menu,
    X,
    LogOut,
    Bell,
    ChevronDown,
    Key,
    Palette
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { logout } from '../../../store/slices/authSlice';
import { toggleSidebar } from '../../../store/slices/uiSlice';
import AdminThemeProvider, { useAdminTheme } from '../theme/AdminThemeProvider';
import { useConfig } from '../../../core/config/ConfigContext';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayoutInner: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { isSidebarOpen } = useAppSelector((state) => state.ui);
    const { layout, tokens } = useAdminTheme();
    const { config } = useConfig();

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/categories', label: 'Categories', icon: Tag },
        { path: '/admin/attributes', label: 'Attributes', icon: Palette },
        { path: '/admin/customers', label: 'Customers', icon: Users },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/admin/license', label: 'License', icon: Key },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = () => {
        dispatch(logout());
    };

    const containerPadding = layout.density === 'compact' ? 'p-4' : 'p-6';
    const navItemPadding = layout.density === 'compact' ? 'px-4 py-2.5' : 'px-4 py-3';

    return (
        <div
            className="min-h-screen flex"
            style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)' }}
        >
            {layout.nav === 'sidebar' && (
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-[var(--admin-sidebar-width)] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    style={{ backgroundColor: 'var(--admin-sidebar-bg)', color: 'var(--admin-sidebar-text)' }}
                >
                    <div className="flex items-center justify-between h-16 px-6" style={{ borderBottom: `1px solid ${tokens.border}` }}>
                        <Link to="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--admin-primary)', color: 'var(--admin-primary-text)' }}>
                                <span className="font-bold">{config['site.name'].charAt(0)}</span>
                            </div>
                            <span className="font-display font-bold">{config['site.name']}</span>
                        </Link>
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="lg:hidden opacity-80 hover:opacity-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 ${navItemPadding} rounded-lg transition-colors ${isActive ? '' : 'hover:bg-white/10'
                                        }`}
                                    style={
                                        isActive
                                            ? {
                                                backgroundColor: 'var(--admin-sidebar-active-bg)',
                                                color: 'var(--admin-sidebar-active-text)'
                                            }
                                            : { color: 'var(--admin-sidebar-text)' }
                                    }
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: `1px solid ${tokens.border}` }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--admin-primary)', color: 'var(--admin-primary-text)' }}>
                                <span className="font-bold">{user?.name?.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{user?.name}</p>
                                <p className="text-sm opacity-80 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors hover:bg-white/10"
                            style={{ color: 'var(--admin-sidebar-text)' }}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>
            )}

            <div
                className={
                    layout.nav === 'sidebar'
                        ? `flex-1 transition-all duration-300 lg:ml-[var(--admin-sidebar-width)] ${isSidebarOpen ? 'lg:ml-[var(--admin-sidebar-width)]' : ''}`
                        : 'flex-1'
                }
            >
                <header
                    className="sticky top-0 z-40 h-16 flex items-center justify-between px-6"
                    style={{ backgroundColor: 'var(--admin-surface)', borderBottom: `1px solid ${tokens.border}` }}
                >
                    <div className="flex items-center gap-4">
                        {layout.nav === 'sidebar' && (
                            <button
                                onClick={() => dispatch(toggleSidebar())}
                                className="lg:hidden"
                                style={{ color: 'var(--admin-muted)' }}
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                        <h1 className="text-xl font-bold" style={{ color: 'var(--admin-text)' }}>
                            {navItems.find((item) => item.path === location.pathname)?.label || 'Admin'}
                        </h1>
                    </div>

                    {layout.nav === 'topbar' && (
                        <nav className="hidden lg:flex items-center gap-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 ${navItemPadding} rounded-lg`}
                                        style={
                                            isActive
                                                ? { backgroundColor: 'var(--admin-primary)', color: 'var(--admin-primary-text)' }
                                                : { color: 'var(--admin-muted)' }
                                        }
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    <div className="flex items-center gap-4">
                        <button
                            className="relative p-2 rounded-lg"
                            style={{ color: 'var(--admin-muted)' }}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
                        </button>
                        <Link to="/" className="text-sm" style={{ color: 'var(--admin-muted)' }}>
                            View Store →
                        </Link>
                    </div>
                </header>

                <main className={containerPadding}>
                    {children}
                </main>
            </div>

            {layout.nav === 'sidebar' && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => dispatch(toggleSidebar())}
                />
            )}
        </div>
    );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <AdminThemeProvider>
            <AdminLayoutInner>{children}</AdminLayoutInner>
        </AdminThemeProvider>
    );
};

export default AdminLayout;
