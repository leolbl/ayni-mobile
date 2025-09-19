import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../lib/firebase';
import { AnalysisResult } from '../../types';
import { AnalysisResultCard } from './components/AnalysisResultCard';
import CheckupFlow from '../checkup/CheckupFlow';
import ProfileModal from '../profile/ProfileModal';
import AnalysisHistoryPage from './AnalysisHistoryPage';
import { mockHistoryData } from '../../data/mockHistoryData';

const CountdownCard: React.FC = () => {
    const calculateTimeLeft = () => {
        const nextCheckupDate = new Date();
        nextCheckupDate.setDate(nextCheckupDate.getDate() + 7); // Set next checkup 7 days from now
        const difference = +nextCheckupDate - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000 * 60); // Update every minute

        return () => clearTimeout(timer);
    });

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-center items-center text-center h-full font-sans">
            <h3 className="text-lg lg:text-xl font-semibold text-[#1A2E40]/80 mb-1 font-poppins">Próximo Análisis Recomendado</h3>
            {Object.keys(timeLeft).length > 0 ? (
                <>
                    <div className="flex items-baseline my-2">
                        <span className="text-8xl lg:text-9xl font-bold text-[#2A787A] tracking-tighter font-poppins">{timeLeft.days}</span>
                        <span className="text-2xl lg:text-3xl font-semibold text-[#1A2E40] ml-2">días</span>
                    </div>
                    <div className="text-base lg:text-lg text-slate-500">
                        {timeLeft.hours} horas, {timeLeft.minutes} minutos
                    </div>
                </>
            ) : (
                <span className="text-2xl font-bold text-green-600 mt-4">¡Es hora de tu chequeo!</span>
            )}
        </div>
    );
};

const FireIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
);


const StreakCard: React.FC = () => {
    // Mock data for streak
    const streak = 5;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md font-sans">
            <h3 className="text-lg font-semibold text-[#1A2E40] mb-2 font-poppins">Racha de Análisis</h3>
            <div className="flex items-center justify-center space-x-4">
                <FireIcon className="w-12 h-12 text-[#FF7F50]"/>
                <span className="text-5xl font-bold text-[#1A2E40] font-poppins">{streak}</span>
                <span className="text-lg text-[#1A2E40]/80 self-end pb-1">días</span>
            </div>
        </div>
    );
};

const AnalysisHistoryCard: React.FC<{ onViewHistory: () => void }> = ({ onViewHistory }) => {
    // Usar los últimos 3 análisis de los datos mock
    const recentHistory = mockHistoryData.slice(0, 3).map(entry => ({
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
                Ver todo ({mockHistoryData.length} análisis)
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
  const [isCheckupActive, setIsCheckupActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  
  const handleStartCheckup = () => {
    setAnalysisResult(null); // Clear previous results
    setIsCheckupActive(true);
  };
  
  const handleCheckupComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsCheckupActive(false);
  };

  const handleViewHistory = () => {
    setShowHistoryPage(true);
  };

  const handleBackFromHistory = () => {
    setShowHistoryPage(false);
  };

  // Si se está mostrando el historial, renderizar solo esa pantalla
  if (showHistoryPage) {
    return <AnalysisHistoryPage onBack={handleBackFromHistory} />;
  }

  const greeting = `¡Hola, ${userProfile?.name?.split(' ')[0] || 'Usuario'}!`;

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img
              src="../assets/logo.png"
              alt="AyniSalud Logo"
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-[#1A2E40] font-poppins">{greeting}</h1>
              <p className="text-[#1A2E40]/80 mt-1">¿Cómo te sientes hoy?</p>
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

        <main className="flex flex-col lg:block">
          {/* Grid container solo para desktop, flex container para móvil */}
          <div className="lg:grid lg:grid-cols-3 gap-6 mb-8 flex flex-col lg:flex-none">
            {/* CountdownCard */}
            <div className="lg:col-span-2 order-1 lg:order-none">
              <CountdownCard />
            </div>
            
            {/* Contenedor de la columna derecha en desktop, elementos separados en móvil */}
            <div className="lg:col-span-1 lg:flex lg:flex-col lg:gap-6 contents lg:block">
              {/* StreakCard */}
              <div className="order-2 lg:order-none mb-6 lg:mb-0">
                <StreakCard />
              </div>
              
              {/* Panel de Chequeo - antes que historial en móvil */}
              <div className="order-3 lg:order-none mb-6 lg:mb-6 bg-[#2A787A] p-8 rounded-2xl text-white shadow-lg text-center md:text-left">
                <h2 className="text-2xl font-bold font-poppins">Chequeo de Salud</h2>
                <p className="mt-2 mb-6 opacity-90">Obtén un análisis rápido de tus síntomas para entender el nivel de riesgo potencial.</p>
                <button onClick={handleStartCheckup} className="bg-white text-[#2A787A] font-bold py-3 px-6 rounded-lg hover:bg-slate-100 transition-transform transform hover:scale-105">
                  Iniciar Chequeo de Bienestar
                </button>
              </div>
              
              {/* Historial - al final en móvil */}
              <div className="order-5 lg:order-none">
                <AnalysisHistoryCard onViewHistory={handleViewHistory} />
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

    </>
  );
};

export default Dashboard;