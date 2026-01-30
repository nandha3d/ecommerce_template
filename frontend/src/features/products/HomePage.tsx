import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Award, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useStoreLayoutSettings } from '../../storeLayout/StoreLayoutProvider';
import { fetchFeaturedProducts, fetchBestSellers, fetchNewArrivals, fetchCategories } from '../../store/slices/productSlice';
import { ProductCard } from '../../components/layout';
import { Button, Loader } from '../../components/ui';

const HomePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { settings } = useStoreLayoutSettings();
    const layoutVariant = settings.home;
    const { featuredProducts, bestSellers, newArrivals, categories, isLoading } = useAppSelector(
        (state) => state.products
    );

    useEffect(() => {
        dispatch(fetchFeaturedProducts());
        dispatch(fetchBestSellers());
        dispatch(fetchNewArrivals());
        dispatch(fetchCategories());
    }, [dispatch]);

    const goals = [
        { id: 1, name: 'Muscle Gain', icon: '💪', slug: 'muscle-gain', color: 'from-blue-500 to-blue-700' },
        { id: 2, name: 'Weight Loss', icon: '🔥', slug: 'weight-loss', color: 'from-red-500 to-orange-500' },
        { id: 3, name: 'Energy Boost', icon: '⚡', slug: 'energy', color: 'from-yellow-500 to-orange-500' },
        { id: 4, name: 'Wellness', icon: '🌿', slug: 'wellness', color: 'from-green-500 to-emerald-600' },
        { id: 5, name: 'Recovery', icon: '🏋️', slug: 'recovery', color: 'from-purple-500 to-violet-600' },
        { id: 6, name: 'Immunity', icon: '🛡️', slug: 'immunity', color: 'from-cyan-500 to-blue-600' },
    ];

    const sectionOrder = (() => {
        switch (layoutVariant) {
            case 2:
                return {
                    hero: 1,
                    featured: 2,
                    bestSellers: 3,
                    goals: 4,
                    categories: 5,
                    newArrivals: 6,
                    trust: 7,
                    newsletter: 8,
                };
            case 3:
                return {
                    hero: 1,
                    goals: 2,
                    categories: 3,
                    featured: 4,
                    newArrivals: 5,
                    bestSellers: 6,
                    trust: 7,
                    newsletter: 8,
                };
            case 4:
                return {
                    hero: 1,
                    trust: 2,
                    featured: 3,
                    categories: 4,
                    bestSellers: 5,
                    newArrivals: 6,
                    goals: 7,
                    newsletter: 8,
                };
            case 5:
                return {
                    hero: 1,
                    featured: 2,
                    goals: 3,
                    categories: 4,
                    bestSellers: 5,
                    trust: 6,
                    newArrivals: 7,
                    newsletter: 8,
                };
            case 1:
            default:
                return {
                    hero: 1,
                    goals: 2,
                    featured: 3,
                    categories: 4,
                    bestSellers: 5,
                    trust: 6,
                    newArrivals: 7,
                    newsletter: 8,
                };
        }
    })();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <section className="gradient-hero relative overflow-hidden" style={{ order: sectionOrder.hero }}>
                <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-white">
                            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                                🎉 Free Shipping on Orders Over $50
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
                                Fuel Your Body.
                                <br />
                                <span className="text-primary-500">Achieve Your Goals.</span>
                            </h1>
                            <p className="text-lg text-white/80 mb-8 max-w-lg">
                                Premium supplements backed by science. From protein powders to vitamins,
                                we have everything you need to reach your peak performance.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/products">
                                    <Button size="lg" className="bg-white text-primary-900 hover:bg-white/90">
                                        Shop Now
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/pages/about">
                                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="hidden md:block relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent rounded-3xl" />
                            <img
                                src="/hero-supplements.png"
                                alt="Premium Supplements"
                                className="w-full max-w-lg mx-auto animate-float"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600';
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
            </section>

            {/* Goals Section */}
            <section className="py-16 bg-white" style={{ order: sectionOrder.goals }}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-900 mb-4">
                            What's Your Goal?
                        </h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto">
                            Whether you're looking to build muscle, lose weight, or boost your overall wellness,
                            we have the perfect supplements for you.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {goals.map((goal) => (
                            <Link
                                key={goal.id}
                                to={`/products?goal=${goal.slug}`}
                                className="group text-center p-6 rounded-2xl bg-neutral-50 hover:shadow-lg transition-all duration-300"
                            >
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                                    {goal.icon}
                                </div>
                                <h3 className="font-semibold text-neutral-900 group-hover:text-primary-500 transition-colors">
                                    {goal.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 section-light" style={{ order: sectionOrder.featured }}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-primary-900">
                                Featured Products
                            </h2>
                            <p className="text-neutral-600 mt-2">Hand-picked supplements for maximum results</p>
                        </div>
                        <Link to="/products?featured=true" className="hidden md:flex items-center gap-2 text-primary-500 font-medium hover:gap-3 transition-all">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader size="lg" text="Loading products..." />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(featuredProducts || []).slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                    <div className="mt-8 text-center md:hidden">
                        <Link to="/products?featured=true">
                            <Button variant="outline">View All Featured</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 bg-white" style={{ order: sectionOrder.categories }}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-900 mb-4">
                            Shop by Category
                        </h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto">
                            Explore our wide range of supplement categories
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {(categories || []).slice(0, 8).map((category) => (
                            <Link
                                key={category.id}
                                to={`/products?category=${category.slug}`}
                                className="relative group overflow-hidden rounded-2xl aspect-square"
                            >
                                <img
                                    src={category.image || `https://source.unsplash.com/400x400/?${category.name},supplements`}
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-white font-bold text-lg mb-1">{category.name}</h3>
                                    <p className="text-white/70 text-sm">{category.product_count || 0} products</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Best Sellers */}
            <section className="py-16 bg-white" style={{ order: sectionOrder.bestSellers }}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-primary-900">
                                Best Sellers
                            </h2>
                            <p className="text-neutral-600 mt-2">Our most popular products loved by thousands</p>
                        </div>
                        <Link to="/products?sort_by=popularity" className="hidden md:flex items-center gap-2 text-primary-500 font-medium hover:gap-3 transition-all">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(bestSellers || []).slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-16 section-dark" style={{ order: sectionOrder.trust }}>
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                                <Award className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-white mb-2">Premium Quality</h3>
                            <p className="text-white/70 text-sm">Lab-tested and certified ingredients</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                                <Zap className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-white mb-2">Fast Results</h3>
                            <p className="text-white/70 text-sm">Feel the difference within weeks</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                                <Shield className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-white mb-2">Safe & Natural</h3>
                            <p className="text-white/70 text-sm">No harmful additives or fillers</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-white mb-2">Science Backed</h3>
                            <p className="text-white/70 text-sm">Formulas based on research</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="py-16 bg-white" style={{ order: sectionOrder.newArrivals }}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-primary-900">
                                New Arrivals
                            </h2>
                            <p className="text-neutral-600 mt-2">Check out our latest products</p>
                        </div>
                        <Link to="/products?sort_by=newest" className="hidden md:flex items-center gap-2 text-primary-500 font-medium hover:gap-3 transition-all">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(newArrivals || []).slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-500" style={{ order: sectionOrder.newsletter }}>
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        Subscribe & Save 10%
                    </h2>
                    <p className="text-white/80 max-w-xl mx-auto mb-8">
                        Join our newsletter to get exclusive deals, new product alerts, and wellness tips delivered to your inbox.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <Button className="bg-white text-primary-700 hover:bg-white/90">
                            Subscribe
                        </Button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
