import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AnalysisResult } from '../../types';
import { Spinner } from '../../components/Spinner';
import HistoryStats from './components/HistoryStats';
import { 
    mockHistoryData, 
    MockHistoryEntry, 
    loadMockHistoryData, 
    filterMockData, 
    calculateMockStats 
} from '../../data/mockHistoryData';
 
 // Este tipo representa una entrada completa en el historial.
 interface HistoryEntry {
     id: string;
     date: Date;
     result: AnalysisResult;
 }

 // Interfaz para estadísticas locales
 interface LocalHistoryStats {
     totalAnalyses: number;
     normalCount: number;
     warningCount: number;
     alertCount: number;
     lastAnalysisDate?: Date;
     averageFeeling?: number;
     streak: number;
 }

 // Filtros disponibles para el historial
 type FilterType = 'all' | 'normal' | 'warning' | 'alert';
 type SortType = 'newest' | 'oldest';

 // Filtros y componentes de UI
 const FilterButton: React.FC<{
     active: boolean;
     onClick: () => void;
     children: React.ReactNode;
     count?: number;
 }> = ({ active, onClick, children, count }) => (
     <button
         onClick={onClick}
         className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
             active
                 ? 'bg-[#2A787A] text-white shadow-md'
                 : 'bg-white text-[#1A2E40]/70 hover:text-[#2A787A] hover:bg-[#2A787A]/5 border border-slate-200'
         }`}
     >
         {children}
         {count !== undefined && (
             <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                 active ? 'bg-white/20' : 'bg-slate-100'
             }`}>
                 {count}
             </span>
         )}
     </button>
 );

 const SearchIcon = ({ className }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
         <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
     </svg>
 );

 const FilterIcon = ({ className }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
     </svg>
 );

 // Objeto para centralizar los estilos y etiquetas asociados a cada nivel de riesgo.
 const riskMeta = {
     normal: { label: 'Normal', dotClass: 'bg-[#2A787A]', textClass: 'text-[#2A787A]', bgClass: 'bg-[#2A787A]/10' },
     warning: { label: 'Advertencia', dotClass: 'bg-[#FFC72C]', textClass: 'text-amber-700', bgClass: 'bg-[#FFC72C]/10' },
     alert: { label: 'Alerta', dotClass: 'bg-[#FF7F50]', textClass: 'text-[#FF7F50]', bgClass: 'bg-[#FF7F50]/10' },
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
         <div className={`bg-white rounded-2xl shadow-md transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'ring-2 ring-[#2A787A]' : 'ring-1 ring-slate-200'}`}>
             <button onClick={onToggle} className="w-full p-4 text-left flex justify-between items-center" aria-expanded={isOpen}>
                 <div className="flex items-center space-x-4">
                     <span className={`w-3 h-3 rounded-full ${meta.dotClass}`}></span>
                     <div>
                         <p className="font-bold text-[#1A2E40]">{formattedDate}</p>
                         <p className={`text-sm font-semibold ${meta.textClass}`}>Riesgo {meta.label}</p>
                     </div>
                 </div>
                 <ChevronDownIcon className={`w-6 h-6 text-[#1A2E40]/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
             </button>
             {isOpen && (
                 <div className="px-4 pb-4 border-t border-slate-200">
                     <div className={`p-4 rounded-lg mt-4 ${meta.bgClass}`}>
                         <p className="font-semibold text-[#1A2E40]">Explicación del Análisis</p>
                         <p className="text-sm text-[#1A2E40]/80 mt-1">{result.explanation}</p>
                     </div>
 
                     <div className="mt-4">
                         <h4 className="font-semibold text-[#1A2E40]">Hallazgos Principales</h4>
                         <ul className="list-disc list-inside text-sm text-[#1A2E40]/80 mt-2 space-y-1">
                             {result.keyFindings.map((finding, i) => <li key={i}>{finding}</li>)}
                         </ul>
                     </div>
 
                     <div className="mt-4">
                         <h4 className="font-semibold text-[#1A2E40]">Recomendaciones</h4>
                         <ul className="list-disc list-inside text-sm text-[#1A2E40]/80 mt-2 space-y-1">
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
     const { user } = useAuth();
     const [openItemId, setOpenItemId] = useState<string | null>(null);
     const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
     const [historyStats, setHistoryStats] = useState<LocalHistoryStats | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [searchTerm, setSearchTerm] = useState('');
     const [filterType, setFilterType] = useState<FilterType>('all');
     const [sortType, setSortType] = useState<SortType>('newest');

     // Cargar datos mock con simulación de carga
     useEffect(() => {
         const loadData = async () => {
             try {
                 setLoading(true);
                 
                 // Simular carga de datos
                 const mockData = await loadMockHistoryData();
                 
                 // Convertir MockHistoryEntry a HistoryEntry local
                 const localEntries: HistoryEntry[] = mockData.map(entry => ({
                     id: entry.id,
                     date: entry.date,
                     result: entry.result
                 }));
                 
                 setHistoryEntries(localEntries);
                 
                 // Calcular estadísticas
                 const stats = calculateMockStats(mockData);
                 setHistoryStats(stats);
                 
                 // Establecer el primer elemento como abierto
                 if (localEntries.length > 0) {
                     setOpenItemId(localEntries[0].id);
                 }
                 
                 setLoading(false);
                 setError(null);
             } catch (err) {
                 console.error('Error loading mock data:', err);
                 setError('No se pudo cargar el historial. Intentalo nuevamente.');
                 setLoading(false);
             }
         };

         loadData();
     }, []);

     // Filtrar y ordenar entradas usando funciones locales
     const filteredAndSortedEntries = React.useMemo(() => {
         // Usar la función de filtrado mock
         const filtered = filterMockData(
             mockHistoryData, 
             {
                 riskLevel: filterType !== 'all' ? filterType : undefined,
                 searchTerm: searchTerm || undefined,
                 sortBy: sortType
             }
         );
         
         // Convertir a formato local
         return filtered.map(entry => ({
             id: entry.id,
             date: entry.date,
             result: entry.result
         }));
     }, [filterType, searchTerm, sortType]);

     // Calcular conteos para filtros usando datos mock
     const counts = React.useMemo(() => {
         return {
             all: mockHistoryData.length,
             normal: mockHistoryData.filter(e => e.result.riskLevel === 'normal').length,
             warning: mockHistoryData.filter(e => e.result.riskLevel === 'warning').length,
             alert: mockHistoryData.filter(e => e.result.riskLevel === 'alert').length,
         };
     }, []);

     const handleToggle = (id: string) => {
         setOpenItemId(prevId => (prevId === id ? null : id));
     };

     if (loading) {
         return (
             <div className="fixed inset-0 bg-[#F0F4F8] z-40 overflow-y-auto font-sans">
                 <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                     <header className="flex items-center mb-8">
                         <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 transition-colors mr-4">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-[#1A2E40]">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                             </svg>
                         </button>
                         <h1 className="text-3xl font-bold text-[#1A2E40] font-poppins">Historial de Análisis</h1>
                     </header>
                     <div className="flex justify-center items-center py-16">
                         <Spinner size="lg" />
                     </div>
                 </div>
             </div>
         );
     }

     if (error) {
         return (
             <div className="fixed inset-0 bg-[#F0F4F8] z-40 overflow-y-auto font-sans">
                 <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                     <header className="flex items-center mb-8">
                         <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 transition-colors mr-4">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-[#1A2E40]">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                             </svg>
                         </button>
                         <h1 className="text-3xl font-bold text-[#1A2E40] font-poppins">Historial de Análisis</h1>
                     </header>
                     <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
                         <div className="text-red-500 mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                             </svg>
                         </div>
                         <h3 className="text-xl font-semibold text-[#1A2E40] font-poppins">Error al cargar el historial</h3>
                         <p className="text-[#1A2E40]/80 mt-2 mb-4">{error}</p>
                         <button 
                             onClick={() => window.location.reload()}
                             className="bg-[#2A787A] text-white px-6 py-2 rounded-lg hover:bg-[#2A787A]/90 transition-colors"
                         >
                             Intentar nuevamente
                         </button>
                     </div>
                 </div>
             </div>
         );
     }     return (
         <div className="fixed inset-0 bg-[#F0F4F8] z-40 overflow-y-auto font-sans">
             <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                 <header className="flex items-center mb-8">
                     <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 transition-colors mr-4">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-[#1A2E40]">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                         </svg>
                     </button>
                     <h1 className="text-3xl font-bold text-[#1A2E40] font-poppins">Historial de Análisis</h1>
                 </header>

                 {/* Barra de búsqueda y filtros */}
                 <div className="mb-6 space-y-4">
                     {/* Búsqueda */}
                     <div className="relative">
                         <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1A2E40]/50" />
                         <input
                             type="text"
                             placeholder="Buscar en historial..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-[#2A787A] focus:ring-1 focus:ring-[#2A787A] outline-none transition-colors"
                         />
                     </div>

                     {/* Filtros */}
                     <div className="flex flex-wrap gap-3">
                         <div className="flex items-center gap-2">
                             <FilterIcon className="w-5 h-5 text-[#1A2E40]/60" />
                             <span className="text-sm font-medium text-[#1A2E40]/70">Filtrar:</span>
                         </div>
                         <FilterButton
                             active={filterType === 'all'}
                             onClick={() => setFilterType('all')}
                             count={counts.all}
                         >
                             Todos
                         </FilterButton>
                         <FilterButton
                             active={filterType === 'normal'}
                             onClick={() => setFilterType('normal')}
                             count={counts.normal}
                         >
                             Normal
                         </FilterButton>
                         <FilterButton
                             active={filterType === 'warning'}
                             onClick={() => setFilterType('warning')}
                             count={counts.warning}
                         >
                             Advertencia
                         </FilterButton>
                         <FilterButton
                             active={filterType === 'alert'}
                             onClick={() => setFilterType('alert')}
                             count={counts.alert}
                         >
                             Alerta
                         </FilterButton>
                     </div>

                     {/* Ordenamiento */}
                     <div className="flex items-center gap-3">
                         <span className="text-sm font-medium text-[#1A2E40]/70">Ordenar:</span>
                         <select
                             value={sortType}
                             onChange={(e) => setSortType(e.target.value as SortType)}
                             className="px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-[#2A787A] focus:ring-1 focus:ring-[#2A787A] outline-none text-sm"
                         >
                             <option value="newest">Más reciente</option>
                             <option value="oldest">Más antiguo</option>
                         </select>
                     </div>
                 </div>

                 {/* Mostrar estadísticas si están disponibles */}
                 {historyStats && (
                     <HistoryStats
                         totalAnalyses={historyStats.totalAnalyses}
                         normalCount={historyStats.normalCount}
                         warningCount={historyStats.warningCount}
                         alertCount={historyStats.alertCount}
                         averageFeeling={historyStats.averageFeeling}
                         streak={historyStats.streak}
                     />
                 )}

                 <main>
                     {filteredAndSortedEntries.length > 0 ? (
                         <>
                             {/* Contador de resultados */}
                             <div className="mb-4">
                                 <p className="text-sm text-[#1A2E40]/70">
                                     Mostrando {filteredAndSortedEntries.length} de {mockHistoryData.length} análisis
                                     {searchTerm && ` para "${searchTerm}"`}
                                 </p>
                             </div>
                             
                             <div className="space-y-4">
                                 {filteredAndSortedEntries.map(entry => (
                                     <HistoryItemCard
                                         key={entry.id}
                                         entry={entry}
                                         isOpen={openItemId === entry.id}
                                         onToggle={() => handleToggle(entry.id)}
                                     />
                                 ))}
                             </div>
                         </>
                     ) : searchTerm || filterType !== 'all' ? (
                         <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
                             <div className="text-[#1A2E40]/40 mb-4">
                                 <SearchIcon className="w-12 h-12 mx-auto" />
                             </div>
                             <h3 className="text-xl font-semibold text-[#1A2E40] font-poppins">No se encontraron resultados</h3>
                             <p className="text-[#1A2E40]/80 mt-2 mb-4">
                                 {searchTerm 
                                     ? `No hay análisis que coincidan con "${searchTerm}"`
                                     : `No hay análisis con nivel de riesgo "${riskMeta[filterType as keyof typeof riskMeta].label}"`
                                 }
                             </p>
                             <button
                                 onClick={() => {
                                     setSearchTerm('');
                                     setFilterType('all');
                                 }}
                                 className="text-[#2A787A] hover:text-[#2A787A]/80 font-semibold"
                             >
                                 Limpiar filtros
                             </button>
                         </div>
                     ) : (
                         <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
                             <div className="text-[#1A2E40]/40 mb-4">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c0 .621.504 1.125 1.125 1.125H18a2.25 2.25 0 0 0 2.25-2.25V9.375c0-.621-.504-1.125-1.125-1.125H15M8.25 8.25V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.124-.08M15 8.25H9" />
                                 </svg>
                             </div>
                             <h3 className="text-xl font-semibold text-[#1A2E40] font-poppins">No hay análisis todavía</h3>
                             <p className="text-[#1A2E40]/80 mt-2">Cuando realices tu primer chequeo, aparecerá aquí.</p>
                         </div>
                     )}
                 </main>
             </div>
         </div>
     );
 };
 
 export default AnalysisHistoryPage;