export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  sex: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  chronicConditions: string[];
  allergies: string[];
  onboardingCompleted: boolean;
  
  // Professional Onboarding Fields
  surgeriesOrPastIllnesses: string[];
  medicationsAndSupplements: string[];
  smokingStatus?: 'never' | 'former' | 'current';
  alcoholConsumption?: 'none' | 'light' | 'moderate' | 'heavy';
  exerciseFrequency?: 'never' | 'rarely' | 'regularly' | 'frequently';
  drugConsumption?: 'none' | 'rarely' | 'regularly' | 'prefer_not_to_say';
}

export interface Measurement {
  id?: string;
  type: 'heartRate' | 'bloodPressure' | 'temperature' | 'bloodSugar';
  value: number | { systolic: number; diastolic: number };
  unit: string;
  timestamp: Date;
}

export interface AnalysisResult {
  riskLevel: 'normal' | 'warning' | 'alert';
  explanation: string;
  recommendations: string[];
  keyFindings: string[];
  urgencyLevel: 'routine' | 'priority' | 'urgent';
  personalizedInsights: string[];
  riskFactors: string[];
  followUpPlan: string;
}

// --- NUEVOS TIPOS PARA EL CHEQUEO DE BIENESTAR ---

export interface Symptom {
  name: string;       // ej. "Dolor de cabeza"
  intensity: number;  // 1-10
  details?: string;     // Opcional
}

export interface Checkup {
  // timestamp: FieldValue; // Se añadirá en el backend
  generalFeeling: {
    scale: number;    // 1-5
    tags: string[];   // ej. ["Cansado/a", "Estresado/a"]
  };
  vitals: {
    heartRate?: number;
    spo2?: number;
    temperature?: number;
    bloodPressure?: { systolic?: number; diastolic?: number };
  };
  hasSymptoms: boolean;
  symptoms?: Symptom[]; // Existe solo si hasSymptoms es true
  analysisResult?: AnalysisResult; // Se adjuntará después del análisis de IA
}