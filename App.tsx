import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import ProtectedRoute from './components/ProtectedRoute';
import PurchaseCreditsPage from './components/pages/PurchaseCreditsPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import PurchaseSuccessPage from './components/pages/PurchaseSuccessPage';
import PurchaseCancelPage from './components/pages/PurchaseCancelPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route 
          index 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="purchase-credits" 
          element={
            <ProtectedRoute>
              <PurchaseCreditsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="purchase-success"
          element={
            <ProtectedRoute>
              <PurchaseSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="purchase-cancel"
          element={
            <ProtectedRoute>
              <PurchaseCancelPage />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="terms-of-service" element={<TermsOfServicePage />} />
      </Route>
    </Routes>
  );
};

export default App;