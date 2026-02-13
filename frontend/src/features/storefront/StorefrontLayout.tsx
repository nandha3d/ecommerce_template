import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    Search,
    User,
    ShoppingCart,
    Menu,
    X,
    Instagram,
    Twitter,
    Facebook,
    ChevronRight
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store';
import { toggleCart } from '../../store/cartSlice';
import CartDrawer from './components/CartDrawer';

const StorefrontLayout: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const { items } = useSelector((state: RootState) => state.cart);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Navbar */}
            <nav
                className={isScrolled ? 'glass' : ''}
                style={{
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 var(--space-2xl)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backgroundColor: isScrolled ? 'rgba(255,255,255,0.8)' : 'transparent',
                    transition: 'var(--transition)',
                    borderBottom: isScrolled ? '1px solid var(--border)' : 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2xl)' }}>
                    <Link to="/" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', textDecoration: 'none', letterSpacing: '-1px' }}>
                        ShopKart
                    </Link>

                    <div style={{ display: 'none', gap: 'var(--space-xl)', marginLeft: 'var(--space-xl)' }} className="desktop-menu">
                        {['Home', 'Products', 'Stacks', 'Supplements'].map((item) => (
                            <Link
                                key={item}
                                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                style={{
                                    textDecoration: 'none',
                                    color: 'var(--text-main)',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    opacity: 0.8
                                }}
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
                    <button className="btn-ghost" style={{ padding: 'var(--space-sm)' }}><Search size={22} /></button>
                    <button className="btn-ghost" style={{ padding: 'var(--space-sm)' }}><User size={22} /></button>
                    <button
                        onClick={() => dispatch(toggleCart())}
                        className="btn-ghost"
                        style={{ padding: 'var(--space-sm)', position: 'relative' }}
                    >
                        <ShoppingCart size={22} />
                        {items.length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                fontSize: '10px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {items.length}
                            </span>
                        )}
                    </button>

                    <button
                        className="mobile-toggle btn-ghost"
                        style={{ display: isMobileMenuOpen ? 'block' : 'none' }}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>

            <CartDrawer />

            {/* Footer */}
            <footer style={{ backgroundColor: 'var(--bg-sidebar)', color: 'white', padding: 'var(--space-3xl) var(--space-2xl) var(--space-xl)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-2xl)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>ShopKart</span>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>The ultimate destination for premium performance supplements. Quality tested, athlete approved.</p>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <Instagram size={20} style={{ cursor: 'pointer', opacity: 0.8 }} />
                            <Twitter size={20} style={{ cursor: 'pointer', opacity: 0.8 }} />
                            <Facebook size={20} style={{ cursor: 'pointer', opacity: 0.8 }} />
                        </div>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: 'var(--space-xl)', fontSize: '1.2rem' }}>Quick Links</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', listStyle: 'none', color: 'rgba(255,255,255,0.6)' }}>
                            <li><Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>All Products</Link></li>
                            <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Our Story</Link></li>
                            <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Support Center</Link></li>
                            <li><Link to="/shipping" style={{ color: 'inherit', textDecoration: 'none' }}>Shipping Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: 'var(--space-xl)', fontSize: '1.2rem' }}>Newsletter</h4>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 'var(--space-lg)' }}>Join 50k+ athletes for exclusive drops and science-backed tips.</p>
                        <div className="flex-center" style={{ gap: 'var(--space-sm)', backgroundColor: 'rgba(255,255,255,0.1)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}>
                            <input type="email" placeholder="Enter your email" style={{ background: 'none', border: 'none', outline: 'none', color: 'white', flex: 1, padding: '0 var(--space-sm)' }} />
                            <button className="btn btn-primary" style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-sm)' }}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 'var(--space-3xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                    &copy; 2026 ShopKart. All rights reserved. Precision formulated for the dedicated athlete.
                </div>
            </footer>

            <style>{`
        @media (min-width: 768px) {
          .desktop-menu { display: flex !important; }
        }
        @media (max-width: 767px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
        </div>
    );
};

export default StorefrontLayout;
