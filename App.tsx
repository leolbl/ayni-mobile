
import React from 'react';
import AuthProvider from './providers/AuthProvider';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
