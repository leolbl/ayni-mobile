import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signInAsGuest: (profileData: Partial<UserProfile>) => void;
  signOut: () => void;
  updateUserProfile: (newProfileData: Partial<UserProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  profileLoading: true,
  signInAsGuest: (_profileData: Partial<UserProfile>) => {},
  signOut: () => {},
  updateUserProfile: async (_newProfileData: Partial<UserProfile>) => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // Para pruebas sin backend, iniciamos el estado de carga como `false`.
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Se ha comentado el `useEffect` que usa `onAuthStateChanged` de Firebase.
  // Esto evita que Firebase intente restaurar una sesión automáticamente,
  // dándonos control total sobre el estado de autenticación para las pruebas.
  // La app ahora solo funcionará con "Iniciar como Invitado" y el cierre de sesión simulado.
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, ...);
  //   return () => unsubscribe();
  // }, []);

  const signInAsGuest = (profileData: Partial<UserProfile>) => {
    const guestUID = 'guest-' + new Date().getTime();
    const guestName = profileData.name || 'Invitado';

    const mockUser: User = {
      uid: guestUID,
      email: `${guestName.toLowerCase().replace(/\s/g, '.')}@aynisalud.invitado`,
      displayName: guestName,
      emailVerified: true,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      providerId: 'guest',
    } as User;

    const mockProfile: UserProfile = {
      userId: guestUID,
      email: mockUser.email!,
      name: guestName,
      birthDate: profileData.birthDate || '1990-01-01',
      sex: profileData.sex || 'other',
      height: profileData.height || 170,
      weight: profileData.weight || 70,
      chronicConditions: profileData.chronicConditions || ['Ninguna'],
      allergies: profileData.allergies || ['Ninguna'],
      surgeriesOrPastIllnesses: profileData.surgeriesOrPastIllnesses || ['Ninguna'],
      medicationsAndSupplements: profileData.medicationsAndSupplements || ['Ninguno'],
      smokingStatus: profileData.smokingStatus || 'never',
      alcoholConsumption: profileData.alcoholConsumption || 'none',
      exerciseFrequency: profileData.exerciseFrequency || 'rarely',
      drugConsumption: profileData.drugConsumption || 'prefer_not_to_say',
      onboardingCompleted: true, // Omitir el onboarding completo para invitados
    };
    
    setUser(mockUser);
    setUserProfile(mockProfile);
    setLoading(false);
    setProfileLoading(false);
  };

  const signOut = () => {
    // Para fines de prueba sin backend, simplemente limpiamos el estado del usuario.
    // Esto provocará la redirección a la pantalla de login.
    setUser(null);
    setUserProfile(null);
    // Originalmente, esto llamaría a auth.signOut() de Firebase.
  };

  const updateUserProfile = async (newProfileData: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      console.error("No hay usuario o perfil para actualizar");
      return;
    }

    const updatedProfile = { ...userProfile, ...newProfileData };
    
    // Actualización optimista del estado local para una UX más fluida
    setUserProfile(updatedProfile);

    // Si es un usuario real, persistir en Firestore
    if (!user.uid.startsWith('guest-')) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, newProfileData);
      } catch (error) {
        console.error("Fallo al actualizar el perfil en Firestore:", error);
        // Si la actualización falla, revertir la actualización optimista
        setUserProfile(userProfile); 
        alert("Hubo un error al actualizar tu perfil.");
      }
    }
  };


  const value = { user, userProfile, loading, profileLoading, signInAsGuest, signOut, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;