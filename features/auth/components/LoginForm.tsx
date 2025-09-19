import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { Spinner } from '../../../components/Spinner';
import GuestOnboarding from './GuestOnboarding';


// --- Componente Principal de Inicio de Sesión ---
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.99,35.53,44,29.891,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const GuestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" />
    </svg>
);

const LoginForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuestOnboarding, setShowGuestOnboarding] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (err: any) {
        setError(err.message.replace('Firebase: ', ''));
    } finally {
        setLoading(false);
    }
  }
  
  const handleGuestSignIn = () => {
    setError('');
    setShowGuestOnboarding(true);
  };
  
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4 relative">
          {/* Espacio para el logo en la parte superior del panel */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
              {/* Aquí irá tu logo en PNG */}
              <img 
                src="./../../assets/logo.png" 
                alt="AyniSalud Logo" 
                className="w-12 h-12 object-contain"
                // Comentar la línea de arriba y descomentar la de abajo cuando tengas el logo
                // style={{ display: 'none' }}
              />
            </div>
          </div>
          
          <div className="text-center pt-4">
              <h1 className="text-3xl font-bold text-slate-800">AyniSalud</h1>
              <p className="text-slate-500 mt-2">{isLogin ? 'Bienvenido/a de nuevo, cuídate.' : 'Crea tu cuenta de salud.'}</p>
          </div>
          
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</p>}
          
          <form onSubmit={handleAuthAction} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600" htmlFor="email">Correo Electrónico</label>
              <input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="tu@ejemplo.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600" htmlFor="password">Contraseña</label>
              <input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
                className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-400 transition-colors"
            >
              {loading ? <Spinner /> : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </form>

          <div className="relative">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-slate-500">O continúa con</span>
              </div>
          </div>

          <div className="space-y-4">
              <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex justify-center items-center bg-white text-slate-700 font-medium py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-60 transition-colors"
              >
                  <GoogleIcon />
                  Iniciar sesión con Google
              </button>
              <button 
                  onClick={handleGuestSignIn}
                  disabled={loading}
                  className="w-full flex justify-center items-center bg-white text-slate-700 font-medium py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-60 transition-colors"
              >
                  <GuestIcon />
                  Continuar como Invitado
              </button>
          </div>

          <p className="text-sm text-center text-slate-500">
            {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-cyan-600 hover:underline">
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </p>
        </div>
      </div>
      {showGuestOnboarding && (
        <GuestOnboarding onClose={() => setShowGuestOnboarding(false)} />
      )}
    </>
  );
};

export default LoginForm;