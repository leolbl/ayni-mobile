import { useState, useEffect, useCallback } from 'react';
import { AnalysisResult, Checkup } from '../types';
import { mockHistoryData } from '../data/mockHistoryData';

export interface HistoryEntry {
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
    symptoms?: Array<{
        name: string;
        intensity: number;
        details?: string;
    }>;
}

interface UseHistoryReturn {
    history: HistoryEntry[];
    latestAnalysis: HistoryEntry | null;
    addNewAnalysis: (checkup: Checkup, result: AnalysisResult) => void;
    getTimeUntilNextAnalysis: () => { days: number; hours: number; minutes: number } | null;
    shouldRecommendAnalysis: () => boolean;
    getNextAnalysisDate: () => Date;
    clearHistory: () => void;
    isLoading: boolean;
}

/**
 * Hook personalizado para manejar el historial de análisis médicos
 * Incluye funciones para agregar nuevos análisis y calcular tiempos de seguimiento
 */
export const useHistory = (): UseHistoryReturn => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Inicializar con datos mock
    useEffect(() => {
        setIsLoading(true);
        // Simular carga de datos
        setTimeout(() => {
            const mockData: HistoryEntry[] = mockHistoryData.map(item => ({
                id: item.id,
                date: item.date,
                result: item.result,
                generalFeeling: item.generalFeeling,
                hasSymptoms: item.hasSymptoms,
                vitals: item.vitals
            }));
            setHistory(mockData);
            setIsLoading(false);
        }, 100);
    }, []);

    /**
     * Agregar un nuevo análisis al historial
     */
    const addNewAnalysis = useCallback((checkup: Checkup, result: AnalysisResult) => {
        const newEntry: HistoryEntry = {
            id: `analysis_${Date.now()}`,
            date: new Date(),
            result,
            generalFeeling: checkup.generalFeeling,
            hasSymptoms: checkup.hasSymptoms,
            vitals: checkup.vitals,
            symptoms: checkup.symptoms
        };

        setHistory(prevHistory => {
            // Agregar al inicio del array (más reciente primero)
            const updatedHistory = [newEntry, ...prevHistory];
            
            // Opcional: limitar el historial a los últimos 50 análisis
            return updatedHistory.slice(0, 50);
        });

        // Opcional: guardar en localStorage para persistencia
        try {
            const storageKey = 'ayni_analysis_history';
            const currentStorage = localStorage.getItem(storageKey);
            const existingHistory = currentStorage ? JSON.parse(currentStorage) : [];
            
            const updatedStorage = [
                {
                    ...newEntry,
                    date: newEntry.date.toISOString() // Convertir Date a string para JSON
                },
                ...existingHistory.slice(0, 49) // Mantener solo los últimos 49 + el nuevo = 50
            ];
            
            localStorage.setItem(storageKey, JSON.stringify(updatedStorage));
        } catch (error) {
            console.warn('No se pudo guardar en localStorage:', error);
        }
    }, []);

    /**
     * Obtener el análisis más reciente
     */
    const latestAnalysis = history.length > 0 ? history[0] : null;

    /**
     * Calcular la fecha del próximo análisis recomendado
     */
    const getNextAnalysisDate = useCallback((): Date => {
        if (!latestAnalysis) {
            // Si no hay historial, recomendar en 7 días
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + 7);
            return nextDate;
        }

        // Usar la frecuencia específica recomendada en el último análisis
        const frequency = latestAnalysis.result.recommendedFrequencyDays || 7;
        const nextDate = new Date(latestAnalysis.date);
        nextDate.setDate(nextDate.getDate() + frequency);
        return nextDate;
    }, [latestAnalysis]);

    /**
     * Obtener el tiempo restante hasta el próximo análisis
     */
    const getTimeUntilNextAnalysis = useCallback((): { days: number; hours: number; minutes: number } | null => {
        const nextDate = getNextAnalysisDate();
        const now = new Date();
        const difference = nextDate.getTime() - now.getTime();

        if (difference <= 0) {
            return null; // Es hora del análisis
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60)
        };
    }, [getNextAnalysisDate]);

    /**
     * Verificar si es hora de hacer un nuevo análisis
     */
    const shouldRecommendAnalysis = useCallback((): boolean => {
        const nextDate = getNextAnalysisDate();
        return new Date() >= nextDate;
    }, [getNextAnalysisDate]);

    /**
     * Limpiar todo el historial
     */
    const clearHistory = useCallback(() => {
        setHistory([]);
        try {
            localStorage.removeItem('ayni_analysis_history');
        } catch (error) {
            console.warn('No se pudo limpiar localStorage:', error);
        }
    }, []);

    return {
        history,
        latestAnalysis,
        addNewAnalysis,
        getTimeUntilNextAnalysis,
        shouldRecommendAnalysis,
        getNextAnalysisDate,
        clearHistory,
        isLoading
    };
};