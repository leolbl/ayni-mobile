import { Capacitor } from '@capacitor/core';

interface AppConfig {
  geminiApiKey: string;
  isNative: boolean;
  platform: 'web' | 'android' | 'ios';
}

const getConfig = (): AppConfig => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform() as 'web' | 'android' | 'ios';
  
  let geminiApiKey: string;
  
  if (isNative) {
    // Para APK/móvil - hardcodeamos la API key aquí
    // IMPORTANTE: Cambia esta por tu API key real de Gemini
    geminiApiKey = 'AIzaSyC-QAFQ_7TeIs57Ngo1CB1eFsL-Hom7kL0';
    
    // Alternativamente, podrías usar capacitor-preferences para almacenar la key
    // pero para simplicidad, la hardcodeamos aquí
  } else {
    // Para web/Vercel - usar variable de entorno
    geminiApiKey = process.env.GEMINI_API_KEY || '';
  }
  
  return {
    geminiApiKey,
    isNative,
    platform
  };
};

export default getConfig;