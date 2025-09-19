import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { UserProfile } from '../../types';
import { ProgressBar } from '../../components/ProgressBar';
import { Spinner } from '../../components/Spinner';

const STEPS = [
  { id: 1, title: "Conozcámonos" },
  { id: 2, title: "Antecedentes Médicos" },
  { id: 3, title: "Alergias" },
  { id: 4, title: "Confirmación" },
];

const CHRONIC_CONDITIONS = [
    'Hipertensión', 'Diabetes', 'Asma', 'Enfermedad Cardíaca', 'Enfermedad Renal', 'Artritis', 'Ninguna'
];
const ALLERGIES = [
    'Polen', 'Ácaros del polvo', 'Moho', 'Penicilina', 'Cacahuetes', 'Mariscos', 'Ninguna'
];

const translateSex = (sex: 'male' | 'female' | 'other' | undefined): string => {
    if (sex === 'male') return 'Masculino';
    if (sex === 'female') return 'Femenino';
    if (sex === 'other') return 'Otro';
    return 'No especificado';
};


const OnboardingFlow: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: user?.displayName || '',
    birthDate: '',
    sex: undefined,
    height: 170,
    weight: 70,
    chronicConditions: [],
    allergies: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChipToggle = (field: 'chronicConditions' | 'allergies', value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const finalProfile: UserProfile = {
        userId: user.uid,
        email: user.email!,
        name: formData.name!,
        birthDate: formData.birthDate!,
        sex: formData.sex!,
        height: Number(formData.height),
        weight: Number(formData.weight),
        chronicConditions: formData.chronicConditions!,
        allergies: formData.allergies!,
        onboardingCompleted: true,
        // Añadir propiedades faltantes para satisfacer el tipo UserProfile.
        // Este onboarding simplificado no recopila estos datos, por lo que proporcionamos arrays vacíos por defecto.
        surgeriesOrPastIllnesses: [],
        medicationsAndSupplements: [],
      };

      await setDoc(doc(db, 'users', user.uid), finalProfile);
      // El AuthProvider recogerá automáticamente el nuevo perfil y redirigirá al panel de control
      // por lo que no es necesario un window.location.reload()
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Hubo un error al guardar tu perfil. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 text-center">Bienvenido/a a AyniSalud</h1>
        <p className="text-slate-500 text-center mt-2 mb-8">Vamos a configurar tu perfil de salud para obtener información personalizada.</p>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <ProgressBar progress={progress} />
          <h2 className="text-2xl font-semibold text-cyan-700 mt-6 mb-2">{STEPS[currentStep - 1].title}</h2>
          <p className="text-slate-500 mb-6">Paso {currentStep} de {STEPS.length}</p>

          <div className="space-y-6">
            {currentStep === 1 && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Fecha de Nacimiento</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Sexo Biológico</label>
                            <select name="sex" value={formData.sex} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-white">
                                <option value="">Seleccionar...</option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Altura (cm)</label>
                            <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Peso (kg)</label>
                            <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                    </div>
                </>
            )}
            {currentStep === 2 && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">¿Tienes alguna de las siguientes condiciones crónicas?</label>
                    <div className="flex flex-wrap gap-2">
                        {CHRONIC_CONDITIONS.map(condition => (
                            <button key={condition} onClick={() => handleChipToggle('chronicConditions', condition)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.chronicConditions?.includes(condition) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                {condition}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {currentStep === 3 && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">¿Tienes alguna alergia conocida?</label>
                    <div className="flex flex-wrap gap-2">
                        {ALLERGIES.map(allergy => (
                            <button key={allergy} onClick={() => handleChipToggle('allergies', allergy)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.allergies?.includes(allergy) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                {allergy}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {currentStep === 4 && (
                <div className="space-y-4 text-slate-700">
                    <h3 className="text-xl font-semibold mb-4">Por favor, confirma tu información</h3>
                    <p><strong>Nombre:</strong> {formData.name}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {formData.birthDate}</p>
                    <p><strong>Sexo:</strong> {translateSex(formData.sex)}</p>
                    <p><strong>Condiciones:</strong> {formData.chronicConditions?.join(', ') || 'Ninguna'}</p>
                    <p><strong>Alergias:</strong> {formData.allergies?.join(', ') || 'Ninguna'}</p>
                    <p className="text-sm text-slate-500 mt-4">Esta información nos ayuda a proporcionar un análisis más preciso. Puedes actualizarla más tarde en la configuración de tu perfil.</p>
                </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={prevStep} disabled={currentStep === 1 || loading} className="px-6 py-2 text-slate-700 bg-slate-200 rounded-lg font-semibold hover:bg-slate-300 disabled:opacity-50 transition-colors">Atrás</button>
            {currentStep < STEPS.length ? (
              <button onClick={nextStep} className="px-6 py-2 text-white bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-700 transition-colors">Siguiente</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center">
                {loading ? <Spinner /> : 'Finalizar Configuración'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;