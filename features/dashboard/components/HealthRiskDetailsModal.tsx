import React, { useState } from 'react';
import { HealthRiskAssessment } from '../../../services/healthRiskService';

interface HealthRiskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: HealthRiskAssessment;
}

const HealthRiskDetailsModal: React.FC<HealthRiskDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  assessment 
}) => {
  if (!isOpen) return null;

  const getRiskLevelInfo = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return {
          title: 'Riesgo Crítico',
          description: 'Tu perfil presenta múltiples factores de alto riesgo que requieren atención médica frecuente.',
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '🚨'
        };
      case 'high':
        return {
          title: 'Riesgo Alto',
          description: 'Tu perfil indica factores de riesgo importantes que requieren monitoreo regular.',
          color: 'text-orange-700',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: '⚠️'
        };
      case 'moderate':
        return {
          title: 'Riesgo Moderado',
          description: 'Tu perfil muestra algunos factores de riesgo que se benefician de seguimiento regular.',
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: '⚡'
        };
      default:
        return {
          title: 'Riesgo Bajo',
          description: 'Tu perfil presenta un riesgo bajo, mantén tus hábitos saludables.',
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: '✅'
        };
    }
  };

  const riskInfo = getRiskLevelInfo(assessment.riskLevel);

  const getFrequencyText = (days: number) => {
    if (days === 1) return 'diario';
    if (days === 3) return 'cada 3 días';
    if (days === 7) return 'semanal';
    if (days === 14) return 'quincenal';
    return `cada ${days} días`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{riskInfo.icon}</span>
            <div>
              <h2 className={`text-2xl font-bold ${riskInfo.color} font-poppins`}>
                {riskInfo.title}
              </h2>
              <p className="text-slate-600 text-sm">Puntuación: {assessment.riskScore}/100</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Descripción principal */}
        <div className={`${riskInfo.bgColor} border ${riskInfo.borderColor} rounded-lg p-4 mb-6`}>
          <p className={`${riskInfo.color} font-medium`}>{riskInfo.description}</p>
        </div>

        {/* Frecuencia recomendada */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 font-poppins">
            📅 Frecuencia Recomendada
          </h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-slate-700">
              <span className="font-semibold">Análisis {getFrequencyText(assessment.recommendedAnalysisFrequency)}</span>
              <span className="text-slate-500 text-sm ml-2">
                (cada {assessment.recommendedAnalysisFrequency} día{assessment.recommendedAnalysisFrequency !== 1 ? 's' : ''})
              </span>
            </p>
          </div>
        </div>

        {/* Factores de riesgo identificados */}
        {assessment.riskFactors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 font-poppins">
              🔍 Factores de Riesgo Identificados
            </h3>
            <div className="space-y-2">
              {assessment.riskFactors.map((factor, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-3 flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-700 text-sm">{factor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje personalizado */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 font-poppins">
            💡 Recomendación Personalizada
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">{assessment.personalizedMessage}</p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-semibold text-slate-800 mb-2">📋 Importante:</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Esta evaluación se basa en la información de tu perfil de salud</li>
            <li>• Las recomendaciones son orientativas y no sustituyen consulta médica</li>
            <li>• Actualiza tu perfil si hay cambios en tu estado de salud</li>
            <li>• En caso de emergencia, contacta servicios médicos inmediatamente</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#2A787A] text-white rounded-lg hover:bg-[#2A787A]/90 transition-colors font-semibold"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthRiskDetailsModal;