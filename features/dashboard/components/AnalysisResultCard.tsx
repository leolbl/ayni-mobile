import React from 'react';
import { AnalysisResult } from '../../../types';

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

const getRiskLevelStyles = (riskLevel: AnalysisResult['riskLevel']) => {
  switch (riskLevel) {
    case 'normal':
      return {
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        borderColor: 'border-green-500',
        cardClass: 'card-success',
        icon: '✅',
        title: 'Estado Normal'
      };
    case 'warning':
      return {
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-500',
        cardClass: 'card-warning',
        icon: '⚠️',
        title: 'Requiere Atención'
      };
    case 'alert':
      return {
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        borderColor: 'border-red-500',
        cardClass: 'card-danger',
        icon: '🚨',
        title: 'Alerta Médica'
      };
    default:
      return {
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-800',
        borderColor: 'border-slate-500',
        cardClass: 'card-medical',
        icon: 'ℹ️',
        title: 'Información'
      };
  }
};

const getUrgencyStyles = (urgencyLevel: AnalysisResult['urgencyLevel']) => {
  switch (urgencyLevel) {
    case 'routine':
      return {
        className: 'urgency-routine',
        label: 'Seguimiento Rutinario'
      };
    case 'priority':
      return {
        className: 'urgency-priority',
        label: 'Atención Prioritaria'
      };
    case 'urgent':
      return {
        className: 'urgency-urgent',
        label: 'Atención Urgente'
      };
    default:
      return {
        className: 'bg-gray-100 text-gray-800',
        label: 'Sin Especificar'
      };
  }
};

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result }) => {
  const styles = getRiskLevelStyles(result.riskLevel);
  const urgencyStyles = getUrgencyStyles(result.urgencyLevel);

  return (
    <div className={`${styles.cardClass} animate-fade-in`}>
      {/* Header con estado y urgencia */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-3xl mr-4">{styles.icon}</span>
          <div>
            <h3 className={`text-medical-title ${styles.textColor}`}>{styles.title}</h3>
            <span className={urgencyStyles.className}>
              {urgencyStyles.label}
            </span>
          </div>
        </div>
      </div>

      {/* Explicación principal */}
      <div className={`p-4 rounded-lg ${styles.bgColor} mb-6`}>
        <p className={`text-medical-body ${styles.textColor}`}>{result.explanation}</p>
      </div>

      {/* Hallazgos clave */}
      {result.keyFindings && result.keyFindings.length > 0 && (
        <div className="mb-6">
          <h4 className={`text-medical-subtitle ${styles.textColor} mb-3`}>Hallazgos Principales:</h4>
          <div className="space-y-2">
            {result.keyFindings.map((finding, index) => (
              <div key={index} className="flex items-start p-3 rounded-lg bg-slate-50 border-medical">
                <span className={`text-sm mr-3 mt-0.5 ${styles.textColor}`}>📋</span>
                <span className="text-medical-body text-slate-700">{finding}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="mb-6 border-t border-slate-200 pt-6">
        <h4 className={`text-medical-subtitle ${styles.textColor} mb-4`}>Pasos Siguientes Recomendados:</h4>
        <div className="space-y-3">
          {result.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start p-3 rounded-lg border-l-3 border-slate-300 bg-slate-50">
              <span className={`text-lg mr-3 mt-0.5 ${styles.textColor}`}>
                {index === 0 ? '1️⃣' : index === 1 ? '2️⃣' : '3️⃣'}
              </span>
              <span className="text-medical-body text-slate-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Aviso legal */}
      <div className="border-t border-slate-200 pt-4">
        <p className="text-medical-caption text-center leading-relaxed">
          <strong>⚕️ Aviso Legal:</strong> Este análisis es generado por IA y es solo para fines informativos. 
          No sustituye el consejo, diagnóstico o tratamiento médico profesional. Ante cualquier duda, consulta con un profesional de la salud.
        </p>
      </div>
    </div>
  );
};