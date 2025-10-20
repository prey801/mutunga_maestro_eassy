import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import OrderPage from '@/pages/OrderPage';
import SimpleOrderPage from '@/pages/SimpleOrderPage';
import PaymentPage from '@/pages/PaymentPage';
import DashboardPage from '@/pages/DashboardPage';
import DynamicAdminPage from '@/pages/DynamicAdminPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminTestPage from '@/pages/AdminTestPage';
import SimpleAdminDebug from '@/pages/SimpleAdminDebug';
import BasicAdminPage from '@/pages/BasicAdminPage';
import RealDataAdminPage from '@/pages/RealDataAdminPage';
import TestPage from '@/pages/TestPage';
import PaymentPageSimple from '@/pages/PaymentPageSimple';
import EnvTest from '@/pages/EnvTest';
import SupabaseTest from '@/pages/SupabaseTest';
import ChatPage from '@/pages/ChatPage';
import ServicesPage from '@/pages/ServicesPage';
import SamplesPage from '@/pages/SamplesPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ProfilePage from '@/pages/ProfilePage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import ThankYouPage from '@/pages/ThankYouPage';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
        <Helmet>
          <title>Maestro Essays - Professional Academic Writing Services</title>
          <meta name="description" content="Get high-quality academic writing services from expert writers. Custom essays, research papers, and assignments delivered on time with guaranteed quality." />
          <meta property="og:title" content="Maestro Essays - Professional Academic Writing Services" />
          <meta property="og:description" content="Get high-quality academic writing services from expert writers. Custom essays, research papers, and assignments delivered on time with guaranteed quality." />
        </Helmet>
        
        <Routes>
          {/* Standalone test routes without header/footer */}
          <Route path="/supabase-test" element={<SupabaseTest />} />
          <Route path="/env-test" element={<EnvTest />} />
        </Routes>
        
        <Header />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/order" element={<ProtectedRoute><SimpleOrderPage /></ProtectedRoute>} />
            <Route path="/order-old" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><ErrorBoundary><RealDataAdminPage /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin-test" element={<SimpleAdminDebug />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/payment-simple" element={<PaymentPageSimple />} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/samples" element={<SamplesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/profile" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route path="/thankyou" element={<ThankYouPage />} />
          </Routes>
        </main>
        
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;