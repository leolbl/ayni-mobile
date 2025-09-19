
import React from 'react';
import AuthProvider from './providers/AuthProvider';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F0F4F8] text-[#1A2E40] font-sans">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
