import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Demo from './pages/Demo';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

// Route guard: Authenticated users only
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Layout><div dir="rtl" className="min-h-screen flex items-center justify-center">جاري التحميل...</div></Layout>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
}

// Route guard: Admin only
function AdminRoute({ element }: { element: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <Layout><div dir="rtl" className="min-h-screen flex items-center justify-center">جاري التحميل...</div></Layout>;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/features" element={<Layout><FeaturesPage /></Layout>} />
        <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
        <Route path="/demo" element={<Demo />} />

        {/* Auth pages */}
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />
        <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
        <Route path="/forgot-password" element={<Layout><ForgotPasswordPage /></Layout>} />
        <Route path="/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />

        {/* Protected dashboard pages */}
        <Route path="/dashboard/*" element={<ProtectedRoute element={<div dir="rtl" className="min-h-screen">لوحة التحكم (قريباً)</div>} />} />

        {/* Admin pages */}
        <Route path="/admin/*" element={<AdminRoute element={<div dir="rtl" className="min-h-screen">لوحة الإدارة (قريباً)</div>} />} />

        {/* Fallback */}
        <Route path="*" element={<Layout><Home /></Layout>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
