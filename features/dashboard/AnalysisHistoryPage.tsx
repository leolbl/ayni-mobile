import React, { useState } from 'react';
import { AnalysisResult } from '../../types';
 
 // Este tipo representa una entrada completa en el historial.
 interface HistoryEntry {
     id: string;
     date: Date;
     result: AnalysisResult;
 }
 
 // Datos de ejemplo para simular un historial real y completo.
 const mockHistory: HistoryEntry[] = [
     {
         id: '1',
         date: new Date('2023-10-23T10:00:00Z'),
         result: {
             riskLevel: 'normal',
            explanation: 'Tus síntomas no parecen indicar un riesgo inmediato. Continúa monitoreando tu salud.',
            keyFindings: ['Signos de estrés leve', 'Fatiga reportada'],
             recommendations: [
                 'Mantén un estilo de vida saludable.',
                 'Asegúrate de descansar lo suficiente.',
                 'Considera técnicas de manejo del estrés como la meditación.'
             ],
            urgencyLevel: 'routine',
         },
     },
     {
         id: '2',
         date: new Date('2023-10-16T11:30:00Z'),
         result: {
             riskLevel: 'normal',
            explanation: 'Bajo riesgo detectado. Los síntomas son leves y probablemente pasajeros.',
            keyFindings: ['Síntomas compatibles con resfriado común'],
             recommendations: [
                 'Bebe muchos líquidos.',
                 'Descansa y evita el esfuerzo físico.',
             ],
            urgencyLevel: 'routine',
         },
     },
     {
         id: '3',
         date: new Date('2023-10-09T09:00:00Z'),
         result: {
             riskLevel: 'warning',
            explanation: 'Se detectaron síntomas que requieren atención. No es una emergencia, pero se recomienda consultar a un médico.',
            keyFindings: ['Síntomas compatibles con gripe', 'Fiebre leve registrada'],
             recommendations: [
                 'Agenda una cita con tu médico de cabecera esta semana.',
                 'Monitorea la aparición de nuevos síntomas como fiebre alta o dificultad para respirar.',
                 'Evita el contacto cercano con otras personas para no propagar una posible infección.',
             ],
            urgencyLevel: 'priority',
         },
     },
     {
         id: '4',
         date: new Date('2023-10-02T15:00:00Z'),
         result: {
             riskLevel: 'alert',
            explanation: 'Tus síntomas indican un nivel de riesgo alto. Es crucial que busques atención médica de inmediato.',
            keyFindings: ['Dificultad respiratoria', 'Frecuencia cardíaca elevada'],
             recommendations: [
                 'Dirígete al servicio de urgencias más cercano.',
                 'Informa al personal médico sobre los resultados de este análisis preliminar.',
                 'No demores en buscar ayuda profesional.',
             ],
            urgencyLevel: 'urgent',
         },
     },
 ];
 
 // Objeto para centralizar los estilos y etiquetas asociados a cada nivel de riesgo.
 const riskMeta = {
     normal: { label: 'Normal', dotClass: 'bg-green-500', textClass: 'text-green-700', bgClass: 'bg-green-50' },
     warning: { label: 'Advertencia', dotClass: 'bg-yellow-500', textClass: 'text-yellow-700', bgClass: 'bg-yellow-50' },
     alert: { label: 'Alerta', dotClass: 'bg-red-500', textClass: 'text-red-700', bgClass: 'bg-red-50' },
 };
 
 const ChevronDownIcon = ({ className }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
         <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
     </svg>
 );
 
 interface HistoryItemCardProps {
     entry: HistoryEntry;
     isOpen: boolean;
     onToggle: () => void;
 }
 
 const HistoryItemCard: React.FC<HistoryItemCardProps> = ({ entry, isOpen, onToggle }) => {
     const { date, result } = entry;
     const meta = riskMeta[result.riskLevel];
     const formattedDate = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(date);
 
     return (
         <div className={`bg-white rounded-2xl shadow-md transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'ring-2 ring-cyan-500' : 'ring-1 ring-slate-200'}`}>
             <button onClick={onToggle} className="w-full p-4 text-left flex justify-between items-center" aria-expanded={isOpen}>
                 <div className="flex items-center space-x-4">
                     <span className={`w-3 h-3 rounded-full ${meta.dotClass}`}></span>
                     <div>
                         <p className="font-bold text-slate-800">{formattedDate}</p>
                         <p className={`text-sm font-semibold ${meta.textClass}`}>Riesgo {meta.label}</p>
                     </div>
                 </div>
                 <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
             </button>
             {isOpen && (
                 <div className="px-4 pb-4 border-t border-slate-200">
                     <div className={`p-4 rounded-lg mt-4 ${meta.bgClass}`}>
                         <p className="font-semibold text-slate-800">Explicación del Análisis</p>
                         <p className="text-sm text-slate-600 mt-1">{result.explanation}</p>
                     </div>
 
                     <div className="mt-4">
                         <h4 className="font-semibold text-slate-800">Hallazgos Principales</h4>
                         <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
                             {result.keyFindings.map((finding, i) => <li key={i}>{finding}</li>)}
                         </ul>
                     </div>
 
                     <div className="mt-4">
                         <h4 className="font-semibold text-slate-800">Recomendaciones</h4>
                         <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
                             {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                         </ul>
                     </div>
                 </div>
             )}
         </div>
     );
 };
 
 interface AnalysisHistoryPageProps {
     onBack: () => void;
 }
 
 const AnalysisHistoryPage: React.FC<AnalysisHistoryPageProps> = ({ onBack }) => {
     const [openItemId, setOpenItemId] = useState<string | null>(mockHistory.length > 0 ? mockHistory[0].id : null);
 
     const handleToggle = (id: string) => {
         setOpenItemId(prevId => (prevId === id ? null : id));
     };
 
     return (
         <div className="fixed inset-0 bg-slate-50 z-40 overflow-y-auto">
             <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                 <header className="flex items-center mb-8">
                     <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 transition-colors mr-4">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                         </svg>
                     </button>
                     <h1 className="text-3xl font-bold text-slate-800">Historial de Análisis</h1>
                 </header>
 
                 <main>
                     {mockHistory.length > 0 ? (
                         <div className="space-y-4">
                             {mockHistory.map(entry => (
                                 <HistoryItemCard
                                     key={entry.id}
                                     entry={entry}
                                     isOpen={openItemId === entry.id}
                                     onToggle={() => handleToggle(entry.id)}
                                 />
                             ))}
                         </div>
                     ) : (
                         <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
                             <h3 className="text-xl font-semibold text-slate-700">No hay análisis todavía</h3>
                             <p className="text-slate-500 mt-2">Cuando realices tu primer chequeo, aparecerá aquí.</p>
                         </div>
                     )}
                 </main>
             </div>
         </div>
     );
 };
 
 export default AnalysisHistoryPage;