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

// Datos de ejemplo más completos y realistas
export const mockHistoryData: MockHistoryEntry[] = [
    {
        id: '1',
        date: new Date('2024-09-19T10:00:00Z'),
        generalFeeling: { scale: 4, tags: ['Energético/a', 'Optimista'] },
        hasSymptoms: false,
        vitals: { heartRate: 72, spo2: 98, temperature: 36.5 },
        result: {
            riskLevel: 'normal',
            explanation: 'Tus parámetros están dentro de los rangos normales. Tu estado general es bueno y no se detectan signos de alarma.',
            keyFindings: ['Signos vitales normales', 'Estado de ánimo positivo', 'Sin síntomas reportados'],
            recommendations: [
                'Continúa con tu rutina de ejercicio regular.',
                'Mantén una alimentación balanceada.',
                'Asegúrate de dormir al menos 7-8 horas diarias.'
            ],
            urgencyLevel: 'routine',
        },
    },
    {
        id: '2',
        date: new Date('2024-09-17T14:30:00Z'),
        generalFeeling: { scale: 3, tags: ['Cansado/a', 'Algo estresado/a'] },
        hasSymptoms: true,
        vitals: { heartRate: 78, spo2: 97, temperature: 36.8 },
        result: {
            riskLevel: 'normal',
            explanation: 'Aunque reportas cansancio y estrés, tus signos vitales están bien. Esto puede ser resultado de una carga de trabajo intensa.',
            keyFindings: ['Fatiga leve reportada', 'Estrés moderado', 'Signos vitales estables'],
            recommendations: [
                'Practica técnicas de relajación como meditación o yoga.',
                'Asegúrate de tomar descansos regulares durante el trabajo.',
                'Considera reducir la cafeína si consumes mucha.'
            ],
            urgencyLevel: 'routine',
        },
    },
    {
        id: '3',
        date: new Date('2024-09-15T09:15:00Z'),
        generalFeeling: { scale: 2, tags: ['Malestar general', 'Decaído/a'] },
        hasSymptoms: true,
        vitals: { heartRate: 85, spo2: 96, temperature: 37.2, bloodPressure: { systolic: 125, diastolic: 82 } },
        result: {
            riskLevel: 'warning',
            explanation: 'Se detecta una temperatura ligeramente elevada y malestar general. Podría ser el inicio de un proceso infeccioso leve.',
            keyFindings: ['Temperatura subfebril', 'Malestar general reportado', 'Frecuencia cardíaca algo elevada'],
            recommendations: [
                'Descansa y mantente hidratado bebiendo abundantes líquidos.',
                'Monitorea tu temperatura cada 4-6 horas.',
                'Si los síntomas empeoran o la fiebre sube, consulta a tu médico.',
                'Evita el contacto cercano con otras personas para no contagiar.'
            ],
            urgencyLevel: 'priority',
        },
    },
    {
        id: '4',
        date: new Date('2024-09-12T16:45:00Z'),
        generalFeeling: { scale: 5, tags: ['Excelente', 'Muy activo/a'] },
        hasSymptoms: false,
        vitals: { heartRate: 68, spo2: 99, temperature: 36.4 },
        result: {
            riskLevel: 'normal',
            explanation: 'Excelente estado de salud. Todos tus parámetros están óptimos y tu nivel de energía es muy bueno.',
            keyFindings: ['Estado físico excelente', 'Signos vitales óptimos', 'Alto nivel de energía'],
            recommendations: [
                'Continúa con tus hábitos saludables actuales.',
                'Mantén tu rutina de actividad física.',
                'Considera este un buen momento para establecer nuevas metas de bienestar.'
            ],
            urgencyLevel: 'routine',
        },
    },
    {
        id: '5',
        date: new Date('2024-09-10T11:20:00Z'),
        generalFeeling: { scale: 2, tags: ['Ansioso/a', 'Dolor de cabeza'] },
        hasSymptoms: true,
        vitals: { heartRate: 95, spo2: 97, temperature: 36.9, bloodPressure: { systolic: 140, diastolic: 88 } },
        result: {
            riskLevel: 'warning',
            explanation: 'Tu presión arterial está elevada y reportas ansiedad con dolor de cabeza. Esto podría estar relacionado con estrés o tensión.',
            keyFindings: ['Presión arterial elevada', 'Ansiedad reportada', 'Cefalea presente', 'Taquicardia leve'],
            recommendations: [
                'Programa una consulta médica esta semana para evaluar tu presión arterial.',
                'Practica técnicas de respiración profunda para manejar la ansiedad.',
                'Reduce el consumo de sal y cafeína temporalmente.',
                'Monitorea tu presión arterial en casa si es posible.'
            ],
            urgencyLevel: 'priority',
        },
    },
    {
        id: '6',
        date: new Date('2024-09-08T08:30:00Z'),
        generalFeeling: { scale: 1, tags: ['Muy mal', 'Dolor intenso'] },
        hasSymptoms: true,
        vitals: { heartRate: 110, spo2: 94, temperature: 38.5, bloodPressure: { systolic: 150, diastolic: 95 } },
        result: {
            riskLevel: 'alert',
            explanation: 'Presentas fiebre alta, dolor intenso y signos vitales alterados. Es importante que busques atención médica inmediata.',
            keyFindings: ['Fiebre alta (38.5°C)', 'Taquicardia significativa', 'Hipoxemia leve', 'Hipertensión'],
            recommendations: [
                'Dirígete inmediatamente al servicio de urgencias más cercano.',
                'No conduzcas; pide a alguien que te acompañe o llama una ambulancia.',
                'Lleva contigo una lista de tus medicamentos actuales.',
                'Informa al personal médico sobre todos los síntomas que presentas.'
            ],
            urgencyLevel: 'urgent',
        },
    },
    {
        id: '7',
        date: new Date('2024-09-05T13:10:00Z'),
        generalFeeling: { scale: 4, tags: ['Recuperándose', 'Mejor'] },
        hasSymptoms: false,
        vitals: { heartRate: 75, spo2: 98, temperature: 36.6 },
        result: {
            riskLevel: 'normal',
            explanation: 'Buena recuperación tras tu episodio anterior. Tus signos vitales han vuelto a la normalidad.',
            keyFindings: ['Normalización de signos vitales', 'Mejoría subjetiva', 'Sin síntomas activos'],
            recommendations: [
                'Continúa el reposo hasta sentirte completamente recuperado.',
                'Mantén una dieta suave y nutritiva.',
                'Programa una cita de seguimiento con tu médico de cabecera.'
            ],
            urgencyLevel: 'routine',
        },
    },
    {
        id: '8',
        date: new Date('2024-09-03T19:45:00Z'),
        generalFeeling: { scale: 3, tags: ['Algo mejor', 'Todavía débil'] },
        hasSymptoms: true,
        vitals: { heartRate: 82, spo2: 96, temperature: 37.0 },
        result: {
            riskLevel: 'warning',
            explanation: 'Aunque hay mejoría, aún presentas algunos síntomas residuales. Es importante continuar el reposo y seguimiento.',
            keyFindings: ['Temperatura ligeramente elevada', 'Debilidad persistente', 'Mejoría gradual'],
            recommendations: [
                'Continúa con el tratamiento médico indicado.',
                'Aumenta gradualmente tu nivel de actividad.',
                'Mantente bien hidratado y come alimentos nutritivos.',
                'Contacta a tu médico si los síntomas empeoran.'
            ],
            urgencyLevel: 'priority',
        },
    }
];

