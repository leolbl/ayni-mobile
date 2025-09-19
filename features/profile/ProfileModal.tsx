import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { Spinner } from '../../components/Spinner';


// Constantes para selecciones de chips, pueden ser compartidas o redefinidas
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
const CHRONIC_CONDITIONS_OPTIONS = [...CHRONIC_CONDITIONS.filter(c => c !== 'Ninguna'), 'Otros', 'Ninguna'];
const ALLERGIES_OPTIONS = [...ALLERGIES.filter(a => a !== 'Ninguna'), 'Otros', 'Ninguna'];
const COMMON_SURGERIES_OPTIONS = [...COMMON_SURGERIES.filter(s => s !== 'Ninguna'), 'Otros', 'Ninguna'];
const COMMON_MEDICATIONS_OPTIONS = [...COMMON_MEDICATIONS.filter(m => m !== 'Ninguno'), 'Otros', 'Ninguno'];

const TABS = [
    { id: 'basic', label: 'Información Básica' },
    { id: 'medical', label: 'Historial Médico' },
    { id: 'lifestyle', label: 'Estilo de Vida' },
];

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonClassName?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmButtonText = 'Confirmar',
    cancelButtonText = 'Cancelar',
    confirmButtonClassName = 'bg-red-600 hover:bg-red-700 text-white',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full" role="document">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <div className="my-4 text-slate-600">{children}</div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                        {cancelButtonText}
                    </button>
                    <button onClick={onConfirm} className={`px-4 py-2 font-semibold rounded-lg transition-colors ${confirmButtonClassName}`}>
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RadioCard = ({ name, value, label, checked, onChange, description }: { name: string, value: string, label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, description?: string }) => (
    <label className={`block p-4 border rounded-lg cursor-pointer transition-all ${checked ? 'bg-[#2A787A]/10 border-[#2A787A] ring-2 ring-[#2A787A]' : 'bg-white border-slate-300 hover:bg-slate-50'}`}>
        <div className="flex items-center">
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="h-4 w-4 text-[#2A787A] border-slate-300 focus:ring-[#2A787A]" />
            <div className="ml-3 text-sm">
                <span className="font-medium text-[#1A2E40]">{label}</span>
                {description && <p className="text-[#1A2E40]/80">{description}</p>}
            </div>
        </div>
    </label>
);

