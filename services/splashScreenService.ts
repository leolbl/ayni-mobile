import { SplashScreen } from '@capacitor/splash-screen';

export class SplashScreenManager {
  static async showWithAnimation() {
    try {
      // Mostrar splash screen
      await SplashScreen.show({
        showDuration: 3000,
        fadeInDuration: 200,
        fadeOutDuration: 200,
        autoHide: true,
      });
    } catch (error) {
      console.error('Error showing splash screen:', error);
    }
  }

  static async hide() {
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  }

  static async showWithCustomAnimation() {
    try {
      // Mostrar splash por 2 segundos primero
      await SplashScreen.show({
        showDuration: 2000,
        fadeInDuration: 300,
        fadeOutDuration: 500,
        autoHide: false,
      });

      // Después de 2 segundos, iniciar la animación de salida
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 2000);
    } catch (error) {
      console.error('Error in custom splash animation:', error);
    }
  }
}