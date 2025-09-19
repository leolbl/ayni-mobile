import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AnalysisResult, Checkup } from '../types';
import getConfig from '../lib/config';

// Obtener configuración según la plataforma
const config = getConfig();
const API_KEY = config.geminiApiKey;

if (!API_KEY || API_KEY === 'TU_API_KEY_DE_GEMINI_PARA_MOVIL') {
  console.error(`La clave de API de Gemini no está configurada para ${config.platform}. ${config.isNative ? 'Por favor, configura la API key en lib/config.ts' : 'Por favor, establece la variable de entorno GEMINI_API_KEY.'}`);
}

const ai = API_KEY && API_KEY !== 'TU_API_KEY_DE_GEMINI_PARA_MOVIL' ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: {
      type: Type.STRING,
      enum: ["normal", "warning", "alert"],
      description: "Nivel de riesgo basado en análisis integral: 'normal' para estado saludable sin banderas rojas, 'warning' para situaciones que requieren monitoreo o seguimiento, 'alert' para casos que necesitan atención médica urgente o inmediata."
    },
    explanation: {
      type: Type.STRING,
      description: "Explicación médica clara y empática del estado actual, contextualizada con el perfil específico del paciente. Debe incluir justificación del nivel de riesgo, correlaciones importantes y referencias al historial médico cuando sea relevante. 200-300 palabras."
    },
    recommendations: {
      type: Type.ARRAY,
      items: { 
        type: Type.STRING,
        description: "Recomendación específica, personalizada y accionable con plazo temporal preciso"
      },
      description: "Lista de 3-4 recomendaciones priorizadas y personalizadas según el perfil del paciente. Deben incluir plazos específicos, considerar condiciones preexistentes y ser culturalmente apropiadas."
    },
    keyFindings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 2-4 hallazgos clínicos más significativos que influyeron en la evaluación, con contexto del perfil del paciente (ej: 'Presión arterial 150/95 mmHg - elevada para edad y sin medicación antihipertensiva')"
    },
    urgencyLevel: {
      type: Type.STRING,
      enum: ["routine", "priority", "urgent"],
      description: "Nivel de urgencia personalizado: 'routine' para seguimiento normal en próxima cita programada, 'priority' para atención en 3-7 días considerando factores de riesgo específicos, 'urgent' para atención en 24-48 horas o inmediata"
    },
    personalizedInsights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 2-3 insights personalizados que conectan los hallazgos actuales con el historial médico, estilo de vida y factores de riesgo específicos del paciente."
    },
    riskFactors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de factores de riesgo específicos identificados basados en la combinación de datos actuales y perfil histórico del paciente."
    },
    followUpPlan: {
      type: Type.STRING,
      description: "Plan de seguimiento personalizado que considera las condiciones crónicas, medicación actual y factores de estilo de vida del paciente. Debe incluir frecuencia recomendada de monitoreo y parámetros específicos a vigilar."
    }
  },
  required: ["riskLevel", "explanation", "recommendations", "keyFindings", "urgencyLevel", "personalizedInsights", "riskFactors", "followUpPlan"]
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
  if (!API_KEY || API_KEY === 'TU_API_KEY_DE_GEMINI_PARA_MOVIL' || !ai) {
    // Devolver una respuesta de prueba si la clave de API no está disponible
    return {
      riskLevel: "warning",
      explanation: `Clave de API no configurada para ${config.platform}. Esta es una respuesta de prueba. Por favor, busca consejo médico profesional para cualquier preocupación de salud.`,
      recommendations: [
        "Consulta a un médico por cualquier preocupación de salud.", 
        "Este servicio es solo para fines informativos y no sustituye atención médica."
      ],
      keyFindings: [`Sistema en modo de prueba - API no configurada para ${config.platform}`],
      urgencyLevel: "routine",
      personalizedInsights: ["Sistema en modo de desarrollo - configura la API de Gemini para obtener análisis personalizados"],
      riskFactors: ["Configuración técnica pendiente"],
      followUpPlan: "Una vez configurado el sistema, podrás recibir análisis médicos detallados y personalizados basados en tu perfil de salud completo."
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
SISTEMA DE ANÁLISIS MÉDICO INTELIGENTE - TRIAJE AVANZADO Y EVALUACIÓN DE RIESGO
================================================================================

**ROL Y CONTEXTO:**
Actúas como un sistema de inteligencia artificial médica especializado en triaje, evaluación de riesgo y análisis integral de salud. Tu función es proporcionar evaluaciones clínicas precisas, contextualizadas y culturalmente apropiadas para población hispanohablante.

**PERFIL DEL PACIENTE:**
Identificación: ${userProfile.sex === 'male' ? 'Hombre' : userProfile.sex === 'female' ? 'Mujer' : 'Persona'}, ${age} años
Nombre: ${userProfile.name}
Antropometría: ${userProfile.height}cm, ${userProfile.weight}kg 
Índice de Masa Corporal: ${bmi.toFixed(1)} kg/m² ${bmi < 18.5 ? '(Bajo peso)' : bmi < 25 ? '(Normal)' : bmi < 30 ? '(Sobrepeso)' : '(Obesidad)'}

**HISTORIAL CLÍNICO INTEGRAL:**

🏥 CONDICIONES MÉDICAS ACTIVAS:
${userProfile.chronicConditions.length && !userProfile.chronicConditions.includes('Ninguna') 
  ? userProfile.chronicConditions.map(condition => `   • ${condition} - Condición crónica que requiere manejo continuo`).join('\n')
  : '   • Sin condiciones crónicas conocidas registradas'}

💊 FARMACOTERAPIA ACTUAL:
${userProfile.medicationsAndSupplements.length && !userProfile.medicationsAndSupplements.includes('Ninguno')
  ? userProfile.medicationsAndSupplements.map(med => `   • ${med} - Considerar interacciones y efectos sobre signos vitales`).join('\n') 
  : '   • Sin medicación actual reportada'}

🚨 ALERGIAS Y CONTRAINDICACIONES:
${userProfile.allergies.length && !userProfile.allergies.includes('Ninguna')
  ? userProfile.allergies.map(allergy => `   • ${allergy} - Alergia conocida`).join('\n')
  : '   • Sin alergias conocidas registradas'}

📋 ANTECEDENTES QUIRÚRGICOS/PATOLÓGICOS:
${userProfile.surgeriesOrPastIllnesses.length && !userProfile.surgeriesOrPastIllnesses.includes('Ninguna')
  ? userProfile.surgeriesOrPastIllnesses.map(surgery => `   • ${surgery} - Antecedente relevante para evaluación actual`).join('\n')
  : '   • Sin antecedentes quirúrgicos o patológicos significativos'}

**FACTORES DE RIESGO Y ESTILO DE VIDA:**
🚬 Tabaquismo: ${userProfile.smokingStatus === 'current' ? '⚠️ FUMADOR ACTIVO - Factor de riesgo cardiovascular y respiratorio significativo' :
                 userProfile.smokingStatus === 'former' ? 'Ex-fumador - Riesgo residual presente' :
                 userProfile.smokingStatus === 'never' ? 'No fumador - Factor protector' : 'No especificado'}

🍷 Alcohol: ${userProfile.alcoholConsumption === 'heavy' ? '⚠️ CONSUMO ELEVADO - Evaluar hepatotoxicidad y interacciones' :
              userProfile.alcoholConsumption === 'moderate' ? 'Consumo moderado - Evaluar en contexto de medicación' :
              userProfile.alcoholConsumption === 'light' ? 'Consumo ligero - Generalmente aceptable' :
              userProfile.alcoholConsumption === 'none' ? 'Abstinencia total - Factor protector' : 'No especificado'}

🏃‍♂️ Actividad Física: ${userProfile.exerciseFrequency === 'frequently' ? 'Alta frecuencia - Factor cardioprotector importante' :
                        userProfile.exerciseFrequency === 'regularly' ? 'Regular - Factor protector moderado' :
                        userProfile.exerciseFrequency === 'rarely' ? '⚠️ Sedentarismo parcial - Factor de riesgo' :
                        userProfile.exerciseFrequency === 'never' ? '⚠️ SEDENTARISMO COMPLETO - Factor de riesgo significativo' : 'No especificado'}

💊 Sustancias: ${userProfile.drugConsumption === 'regularly' ? '⚠️ USO REGULAR - Factor de riesgo alto, evaluar interacciones' :
                userProfile.drugConsumption === 'rarely' ? '⚠️ Uso ocasional - Considerar en evaluación' :
                userProfile.drugConsumption === 'none' ? 'Sin uso - Factor protector' :
                userProfile.drugConsumption === 'prefer_not_to_say' ? 'Información no proporcionada - Mantener consideración clínica' : 'No especificado'}

**EVALUACIÓN CLÍNICA ACTUAL - ${new Date().toLocaleDateString('es-ES')}:**

📊 ESTADO SUBJETIVO REPORTADO:
• Escala de bienestar: ${checkup.generalFeeling.scale}/5 ${checkup.generalFeeling.scale <= 2 ? '(⚠️ ESTADO CRÍTICO)' : 
                                                        checkup.generalFeeling.scale === 3 ? '(Estado neutro)' : 
                                                        checkup.generalFeeling.scale >= 4 ? '(Estado positivo)' : ''}
• Descriptores específicos: ${checkup.generalFeeling.tags.length ? checkup.generalFeeling.tags.join(', ') : 'Sin descriptores específicos proporcionados'}

🩺 SIGNOS VITALES OBJETIVOS:
${vitalsReport === 'No proporcionado' ? '⚠️ DATOS VITALES FALTANTES - Limita precisión del análisis' : vitalsReport}

🎯 SINTOMATOLOGÍA ESPECÍFICA:
${symptomsReport}

**CRITERIOS DE EVALUACIÓN ESPECIALIZADA:**

🔴 ALGORITMO DE ALERTA ROJA (Derivación urgente):
• Dolor torácico con factores de riesgo cardiovascular
• Disnea significativa (especialmente con antecedentes cardiopulmonares)
• Signos vitales críticos: FC >120/<50, T >38.5°C, SpO2 <90%, PAS >180/<90 mmHg
• Síntomas neurológicos agudos o alteración de conciencia
• Dolor abdominal severo con signos de alarma
• Interacciones medicamentosas peligrosas identificadas

🟡 CRITERIOS DE PRIORIDAD (Seguimiento 3-7 días):
• Síntomas persistentes sin mejoría en pacientes con comorbilidades
• Factores de riesgo múltiples con síntomas inespecíficos
• Pacientes con condiciones crónicas descompensadas
• Efectos adversos medicamentosos sospechados

🟢 SEGUIMIENTO RUTINARIO:
• Parámetros dentro de rangos normales para edad y comorbilidades
• Síntomas menores autolimitados
• Controles preventivos recomendados

**CONSIDERACIONES ESPECIALES SEGÚN PERFIL:**

${age >= 65 ? '👴 PACIENTE GERIÁTRICO: Aplicar criterios de fragilidad, considerar polifarmacia y síndromes geriátricos.' : ''}
${age <= 18 ? '👶 PACIENTE PEDIÁTRICO: Aplicar parámetros normales específicos para edad.' : ''}
${userProfile.sex === 'female' && age >= 15 && age <= 55 ? '♀️ MUJER EN EDAD REPRODUCTIVA: Considerar ciclo menstrual, embarazo potencial.' : ''}
${userProfile.chronicConditions.some(c => c.toLowerCase().includes('diabet')) ? '🩸 PACIENTE DIABÉTICO: Evaluar control glucémico, riesgo cardiovascular aumentado.' : ''}
${userProfile.chronicConditions.some(c => c.toLowerCase().includes('hiperten')) ? '💓 PACIENTE HIPERTENSO: Evaluar control tensional, riesgo cardiovascular.' : ''}
${userProfile.chronicConditions.some(c => c.toLowerCase().includes('cardía')) ? '❤️ PACIENTE CARDIOPATA: Monitoreo cardiovascular estrecho requerido.' : ''}

**INSTRUCCIONES DE ANÁLISIS INTEGRAL:**

1. **CORRELACIÓN CLÍNICA**: Analiza correlaciones entre síntomas actuales, signos vitales, y antecedentes médicos específicos del paciente.

2. **ESTRATIFICACIÓN DE RIESGO**: Utiliza scoring clínico considerando edad, comorbilidades, medicación y factores de estilo de vida.

3. **PERSONALIZACIÓN CULTURAL**: Proporciona recomendaciones culturalmente apropiadas para población hispanohablante.

4. **MEDICINA PREVENTIVA**: Integra recomendaciones preventivas específicas para el perfil de riesgo identificado.

5. **SEGUIMIENTO ESTRUCTURADO**: Establece plan de monitoreo considerando recursos de salud disponibles y accesibilidad.

6. **EDUCACIÓN AL PACIENTE**: Incluye elementos educativos para empoderamiento del paciente en su autocuidado.

**COMUNICACIÓN CLÍNICA:**
• Utiliza terminología médica precisa pero accesible
• Proporciona contexto tranquilizador cuando sea clínicamente apropiado
• Enfatiza la importancia del seguimiento médico profesional
• Incluye señales de alarma específicas para retorno urgente
• Considera el impacto psicológico de la información proporcionada

**LIMITACIONES Y DISCLAIMERS:**
• Este análisis es complementario, no sustituto del juicio clínico profesional
• Requiere correlación con exploración física y pruebas complementarias según criterio médico
• Las recomendaciones deben adaptarse a recursos locales de salud disponibles

PROPORCIONA tu análisis en formato JSON estructurado según el esquema requerido, integrando toda esta información de manera coherente y profesional.
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
    
    if (result.riskLevel && result.explanation && result.recommendations && result.keyFindings && result.urgencyLevel && result.personalizedInsights && result.riskFactors && result.followUpPlan) {
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
      urgencyLevel: "routine",
      personalizedInsights: ["Sistema experimentó error técnico - consulta médico si tienes inquietudes"],
      riskFactors: ["Error de conectividad o procesamiento"],
      followUpPlan: "Intenta realizar el análisis nuevamente más tarde. Si persisten los problemas técnicos, contacta soporte o consulta directamente con un profesional de salud."
    };
  }
};