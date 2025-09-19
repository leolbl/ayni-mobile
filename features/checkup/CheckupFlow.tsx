import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Checkup, AnalysisResult } from '../../types';
import { ProgressBar } from '../../components/ProgressBar';
import { Spinner } from '../../components/Spinner';
import GeneralFeelingStep from './steps/GeneralFeelingStep';
import VitalSignsStep from './steps/VitalSignsStep';
import SymptomSelectorStep from './steps/SymptomSelectorStep';
import { getCheckupAnalysis } from '../../services/analysisService';

const STEPS = [
  { id: 1, title: "Sensación General" },
  { id: 2, title: "Signos Vitales" },
  { id: 3, title: "Síntomas" },
];

interface CheckupFlowProps {
  onClose: () => void;
  onComplete: (result: AnalysisResult) => void;
}

const CheckupFlow: React.FC<CheckupFlowProps> = ({ onClose, onComplete }) => {
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [checkupData, setCheckupData] = useState<Partial<Checkup>>({
    generalFeeling: { scale: 3, tags: [] },
    vitals: {
        bloodPressure: {}
    },
    symptoms: [],
  });

  const updateCheckupData = (data: Partial<Checkup>) => {
    setCheckupData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleFinish = async (finalData: Partial<Checkup>) => {
    if (!userProfile) return;
    setIsLoading(true);

    const completeData: Checkup = {
        generalFeeling: finalData.generalFeeling!,
        vitals: finalData.vitals!,
        hasSymptoms: finalData.hasSymptoms!,
        symptoms: finalData.symptoms,
    };
    
    const result = await getCheckupAnalysis(completeData, userProfile);
    
    setIsLoading(false);
    onComplete(result);
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-[#F0F4F8] z-50 flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto flex-grow flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#1A2E40] font-poppins">Chequeo de Bienestar</h1>
            <button onClick={onClose} disabled={isLoading} className="text-slate-400 hover:text-[#1A2E40]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <ProgressBar progress={progress} />

        {/* Step Content */}
        <div className="flex-grow mt-6 overflow-y-auto">
            {currentStep === 1 && (
                <GeneralFeelingStep 
                    data={checkupData.generalFeeling!}
                    onUpdate={(data) => updateCheckupData({ generalFeeling: data })}
                />
            )}
            {currentStep === 2 && (
                <VitalSignsStep 
                    data={checkupData.vitals!}
                    onUpdate={(data) => updateCheckupData({ vitals: data })}
                />
            )}
            {currentStep === 3 && (
                <SymptomSelectorStep
                    data={checkupData.symptoms!}
                    onUpdate={(data, hasSymptoms) => updateCheckupData({ symptoms: data, hasSymptoms })}
                />
            )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-4 border-t border-slate-200">
             {isLoading ? (
                <div className="flex justify-center">
                    <div className="flex items-center space-x-2 text-[#1A2E40]">
                        <Spinner />
                        <span>Analizando tus datos...</span>
                    </div>
                </div>
             ) : (
                <div className="flex justify-between items-center">
                    <button onClick={prevStep} disabled={currentStep === 1} className="px-6 py-2 text-[#1A2E40] bg-slate-200 rounded-lg font-semibold hover:bg-slate-300 disabled:opacity-50 transition-colors">Atrás</button>
                    
                    {currentStep < STEPS.length ? (
                        <button onClick={nextStep} className="px-6 py-2 text-white bg-[#2A787A] rounded-lg font-semibold hover:bg-[#2A787A]/90 transition-colors">Siguiente</button>
                    ) : (
                        <button onClick={() => handleFinish(checkupData)} className="px-6 py-2 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors">Finalizar y Analizar</button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CheckupFlow;