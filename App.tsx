
import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { motion } from 'framer-motion';
import { SplashScreen } from '@capacitor/splash-screen';
import AuthProvider from './providers/AuthProvider';
import AppRoutes from './AppRoutes';

function App() {
  useEffect(() => {
    // Solo en plataformas nativas (iOS/Android)
    if (Capacitor.isNativePlatform()) {
      // Configurar el splash screen cuando la app esté lista
      const initializeSplashScreen = async () => {
        try {
          // La app está lista, ocultar splash screen con animación
          setTimeout(async () => {
            await SplashScreen.hide();
          }, 1000); // Esperar 1 segundo adicional para mostrar la interfaz
        } catch (error) {
          console.error('Error managing splash screen:', error);
        }
      };

      initializeSplashScreen();
    }
  }, []);

  return (
    <AuthProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }} // Pequeño delay post-splash
        className="min-h-screen bg-[#F0F4F8] text-[#1A2E40] font-sans"
      >
        <AppRoutes />
      </motion.div>
    </AuthProvider>
  );
}

export default App;
