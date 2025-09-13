import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Mail, Phone, MapPin } from 'lucide-react';

const SocialIcon = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400 cursor-pointer transition-colors">
        {children}
    </a>
);

const Footer = () => {
    return (
        <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-sky-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center">
                                <PenTool className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold">Maestro</span>
                                <span className="text-sm text-sky-300 -mt-1">Essays</span>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your trusted partner for high-quality academic writing services. We deliver excellence in every assignment with professional writers and guaranteed satisfaction.
                        </p>
                        <div className="flex space-x-4">
                            <SocialIcon href="https://instagram.com">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </SocialIcon>
                            <SocialIcon href="https://tiktok.com">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h4v4"></path><path d="M14.5 9.5a5 5 0 0 0-5 5v3h-3a2 2 0 0 1 2-2V9a2 2 0 0 1 2-2h4"></path><path d="M18 13a4 4 0 0 0-4-4V5"></path></svg>
                            </SocialIcon>
                            <SocialIcon href="https://x.com">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>
                            </SocialIcon>
                            <SocialIcon href="https://snapchat.com">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1.67C9.33 1.67 7.33 3.67 7.33 6.33V7.33c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-2.66-2-4.66-4.67-4.66zM4.33 9.33H2v6h2.33V9.33zm15.34 0H22v6h-2.33V9.33zM7.33 16.33c0 2.21 1.79 4 4 4h2c2.21 0 4-1.79 4-4v-4H7.33v4z"></path></svg>
                            </SocialIcon>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <span className="text-lg font-semibold text-sky-300">Quick Links</span>
                        <div className="flex flex-col space-y-2">
                            <Link to="/" className="text-gray-300 hover:text-sky-400 transition-colors text-sm">Home</Link>
                            <Link to="/order" className="text-gray-300 hover:text-sky-400 transition-colors text-sm">Order Now</Link>
                            <Link to="/chat" className="text-gray-300 hover:text-sky-400 transition-colors text-sm">Live Chat</Link>
                            <Link to="/services" className="text-gray-300 hover:text-sky-400 transition-colors text-sm cursor-pointer">Our Services</Link>
                            <Link to="/#how-to-order" className="text-gray-300 hover:text-sky-400 transition-colors text-sm cursor-pointer">How to Order</Link>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <span className="text-lg font-semibold text-sky-300">Our Services</span>
                        <div className="flex flex-col space-y-2">
                            <span className="text-gray-300 text-sm">Essay Writing</span>
                            <span className="text-gray-300 text-sm">Research Papers</span>
                            <span className="text-gray-300 text-sm">Dissertations</span>
                            <span className="text-gray-300 text-sm">Case Studies</span>
                            <span className="text-gray-300 text-sm">Term Papers</span>
                            <span className="text-gray-300 text-sm">Thesis Writing</span>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <span className="text-lg font-semibold text-sky-300">Contact Us</span>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-sky-400" />
                                <span className="text-gray-300 text-sm">support@maestroessays.com</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-sky-400" />
                                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-sky-400" />
                                <span className="text-gray-300 text-sm">24/7 Online Support</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} Maestro Essays. All rights reserved. | Privacy Policy | Terms of Service
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;