// Función para simular la carga de datos con delay
export const loadMockHistoryData = (): Promise<MockHistoryEntry[]> => {
    return new Promise((resolve) => {
        // Simular delay de red
        setTimeout(() => {
            resolve(mockHistoryData);
        }, 800);
    });
};

// Función para filtrar datos mock
export const filterMockData = (
    data: MockHistoryEntry[], 
    filters: {
        riskLevel?: 'normal' | 'warning' | 'alert';
        searchTerm?: string;
        sortBy?: 'newest' | 'oldest';
    }
): MockHistoryEntry[] => {
    let filtered = [...data];

    // Filtrar por nivel de riesgo
    if (filters.riskLevel) {
        filtered = filtered.filter(entry => entry.result.riskLevel === filters.riskLevel);
    }

    // Filtrar por término de búsqueda
    if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(entry => 
            entry.result.explanation.toLowerCase().includes(term) ||
            entry.result.keyFindings.some(finding => 
                finding.toLowerCase().includes(term)
            ) ||
            entry.result.recommendations.some(rec => 
                rec.toLowerCase().includes(term)
            )
        );
    }

    // Ordenar
    if (filters.sortBy === 'oldest') {
        filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
        filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    return filtered;
};

// Función para calcular estadísticas mock
export const calculateMockStats = (data: MockHistoryEntry[]) => {
    const totalAnalyses = data.length;
    const normalCount = data.filter(e => e.result.riskLevel === 'normal').length;
    const warningCount = data.filter(e => e.result.riskLevel === 'warning').length;
    const alertCount = data.filter(e => e.result.riskLevel === 'alert').length;
    
    const feelingScales = data
        .map(e => e.generalFeeling?.scale)
        .filter((scale): scale is number => typeof scale === 'number');
    const averageFeeling = feelingScales.length > 0 
        ? feelingScales.reduce((sum, scale) => sum + scale, 0) / feelingScales.length 
        : undefined;

    // Calcular racha simulada
    const streak = calculateMockStreak(data);

    return {
        totalAnalyses,
        normalCount,
        warningCount,
        alertCount,
        lastAnalysisDate: data.length > 0 ? data[0].date : undefined,
        averageFeeling,
        streak
    };
};

// Función para calcular racha mock
const calculateMockStreak = (entries: MockHistoryEntry[]): number => {
    if (entries.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ordenar por fecha descendente
    const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
    
    let currentDate = new Date(today);
    
    for (const entry of sortedEntries) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 2) { // Permitir hasta 2 días de diferencia para simular consistencia
            streak++;
            currentDate = new Date(entryDate);
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
};