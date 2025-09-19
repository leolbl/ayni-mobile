import { AnalysisResult } from '../types';

export interface MockHistoryEntry {
    id: string;
    date: Date;
    result: AnalysisResult;
    generalFeeling?: {
        scale: number;
        tags: string[];
    };
    hasSymptoms?: boolean;
    vitals?: {
        heartRate?: number;
        spo2?: number;
        temperature?: number;
        bloodPressure?: { systolic?: number; diastolic?: number };
    };
}

// Helper para crear datos mock completos
const createMockResult = (base: Partial<AnalysisResult>): AnalysisResult => ({
    riskLevel: 'normal',
    explanation: '',
    recommendations: [],
    keyFindings: [],
    urgencyLevel: 'routine',
    personalizedInsights: ['Análisis basado en tu perfil de salud personalizado'],
    riskFactors: ['Sin factores de riesgo significativos identificados'],
    followUpPlan: 'Continúa con chequeos regulares según tu plan de salud personalizado.',
    ...base
});

// Datos de ejemplo más completos y realistas
export const mockHistoryData: MockHistoryEntry[] = [
    {
        id: '1',
        date: new Date('2024-09-19T10:00:00Z'),
        generalFeeling: { scale: 4, tags: ['Energético/a', 'Optimista'] },
        hasSymptoms: false,
        vitals: { heartRate: 72, spo2: 98, temperature: 36.5 },
        result: createMockResult({
            riskLevel: 'normal',
            explanation: 'Tus parámetros están dentro de los rangos normales. Tu estado general es bueno y no se detectan signos de alarma.',
            keyFindings: ['Signos vitales normales', 'Estado de ánimo positivo', 'Sin síntomas reportados'],
            recommendations: [
                'Continúa con tu rutina de ejercicio regular.',
                'Mantén una alimentación balanceada.',
                'Asegúrate de dormir al menos 7-8 horas diarias.'
            ],
            personalizedInsights: [
                'Tu frecuencia cardíaca de 72 bpm está en el rango ideal para tu edad',
                'El estado de ánimo positivo es un excelente indicador de bienestar general'
            ],
            riskFactors: ['Sin factores de riesgo identificados en esta evaluación'],
            followUpPlan: 'Continúa con chequeos mensuales preventivos. Mantén tus hábitos saludables actuales.',
            recommendedFrequencyDays: 14 // Cada 2 semanas para perfil normal
        })
    },
    {
        id: '2',
        date: new Date('2024-09-17T14:30:00Z'),
        generalFeeling: { scale: 3, tags: ['Cansado/a', 'Algo estresado/a'] },
        hasSymptoms: false,
        vitals: { heartRate: 78, spo2: 97, temperature: 36.8 },
        result: createMockResult({
            riskLevel: 'normal',
            explanation: 'Aunque reportas cansancio y estrés, tus signos vitales están bien. Esto puede ser resultado de una carga de trabajo intensa.',
            keyFindings: ['Fatiga leve reportada', 'Estrés moderado', 'Signos vitales estables'],
            recommendations: [
                'Prioriza el descanso y manejo del estrés.',
                'Considera técnicas de relajación como meditación.',
                'Evalúa tu carga de trabajo actual.'
            ],
            personalizedInsights: [
                'El cansancio puede estar relacionado con estrés laboral o personal',
                'Tus signos vitales se mantienen estables a pesar del estrés reportado'
            ],
            riskFactors: ['Estrés crónico - factor de riesgo cardiovascular si persiste'],
            followUpPlan: 'Seguimiento en 2 semanas para evaluar niveles de estrés. Considera consulta con especialista en manejo de estrés si persiste.',
            recommendedFrequencyDays: 10 // Seguimiento más frecuente por estrés
        })
    },
    {
        id: '3',
        date: new Date('2024-09-15T09:15:00Z'),
        generalFeeling: { scale: 2, tags: ['Con dolor', 'Preocupado/a'] },
        hasSymptoms: true,
        vitals: { heartRate: 88, spo2: 96, temperature: 37.2, bloodPressure: { systolic: 145, diastolic: 92 } },
        result: createMockResult({
            riskLevel: 'warning',
            explanation: 'Presentas signos que requieren atención. La presión arterial está elevada y tienes síntomas de dolor que necesitan evaluación médica.',
            keyFindings: ['Presión arterial elevada', 'Temperatura ligeramente alta', 'Dolor reportado'],
            recommendations: [
                'Consulta con tu médico dentro de los próximos 3-5 días.',
                'Monitorea tu presión arterial diariamente.',
                'Evita el estrés y actividades intensas.',
                'Considera reducir la ingesta de sal.'
            ],
            urgencyLevel: 'priority',
            personalizedInsights: [
                'La combinación de presión alta y dolor puede indicar necesidad de evaluación médica',
                'Tu temperatura está en el límite superior del rango normal'
            ],
            riskFactors: ['Hipertensión arterial', 'Síntomas de dolor sin causa clara'],
            followUpPlan: 'Consulta médica prioritaria en 3-5 días. Monitoreo diario de presión arterial. Seguimiento en 1 semana.',
            recommendedFrequencyDays: 3 // Seguimiento cada 3 días por signos de advertencia
        })
    }
];

