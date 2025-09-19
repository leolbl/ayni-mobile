import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AnalysisResult, Checkup } from '../types';

// Asumir que process.env.GEMINI_API_KEY está configurado en el entorno
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("La clave de API de Gemini no está configurada. Por favor, establece la variable de entorno GEMINI_API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: {
      type: Type.STRING,
      enum: ["normal", "warning", "alert"],
      description: "Nivel de riesgo: 'normal' para estado saludable, 'warning' para situaciones que requieren seguimiento, 'alert' para casos que necesitan atención médica urgente."
    },
    explanation: {
      type: Type.STRING,
      description: "Explicación clara, empática y en términos sencillos del estado de salud actual. Debe incluir una breve justificación del nivel de riesgo asignado, considerando los hallazgos más relevantes. Máximo 150 palabras."
    },
    recommendations: {
      type: Type.ARRAY,
      items: { 
        type: Type.STRING,
        description: "Recomendación específica y accionable con plazo temporal cuando sea relevante"
      },
      description: "Lista de 2-3 recomendaciones priorizadas, específicas y accionables. Deben incluir plazos cuando sea apropiado (ej: 'en las próximas 24 horas', 'esta semana', 'en tu próxima cita médica')."
    },
    keyFindings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 1-3 hallazgos más significativos que influyeron en la evaluación (ej: 'Presión arterial elevada', 'Síntomas compatibles con resfriado común', 'Signos vitales normales para la edad')"
    },
    urgencyLevel: {
      type: Type.STRING,
      enum: ["routine", "priority", "urgent"],
      description: "Nivel de urgencia para buscar atención médica: 'routine' para seguimiento normal, 'priority' para atención en días, 'urgent' para atención inmediata"
    }
  },
  required: ["riskLevel", "explanation", "recommendations", "keyFindings", "urgencyLevel"]
};

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


