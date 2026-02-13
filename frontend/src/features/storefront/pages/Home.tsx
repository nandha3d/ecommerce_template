import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { shopService } from '../../../services/shopService';
import {
    ArrowRight,
    Zap,
    Target,
    Award,
    ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
    const { data: productsData } = useQuery({
        queryKey: ['featured-products'],
        queryFn: () => shopService.getProducts({ limit: 4 }),
    });

    const featuredProducts = productsData?.data?.data || [];

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                height: '90vh',
                background: 'linear-gradient(135deg, var(--bg-sidebar) 0%, #1e293b 100%)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--space-2xl)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ maxWidth: '800px', zIndex: 1, position: 'relative' }}>
                    <span style={{
                        color: 'var(--primary)',
                        fontWeight: 800,
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        marginBottom: 'var(--space-md)',
                        display: 'block'
                    }}>Precision Formulated</span>
                    <h1 style={{
                        fontSize: '5rem',
                        color: 'white',
                        fontWeight: 900,
                        lineHeight: 1,
                        marginBottom: 'var(--space-xl)',
                        letterSpacing: '-2px'
                    }}>
                        UNLEASH YOUR <span style={{ color: 'var(--primary)' }}>ULTIMATE</span> POTENTIAL.
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '1.25rem',
                        marginBottom: 'var(--space-2xl)',
                        maxWidth: '600px',
                        lineHeight: 1.6
                    }}>
                        Science-backed supplements designed for elite athletes and dedicated warriors. No fillers, no BS. Just pure results.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                        <Link to="/products" className="btn btn-primary" style={{ height: '60px', padding: '0 var(--space-2xl)', fontSize: '1.1rem' }}>
                            Shop All Products
                            <ArrowRight size={20} />
                        </Link>
                        <button className="btn btn-ghost" style={{ height: '60px', padding: '0 var(--space-2xl)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Explore Stacks
                        </button>
                    </div>
                </div>

                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    right: '-10%',
                    top: '10%',
                    width: '60%',
                    height: '80%',
                    background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)'
                }}></div>
            </section>

            {/* Trust Badges */}
            <section style={{ padding: 'var(--space-2xl)', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 'var(--space-2xl)' }}>
                    <div className="flex-center" style={{ gap: 'var(--space-md)' }}>
                        <Award size={32} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Premium Quality</span>
                    </div>
                    <div className="flex-center" style={{ gap: 'var(--space-md)' }}>
                        <Zap size={32} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Fast Metabolism</span>
                    </div>
                    <div className="flex-center" style={{ gap: 'var(--space-md)' }}>
                        <Target size={32} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Proven Results</span>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section style={{ padding: 'var(--space-3xl) var(--space-2xl)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="flex-between" style={{ marginBottom: 'var(--space-3xl)' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem' }}>Top Performance Picks</h2>
                            <p style={{ color: 'var(--text-muted)' }}>The essentials for every serious training regimen.</p>
                        </div>
                        <Link to="/products" className="flex-center" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', gap: 'var(--space-xs)' }}>
                            View All Catalog <ChevronRight size={20} />
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-2xl)' }}>
                        {featuredProducts.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                margin: 'var(--space-3xl) var(--space-2xl)',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--primary)',
                padding: 'var(--space-3xl)',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: 'var(--space-lg)' }}>READY TO JOIN THE ELITE?</h2>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: 'var(--space-2xl)', maxWidth: '700px', margin: '0 auto var(--space-2xl)' }}>
                        Sign up for our newsletter and get 15% off your first order plus exclusive access to new drops.
                    </p>
                    <div className="flex-center" style={{ gap: 'var(--space-md)' }}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            style={{
                                height: '60px',
                                width: '100%',
                                maxWidth: '400px',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                padding: '0 var(--space-xl)',
                                fontSize: '1rem'
                            }}
                        />
                        <button className="btn" style={{
                            height: '60px',
                            backgroundColor: 'var(--bg-sidebar)',
                            color: 'white',
                            padding: '0 var(--space-2xl)',
                            fontWeight: 700
                        }}>
                            Join Now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
