import { UserProfile } from '../types';

/**
 * Servicio para calcular el riesgo de salud del usuario y determinar 
 * la frecuencia recomendada de análisis basada en múltiples factores
 */

export interface HealthRiskAssessment {
  riskScore: number; // 0-100, donde 100 es el mayor riesgo
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendedAnalysisFrequency: number; // días entre análisis
  riskFactors: string[];
  personalizedMessage: string;
}

/**
 * Calcula la edad del usuario basada en su fecha de nacimiento
 */
function calculateAge(birthDateString: string): number {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calcula el IMC del usuario
 */
function calculateBMI(weight: number, height: number): number {
  return weight / Math.pow(height / 100, 2);
}

/**
 * Evalúa factores demográficos de riesgo
 */
function assessDemographicRisk(userProfile: UserProfile): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  const age = calculateAge(userProfile.birthDate);
  const bmi = calculateBMI(userProfile.weight, userProfile.height);

  // Factores de edad
  if (age >= 65) {
    score += 15;
    factors.push('Edad avanzada (≥65 años)');
  } else if (age >= 50) {
    score += 8;
    factors.push('Edad de riesgo moderado (50-64 años)');
  } else if (age >= 40) {
    score += 3;
    factors.push('Edad de riesgo leve (40-49 años)');
  }

  // Factores de IMC
  if (bmi >= 35) {
    score += 12;
    factors.push('Obesidad severa (IMC ≥35)');
  } else if (bmi >= 30) {
    score += 8;
    factors.push('Obesidad (IMC 30-34.9)');
  } else if (bmi >= 25) {
    score += 4;
    factors.push('Sobrepeso (IMC 25-29.9)');
  } else if (bmi < 18.5) {
    score += 6;
    factors.push('Bajo peso (IMC <18.5)');
  }

  return { score, factors };
}

/**
 * Evalúa condiciones crónicas y historial médico
 */
function assessMedicalHistoryRisk(userProfile: UserProfile): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // Condiciones crónicas de alto riesgo
  const highRiskConditions = [
    'diabetes', 'enfermedad cardíaca', 'enfermedad renal', 'hipertensión'
  ];
  
  const moderateRiskConditions = [
    'asma', 'artritis'
  ];

  userProfile.chronicConditions.forEach(condition => {
    const conditionLower = condition.toLowerCase();
    
    if (highRiskConditions.some(hrc => conditionLower.includes(hrc))) {
      score += 15;
      factors.push(`Condición crónica de alto riesgo: ${condition}`);
    } else if (moderateRiskConditions.some(mrc => conditionLower.includes(mrc))) {
      score += 8;
      factors.push(`Condición crónica de riesgo moderado: ${condition}`);
    } else if (condition !== 'Ninguna') {
      score += 5;
      factors.push(`Condición crónica: ${condition}`);
    }
  });

  // Historial de cirugías complejas
  const complexSurgeries = [
    'enfermedad cardíaca', 'reemplazo de cadera', 'cirugía de vesícula biliar'
  ];
  
  userProfile.surgeriesOrPastIllnesses.forEach(surgery => {
    const surgeryLower = surgery.toLowerCase();
    if (complexSurgeries.some(cs => surgeryLower.includes(cs))) {
      score += 5;
      factors.push(`Historial quirúrgico complejo: ${surgery}`);
    } else if (surgery !== 'Ninguna') {
      score += 2;
      factors.push(`Historial quirúrgico: ${surgery}`);
    }
  });

  // Medicamentos que indican condiciones serias
  const seriousMedications = [
    'metformina', 'medicamentos para la presión'
  ];
  
  userProfile.medicationsAndSupplements.forEach(medication => {
    const medicationLower = medication.toLowerCase();
    if (seriousMedications.some(sm => medicationLower.includes(sm))) {
      score += 8;
      factors.push(`Medicación de control: ${medication}`);
    }
  });

  return { score, factors };
}

/**
 * Evalúa factores de estilo de vida
 */
function assessLifestyleRisk(userProfile: UserProfile): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // Tabaquismo
  if (userProfile.smokingStatus === 'current') {
    score += 20;
    factors.push('Tabaquismo activo (riesgo muy alto)');
  } else if (userProfile.smokingStatus === 'former') {
    score += 8;
    factors.push('Ex-fumador (riesgo residual)');
  }

  // Consumo de alcohol
  if (userProfile.alcoholConsumption === 'heavy') {
    score += 12;
    factors.push('Consumo excesivo de alcohol');
  } else if (userProfile.alcoholConsumption === 'moderate') {
    score += 4;
    factors.push('Consumo moderado de alcohol');
  }

  // Frecuencia de ejercicio
  if (userProfile.exerciseFrequency === 'never') {
    score += 15;
    factors.push('Sedentarismo completo');
  } else if (userProfile.exerciseFrequency === 'rarely') {
    score += 10;
    factors.push('Actividad física muy limitada');
  } else if (userProfile.exerciseFrequency === 'frequently') {
    score -= 5; // Bonus por ejercicio frecuente
    factors.push('Actividad física regular (factor protector)');
  }

  // Consumo de drogas
  if (userProfile.drugConsumption === 'regularly') {
    score += 15;
    factors.push('Uso regular de drogas recreativas');
  } else if (userProfile.drugConsumption === 'rarely') {
    score += 5;
    factors.push('Uso ocasional de drogas recreativas');
  }

  return { score, factors };
}

