import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    Heart,
    ChevronDown,
    LogOut,
    Package,
    Settings
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { toggleCart } from '../../store/slices/cartSlice';
import { logout } from '../../store/slices/authSlice';
import { setMobileMenuOpen } from '../../store/slices/uiSlice';
import { useConfig } from '../../core/config/ConfigContext';
import { CurrencySwitcher } from './CurrencySwitcher';

const Header: React.FC = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const { cart } = useAppSelector((state) => state.cart);
    const { isMobileMenuOpen } = useAppSelector((state) => state.ui);
    const { categories } = useAppSelector((state) => state.products);
    const { config } = useConfig();

    const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        setIsUserMenuOpen(false);
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-40 w-full">
            {/* Top Bar */}
            <div className="bg-primary-900 text-white py-2 px-4">
                <div className="container mx-auto flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4">
                        <CurrencySwitcher />
                        <span className="hidden sm:inline">Free shipping on orders over $50</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <a href={`tel:${config['contact.phone']}`} className="hover:text-primary-500 transition-colors">
                            📞 {config['contact.phone']}
                        </a>
                        <span className="text-neutral-400">|</span>
                        <Link to="/pages/faq" className="hover:text-primary-500 transition-colors">
                            Help Center
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="bg-white shadow-soft">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => dispatch(setMobileMenuOpen(!isMobileMenuOpen))}
                            className="md:hidden p-2 text-neutral-600 hover:text-primary-500"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">{config['site.name'].charAt(0)}</span>
                            </div>
                            <span className="hidden sm:block text-xl font-display font-bold text-primary-900">
                                {config['site.name']}
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            <Link to="/products" className="text-neutral-700 hover:text-primary-500 font-medium transition-colors">
                                All Products
                            </Link>
                            <div className="relative group">
                                <button className="flex items-center gap-1 text-neutral-700 hover:text-primary-500 font-medium transition-colors">
                                    Categories <ChevronDown className="w-4 h-4" />
                                </button>
                                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="bg-white rounded-xl shadow-lg border border-neutral-100 py-2 min-w-[200px]">
                                        {categories.slice(0, 8).map((category) => (
                                            <Link
                                                key={category.id}
                                                to={`/products?category=${category.slug}`}
                                                className="block px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                                            >
                                                {category.name}
                                            </Link>
                                        ))}
                                        <div className="border-t border-neutral-100 mt-2 pt-2">
                                            <Link
                                                to="/products"
                                                className="block px-4 py-2 text-primary-500 font-medium hover:bg-primary-50"
                                            >
                                                View All Categories
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Link to="/products?featured=true" className="text-neutral-700 hover:text-primary-500 font-medium transition-colors">
                                Best Sellers
                            </Link>
                            <Link to="/products?new=true" className="text-neutral-700 hover:text-primary-500 font-medium transition-colors">
                                New Arrivals
                            </Link>
                            <Link to="/pages/about" className="text-neutral-700 hover:text-primary-500 font-medium transition-colors">
                                About
                            </Link>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Search */}
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="p-2 text-neutral-600 hover:text-primary-500 transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* Wishlist */}
                            {isAuthenticated && (
                                <Link
                                    to="/account/wishlist"
                                    className="hidden md:flex p-2 text-neutral-600 hover:text-primary-500 transition-colors"
                                >
                                    <Heart className="w-5 h-5" />
                                </Link>
                            )}

                            {/* Cart */}
                            <button
                                onClick={() => dispatch(toggleCart())}
                                className="relative p-2 text-neutral-600 hover:text-primary-500 transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {cartItemCount > 9 ? '9+' : cartItemCount}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 p-2 text-neutral-600 hover:text-primary-500 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary-500" />
                                        </div>
                                        <span className="hidden md:block text-sm font-medium">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                        <ChevronDown className="hidden md:block w-4 h-4" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-100 py-2">
                                            <Link
                                                to="/account"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-500"
                                            >
                                                <Settings className="w-4 h-4" />
                                                My Account
                                            </Link>
                                            <Link
                                                to="/account/orders"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-500"
                                            >
                                                <Package className="w-4 h-4" />
                                                My Orders
                                            </Link>
                                            <Link
                                                to="/account/wishlist"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-500"
                                            >
                                                <Heart className="w-4 h-4" />
                                                Wishlist
                                            </Link>
                                            {user?.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-500"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <div className="border-t border-neutral-100 mt-2 pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-danger hover:bg-red-50"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/auth/login"
                                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                {isSearchOpen && (
                    <div className="border-t border-neutral-100 py-4 px-4 animate-fade-in">
                        <div className="container mx-auto">
                            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for supplements, vitamins, proteins..."
                                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" className="btn-primary">
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[104px] bg-white z-50 overflow-y-auto animate-fade-in">
                    <nav className="container mx-auto px-4 py-6">
                        <div className="space-y-4">
                            <Link
                                to="/products"
                                onClick={() => dispatch(setMobileMenuOpen(false))}
                                className="block py-3 text-lg font-medium text-neutral-900 border-b border-neutral-100"
                            >
                                All Products
                            </Link>
                            <div className="py-3 border-b border-neutral-100">
                                <p className="text-sm font-semibold text-neutral-400 mb-3">Categories</p>
                                <div className="space-y-2 pl-2">
                                    {categories.slice(0, 6).map((category) => (
                                        <Link
                                            key={category.id}
                                            to={`/products?category=${category.slug}`}
                                            onClick={() => dispatch(setMobileMenuOpen(false))}
                                            className="block py-2 text-neutral-700"
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <Link
                                to="/products?featured=true"
                                onClick={() => dispatch(setMobileMenuOpen(false))}
                                className="block py-3 text-lg font-medium text-neutral-900 border-b border-neutral-100"
                            >
                                Best Sellers
                            </Link>
                            <Link
                                to="/products?new=true"
                                onClick={() => dispatch(setMobileMenuOpen(false))}
                                className="block py-3 text-lg font-medium text-neutral-900 border-b border-neutral-100"
                            >
                                New Arrivals
                            </Link>
                            <Link
                                to="/pages/about"
                                onClick={() => dispatch(setMobileMenuOpen(false))}
                                className="block py-3 text-lg font-medium text-neutral-900 border-b border-neutral-100"
                            >
                                About Us
                            </Link>
                            {!isAuthenticated && (
                                <div className="pt-4">
                                    <Link
                                        to="/auth/login"
                                        onClick={() => dispatch(setMobileMenuOpen(false))}
                                        className="block w-full text-center py-3 bg-primary-500 text-white rounded-lg font-medium"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
