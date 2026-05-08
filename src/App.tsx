/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ConsultationWidget from './components/common/ConsultationWidget';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Apply from './pages/Apply';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Tracking from './pages/Tracking';
import AgentDashboard from './pages/Agent';
import { AuthProvider } from './components/common/AuthProvider';
import ReferralTracker from './components/common/ReferralTracker';
import ScrollToTop from './components/common/ScrollToTop';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <ReferralTracker />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/referrals" element={<AgentDashboard />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
            </Routes>
          </main>
          <Footer />
          <ConsultationWidget />
        </div>
      </AuthProvider>
    </Router>
  );
}
