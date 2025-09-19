import React from 'react';
import { Checkup } from '../../../types';

type VitalsData = Checkup['vitals'];

interface VitalSignsStepProps {
  data: VitalsData;
  onUpdate: (data: VitalsData) => void;
}

const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const ThermometerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PulseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 012-2h3.945" /></svg>;
const DropletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12h.01" /></svg>;


const VitalSignsStep: React.FC<VitalSignsStepProps> = ({ data, onUpdate }) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow float for temperature
    const numValue = value === '' ? undefined : (name === 'temperature' ? parseFloat(value) : parseInt(value, 10));
    onUpdate({ ...data, [name]: numValue });
  };
  
  const handleBloodPressureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseInt(value, 10);
    onUpdate({ 
        ...data, 
        bloodPressure: {
            ...data.bloodPressure,
            [name]: numValue
        }
    });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center">Registremos tus signos vitales.</h2>
      <p className="text-slate-500 text-center mt-2 mb-8">Si tienes los datos, por favor, añádelos. Puedes omitir los que no tengas.</p>

      <div className="space-y-4">
        {/* Heart Rate */}
        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="bg-red-100 p-2 rounded-full"><HeartIcon /></div>
          <div className="flex-grow">
            <label htmlFor="heartRate" className="block text-sm font-medium text-slate-700">Frecuencia Cardíaca</label>
            <input 
              type="number" 
              id="heartRate" 
              name="heartRate"
              value={data.heartRate || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-cyan-500 p-1"
              placeholder="Ej: 72"
            />
          </div>
          <span className="text-slate-500">bpm</span>
        </div>

        {/* Blood Oxygen */}
        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-full"><PulseIcon /></div>
          <div className="flex-grow">
            <label htmlFor="spo2" className="block text-sm font-medium text-slate-700">Oxígeno en Sangre (SpO2)</label>
            <input 
              type="number" 
              id="spo2" 
              name="spo2"
              value={data.spo2 || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-cyan-500 p-1"
              placeholder="Ej: 98"
            />
          </div>
          <span className="text-slate-500">%</span>
        </div>
        
        {/* Temperature */}
        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="bg-orange-100 p-2 rounded-full"><ThermometerIcon /></div>
          <div className="flex-grow">
            <label htmlFor="temperature" className="block text-sm font-medium text-slate-700">Temperatura Corporal</label>
            <input 
              type="number" 
              id="temperature" 
              name="temperature"
              step="0.1"
              value={data.temperature || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-cyan-500 p-1"
              placeholder="Ej: 36.6"
            />
          </div>
          <span className="text-slate-500">°C</span>
        </div>

        {/* Blood Pressure */}
        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="bg-pink-100 p-2 rounded-full"><DropletIcon /></div>
          <div className="flex-grow">
            <label className="block text-sm font-medium text-slate-700">Presión Arterial</label>
            <div className="flex items-center space-x-2 mt-1">
              <input 
                type="number" 
                name="systolic"
                value={data.bloodPressure?.systolic || ''}
                onChange={handleBloodPressureChange}
                className="w-full border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-cyan-500 p-1"
                placeholder="Sistólica"
              />
              <span className="text-slate-500 font-bold">/</span>
              <input 
                type="number" 
                name="diastolic"
                value={data.bloodPressure?.diastolic || ''}
                onChange={handleBloodPressureChange}
                className="w-full border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-cyan-500 p-1"
                placeholder="Diastólica"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VitalSignsStep;