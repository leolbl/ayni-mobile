import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AnalysisResult, Checkup } from '../types';

// Asumir que process.env.API_KEY está configurado en el entorno
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("La clave de API de Gemini no está configurada. Por favor, establece la variable de entorno API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: {
      type: Type.STRING,
      enum: ["normal", "warning", "alert"],
      description: "El nivel de riesgo calculado basado en los síntomas y el perfil del usuario."
    },
    explanation: {
      type: Type.STRING,
      description: "Una explicación clara y empática para el nivel de riesgo, escrita en términos sencillos para el usuario."
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Una lista de 2-3 pasos siguientes claros y accionables para el usuario."
    }
  },
  required: ["riskLevel", "explanation", "recommendations"]
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
      explanation: "Clave de API no configurada. Esta es una respuesta de prueba. Por favor, busca consejo médico profesional.",
      recommendations: ["Consulta a un médico por cualquier preocupación de salud.", "Este servicio es solo para fines informativos."],
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

  const prompt = `
    Analiza el siguiente chequeo de salud integral para un usuario y proporciona una recomendación de triaje.

    **Perfil del Usuario:**
    - Edad: ${calculateAge(userProfile.birthDate)} años
    - Sexo: ${userProfile.sex}
    - Altura: ${userProfile.height} cm
    - Peso: ${userProfile.weight} kg
    - Condiciones Crónicas: ${userProfile.chronicConditions.join(', ') || 'Ninguna'}
    - Alergias Conocidas: ${userProfile.allergies.join(', ') || 'Ninguna'}
    - Enfermedades Pasadas o Cirugías Significativas: ${userProfile.surgeriesOrPastIllnesses.join(', ') || 'Ninguna'}
    - Medicamentos y Suplementos Actuales: ${userProfile.medicationsAndSupplements.join(', ') || 'Ninguno'}
    - Estado de Tabaquismo: ${userProfile.smokingStatus || 'No proporcionado'}
    - Consumo de Alcohol: ${userProfile.alcoholConsumption || 'No proporcionado'}
    - Frecuencia de Ejercicio: ${userProfile.exerciseFrequency || 'No proporcionado'}
    - Consumo de Drogas Recreativas: ${userProfile.drugConsumption || 'No proporcionado'}

    **Datos del Chequeo de Hoy:**
    - Sensación General (Escala 1-5, 5 es mejor): ${checkup.generalFeeling.scale}
    - Etiquetas Generales: ${checkup.generalFeeling.tags.join(', ') || 'Ninguna'}
    - Signos Vitales:
    - ${vitalsReport}
    - Síntomas Reportados:
    ${symptomsReport}

    **Tu Tarea:**
    Basado en la combinación del perfil del usuario, su sensación general, sus signos vitales y sus síntomas específicos (o la falta de ellos), evalúa el riesgo potencial para la salud.
    Devuelve tu análisis estrictamente en el formato JSON proporcionado. El lenguaje debe ser empático, claro y fácil de entender para una persona no médica.
    No agregues ningún texto introductorio ni formato markdown. Tu salida completa debe ser un único objeto JSON válido que coincida con el esquema.
    Considera todas las entradas. Por ejemplo, si un usuario informa que se siente bien y tiene signos vitales normales, el riesgo es 'normal'. Si los signos vitales son anormales, incluso sin síntomas, el riesgo debe elevarse. Los síntomas graves (por ejemplo, dolor en el pecho con alta intensidad) siempre deben activar una 'alerta', especialmente con condiciones crónicas relevantes.
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
    
    if (result.riskLevel && result.explanation && result.recommendations) {
        return result as AnalysisResult;
    } else {
        throw new Error("Parsed JSON does not match the expected format.");
    }

  } catch (error) {
    console.error("Error al llamar a la API de Gemini para el análisis del chequeo:", error);
    return {
      riskLevel: 'warning',
      explanation: 'Encontramos un problema al analizar tus datos de chequeo. Esto no es un diagnóstico médico. Por favor, consulta a un profesional de la salud si no te sientes bien.',
      recommendations: ['Contacta a una clínica o médico local.', 'Si es una emergencia, llama a tu número de emergencia local de inmediato.'],
    };
  }
};