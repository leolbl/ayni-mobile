import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserProfile } from '../../types';
import { Spinner } from '../../components/Spinner';

// Constantes para selecciones de chips, pueden ser compartidas o redefinidas
const CHRONIC_CONDITIONS = [
    'Hipertensión', 'Diabetes', 'Asma', 'Enfermedad Cardíaca', 'Enfermedad Renal', 'Artritis', 'Ninguna'
];
const ALLERGIES = [
    'Polen', 'Ácaros del polvo', 'Moho', 'Penicilina', 'Cacahuetes', 'Mariscos', 'Ninguna'
];

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile }) => {
  const { updateUserProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Reset form data if the modal is reopened with fresh profile data
    setFormData(profile);
  }, [profile, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChipToggle = (field: 'chronicConditions' | 'allergies', value: string) => {
    setFormData(prev => {
        const currentValues = (prev[field] as string[]) || [];
        let newValues: string[];

        const noneValue = 'Ninguna';

        if (value === noneValue) {
            newValues = currentValues.includes(noneValue) ? [] : [noneValue];
        } else {
            if (currentValues.includes(value)) {
                newValues = currentValues.filter(v => v !== value);
            } else {
                newValues = [...currentValues.filter(v => v !== noneValue), value];
            }
        }
        return { ...prev, [field]: newValues };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    try {
      await updateUserProfile(formData);
      setSuccessMessage('¡Perfil actualizado con éxito!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Hubo un error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh] animate-fade-in">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Tu Perfil</h2>
            <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow my-4 pr-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
              <input type="email" name="email" value={formData.email || ''} disabled className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm cursor-not-allowed"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Fecha de Nacimiento</label>
                <input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Sexo Biológico</label>
                <select name="sex" value={formData.sex || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Altura (cm)</label>
                <input type="number" name="height" value={formData.height || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Peso (kg)</label>
                <input type="number" name="weight" value={formData.weight || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-cyan-500"/>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Condiciones Crónicas</label>
            <div className="flex flex-wrap gap-2">{CHRONIC_CONDITIONS.map(c => (<button type="button" key={c} onClick={() => handleChipToggle('chronicConditions', c)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.chronicConditions?.includes(c) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{c}</button>))}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Alergias Conocidas</label>
            <div className="flex flex-wrap gap-2">{ALLERGIES.map(a => (<button type="button" key={a} onClick={() => handleChipToggle('allergies', a)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.allergies?.includes(a) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{a}</button>))}</div>
          </div>
          
           {successMessage && (
            <div className="p-3 bg-green-100 text-green-800 rounded-lg text-center text-sm">
                {successMessage}
            </div>
           )}

        </form>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-200 flex-shrink-0">
          <div className="flex justify-end items-center space-x-3">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2 text-slate-700 bg-slate-100 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors">Cancelar</button>
            <button type="submit" form="profileForm" onClick={handleSubmit} disabled={loading} className="px-6 py-2 text-white bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-700 disabled:bg-cyan-400 transition-colors flex items-center min-w-[130px] justify-center">
              {loading ? <Spinner size="sm" /> : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;