import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { UserProfile } from '../../../types';
import { ProgressBar } from '../../../components/ProgressBar';
import { Spinner } from '../../../components/Spinner';

const STEPS = [
  { id: 1, title: "¡Bienvenido/a!" },
  { id: 2, title: "Información Básica" },
  { id: 3, title: "Historial Médico" },
  { id: 4, title: "Medicamentos y Suplementos" },
  { id: 5, title: "Estilo de Vida" },
];

const CHRONIC_CONDITIONS = [
    'Hipertensión', 'Diabetes', 'Asma', 'Enfermedad Cardíaca', 'Enfermedad Renal', 'Artritis', 'Ninguna'
];
const ALLERGIES = [
    'Polen', 'Ácaros del polvo', 'Moho', 'Penicilina', 'Cacahuetes', 'Mariscos', 'Ninguna'
];
const COMMON_SURGERIES = [
    'Apendicectomía', 'Cesárea', 'Cirugía de vesícula biliar', 'Reemplazo de cadera', 'Cirugía de cataratas', 'Cirugía de hernia', 'Ninguna'
];
const COMMON_MEDICATIONS = [
    'Ibuprofeno/Paracetamol', 'Antialérgicos (ej. Loratadina)', 'Antiácidos (ej. Omeprazol)', 'Aspirina', 'Metformina (Diabetes)', 'Medicamentos para la presión', 'Vitaminas/Suplementos', 'Ninguno'
];

// Añadir opción "Otros" a cada lista para la entrada del usuario
const CHRONIC_CONDITIONS_OPTIONS = [...CHRONIC_CONDITIONS, 'Otros'];
const ALLERGIES_OPTIONS = [...ALLERGIES, 'Otros'];
const COMMON_SURGERIES_OPTIONS = [...COMMON_SURGERIES, 'Otros'];
const COMMON_MEDICATIONS_OPTIONS = [...COMMON_MEDICATIONS, 'Otros'];


interface GuestOnboardingProps {
    onClose: () => void;
}

const RadioCard = ({ name, value, label, checked, onChange, description }: { name: string, value: string, label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, description?: string }) => (
    <label className={`block p-4 border rounded-lg cursor-pointer transition-all ${checked ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500' : 'bg-white border-slate-300 hover:bg-slate-50'}`}>
        <div className="flex items-center">
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="h-4 w-4 text-cyan-600 border-slate-300 focus:ring-cyan-500" />
            <div className="ml-3 text-sm">
                <span className="font-medium text-slate-800">{label}</span>
                {description && <p className="text-slate-500">{description}</p>}
            </div>
        </div>
    </label>
);


