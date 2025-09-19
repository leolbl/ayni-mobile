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
      <div className="flex items-start justify-between mb-4">
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
      <div className={`p-4 rounded-lg ${styles.bgColor} mb-6`}>
        <p className={`text-base leading-relaxed ${styles.textColor}`}>{result.explanation}</p>
      </div>

      {/* Hallazgos clave */}
      {result.keyFindings && result.keyFindings.length > 0 && (
        <div className="mb-6">
          <h4 className={`text-lg font-semibold ${styles.textColor} mb-3 font-poppins`}>Hallazgos Principales:</h4>
          <div className="space-y-2">
            {result.keyFindings.map((finding, index) => (
              <div key={index} className={`flex items-start p-3 rounded-lg bg-slate-50`}>
                <span className={`text-sm mr-3 mt-0.5 ${styles.textColor}`}>📋</span>
                <span className="text-sm text-[#1A2E40]">{finding}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="mb-6 border-t border-slate-200/80 pt-6">
        <h4 className={`text-lg font-semibold ${styles.textColor} mb-4 font-poppins`}>Pasos Siguientes Recomendados:</h4>
        <div className="space-y-3">
          {result.recommendations.map((rec, index) => (
            <div key={index} className={`flex items-start p-3 rounded-lg border-l-3 border-slate-300 bg-slate-50`}>
              <span className={`text-lg mr-3 mt-0.5 ${styles.textColor}`}>
                {index === 0 ? '1️⃣' : index === 1 ? '2️⃣' : '3️⃣'}
              </span>
              <span className="text-sm text-slate-700 leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Aviso legal */}
      <div className="border-t border-slate-200/80 pt-4">
        <p className="text-xs text-[#1A2E40]/60 text-center leading-relaxed">
          <strong>⚕️ Aviso Legal:</strong> Este análisis es generado por IA y es solo para fines informativos. 
          No sustituye el consejo, diagnóstico o tratamiento médico profesional. Ante cualquier duda, consulta con un profesional de la salud.
        </p>
      </div>
    </div>
  );
};