// Helper functions para el dashboard
export const loadMockHistoryData = (): MockHistoryEntry[] => {
    return mockHistoryData;
};

export const filterMockData = (
    data: MockHistoryEntry[], 
    filters?: {
        startDate?: Date;
        endDate?: Date;
        riskLevel?: string;
        searchTerm?: string;
        sortBy?: string;
    }
): MockHistoryEntry[] => {
    let filtered = [...data];
    
    if (filters) {
        // Filter by date range
        if (filters.startDate || filters.endDate) {
            filtered = filtered.filter(entry => {
                const entryDate = entry.date;
                if (filters.startDate && entryDate < filters.startDate) return false;
                if (filters.endDate && entryDate > filters.endDate) return false;
                return true;
            });
        }
        
        // Filter by risk level
        if (filters.riskLevel && filters.riskLevel !== 'all') {
            filtered = filtered.filter(entry => entry.result.riskLevel === filters.riskLevel);
        }
        
        // Filter by search term (placeholder - could search in explanation or symptoms)
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(entry => 
                entry.result.explanation.toLowerCase().includes(term) ||
                entry.result.keyFindings.some(finding => finding.toLowerCase().includes(term))
            );
        }
        
        // Sort by specified criteria
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'date-desc':
                        return b.date.getTime() - a.date.getTime();
                    case 'date-asc':
                        return a.date.getTime() - b.date.getTime();
                    case 'risk-high':
                        const riskOrder = { alert: 3, warning: 2, normal: 1 };
                        return (riskOrder[b.result.riskLevel as keyof typeof riskOrder] || 0) - 
                               (riskOrder[a.result.riskLevel as keyof typeof riskOrder] || 0);
                    case 'risk-low':
                        const riskOrderLow = { alert: 3, warning: 2, normal: 1 };
                        return (riskOrderLow[a.result.riskLevel as keyof typeof riskOrderLow] || 0) - 
                               (riskOrderLow[b.result.riskLevel as keyof typeof riskOrderLow] || 0);
                    default:
                        return 0;
                }
            });
        }
    }
    
    return filtered;
};

export const calculateMockStats = (data: MockHistoryEntry[]) => {
    const total = data.length;
    const normal = data.filter(entry => entry.result.riskLevel === 'normal').length;
    const warning = data.filter(entry => entry.result.riskLevel === 'warning').length;
    const alert = data.filter(entry => entry.result.riskLevel === 'alert').length;
    
    return {
        total,
        normal,
        warning,
        alert,
        normalPercentage: total > 0 ? Math.round((normal / total) * 100) : 0,
        warningPercentage: total > 0 ? Math.round((warning / total) * 100) : 0,
        alertPercentage: total > 0 ? Math.round((alert / total) * 100) : 0
    };
};