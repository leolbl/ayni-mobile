import { 
  collection, 
  query, 
  orderBy, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AnalysisResult } from '../types';

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
}

export interface HistoryStats {
  totalAnalyses: number;
  normalCount: number;
  warningCount: number;
  alertCount: number;
  lastAnalysisDate?: Date;
  averageFeeling?: number;
  streak: number; // Días consecutivos con análisis
}

export class HistoryService {
  
  /**
   * Suscribirse al historial completo de un usuario en tiempo real
   */
  static subscribeToUserHistory(
    userId: string,
    onData: (entries: HistoryEntry[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const q = query(
      collection(db, 'checkups'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const entries: HistoryEntry[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.analysisResult) {
            entries.push(this.mapDocumentToHistoryEntry(doc.id, data));
          }
        });
        onData(entries);
      },
      (error) => {
        onError(new Error(`Error loading history: ${error.message}`));
      }
    );

    return unsubscribe;
  }

  /**
   * Obtener historial paginado
   */
  static async getPaginatedHistory(
    userId: string,
    pageSize: number = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{
    entries: HistoryEntry[];
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
    hasMore: boolean;
  }> {
    let q = query(
      collection(db, 'checkups'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(pageSize + 1) // +1 para determinar si hay más páginas
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    
    // Si hay más páginas, remover el último documento extra
    if (hasMore) {
      docs.pop();
    }

    const entries: HistoryEntry[] = docs
      .filter(doc => doc.data().analysisResult)
      .map(doc => this.mapDocumentToHistoryEntry(doc.id, doc.data()));

    return {
      entries,
      lastDoc: docs[docs.length - 1],
      hasMore
    };
  }

  /**
   * Obtener estadísticas del historial
   */
  static async getHistoryStats(userId: string): Promise<HistoryStats> {
    const q = query(
      collection(db, 'checkups'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const entries: HistoryEntry[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.analysisResult) {
        entries.push(this.mapDocumentToHistoryEntry(doc.id, data));
      }
    });

    return this.calculateStats(entries);
  }

  /**
   * Obtener análisis específico por ID
   */
  static async getAnalysisById(checkupId: string): Promise<HistoryEntry | null> {
    const docRef = doc(db, 'checkups', checkupId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().analysisResult) {
      return this.mapDocumentToHistoryEntry(docSnap.id, docSnap.data());
    }
    
    return null;
  }

  /**
   * Filtrar historial por nivel de riesgo
   */
  static filterByRiskLevel(
    entries: HistoryEntry[], 
    riskLevel: 'normal' | 'warning' | 'alert'
  ): HistoryEntry[] {
    return entries.filter(entry => entry.result.riskLevel === riskLevel);
  }

  /**
   * Buscar en el historial por términos
   */
  static searchHistory(entries: HistoryEntry[], searchTerm: string): HistoryEntry[] {
    const term = searchTerm.toLowerCase();
    return entries.filter(entry => 
      entry.result.explanation.toLowerCase().includes(term) ||
      entry.result.keyFindings.some(finding => 
        finding.toLowerCase().includes(term)
      ) ||
      entry.result.recommendations.some(rec => 
        rec.toLowerCase().includes(term)
      )
    );
  }

  /**
   * Obtener tendencias de salud (últimos N análisis)
   */
  static getHealthTrends(entries: HistoryEntry[], limit: number = 7): {
    riskLevelTrend: string[];
    feelingTrend: number[];
    dates: Date[];
  } {
    const recent = entries.slice(0, limit).reverse(); // Orden cronológico
    
    return {
      riskLevelTrend: recent.map(e => e.result.riskLevel),
      feelingTrend: recent.map(e => e.generalFeeling?.scale || 0).filter(s => s > 0),
      dates: recent.map(e => e.date)
    };
  }

  /**
   * Calcular estadísticas del historial
   */
  private static calculateStats(entries: HistoryEntry[]): HistoryStats {
    const totalAnalyses = entries.length;
    const normalCount = entries.filter(e => e.result.riskLevel === 'normal').length;
    const warningCount = entries.filter(e => e.result.riskLevel === 'warning').length;
    const alertCount = entries.filter(e => e.result.riskLevel === 'alert').length;
    
    const lastAnalysisDate = entries.length > 0 ? entries[0].date : undefined;
    
    const feelingScales = entries
      .map(e => e.generalFeeling?.scale)
      .filter((scale): scale is number => typeof scale === 'number');
    const averageFeeling = feelingScales.length > 0 
      ? feelingScales.reduce((sum, scale) => sum + scale, 0) / feelingScales.length 
      : undefined;

    // Calcular racha (días consecutivos con análisis)
    const streak = this.calculateStreak(entries);

    return {
      totalAnalyses,
      normalCount,
      warningCount,
      alertCount,
      lastAnalysisDate,
      averageFeeling,
      streak
    };
  }

  /**
   * Calcular racha de días consecutivos con análisis
   */
  private static calculateStreak(entries: HistoryEntry[]): number {
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
      
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = new Date(entryDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Mapear documento de Firebase a HistoryEntry
   */
  private static mapDocumentToHistoryEntry(id: string, data: DocumentData): HistoryEntry {
    return {
      id,
      date: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp),
      result: data.analysisResult,
      generalFeeling: data.generalFeeling,
      hasSymptoms: data.hasSymptoms,
      vitals: data.vitals
    };
  }

  /**
   * Exportar historial a CSV
   */
  static exportToCSV(entries: HistoryEntry[]): string {
    const headers = [
      'Fecha',
      'Nivel de Riesgo',
      'Urgencia',
      'Explicación',
      'Hallazgos Principales',
      'Recomendaciones',
      'Estado General (1-5)',
      'Frecuencia Cardíaca',
      'Temperatura',
      'SpO2'
    ];

    const rows = entries.map(entry => [
      entry.date.toLocaleDateString(),
      entry.result.riskLevel,
      entry.result.urgencyLevel,
      `"${entry.result.explanation.replace(/"/g, '""')}"`,
      `"${entry.result.keyFindings.join('; ').replace(/"/g, '""')}"`,
      `"${entry.result.recommendations.join('; ').replace(/"/g, '""')}"`,
      entry.generalFeeling?.scale || '',
      entry.vitals?.heartRate || '',
      entry.vitals?.temperature || '',
      entry.vitals?.spo2 || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}