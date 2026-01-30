import React from 'react';
import { Link } from 'react-router-dom';
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Truck,
    Shield,
    Headphones
} from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-primary-900 text-white">
            {/* Trust Badges */}
            <div className="border-b border-white/10">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                <Truck className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Free Shipping</h4>
                                <p className="text-sm text-neutral-400">On orders over $50</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Secure Payments</h4>
                                <p className="text-sm text-neutral-400">100% secure checkout</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Money Back</h4>
                                <p className="text-sm text-neutral-400">30-day guarantee</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                <Headphones className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold">24/7 Support</h4>
                                <p className="text-sm text-neutral-400">Dedicated help center</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-xl font-display font-bold">SupplePro</span>
                        </div>
                        <p className="text-neutral-400 mb-6 leading-relaxed">
                            Your trusted source for premium supplements. We're committed to helping you achieve your health and fitness goals with quality products.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-display font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/products" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?featured=true" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    Best Sellers
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?new=true" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    New Arrivals
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?sale=true" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    Special Offers
                                </Link>
                            </li>
                            <li>
                                <Link to="/pages/about" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/pages/contact" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-display font-bold text-lg mb-6">Customer Service</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/account" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link to="/account/orders" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link to="/pages/shipping" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link to="/pages/returns" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link to="/pages/faq" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link to="/pages/privacy" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-display font-bold text-lg mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                <span className="text-neutral-400">
                                    123 Supplement Street<br />
                                    Health City, HC 12345
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                <a href="tel:+18005877536" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    1-800-SUPPLEMENTS
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                <a href="mailto:support@supplepro.com" className="text-neutral-400 hover:text-primary-500 transition-colors">
                                    support@supplepro.com
                                </a>
                            </li>
                        </ul>

                        {/* Newsletter */}
                        <div className="mt-6">
                            <h4 className="font-semibold mb-3">Subscribe to Newsletter</h4>
                            <form className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-primary-500 rounded-lg font-medium hover:bg-primary-700 transition-colors">
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-neutral-400 text-sm text-center md:text-left">
                            © {currentYear} SupplePro. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link to="/pages/terms" className="text-sm text-neutral-400 hover:text-primary-500 transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/pages/privacy" className="text-sm text-neutral-400 hover:text-primary-500 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/pages/cookies" className="text-sm text-neutral-400 hover:text-primary-500 transition-colors">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
