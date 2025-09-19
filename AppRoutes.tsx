
import React from 'react';
import { useAuth } from './hooks/useAuth';
import OnboardingFlow from './features/onboarding/OnboardingFlow';
import Dashboard from './features/dashboard/Dashboard';
import LoginForm from './features/auth/components/LoginForm';
import { Spinner } from './components/Spinner';

const AppRoutes: React.FC = () => {
  const { user, loading, userProfile, profileLoading } = useAuth();

  if (loading || (user && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }
  
  // A simple check for onboarding completion. 
  // In a real app, this might be a specific 'onboardingCompleted' flag.
  if (user && !userProfile?.birthDate) {
    return <OnboardingFlow />;
  }

  return <Dashboard />;
};

export default AppRoutes;