type ProfileField = 'chronicConditions' | 'allergies' | 'surgeriesOrPastIllnesses' | 'medicationsAndSupplements';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile }) => {
  const { updateUserProfile, signOut } = useAuth();
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  // State for "Other" text inputs
  const [otherChronicCondition, setOtherChronicCondition] = useState('');
  const [otherAllergy, setOtherAllergy] = useState('');
  const [otherSurgery, setOtherSurgery] = useState('');
  const [otherMedication, setOtherMedication] = useState('');

  const extractOtherValue = (
    values: string[] | undefined,
    options: readonly string[]
  ): [string[], string] => {
    if (!values) return [[], ''];
    const knownValues = values.filter(v => options.includes(v) || v === 'Ninguna' || v === 'Ninguno');
    const otherValue = values.find(v => !options.includes(v) && v !== 'Ninguna' && v !== 'Ninguno') || '';
    if (otherValue) {
      knownValues.push('Otros');
    }
    return [knownValues, otherValue];
  };

  useEffect(() => {
    if (isOpen) {
        // Reset form data if the modal is reopened with fresh profile data
        const [chronic, otherChronic] = extractOtherValue(profile.chronicConditions, CHRONIC_CONDITIONS);
        const [allergies, otherAllerg] = extractOtherValue(profile.allergies, ALLERGIES);
        const [surgeries, otherSurg] = extractOtherValue(profile.surgeriesOrPastIllnesses, COMMON_SURGERIES);
        const [meds, otherMed] = extractOtherValue(profile.medicationsAndSupplements, COMMON_MEDICATIONS);

        setFormData({
            ...profile,
            chronicConditions: chronic,
            allergies: allergies,
            surgeriesOrPastIllnesses: surgeries,
            medicationsAndSupplements: meds,
        });

        setOtherChronicCondition(otherChronic);
        setOtherAllergy(otherAllerg);
        setOtherSurgery(otherSurg);
        setOtherMedication(otherMed);
        
        setActiveTab(TABS[0].id); // Reset to first tab
    }
  }, [profile, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChipToggle = (field: ProfileField, value: string) => {
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
                newValues = [...currentValues.filter(v => v !== noneValue && v !== 'Otros'), value];
                if (currentValues.includes('Otros')) newValues.push('Otros');
            }
        }

        // Clear "other" text if "Otros" is deselected or if "Ninguna"/"Ninguno" is selected
        if ((value === 'Otros' && !newValues.includes('Otros')) || (newValues.includes(noneValue))) {
             if (field === 'chronicConditions') setOtherChronicCondition('');
             if (field === 'allergies') setOtherAllergy('');
             if (field === 'surgeriesOrPastIllnesses') setOtherSurgery('');
             if (field === 'medicationsAndSupplements') setOtherMedication('');
        }

        return { ...prev, [field]: newValues };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setSuccessMessage('');

    const finalProfileData: Partial<UserProfile> = { ...formData };

    const processField = (field: ProfileField, otherText: string, noneValue: string) => {
        const selections = ((formData[field] as string[]) || [])
            .filter(item => item !== 'Otros' && item !== noneValue);
        
        if (otherText.trim()) {
            finalProfileData[field] = [...selections, otherText.trim()];
        } else if (selections.length > 0) {
            finalProfileData[field] = selections;
        } else if (((formData[field] as string[]) || []).includes(noneValue)) {
            finalProfileData[field] = [noneValue];
        } else {
            finalProfileData[field] = []; // Guardar como array vacío si no se selecciona nada (ni "Ninguna")
        }
    };
    
    processField('chronicConditions', otherChronicCondition, 'Ninguna');
    processField('allergies', otherAllergy, 'Ninguna');
    processField('surgeriesOrPastIllnesses', otherSurgery, 'Ninguna');
    processField('medicationsAndSupplements', otherMedication, 'Ninguno');

    try {
      await updateUserProfile(finalProfileData);
      setSuccessMessage('¡Perfil actualizado con éxito!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose(); // Cierra el modal después de guardar
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Hubo un error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Cierra el modal de confirmación y llama a la función signOut del hook.
    setIsLogoutConfirmOpen(false);
    signOut(); // Esta función se encargará de la lógica de cierre de sesión.
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh] animate-fade-in font-sans">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#1A2E40] font-poppins">Tu Perfil</h2>
            <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-[#1A2E40] disabled:opacity-50">
              <CloseIcon />
            </button>
          </div>
          {/* Tabs Navigation */}
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto font-poppins" aria-label="Tabs">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-[#2A787A] text-[#2A787A]'
                      : 'border-transparent text-[#1A2E40]/70 hover:text-[#1A2E40] hover:border-slate-300'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow my-4 pr-2 space-y-6">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-[#1A2E40]">Nombre</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-[#2A787A]"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2E40]">Correo Electrónico</label>
                <input type="email" name="email" value={formData.email || ''} disabled className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm cursor-not-allowed"/>
              </div>
               <div>
                  <label className="block text-sm font-medium text-[#1A2E40]">Fecha de Nacimiento</label>
                  <input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-[#2A787A]"/>
              </div>
              <div>
                  <label className="block text-sm font-medium text-[#1A2E40]">Sexo Biológico</label>
                  <select name="sex" value={formData.sex || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-[#2A787A] bg-white">
                      <option value="">Seleccionar...</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                  </select>
              </div>
               <div>
                  <label className="block text-sm font-medium text-[#1A2E40]">Altura (cm)</label>
                  <input type="number" name="height" value={formData.height || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-[#2A787A]"/>
              </div>
              <div>
                  <label className="block text-sm font-medium text-[#1A2E40]">Peso (kg)</label>
                  <input type="number" name="weight" value={formData.weight || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-[#2A787A]"/>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-[#1A2E40] mb-2">Condiciones Crónicas</label>
                <div className="flex flex-wrap gap-2">{CHRONIC_CONDITIONS_OPTIONS.map(c => (<button type="button" key={c} onClick={() => handleChipToggle('chronicConditions', c)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.chronicConditions?.includes(c) ? 'bg-[#2A787A] text-white' : 'bg-slate-100 text-[#1A2E40] hover:bg-slate-200'}`}>{c}</button>))}</div>
                {formData.chronicConditions?.includes('Otros') && (
                    <div className="mt-3 animate-fade-in">
                        <input type="text" value={otherChronicCondition} onChange={(e) => setOtherChronicCondition(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-[#2A787A]" placeholder="Por favor, especifica..."/>
                    </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2E40] mb-2">Alergias Conocidas</label>
                <div className="flex flex-wrap gap-2">{ALLERGIES_OPTIONS.map(a => (<button type="button" key={a} onClick={() => handleChipToggle('allergies', a)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.allergies?.includes(a) ? 'bg-[#2A787A] text-white' : 'bg-slate-100 text-[#1A2E40] hover:bg-slate-200'}`}>{a}</button>))}</div>
                {formData.allergies?.includes('Otros') && (
                    <div className="mt-3 animate-fade-in">
                        <input type="text" value={otherAllergy} onChange={(e) => setOtherAllergy(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-[#2A787A]" placeholder="Por favor, especifica..."/>
                    </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2E40] mb-2">Cirugías o Enfermedades Pasadas</label>
                <div className="flex flex-wrap gap-2">{COMMON_SURGERIES_OPTIONS.map(s => (<button type="button" key={s} onClick={() => handleChipToggle('surgeriesOrPastIllnesses', s)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.surgeriesOrPastIllnesses?.includes(s) ? 'bg-[#2A787A] text-white' : 'bg-slate-100 text-[#1A2E40] hover:bg-slate-200'}`}>{s}</button>))}</div>
                {formData.surgeriesOrPastIllnesses?.includes('Otros') && (
                    <div className="mt-3 animate-fade-in">
                        <input type="text" value={otherSurgery} onChange={(e) => setOtherSurgery(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-[#2A787A]" placeholder="Por favor, especifica..."/>
                    </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2E40] mb-2">Medicamentos y Suplementos</label>
                <div className="flex flex-wrap gap-2">{COMMON_MEDICATIONS_OPTIONS.map(m => (<button type="button" key={m} onClick={() => handleChipToggle('medicationsAndSupplements', m)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.medicationsAndSupplements?.includes(m) ? 'bg-[#2A787A] text-white' : 'bg-slate-100 text-[#1A2E40] hover:bg-slate-200'}`}>{m}</button>))}</div>
                {formData.medicationsAndSupplements?.includes('Otros') && (
                    <div className="mt-3 animate-fade-in">
                        <input type="text" value={otherMedication} onChange={(e) => setOtherMedication(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-[#2A787A]" placeholder="Por favor, especifica..."/>
                    </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'lifestyle' && (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <label className="block text-sm font-medium text-[#1A2E40] mb-2">Tabaquismo</label>
                    <div className="space-y-2">
                        <RadioCard name="smokingStatus" value="never" label="Nunca he fumado" checked={formData.smokingStatus === 'never'} onChange={handleInputChange} />
                        <RadioCard name="smokingStatus" value="former" label="Ex-fumador/a" checked={formData.smokingStatus === 'former'} onChange={handleInputChange} />
                        <RadioCard name="smokingStatus" value="current" label="Actualmente fumo" checked={formData.smokingStatus === 'current'} onChange={handleInputChange} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#1A2E40] mb-2">Consumo de Alcohol</label>
                    <div className="space-y-2">
                         <RadioCard name="alcoholConsumption" value="none" label="No bebo alcohol" checked={formData.alcoholConsumption === 'none'} onChange={handleInputChange} />
                         <RadioCard name="alcoholConsumption" value="light" label="Ocasional / Ligero" description="1-3 bebidas por semana" checked={formData.alcoholConsumption === 'light'} onChange={handleInputChange} />
                         <RadioCard name="alcoholConsumption" value="moderate" label="Moderado" description="4-7 bebidas por semana" checked={formData.alcoholConsumption === 'moderate'} onChange={handleInputChange} />
                         <RadioCard name="alcoholConsumption" value="heavy" label="Fuerte / Frecuente" description="Más de 7 bebidas por semana" checked={formData.alcoholConsumption === 'heavy'} onChange={handleInputChange} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#1A2E40] mb-2">Frecuencia de Ejercicio</label>
                    <div className="space-y-2">
                         <RadioCard name="exerciseFrequency" value="never" label="Nunca o casi nunca" checked={formData.exerciseFrequency === 'never'} onChange={handleInputChange} />
                         <RadioCard name="exerciseFrequency" value="rarely" label="Raramente" description="Menos de 1 vez por semana" checked={formData.exerciseFrequency === 'rarely'} onChange={handleInputChange} />
                         <RadioCard name="exerciseFrequency" value="regularly" label="Regularmente" description="1-3 veces por semana" checked={formData.exerciseFrequency === 'regularly'} onChange={handleInputChange} />
                         <RadioCard name="exerciseFrequency" value="frequently" label="Frecuentemente" description="4 o más veces por semana" checked={formData.exerciseFrequency === 'frequently'} onChange={handleInputChange} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#1A2E40] mb-2">Consumo de Drogas Recreativas</label>
                    <p className="text-xs text-[#1A2E40]/70 mb-2">Esta información es confidencial y nos ayuda a entender factores de riesgo adicionales.</p>
                    <div className="space-y-2">
                         <RadioCard name="drugConsumption" value="none" label="No consumo" checked={formData.drugConsumption === 'none'} onChange={handleInputChange} />
                         <RadioCard name="drugConsumption" value="rarely" label="Ocasionalmente" checked={formData.drugConsumption === 'rarely'} onChange={handleInputChange} />
                         <RadioCard name="drugConsumption" value="regularly" label="Regularmente" checked={formData.drugConsumption === 'regularly'} onChange={handleInputChange} />
                         <RadioCard name="drugConsumption" value="prefer_not_to_say" label="Prefiero no decirlo" checked={formData.drugConsumption === 'prefer_not_to_say'} onChange={handleInputChange} />
                    </div>
                </div>
            </div>
          )}

           {successMessage && (
            <div className="p-3 bg-green-100 text-green-800 rounded-lg text-center text-sm">
                {successMessage}
            </div>
           )}

        </form>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-200 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
            <button type="button" onClick={() => setIsLogoutConfirmOpen(true)} disabled={loading} className="w-full sm:w-auto justify-center flex px-4 py-2 text-red-600 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors text-sm">
                Cerrar Sesión
            </button>
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
              <button type="button" onClick={onClose} disabled={loading} className="w-full sm:w-auto justify-center flex px-6 py-2 text-[#1A2E40] bg-slate-100 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors">Cancelar</button>
              <button type="submit" onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto justify-center flex px-6 py-2 text-white bg-[#2A787A] rounded-lg font-semibold hover:bg-[#2A787A]/90 disabled:bg-[#2A787A]/50 transition-colors items-center min-w-[150px]">
                {loading ? <Spinner size="sm" /> : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Confirmar Cierre de Sesión"
        confirmButtonText="Cerrar Sesión"
        confirmButtonClassName="bg-red-600 hover:bg-red-700 text-white"
      >
        <p>¿Estás seguro de que quieres cerrar tu sesión?</p>
      </ConfirmationModal>
    </div>
  );
};

export default ProfileModal;