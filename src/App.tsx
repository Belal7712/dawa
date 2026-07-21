import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Demo from './pages/Demo';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import EventsPage from './pages/dashboard/EventsPage';
import EventFormPage from './pages/dashboard/EventFormPage';
import EventDetailPage from './pages/dashboard/EventDetailPage';
import InviteStubPage from './pages/InviteStubPage';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';
import SettingsPage from './pages/dashboard/SettingsPage';
import PrivacyPage from './pages/legal/PrivacyPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* Marketing — intact */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/features" element={<Layout><FeaturesPage /></Layout>} />
        <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/invite/:token" element={<InviteStubPage />} />

        {/* Public auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHomePage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/new" element={<EventFormPage />} />
            <Route path="events/:id/edit" element={<EventFormPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPlaceholder />} />
        </Route>

        <Route path="*" element={<Layout><Home /></Layout>} />
      </Routes>
    </AuthProvider>
  );
}
