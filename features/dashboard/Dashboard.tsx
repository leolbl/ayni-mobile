import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../lib/firebase';
import { AnalysisResult, Checkup } from '../../types';
import { AnalysisResultCard } from './components/AnalysisResultCard';
import CheckupFlow from '../checkup/CheckupFlow';
import ProfileModal from '../profile/ProfileModal';
import AnalysisHistoryPage from './AnalysisHistoryPage';
import HealthRiskDetailsModal from './components/HealthRiskDetailsModal';
import { mockHistoryData } from '../../data/mockHistoryData';
import { assessHealthRisk, calculateNextAnalysisDate, shouldRecommendAnalysis, HealthRiskAssessment } from '../../services/healthRiskService';
import { useHistory } from '../../hooks/useHistory';

const CountdownCard: React.FC<{ userProfile: any; onShowRiskDetails?: () => void; history: any; latestAnalysis: any; getTimeUntilNextAnalysis: any; shouldRecommendAnalysis: any }> = ({ 
    userProfile, 
    onShowRiskDetails, 
    history, 
    latestAnalysis, 
    getTimeUntilNextAnalysis, 
    shouldRecommendAnalysis 
}) => {
    const [healthAssessment, setHealthAssessment] = useState<HealthRiskAssessment | null>(null);

    useEffect(() => {
        if (userProfile) {
            const assessment = assessHealthRisk(userProfile);
            setHealthAssessment(assessment);
        }
    }, [userProfile]);

    const calculateTimeLeft = () => {
        const timeUntilNext = getTimeUntilNextAnalysis();
        
        if (!timeUntilNext) {
            return {}; // Es hora del análisis
        }
        
        return timeUntilNext;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        // Actualizar cada minuto para mostrar un contador en tiempo real
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Cada 60 segundos

        return () => clearInterval(timer);
    }, [latestAnalysis, userProfile, healthAssessment]); // Recalcular cuando cambie el análisis

    // También actualizar inmediatamente cuando cambien las dependencias
    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
    }, [latestAnalysis, userProfile, healthAssessment]);

    const getRiskLevelStyles = () => {
        // Usar el riesgo del último análisis si está disponible, sino el del perfil actual
        const riskToUse = latestAnalysis ? latestAnalysis.result.riskLevel : healthAssessment?.riskLevel;
        
        switch (riskToUse) {
            case 'alert':
                return {
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-700',
                    accentColor: 'text-red-600',
                    pulseClass: 'animate-pulse'
                };
            case 'warning':
                return {
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                    textColor: 'text-orange-700',
                    accentColor: 'text-orange-600',
                    pulseClass: ''
                };
            case 'normal':
            default:
                return {
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    textColor: 'text-green-700',
                    accentColor: 'text-green-600',
                    pulseClass: ''
                };
        }
    };

    const styles = getRiskLevelStyles();
    const isUrgent = Object.keys(timeLeft).length === 0 || timeLeft.days === 0;
    
    // Obtener información de frecuencia del último análisis
    const getFrequencyInfo = () => {
        if (latestAnalysis) {
            const frequency = latestAnalysis.result.recommendedFrequencyDays || 7;
            const riskLevel = latestAnalysis.result.riskLevel;
            return { frequency, riskLevel, source: 'analysis' };
        } else if (healthAssessment) {
            return { 
                frequency: healthAssessment.recommendedAnalysisFrequency, 
                riskLevel: healthAssessment.riskLevel, 
                source: 'profile' 
            };
        }
        return { frequency: 7, riskLevel: 'normal', source: 'default' };
    };

    const frequencyInfo = getFrequencyInfo();

    return (
        <div className={`${styles.bgColor} p-6 rounded-2xl shadow-md border-2 ${styles.borderColor} flex flex-col justify-center items-center text-center h-full font-sans ${styles.pulseClass}`}>
            <h3 className={`text-lg lg:text-xl font-semibold ${styles.textColor} mb-1 font-poppins`}>
                Próximo Análisis Recomendado
            </h3>
            
            <div className={`text-sm ${styles.textColor} mb-2 px-3 py-1 rounded-full ${styles.bgColor} border ${styles.borderColor}`}>
                {frequencyInfo.source === 'analysis' ? 
                    `Basado en tu último análisis: Cada ${frequencyInfo.frequency} día${frequencyInfo.frequency !== 1 ? 's' : ''}` :
                    `Basado en tu perfil: Cada ${frequencyInfo.frequency} día${frequencyInfo.frequency !== 1 ? 's' : ''}`
                }
            </div>

            {Object.keys(timeLeft).length > 0 && !isUrgent ? (
                <>
                    <div className="flex items-baseline my-2">
                        <span className={`text-8xl lg:text-9xl font-bold ${styles.accentColor} tracking-tighter font-poppins`}>
                            {timeLeft.days}
                        </span>
                        <span className={`text-2xl lg:text-3xl font-semibold ${styles.textColor} ml-2`}>
                            día{timeLeft.days !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className={`text-base lg:text-lg ${styles.textColor} flex items-center justify-center`}>
                        <span className="mr-2">⏱️</span>
                        {timeLeft.hours} horas, {timeLeft.minutes} minutos
                        <span className="ml-2 animate-pulse">⏳</span>
                    </div>
                </>
            ) : (
                <div className="my-4">
                    <span className="text-2xl font-bold text-red-600 animate-pulse">
                        ¡Es hora de tu chequeo!
                    </span>
                    <p className="text-sm text-red-600 mt-2 font-medium">
                        {frequencyInfo.riskLevel === 'alert' ? 
                            'Tu último análisis requiere seguimiento inmediato' :
                            'Según tu última evaluación, es momento de un nuevo análisis'
                        }
                    </p>
                </div>
            )}

            {(frequencyInfo.source === 'analysis' && latestAnalysis) && (
                <div className={`text-xs ${styles.textColor} mt-4 text-center max-w-md`}>
                    <p className="font-medium mb-1">
                        Último análisis: {new Intl.DateTimeFormat('es-ES', { 
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        }).format(latestAnalysis.date)}
                    </p>
                    <p className="opacity-80">
                        Riesgo detectado: {latestAnalysis.result.riskLevel === 'normal' ? 'Normal' :
                                          latestAnalysis.result.riskLevel === 'warning' ? 'Advertencia' : 'Alerta'}
                    </p>
                    {onShowRiskDetails && (
                        <button 
                            onClick={onShowRiskDetails}
                            className={`text-xs ${styles.accentColor} hover:underline mt-1 font-medium`}
                        >
                            Ver detalles del análisis
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const FireIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
);


const StreakCard: React.FC<{ streak: number }> = ({ streak }) => {
    const [prevStreak, setPrevStreak] = useState(streak);
    const [showAnimation, setShowAnimation] = useState(false);

    // Detectar cuando la racha aumenta para mostrar animación
    useEffect(() => {
        if (streak > prevStreak) {
            setShowAnimation(true);
            const timer = setTimeout(() => setShowAnimation(false), 2000);
            return () => clearTimeout(timer);
        }
        setPrevStreak(streak);
    }, [streak, prevStreak]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md font-sans">
            <h3 className="text-lg font-semibold text-[#1A2E40] mb-2 font-poppins">Racha de Análisis</h3>
            <div className="flex items-center justify-center space-x-4">
                <FireIcon className={`w-12 h-12 text-[#FF7F50] ${showAnimation ? 'animate-bounce' : ''}`}/>
                <span className={`text-5xl font-bold text-[#1A2E40] font-poppins transition-all duration-300 ${showAnimation ? 'scale-110 text-[#FF7F50]' : ''}`}>
                    {streak}
                </span>
                <span className="text-lg text-[#1A2E40]/80 self-end pb-1">días</span>
            </div>
            {showAnimation && (
                <div className="mt-2 text-center">
                    <span className="text-sm text-[#FF7F50] font-semibold animate-pulse">
                        ¡Racha incrementada! 🎉
                    </span>
                </div>
            )}
        </div>
    );
};

const AnalysisHistoryCard: React.FC<{ onViewHistory: () => void; history: any[] }> = ({ onViewHistory, history }) => {
    // Usar los últimos 3 análisis del historial actual
    const recentHistory = history.slice(0, 3).map(entry => ({
        date: new Intl.DateTimeFormat('es-ES', { 
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(entry.date),
        risk: entry.result.riskLevel
    }));
    
    const riskStyles = {
        normal: 'bg-[#2A787A]',
        warning: 'bg-[#FFC72C]',
        alert: 'bg-[#FF7F50]',
    };
    
    const translateRisk = (risk: 'normal' | 'warning' | 'alert') => {
        switch (risk) {
            case 'normal': return 'Normal';
            case 'warning': return 'Advertencia';
            case 'alert': return 'Alerta';
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col font-sans">
            <h3 className="text-lg font-semibold text-[#1A2E40] mb-4 font-poppins">Historial de Análisis</h3>
            <ul className="space-y-3 flex-grow">
                {recentHistory.map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                        <span className="text-[#1A2E40]/90">{item.date}</span>
                        <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${riskStyles[item.risk]}`}></span>
                            <span className="capitalize font-medium text-[#1A2E40]">Riesgo {translateRisk(item.risk)}</span>
                        </div>
                    </li>
                ))}
            </ul>
            <button 
                onClick={onViewHistory}
                className="text-sm text-[#2A787A] hover:text-[#2A787A]/80 font-semibold mt-4 text-center w-full transition-colors"
            >
                Ver todo ({history.length} análisis)
            </button>
        </div>
    );
};

const UserCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
    </svg>
);

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { 
    history, 
    latestAnalysis, 
    addNewAnalysis, 
    getTimeUntilNextAnalysis, 
    shouldRecommendAnalysis: isRecommendedAnalysis, 
    isLoading,
    streak
  } = useHistory(false); // false = no usar datos mock, empezar con historial vacío
  
  const [isCheckupActive, setIsCheckupActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [healthAssessment, setHealthAssessment] = useState<HealthRiskAssessment | null>(null);
  const [showRiskDetailsModal, setShowRiskDetailsModal] = useState(false);
  const [lastCheckup, setLastCheckup] = useState<Checkup | null>(null);
  
  useEffect(() => {
    if (userProfile) {
      const assessment = assessHealthRisk(userProfile);
      setHealthAssessment(assessment);
    }
  }, [userProfile]);

  // Efecto para detectar cambios en la racha
  useEffect(() => {
    console.log('🔥 Racha actualizada:', streak, 'días consecutivos');
  }, [streak]);

  const handleStartCheckup = () => {
    setAnalysisResult(null); // Clear previous results
    setIsCheckupActive(true);
  };
  
  const handleCheckupComplete = (result: AnalysisResult, checkupData: Checkup) => {
    // Guardar los datos del checkup para poder agregar al historial
    setLastCheckup(checkupData);
    setAnalysisResult(result);
    setIsCheckupActive(false);
    
    // Registrar racha actual antes de agregar
    const currentStreak = streak;
    
    // Agregar inmediatamente al historial usando el hook
    addNewAnalysis(checkupData, result);
    
    console.log('Nuevo análisis agregado al historial:', {
      checkup: checkupData,
      result: result,
      timestamp: new Date().toISOString(),
      previousStreak: currentStreak,
      note: 'La racha se actualizará automáticamente al recalcularse con el nuevo historial'
    });
  };

  const handleViewHistory = () => {
    setShowHistoryPage(true);
  };

  const handleBackFromHistory = () => {
    setShowHistoryPage(false);
  };

  const handleShowRiskDetails = () => {
    setShowRiskDetailsModal(true);
  };

  const handleCloseRiskDetails = () => {
    setShowRiskDetailsModal(false);
  };

  // Si se está mostrando el historial, renderizar solo esa pantalla
  if (showHistoryPage) {
    return <AnalysisHistoryPage onBack={handleBackFromHistory} />;
  }

  const greeting = `¡Hola, ${userProfile?.name?.split(' ')[0] || 'Usuario'}!`;

  // Determinar si se debe mostrar una recomendación urgente usando el hook
  const isAnalysisRecommended = isRecommendedAnalysis();

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="AyniSalud Logo"
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-[#1A2E40] font-poppins">{greeting}</h1>
              <p className="text-[#1A2E40]/80 mt-1">
                {healthAssessment ? 
                  `${healthAssessment.personalizedMessage.slice(0, 60)}...` : 
                  '¿Cómo te sientes hoy?'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-[#1A2E40]/70 hover:text-[#2A787A] transition-colors"
            aria-label="Abrir perfil de usuario"
          >
            <UserCircleIcon className="w-10 h-10" />
          </button>
        </header>

        {/* Alerta de análisis recomendado si es urgente */}
        {isAnalysisRecommended && healthAssessment?.riskLevel === 'critical' && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Análisis Crítico Recomendado
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  Tu perfil de salud requiere monitoreo frecuente. Te recomendamos realizar un análisis ahora.
                </p>
              </div>
            </div>
          </div>
        )}

        <main className="flex flex-col lg:block">
          {/* Grid container solo para desktop, flex container para móvil */}
          <div className="lg:grid lg:grid-cols-3 gap-6 mb-8 flex flex-col lg:flex-none">
            {/* CountdownCard */}
            <div className="lg:col-span-2 order-1 lg:order-none">
              <CountdownCard 
                userProfile={userProfile} 
                onShowRiskDetails={handleShowRiskDetails}
                history={history}
                latestAnalysis={latestAnalysis}
                getTimeUntilNextAnalysis={getTimeUntilNextAnalysis}
                shouldRecommendAnalysis={isRecommendedAnalysis}
              />
            </div>
            
            {/* Contenedor de la columna derecha en desktop, elementos separados en móvil */}
            <div className="lg:col-span-1 lg:flex lg:flex-col lg:gap-6 contents lg:block">
              {/* StreakCard */}
              <div className="order-2 lg:order-none mb-6 lg:mb-0">
                <StreakCard streak={streak} />
              </div>
              
              {/* Panel de Chequeo - actualizado según el riesgo */}
              <div className={`order-3 lg:order-none mb-6 lg:mb-6 p-8 rounded-2xl text-white shadow-lg text-center md:text-left ${
                healthAssessment?.riskLevel === 'critical' ? 'bg-red-600' :
                healthAssessment?.riskLevel === 'high' ? 'bg-orange-500' :
                healthAssessment?.riskLevel === 'moderate' ? 'bg-yellow-500' :
                'bg-[#2A787A]'
              }`}>
                <h2 className="text-2xl font-bold font-poppins">
                  {isAnalysisRecommended ? 'Análisis Recomendado' : 'Chequeo de Salud'}
                </h2>
                <p className="mt-2 mb-6 opacity-90">
                  {healthAssessment?.riskLevel === 'critical' ? 
                    'Tu perfil requiere monitoreo frecuente para tu seguridad.' :
                    healthAssessment?.riskLevel === 'high' ?
                    'Tu perfil sugiere realizar análisis con mayor frecuencia.' :
                    'Obtén un análisis rápido de tus síntomas para entender el nivel de riesgo potencial.'
                  }
                </p>
                <button 
                  onClick={handleStartCheckup} 
                  className={`bg-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 ${
                    healthAssessment?.riskLevel === 'critical' ? 'text-red-600 hover:bg-red-50' :
                    healthAssessment?.riskLevel === 'high' ? 'text-orange-500 hover:bg-orange-50' :
                    healthAssessment?.riskLevel === 'moderate' ? 'text-yellow-600 hover:bg-yellow-50' :
                    'text-[#2A787A] hover:bg-slate-100'
                  }`}
                >
                  {isAnalysisRecommended ? 'Realizar Análisis Ahora' : 'Iniciar Chequeo de Bienestar'}
                </button>
              </div>
              
              {/* Historial - al final en móvil */}
              <div className="order-5 lg:order-none">
                <AnalysisHistoryCard onViewHistory={handleViewHistory} history={history} />
              </div>
            </div>
            
            {/* Resultados - entre panel de chequeo e historial en móvil, separado del grid en desktop */}
            {analysisResult && (
              <div className="order-4 lg:order-none lg:col-span-3 mb-6 lg:mb-0">
                <AnalysisResultCard result={analysisResult} />
              </div>
            )}
          </div>
        </main>
      </div>
      
      {isCheckupActive && (
        <CheckupFlow
          onClose={() => setIsCheckupActive(false)}
          onComplete={handleCheckupComplete}
        />
      )}

      {isProfileModalOpen && userProfile && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={userProfile}
        />
      )}

      {showRiskDetailsModal && healthAssessment && (
        <HealthRiskDetailsModal
          isOpen={showRiskDetailsModal}
          onClose={handleCloseRiskDetails}
          assessment={healthAssessment}
        />
      )}

    </>
  );
};

export default Dashboard;