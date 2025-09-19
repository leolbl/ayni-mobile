import React, { useState, useMemo } from 'react';
import { Symptom } from '../../../types';

interface SymptomSelectorStepProps {
  data: Symptom[];
  onUpdate: (data: Symptom[], hasSymptoms: boolean) => void;
}

// Mock database of common symptoms
const SYMPTOM_DATABASE = [
  'Dolor de cabeza', 'Fiebre', 'Tos', 'Dolor de garganta', 'Fatiga', 'Náuseas', 'Mareos',
  'Falta de aire', 'Dolor en el pecho', 'Dolor de estómago', 'Diarrea', 'Erupción cutánea', 'Dolor muscular'
];

const CloseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CustomSymptomModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, details: string) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onAdd(name.trim(), details.trim());
            setName('');
            setDetails('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Añadir Síntoma Personalizado</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="symptomName" className="block text-sm font-medium text-slate-700 mb-1">Nombre del Síntoma</label>
                        <input
                            id="symptomName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            placeholder="Ej: Dolor articular"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="symptomDetails" className="block text-sm font-medium text-slate-700 mb-1">Descripción (opcional)</label>
                        <textarea
                            id="symptomDetails"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="w-full h-24 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            placeholder="Describe dónde y cómo se siente..."
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg font-semibold hover:bg-slate-200">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-white bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-700">Añadir Síntoma</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SymptomSelectorStep: React.FC<SymptomSelectorStepProps> = ({ data, onUpdate }) => {
  const [query, setQuery] = useState('');
  const [activeSymptom, setActiveSymptom] = useState<string | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const filteredSymptoms = useMemo(() => {
    if (!query) return [];
    const selectedNames = data.map(s => s.name);
    return SYMPTOM_DATABASE.filter(s => 
      s.toLowerCase().includes(query.toLowerCase()) && !selectedNames.includes(s)
    );
  }, [query, data]);
  
  const addSymptom = (name: string, details: string = '') => {
    const symptomExists = data.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (symptomExists) return; // Avoid duplicates

    const newSymptom: Symptom = { name, intensity: 5, details };
    onUpdate([...data, newSymptom], true);
    setQuery('');
    setActiveSymptom(name);
  };

  const handleAddCustomSymptom = (name: string, details: string) => {
    addSymptom(name, details);
    setIsCustomModalOpen(false);
  };

  const removeSymptom = (name: string) => {
    const newData = data.filter(s => s.name !== name);
    if (activeSymptom === name) {
      setActiveSymptom(null);
    }
    onUpdate(newData, newData.length > 0);
  };
  
  const updateSymptom = (name: string, updatedValues: Partial<Symptom>) => {
    const newData = data.map(s => s.name === name ? { ...s, ...updatedValues } : s);
    onUpdate(newData, true);
  };

  const currentSymptomData = activeSymptom ? data.find(s => s.name === activeSymptom) : null;

  return (
    <>
        <div className="flex flex-col h-full animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-2">¿Tienes algún síntoma específico que reportar hoy?</h2>
            <p className="text-slate-500 text-center mb-6">Busca síntomas a continuación. Si te sientes bien, puedes finalizar el chequeo.</p>

            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Busca un síntoma (Ej: Dolor de cabeza)"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
                {filteredSymptoms.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                    {filteredSymptoms.map(symptom => (
                        <li key={symptom} onClick={() => addSymptom(symptom)}
                        className="p-3 hover:bg-cyan-50 cursor-pointer">
                        {symptom}
                        </li>
                    ))}
                    </ul>
                )}
            </div>

            <div className="text-center mt-3">
                <button onClick={() => setIsCustomModalOpen(true)} className="text-sm text-cyan-600 hover:text-cyan-800 font-semibold hover:underline">
                    ¿No encuentras tu síntoma? Añádelo manualmente.
                </button>
            </div>

            <div className="flex-grow mt-4 overflow-y-auto pr-2">
                {data.length > 0 ? (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-700">Tus Síntomas (haz clic para evaluar):</h3>
                        <div className="flex flex-wrap gap-3">
                            {data.map(symptom => (
                                <div key={symptom.name} className="animate-fade-in">
                                    <button 
                                        onClick={() => setActiveSymptom(symptom.name)}
                                        className={`py-2 pl-4 pr-3 rounded-full text-sm font-medium transition-all duration-200 flex items-center group ${activeSymptom === symptom.name ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                        {symptom.name}
                                        <span className="ml-2 font-mono text-xs opacity-70">({symptom.intensity})</span>
                                        <span 
                                            onClick={(e) => { e.stopPropagation(); removeSymptom(symptom.name); }} 
                                            className="ml-2 bg-slate-400/50 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-50 group-hover:opacity-100 group-hover:bg-slate-500 transition-all cursor-pointer"
                                        >
                                            <CloseIcon className="w-3 h-3"/>
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {currentSymptomData && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg border animate-fade-in">
                                <h4 className="font-bold text-lg text-cyan-700">Evaluar "{currentSymptomData.name}"</h4>
                                <div className="my-3">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Intensidad: {currentSymptomData.intensity}</label>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-slate-500">Leve</span>
                                        <input type="range" min="1" max="10" value={currentSymptomData.intensity}
                                            onChange={(e) => updateSymptom(currentSymptomData.name, { intensity: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                        />
                                        <span className="text-xs text-slate-500">Grave</span>
                                    </div>
                                </div>
                                <textarea
                                    value={currentSymptomData.details}
                                    onChange={(e) => updateSymptom(currentSymptomData.name, { details: e.target.value })}
                                    placeholder="Añade más detalles (opcional)"
                                    className="w-full h-20 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-slate-400 py-10 mt-4 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="font-medium">Aún no se han añadido síntomas.</p>
                        <p className="text-sm">Usa la barra de búsqueda o añade un síntoma manualmente.</p>
                    </div>
                )}
            </div>
            
        </div>
        <CustomSymptomModal 
            isOpen={isCustomModalOpen}
            onClose={() => setIsCustomModalOpen(false)}
            onAdd={handleAddCustomSymptom}
        />
    </>
  );
};

export default SymptomSelectorStep;