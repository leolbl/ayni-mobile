import React from 'react';

interface HistoryStatsProps {
  totalAnalyses: number;
  normalCount: number;
  warningCount: number;
  alertCount: number;
  averageFeeling?: number;
  streak: number;
}

const HistoryStats: React.FC<HistoryStatsProps> = ({
  totalAnalyses,
  normalCount,
  warningCount,
  alertCount,
  averageFeeling,
  streak
}) => {
  const getPercentage = (count: number) => {
    return totalAnalyses > 0 ? Math.round((count / totalAnalyses) * 100) : 0;
  };

  const StatsCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    icon: React.ReactNode;
  }> = ({ title, value, subtitle, color, icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#1A2E40]/70 font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color} font-poppins`}>{value}</p>
          {subtitle && <p className="text-xs text-[#1A2E40]/60 mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ChartIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
    </svg>
  );

  const HeartIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001Z" />
    </svg>
  );

  const FireIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );

  const TargetIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
    </svg>
  );

  if (totalAnalyses === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-[#1A2E40] mb-4 font-poppins">Resumen de tu Salud</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Análisis"
          value={totalAnalyses}
          color="text-[#2A787A]"
          icon={<ChartIcon className="w-8 h-8" />}
        />
        
        <StatsCard
          title="Racha Actual"
          value={streak}
          subtitle={streak === 1 ? "día" : "días"}
          color="text-[#FF7F50]"
          icon={<FireIcon className="w-8 h-8" />}
        />

        {averageFeeling && (
          <StatsCard
            title="Estado Promedio"
            value={`${averageFeeling.toFixed(1)}/5`}
            color="text-[#2A787A]"
            icon={<HeartIcon className="w-8 h-8" />}
          />
        )}

        <StatsCard
          title="Análisis Normales"
          value={`${getPercentage(normalCount)}%`}
          subtitle={`${normalCount} de ${totalAnalyses}`}
          color="text-[#2A787A]"
          icon={<TargetIcon className="w-8 h-8" />}
        />
      </div>

      {/* Distribución de riesgos */}
      <div className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-medium text-[#1A2E40]/70 mb-3">Distribución de Niveles de Riesgo</h3>
        <div className="flex rounded-lg overflow-hidden h-2 bg-slate-100">
          {normalCount > 0 && (
            <div 
              className="bg-[#2A787A]"
              style={{ width: `${getPercentage(normalCount)}%` }}
              title={`Normal: ${normalCount} (${getPercentage(normalCount)}%)`}
            />
          )}
          {warningCount > 0 && (
            <div 
              className="bg-[#FFC72C]"
              style={{ width: `${getPercentage(warningCount)}%` }}
              title={`Advertencia: ${warningCount} (${getPercentage(warningCount)}%)`}
            />
          )}
          {alertCount > 0 && (
            <div 
              className="bg-[#FF7F50]"
              style={{ width: `${getPercentage(alertCount)}%` }}
              title={`Alerta: ${alertCount} (${getPercentage(alertCount)}%)`}
            />
          )}
        </div>
        <div className="flex justify-between text-xs text-[#1A2E40]/60 mt-2">
          <span>Normal: {getPercentage(normalCount)}%</span>
          <span>Advertencia: {getPercentage(warningCount)}%</span>
          <span>Alerta: {getPercentage(alertCount)}%</span>
        </div>
      </div>
    </div>
  );
};

export default HistoryStats;