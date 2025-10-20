import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, PenTool, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      // Multiple hardcoded admin checks
      if (user.email === 'musyokibrian@gmail.com' || 
          user.email === 'musyokibrian047@gmail.com') {
        setIsAdmin(true);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle missing records
        
        if (error) {
          console.warn('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          // If no profile exists, data will be null
          setIsAdmin(data?.is_admin || false);
        }
      } catch (error) {
        console.warn('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Our Services', href: '/services' },
    { name: 'Order Now', href: '/order' },
    { name: 'Blog', href: '/blog' },
  ];

  const handleSignOut = async () => {
    await signOut();
    // You might want to navigate to home page after sign out
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient">Maestro</span>
              <span className="text-sm text-sky-600 font-medium -mt-1">Essays</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? 'text-sky-600'
                    : 'text-gray-700 hover:text-sky-600'
                }`}
              >
                {item.name}
                {location.pathname === item.href && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-600"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link to="/admin" className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/admin'
                      ? 'text-sky-600'
                      : 'text-gray-700 hover:text-sky-600'
                  }`}>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                  {location.pathname === '/admin' && (
                    <motion.div
                      layoutId="activeTabAdmin"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
                <Link to="/admin/users" className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/admin/users'
                      ? 'text-sky-600'
                      : 'text-gray-700 hover:text-sky-600'
                  }`}>
                  Users
                  {location.pathname === '/admin/users' && (
                    <motion.div
                      layoutId="activeTabUsers"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button asChild variant="ghost">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-sky-200"
          >
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === item.href
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-gray-700 hover:text-sky-600 hover:bg-sky-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        location.pathname === '/admin'
                          ? 'text-sky-600 bg-sky-50'
                          : 'text-gray-700 hover:text-sky-600 hover:bg-sky-50'
                      }`}>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </div>
                  </Link>
                  <Link to="/admin/users" onClick={() => setIsMenuOpen(false)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        location.pathname === '/admin/users'
                          ? 'text-sky-600 bg-sky-50'
                          : 'text-gray-700 hover:text-sky-600 hover:bg-sky-50'
                      }`}>
                    Admin Users
                  </Link>
                </>
              )}
              <div className="border-t my-2"></div>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-sky-600 hover:bg-sky-50">Dashboard</Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-sky-600 hover:bg-sky-50">Profile</Link>
                  <Button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="mt-2 text-white">Sign Out</Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-sky-600 hover:bg-sky-50">
                    Login
                  </Link>
                  <Button asChild className="mt-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white">
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
};

export default Header;