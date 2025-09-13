import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import OrderPage from '@/pages/OrderPage';
import AdminPage from '@/pages/AdminPage';
import ChatPage from '@/pages/ChatPage';
import ServicesPage from '@/pages/ServicesPage';
import SamplesPage from '@/pages/SamplesPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ProfilePage from '@/pages/ProfilePage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import ThankYouPage from '@/pages/ThankYouPage';

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
        
        <Header />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/order" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/samples" element={<SamplesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
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