export const getCheckupAnalysis = async (
  checkup: Checkup,
  userProfile: UserProfile
): Promise<AnalysisResult> => {
  if (!API_KEY) {
    // Devolver una respuesta de prueba si la clave de API no está disponible
    return {
      riskLevel: "warning",
      explanation: "Clave de API no configurada. Esta es una respuesta de prueba. Por favor, busca consejo médico profesional para cualquier preocupación de salud.",
      recommendations: [
        "Consulta a un médico por cualquier preocupación de salud.", 
        "Este servicio es solo para fines informativos y no sustituye atención médica."
      ],
      keyFindings: ["Sistema en modo de prueba - API no configurada"],
      urgencyLevel: "routine"
    };
  }

  // Construir un informe detallado del chequeo del usuario
  const vitalsReport = [
    checkup.vitals.heartRate && `Frecuencia Cardíaca: ${checkup.vitals.heartRate} bpm`,
    checkup.vitals.temperature && `Temperatura Corporal: ${checkup.vitals.temperature}°C`,
    checkup.vitals.spo2 && `Oxígeno en Sangre (SpO2): ${checkup.vitals.spo2}%`,
    checkup.vitals.bloodPressure?.systolic && checkup.vitals.bloodPressure?.diastolic && `Presión Arterial: ${checkup.vitals.bloodPressure.systolic}/${checkup.vitals.bloodPressure.diastolic} mmHg`
  ].filter(Boolean).join('\n    - ') || 'No proporcionado';

  const symptomsReport = checkup.hasSymptoms && checkup.symptoms?.length 
    ? checkup.symptoms.map(s => 
        `- Síntoma: ${s.name}, Intensidad: ${s.intensity}/10${s.details ? `, Detalles: ${s.details}` : ''}`
      ).join('\n    ')
    : 'El usuario no reporta síntomas específicos.';

  // Calcular IMC para contexto adicional
  const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2);
  const age = calculateAge(userProfile.birthDate);

  const prompt = `
    Eres un asistente médico especializado en triaje y evaluación de riesgo. Analiza cuidadosamente el siguiente perfil de salud y datos de chequeo para proporcionar una evaluación precisa y empática.

    **CONTEXTO DEL PACIENTE:**
    Paciente: ${userProfile.sex}, ${age} años
    Antropometría: ${userProfile.height}cm, ${userProfile.weight}kg (IMC: ${bmi.toFixed(1)})
    
    **HISTORIAL MÉDICO RELEVANTE:**
    • Condiciones crónicas activas: ${userProfile.chronicConditions.length ? userProfile.chronicConditions.join(', ') : 'Ninguna registrada'}
    • Alergias conocidas: ${userProfile.allergies.length ? userProfile.allergies.join(', ') : 'Ninguna registrada'}
    • Cirugías/enfermedades previas: ${userProfile.surgeriesOrPastIllnesses.length ? userProfile.surgeriesOrPastIllnesses.join(', ') : 'Ninguna registrada'}
    • Medicación actual: ${userProfile.medicationsAndSupplements.length ? userProfile.medicationsAndSupplements.join(', ') : 'Ninguna'}
    
    **FACTORES DE ESTILO DE VIDA:**
    • Tabaquismo: ${userProfile.smokingStatus || 'No especificado'}
    • Alcohol: ${userProfile.alcoholConsumption || 'No especificado'}
    • Ejercicio: ${userProfile.exerciseFrequency || 'No especificado'}
    • Sustancias: ${userProfile.drugConsumption || 'No especificado'}

    **EVALUACIÓN ACTUAL (${new Date().toLocaleDateString()}):**
    
    Estado subjetivo: ${checkup.generalFeeling.scale}/5 (donde 5 = excelente)
    Descriptores: ${checkup.generalFeeling.tags.length ? checkup.generalFeeling.tags.join(', ') : 'Sin descriptores específicos'}
    
    Signos vitales registrados:
    ${vitalsReport}
    
    Sintomatología reportada:
    ${symptomsReport}

    **INSTRUCCIONES DE EVALUACIÓN:**
    
    1. ANALIZA INTEGRALMENTE considerando:
       - Correlación entre síntomas y signos vitales
       - Factores de riesgo del historial médico
       - Edad y contexto demográfico
       - Interacciones potenciales con medicación actual
    
    2. CLASIFICACIÓN DE RIESGO:
       • "normal": Parámetros dentro de rangos esperados, sin señales de alarma
       • "warning": Anomalías leves o factores de riesgo que requieren seguimiento
       • "alert": Signos de alarma que requieren atención médica urgente
    
    3. CRITERIOS ESPECÍFICOS DE ALERTA:
       - Dolor torácico (especialmente >7/10 o con factores de riesgo cardiovascular)
       - Dificultad respiratoria significativa
       - Signos vitales críticos (FC >120 o <50, Temp >38.5°C, SpO2 <90%, PA sistólica >180 o <90)
       - Síntomas neurológicos agudos
       - Dolor abdominal severo con signos de alarma
    
    4. COMUNICACIÓN:
       - Usa lenguaje empático y comprensible
       - Evita terminología médica compleja
       - Proporciona contexto tranquilizador cuando sea apropiado
       - Enfatiza cuándo buscar atención inmediata vs. seguimiento rutinario
    
    5. RECOMENDACIONES ACCIONABLES:
       - Máximo 3 recomendaciones priorizadas
       - Incluye plazos específicos cuando sea relevante
       - Considera recursos de atención disponibles
       - Incluye medidas de autocuidado apropiadas

    RESPONDE ÚNICAMENTE con un objeto JSON válido que cumpla exactamente el esquema proporcionado. No incluyas texto adicional, explicaciones o formato markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result.riskLevel && result.explanation && result.recommendations && result.keyFindings && result.urgencyLevel) {
        return result as AnalysisResult;
    } else {
        throw new Error("Parsed JSON does not match the expected format.");
    }

  } catch (error) {
    console.error("Error al llamar a la API de Gemini para el análisis del chequeo:", error);
    return {
      riskLevel: 'warning',
      explanation: 'Encontramos un problema técnico al analizar tus datos de chequeo. Esto no es un diagnóstico médico. Por favor, consulta a un profesional de la salud si no te sientes bien.',
      recommendations: [
        'Contacta a una clínica o médico local si tienes síntomas preocupantes.', 
        'Si es una emergencia médica, llama a tu número de emergencia local de inmediato.',
        'Intenta realizar el chequeo nuevamente más tarde.'
      ],
      keyFindings: ["Error técnico en el análisis"],
      urgencyLevel: "routine"
    };
  }
};