const GuestOnboarding: React.FC<GuestOnboardingProps> = ({ onClose }) => {
    const { signInAsGuest } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<UserProfile>>({
        name: '',
        birthDate: '',
        sex: undefined,
        height: 170,
        weight: 70,
        chronicConditions: [],
        allergies: [],
        surgeriesOrPastIllnesses: [],
        medicationsAndSupplements: [],
        smokingStatus: undefined,
        alcoholConsumption: undefined,
        exerciseFrequency: undefined,
        drugConsumption: undefined,
    });
    
    // State for "Other" text inputs
    const [otherChronicCondition, setOtherChronicCondition] = useState('');
    const [otherAllergy, setOtherAllergy] = useState('');
    const [otherSurgery, setOtherSurgery] = useState('');
    const [otherMedication, setOtherMedication] = useState('');


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleChipToggle = (
        field: 'chronicConditions' | 'allergies' | 'surgeriesOrPastIllnesses' | 'medicationsAndSupplements',
        value: string
    ) => {
        setFormData(prev => {
            const noneValue = field === 'medicationsAndSupplements' ? 'Ninguno' : 'Ninguna';
            const currentValues = (prev[field] as string[]) || [];
            let newValues: string[];
    
            if (value === noneValue) {
                newValues = currentValues.includes(noneValue) ? [] : [noneValue];
            } else {
                if (currentValues.includes(value)) {
                    newValues = currentValues.filter(v => v !== value);
                } else {
                    newValues = [...currentValues.filter(v => v !== noneValue), value];
                }
            }
            
            // Clear "other" text if "Otros" is deselected or if "Ninguna" is selected
            if ((value === 'Otros' && !newValues.includes('Otros')) || (value === noneValue && newValues.includes(noneValue))) {
                 if (field === 'chronicConditions') setOtherChronicCondition('');
                 if (field === 'allergies') setOtherAllergy('');
                 if (field === 'surgeriesOrPastIllnesses') setOtherSurgery('');
                 if (field === 'medicationsAndSupplements') setOtherMedication('');
            }

            return { ...prev, [field]: newValues };
        });
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        setLoading(true);

        const finalProfileData: Partial<UserProfile> = { ...formData };

        const processField = (
            field: 'chronicConditions' | 'allergies' | 'surgeriesOrPastIllnesses' | 'medicationsAndSupplements',
            otherText: string,
            noneValue: string
        ) => {
            const selections = ((formData[field] as string[]) || [])
                .filter(item => item !== 'Otros' && item !== noneValue);
            
            if (otherText.trim()) {
                selections.push(otherText.trim());
            }

            if (selections.length === 0) {
                finalProfileData[field] = [noneValue];
            } else {
                finalProfileData[field] = selections;
            }
        };
        
        processField('chronicConditions', otherChronicCondition, 'Ninguna');
        processField('allergies', otherAllergy, 'Ninguna');
        processField('surgeriesOrPastIllnesses', otherSurgery, 'Ninguna');
        processField('medicationsAndSupplements', otherMedication, 'Ninguno');


        await new Promise(res => setTimeout(res, 500));
        signInAsGuest(finalProfileData);
    };

    const progress = (currentStep / STEPS.length) * 100;
    
    const isStepValid = () => {
        switch(currentStep) {
            case 1: return formData.name?.trim().length ?? 0 > 0;
            case 2: return !!formData.birthDate && !!formData.sex && !!formData.height && !!formData.weight;
            case 3: return (formData.chronicConditions?.length ?? 0) > 0 && (formData.allergies?.length ?? 0) > 0 && (formData.surgeriesOrPastIllnesses?.length ?? 0) > 0;
            case 4: return (formData.medicationsAndSupplements?.length ?? 0) > 0;
            case 5: return !!formData.smokingStatus && !!formData.alcoholConsumption && !!formData.exerciseFrequency && !!formData.drugConsumption;
            default: return false;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh] animate-fade-in">
                {/* Header */}
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-center mb-2">
                         <h2 className="text-2xl font-bold text-slate-800">{STEPS[currentStep - 1].title}</h2>
                        <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <ProgressBar progress={progress} />
                </div>
                
                {/* Form Content */}
                <div className="overflow-y-auto flex-grow my-6 pr-2 space-y-6">
                    {currentStep === 1 && (
                        <div>
                             <p className="text-slate-500 mb-6">Por favor, introduce tu nombre para personalizar tu experiencia.</p>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Tu Nombre</label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 focus:border-transparent transition" placeholder="Ej: Alex" required autoFocus />
                        </div>
                    )}
                    {currentStep === 2 && (
                         <>
                            <p className="text-slate-500 mb-6">Estos datos nos ayudan a calcular métricas importantes como tu IMC.</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Fecha de Nacimiento</label>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500 focus:border-cyan-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Sexo Biológico</label>
                                    <select name="sex" value={formData.sex} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500 focus:border-cyan-500 bg-white">
                                        <option value="">Seleccionar...</option>
                                        <option value="male">Masculino</option>
                                        <option value="female">Femenino</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700">Altura (cm)</label>
                                    <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500 focus:border-cyan-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Peso (kg)</label>
                                    <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500 focus:border-cyan-500"/>
                                </div>
                            </div>
                        </>
                    )}
                    {currentStep === 3 && (
                        <>
                            <p className="text-slate-500 mb-6">Selecciona cualquier condición preexistente. Esto es crucial para un análisis preciso.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Condiciones Crónicas</label>
                                    <div className="flex flex-wrap gap-2">{CHRONIC_CONDITIONS_OPTIONS.map(c => (<button type="button" key={c} onClick={() => handleChipToggle('chronicConditions', c)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.chronicConditions?.includes(c) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{c}</button>))}</div>
                                    {formData.chronicConditions?.includes('Otros') && (
                                        <div className="mt-3 animate-fade-in">
                                            <input type="text" value={otherChronicCondition} onChange={(e) => setOtherChronicCondition(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500 focus:border-cyan-500" placeholder="Por favor, especifica..."/>
                                        </div>
                                    )}
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Alergias Conocidas</label>
                                    <div className="flex flex-wrap gap-2">{ALLERGIES_OPTIONS.map(a => (<button type="button" key={a} onClick={() => handleChipToggle('allergies', a)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.allergies?.includes(a) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{a}</button>))}</div>
                                     {formData.allergies?.includes('Otros') && (
                                        <div className="mt-3 animate-fade-in">
                                            <input type="text" value={otherAllergy} onChange={(e) => setOtherAllergy(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500 focus:border-cyan-500" placeholder="Por favor, especifica..."/>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Cirugías o Enfermedades Pasadas Significativas</label>
                                    <div className="flex flex-wrap gap-2">{COMMON_SURGERIES_OPTIONS.map(s => (<button type="button" key={s} onClick={() => handleChipToggle('surgeriesOrPastIllnesses', s)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.surgeriesOrPastIllnesses?.includes(s) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{s}</button>))}</div>
                                    {formData.surgeriesOrPastIllnesses?.includes('Otros') && (
                                        <div className="mt-3 animate-fade-in">
                                            <input type="text" value={otherSurgery} onChange={(e) => setOtherSurgery(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500 focus:border-cyan-500" placeholder="Por favor, especifica..."/>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                     {currentStep === 4 && (
                        <>
                            <p className="text-slate-500 mb-6">Saber qué medicamentos y suplementos tomas ayuda a evitar interacciones y a entender mejor tu salud.</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Medicamentos y Suplementos Actuales</label>
                                <div className="flex flex-wrap gap-2">{COMMON_MEDICATIONS_OPTIONS.map(m => (<button type="button" key={m} onClick={() => handleChipToggle('medicationsAndSupplements', m)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.medicationsAndSupplements?.includes(m) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{m}</button>))}</div>
                                {formData.medicationsAndSupplements?.includes('Otros') && (
                                    <div className="mt-3 animate-fade-in">
                                        <input type="text" value={otherMedication} onChange={(e) => setOtherMedication(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500 focus:border-cyan-500" placeholder="Por favor, especifica..."/>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {currentStep === 5 && (
                         <>
                            <p className="text-slate-500 mb-6">Tus hábitos diarios son una parte importante de tu bienestar general.</p>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Tabaquismo</label>
                                    <div className="space-y-2">
                                        <RadioCard name="smokingStatus" value="never" label="Nunca he fumado" checked={formData.smokingStatus === 'never'} onChange={handleInputChange} />
                                        <RadioCard name="smokingStatus" value="former" label="Ex-fumador/a" checked={formData.smokingStatus === 'former'} onChange={handleInputChange} />
                                        <RadioCard name="smokingStatus" value="current" label="Actualmente fumo" checked={formData.smokingStatus === 'current'} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Consumo de Alcohol</label>
                                    <div className="space-y-2">
                                         <RadioCard name="alcoholConsumption" value="none" label="No bebo alcohol" checked={formData.alcoholConsumption === 'none'} onChange={handleInputChange} />
                                         <RadioCard name="alcoholConsumption" value="light" label="Ocasional / Ligero" description="1-3 bebidas por semana" checked={formData.alcoholConsumption === 'light'} onChange={handleInputChange} />
                                         <RadioCard name="alcoholConsumption" value="moderate" label="Moderado" description="4-7 bebidas por semana" checked={formData.alcoholConsumption === 'moderate'} onChange={handleInputChange} />
                                         <RadioCard name="alcoholConsumption" value="heavy" label="Fuerte / Frecuente" description="Más de 7 bebidas por semana" checked={formData.alcoholConsumption === 'heavy'} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Frecuencia de Ejercicio</label>
                                    <div className="space-y-2">
                                         <RadioCard name="exerciseFrequency" value="never" label="Nunca o casi nunca" checked={formData.exerciseFrequency === 'never'} onChange={handleInputChange} />
                                         <RadioCard name="exerciseFrequency" value="rarely" label="Raramente" description="Menos de 1 vez por semana" checked={formData.exerciseFrequency === 'rarely'} onChange={handleInputChange} />
                                         <RadioCard name="exerciseFrequency" value="regularly" label="Regularmente" description="1-3 veces por semana" checked={formData.exerciseFrequency === 'regularly'} onChange={handleInputChange} />
                                         <RadioCard name="exerciseFrequency" value="frequently" label="Frecuentemente" description="4 o más veces por semana" checked={formData.exerciseFrequency === 'frequently'} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Consumo de Drogas Recreativas</label>
                                    <p className="text-xs text-slate-500 mb-2">Esta información es confidencial y nos ayuda a entender factores de riesgo adicionales.</p>
                                    <div className="space-y-2">
                                         <RadioCard name="drugConsumption" value="none" label="No consumo" checked={formData.drugConsumption === 'none'} onChange={handleInputChange} />
                                         <RadioCard name="drugConsumption" value="rarely" label="Ocasionalmente" checked={formData.drugConsumption === 'rarely'} onChange={handleInputChange} />
                                         <RadioCard name="drugConsumption" value="regularly" label="Regularmente" checked={formData.drugConsumption === 'regularly'} onChange={handleInputChange} />
                                         <RadioCard name="drugConsumption" value="prefer_not_to_say" label="Prefiero no decirlo" checked={formData.drugConsumption === 'prefer_not_to_say'} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="mt-auto pt-4 border-t border-slate-200 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                        <button type="button" onClick={prevStep} disabled={currentStep === 1 || loading} className="px-4 sm:px-6 py-2 text-slate-700 bg-slate-200 rounded-lg font-semibold hover:bg-slate-300 disabled:opacity-50 transition-colors flex-shrink-0">Atrás</button>
                        
                        {currentStep < STEPS.length ? (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
                                {currentStep > 1 && (
                                    <button type="button" onClick={nextStep} className="px-4 sm:px-6 py-2 text-slate-700 font-semibold hover:bg-slate-100 rounded-lg transition-colors">
                                        Omitir
                                    </button>
                                )}
                                <button type="button" onClick={nextStep} disabled={!isStepValid()} className="px-4 sm:px-6 py-2 text-white bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-700 disabled:bg-cyan-300 disabled:cursor-not-allowed transition-colors">Siguiente</button>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
                                <button type="button" onClick={handleSubmit} disabled={loading} className="px-4 sm:px-6 py-2 text-slate-700 font-semibold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                                    Omitir y Enviar
                                </button>
                                <button type="button" onClick={handleSubmit} disabled={loading || !isStepValid()} className="px-4 sm:px-6 py-2 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-full sm:w-auto sm:min-w-[180px]">
                                    {loading ? <Spinner size="sm" /> : 'Finalizar y Comenzar'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestOnboarding;
