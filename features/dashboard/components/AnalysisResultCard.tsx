import React from 'react';
import { AnalysisResult } from '../../../types';

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

const getRiskLevelStyles = (riskLevel: AnalysisResult['riskLevel']) => {
  switch (riskLevel) {
    case 'normal':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-500',
        icon: '✅',
        title: 'Riesgo Normal'
      };
    case 'warning':
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-500',
        icon: '⚠️',
        title: 'Advertencia'
      };
    case 'alert':
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-500',
        icon: '🚨',
        title: 'Alerta'
      };
    default:
      return {
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-800',
        borderColor: 'border-slate-500',
        icon: 'ℹ️',
        title: 'Información'
      };
  }
};

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result }) => {
  const styles = getRiskLevelStyles(result.riskLevel);

  return (
    <div className={`p-6 rounded-2xl shadow-md border-l-4 ${styles.borderColor} ${styles.bgColor}`}>
      <div className="flex items-start">
        <span className="text-3xl mr-4">{styles.icon}</span>
        <div>
          <h3 className={`text-2xl font-bold ${styles.textColor}`}>{styles.title}</h3>
          <p className={`mt-2 text-base ${styles.textColor}`}>{result.explanation}</p>
        </div>
      </div>
      <div className="mt-6 border-t border-gray-300 pt-4">
        <h4 className={`text-lg font-semibold ${styles.textColor} mb-3`}>Pasos Siguientes Recomendados:</h4>
        <ul className="list-disc list-inside space-y-2">
          {result.recommendations.map((rec, index) => (
            <li key={index} className={styles.textColor}>{rec}</li>
          ))}
        </ul>
      </div>
       <p className="text-xs text-slate-500 mt-6 text-center">
        Aviso Legal: Este análisis es generado por IA y es solo para fines informativos. No sustituye el consejo, diagnóstico o tratamiento médico profesional.
      </p>
    </div>
  );
};