/**
 * Determina el nivel de riesgo basado en la puntuación total
 */
function determineRiskLevel(totalScore: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (totalScore >= 50) return 'critical';
  if (totalScore >= 35) return 'high';
  if (totalScore >= 20) return 'moderate';
  return 'low';
}

/**
 * Calcula la frecuencia recomendada de análisis basada en el nivel de riesgo
 */
function calculateAnalysisFrequency(riskLevel: 'low' | 'moderate' | 'high' | 'critical', age: number): number {
  const baseFrequencies = {
    low: 14,      // 2 semanas
    moderate: 7,   // 1 semana
    high: 3,       // 3 días
    critical: 1    // 1 día
  };

  let frequency = baseFrequencies[riskLevel];

  // Ajustar por edad
  if (age >= 65) {
    frequency = Math.max(1, Math.floor(frequency * 0.7)); // Más frecuente para adultos mayores
  } else if (age >= 50) {
    frequency = Math.max(1, Math.floor(frequency * 0.85));
  }

  return frequency;
}

/**
 * Genera un mensaje personalizado basado en el perfil de riesgo
 */
function generatePersonalizedMessage(
  riskLevel: 'low' | 'moderate' | 'high' | 'critical',
  frequency: number,
  primaryRiskFactors: string[]
): string {
  const name = primaryRiskFactors.length > 0 ? 'dado tu perfil de salud' : 'mantener tu bienestar';
  
  const messages = {
    low: `Excelente, tu perfil de riesgo es bajo. Te recomendamos análisis cada ${frequency} días para mantener un seguimiento preventivo de tu salud.`,
    moderate: `Tu perfil muestra algunos factores de riesgo que requieren atención. Recomendamos análisis cada ${frequency} días para monitoreo regular.`,
    high: `Tu perfil indica factores de riesgo importantes. Es crucial realizar análisis cada ${frequency} días para seguimiento estrecho y detección temprana.`,
    critical: `Tu perfil presenta múltiples factores de alto riesgo. Necesitas análisis ${frequency === 1 ? 'diarios' : `cada ${frequency} días`} para monitoreo intensivo de tu salud.`
  };

  return messages[riskLevel];
}

/**
 * Función principal que evalúa el riesgo de salud del usuario
 */
export function assessHealthRisk(userProfile: UserProfile): HealthRiskAssessment {
  // Evaluar diferentes categorías de riesgo
  const demographicRisk = assessDemographicRisk(userProfile);
  const medicalHistoryRisk = assessMedicalHistoryRisk(userProfile);
  const lifestyleRisk = assessLifestyleRisk(userProfile);

  // Calcular puntuación total
  const totalScore = Math.max(0, Math.min(100, 
    demographicRisk.score + medicalHistoryRisk.score + lifestyleRisk.score
  ));

  // Combinar factores de riesgo
  const allRiskFactors = [
    ...demographicRisk.factors,
    ...medicalHistoryRisk.factors,
    ...lifestyleRisk.factors
  ];

  // Determinar nivel de riesgo
  const riskLevel = determineRiskLevel(totalScore);
  
  // Calcular frecuencia recomendada
  const age = calculateAge(userProfile.birthDate);
  const recommendedFrequency = calculateAnalysisFrequency(riskLevel, age);

  // Generar mensaje personalizado
  const personalizedMessage = generatePersonalizedMessage(riskLevel, recommendedFrequency, allRiskFactors);

  return {
    riskScore: totalScore,
    riskLevel,
    recommendedAnalysisFrequency: recommendedFrequency,
    riskFactors: allRiskFactors,
    personalizedMessage
  };
}

/**
 * Calcula cuándo debe ser el próximo análisis basado en el último realizado
 */
export function calculateNextAnalysisDate(
  userProfile: UserProfile,
  lastAnalysisDate?: Date
): Date {
  const assessment = assessHealthRisk(userProfile);
  const frequency = assessment.recommendedAnalysisFrequency;
  
  const baseDate = lastAnalysisDate || new Date();
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + frequency);
  
  return nextDate;
}

/**
 * Verifica si es hora de realizar un nuevo análisis
 */
export function shouldRecommendAnalysis(
  userProfile: UserProfile,
  lastAnalysisDate?: Date
): boolean {
  const nextRecommendedDate = calculateNextAnalysisDate(userProfile, lastAnalysisDate);
  return new Date() >= nextRecommendedDate;
}