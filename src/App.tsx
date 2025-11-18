import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { BranchSelection } from './components/BranchSelection';
import { OTPVerification } from './components/OTPVerification';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { BranchManagement } from './components/BranchManagement';
import { MenuManagement } from './components/MenuManagement';
import { OrderManagement } from './components/OrderManagement';
import { POSSystem } from './components/POSSystem';
import { TablesReservations } from './components/TablesReservations';
import { InventoryManagement } from './components/InventoryManagement';
import { StaffManagement } from './components/StaffManagement';
import { CustomerManagement } from './components/CustomerManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { Settings } from './components/Settings';
import FinanceManagement from './components/FinanceManagement';
import { Toaster } from './components/ui/sonner';
import { PWAInstallPrompt } from './components/mobile/PWAInstallPrompt';
import { OnlineStatus } from './components/mobile/OnlineStatus';
import { initializePWA } from './utils/pwa';

type AuthScreen = 'landing' | 'login' | 'signup' | 'forgot-password' | 'reset-password';

function AppContent() {
  const { isAuthenticated, user, tempUser, selectedBranchId } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('landing');

  // Check if user needs 2FA verification
  if (tempUser && !isAuthenticated) {
    return <OTPVerification />;
  }

  // Check if user needs to select a branch (multi-branch managers)
  // Only show branch selection if:
  // 1. User is authenticated
  // 2. User is a manager or admin without a specific branchId
  // 3. No branch has been selected yet
  if (
    isAuthenticated &&
    user &&
    (user.role === 'admin' || user.role === 'manager') &&
    !user.branchId &&
    !selectedBranchId
  ) {
    return <BranchSelection />;
  }

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    switch (authScreen) {
      case 'landing':
        return <LandingPage onGetStarted={() => setAuthScreen('login')} />;
      case 'login':
        return (
          <LoginForm
            onBackToHome={() => setAuthScreen('landing')}
            onForgotPassword={() => setAuthScreen('forgot-password')}
            onSignup={() => setAuthScreen('signup')}
          />
        );
      case 'signup':
        return (
          <SignupForm
            onBackToHome={() => setAuthScreen('landing')}
            onLogin={() => setAuthScreen('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPassword
            onBackToLogin={() => setAuthScreen('login')}
          />
        );
      case 'reset-password':
        return (
          <ResetPassword
            token="demo-token" // In real app, get this from URL params
            onBackToLogin={() => setAuthScreen('login')}
          />
        );
      default:
        return <LandingPage onGetStarted={() => setAuthScreen('login')} />;
    }
  }

  // Render main application
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'branches':
        return <BranchManagement />;
      case 'menu':
        return <MenuManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'pos':
        return <POSSystem />;
      case 'tables':
        return <TablesReservations />;
      case 'inventory':
        return <InventoryManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'finance':
        return <FinanceManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize PWA features
    initializePWA();
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <OnlineStatus />
        <AppContent />
        <PWAInstallPrompt />
        <Toaster position="top-right" />
      </AppProvider>
    </AuthProvider>
  );
}
