import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Demo from './pages/Demo';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/features" element={<Layout><FeaturesPage /></Layout>} />
        <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        {/* الدعوة التجريبية — تجربة مستقلة بملء الشاشة */}
        <Route path="/demo" element={<Demo />} />
        <Route path="*" element={<Layout><Home /></Layout>} />
      </Routes>
    </>
  );
}
