import React from 'react';
import { AnalysisResult } from '../../../types';

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

const getRiskLevelStyles = (riskLevel: AnalysisResult['riskLevel']) => {
  switch (riskLevel) {
    case 'normal':
      return {
        bgColor: 'bg-[#2A787A]/10',
        textColor: 'text-[#2A787A]',
        borderColor: 'border-[#2A787A]',
        headerBg: 'bg-[#2A787A]/20',
        icon: '✅',
        title: 'Análisis Normal'
      };
    case 'warning':
      return {
        bgColor: 'bg-[#FFC72C]/10',
        textColor: 'text-amber-800',
        borderColor: 'border-[#FFC72C]',
        headerBg: 'bg-[#FFC72C]/20',
        icon: '⚠️',
        title: 'Atención Requerida'
      };
    case 'alert':
      return {
        bgColor: 'bg-[#FF7F50]/10',
        textColor: 'text-red-700',
        borderColor: 'border-[#FF7F50]',
        headerBg: 'bg-[#FF7F50]/20',
        icon: '🚨',
        title: 'Alerta de Salud'
      };
    default:
      return {
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-800',
        borderColor: 'border-slate-500',
        headerBg: 'bg-slate-100',
        icon: 'ℹ️',
        title: 'Información'
      };
  }
};

const getUrgencyStyles = (urgencyLevel: AnalysisResult['urgencyLevel']) => {
  switch (urgencyLevel) {
    case 'routine':
      return {
        bgColor: 'bg-[#2A787A]/20',
        textColor: 'text-[#2A787A]',
        label: 'Seguimiento Rutinario'
      };
    case 'priority':
      return {
        bgColor: 'bg-[#FFC72C]/20',
        textColor: 'text-amber-800',
        label: 'Atención Prioritaria'
      };
    case 'urgent':
      return {
        bgColor: 'bg-[#FF7F50]/20',
        textColor: 'text-red-700',
        label: 'Atención Urgente'
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        label: 'Sin Especificar'
      };
  }
};

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result }) => {
  const styles = getRiskLevelStyles(result.riskLevel);
  const urgencyStyles = getUrgencyStyles(result.urgencyLevel);

  return (
    <div className={`p-6 bg-white rounded-xl shadow-lg border-l-4 ${styles.borderColor} font-sans`}>
      {/* Header con estado y urgencia */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <span className="text-3xl mr-4">{styles.icon}</span>
          <div>
            <h3 className={`text-2xl font-bold ${styles.textColor} font-poppins`}>{styles.title}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${urgencyStyles.bgColor} ${urgencyStyles.textColor}`}>
              {urgencyStyles.label}
            </span>
          </div>
        </div>
      </div>

      {/* Explicación principal */}
      <div className={`p-5 rounded-lg ${styles.bgColor} mb-6`}>
        <h4 className={`text-lg font-semibold ${styles.textColor} mb-3 font-poppins`}>Análisis Médico Integral:</h4>
        <p className={`text-base leading-relaxed ${styles.textColor}`}>{result.explanation}</p>
      </div>

      {/* Hallazgos clave */}
      {result.keyFindings && result.keyFindings.length > 0 && (
        <div className="mb-6">
          <h4 className={`text-lg font-semibold ${styles.textColor} mb-4 font-poppins flex items-center`}>
            <span className="mr-2">🔍</span>
            Hallazgos Clínicos Principales:
          </h4>
          <div className="space-y-3">
            {result.keyFindings.map((finding, index) => (
              <div key={index} className={`flex items-start p-4 rounded-lg bg-slate-50 border-l-3 border-slate-300`}>
                <span className={`text-lg mr-3 mt-0.5 ${styles.textColor}`}>
                  {index === 0 ? '🩺' : index === 1 ? '📊' : '📋'}
                </span>
                <span className="text-sm text-[#1A2E40] leading-relaxed font-medium">{finding}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights personalizados */}
      {result.personalizedInsights && result.personalizedInsights.length > 0 && (
        <div className="mb-6">
          <h4 className={`text-lg font-semibold ${styles.textColor} mb-4 font-poppins flex items-center`}>
            <span className="mr-2">💡</span>
            Análisis Personalizado:
          </h4>
          <div className="space-y-3">
            {result.personalizedInsights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 border-blue-300 bg-blue-50`}>
                <span className="text-sm text-blue-800 leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Factores de riesgo */}
      {result.riskFactors && result.riskFactors.length > 0 && (
        <div className="mb-6">
          <h4 className={`text-lg font-semibold ${styles.textColor} mb-4 font-poppins flex items-center`}>
            <span className="mr-2">⚠️</span>
            Factores de Riesgo Identificados:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.riskFactors.map((factor, index) => (
              <div key={index} className={`p-3 rounded-lg border border-amber-200 bg-amber-50`}>
                <div className="flex items-start">
                  <span className="text-amber-600 mr-2 mt-0.5">🔸</span>
                  <span className="text-sm text-amber-800 leading-relaxed">{factor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="mb-6 border-t border-slate-200/80 pt-6">
        <h4 className={`text-lg font-semibold ${styles.textColor} mb-4 font-poppins flex items-center`}>
          <span className="mr-2">📋</span>
          Recomendaciones Médicas Prioritarias:
        </h4>
        <div className="space-y-4">
          {result.recommendations.map((rec, index) => (
            <div key={index} className={`flex items-start p-4 rounded-lg border-l-4 border-green-400 bg-green-50`}>
              <span className={`text-xl mr-3 mt-0.5 text-green-600`}>
                {index === 0 ? '1️⃣' : index === 1 ? '2️⃣' : index === 2 ? '3️⃣' : '4️⃣'}
              </span>
              <span className="text-sm text-green-800 leading-relaxed font-medium">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan de seguimiento */}
      {result.followUpPlan && (
        <div className="mb-6 border-t border-slate-200/80 pt-6">
          <h4 className={`text-lg font-semibold ${styles.textColor} mb-4 font-poppins flex items-center`}>
            <span className="mr-2">📅</span>
            Plan de Seguimiento Personalizado:
          </h4>
          <div className={`p-5 rounded-lg border-l-4 border-purple-400 bg-purple-50`}>
            <p className="text-sm text-purple-800 leading-relaxed">{result.followUpPlan}</p>
          </div>
        </div>
      )}

      {/* Aviso legal mejorado */}
      <div className="border-t border-slate-200/80 pt-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-xs text-[#1A2E40]/70 text-center leading-relaxed">
            <strong>⚕️ Información Médica Importante:</strong> Este análisis utiliza inteligencia artificial avanzada y se basa en la información proporcionada. 
            Es una herramienta de apoyo que <strong>NO sustituye</strong> la consulta, diagnóstico o tratamiento médico profesional. 
            <br /><br />
            <strong>🚨 Busca atención médica inmediata si:</strong> Experimentas síntomas severos, dolor intenso, dificultad para respirar, 
            o cualquier síntoma que consideres preocupante. En emergencias, contacta servicios de urgencia locales.
            <br /><br />
            <span className="text-[#2A787A] font-medium">💚 AyniSalud se compromete con tu bienestar integral.</span>
          </p>
        </div>
      </div>
    </div>
  );
};