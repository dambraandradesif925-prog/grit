import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import LoanDetail from './pages/LoanDetail';
import OnlineApply from './pages/OnlineApply';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Ordinance from './pages/Ordinance';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-55" id="app-root-layout">
          {/* Header */}
          <Header />

          {/* Main Workspace content */}
          <main className="flex-grow" id="app-main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/loan/:slug" element={<LoanDetail />} />
              <Route path="/online" element={<OnlineApply />} />
              <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
              <Route path="/Termsofuse" element={<TermsOfUse />} />
              <Route path="/MoneyLendersOrdinance" element={<Ordinance />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
