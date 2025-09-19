import React from 'react';
import { Checkup } from '../../../types';

type GeneralFeelingData = Checkup['generalFeeling'];

interface GeneralFeelingStepProps {
  data: GeneralFeelingData;
  onUpdate: (data: GeneralFeelingData) => void;
}

const FEELING_EMOJIS = [ { emoji: '😞', value: 1 }, { emoji: '😟', value: 2 }, { emoji: '😐', value: 3 }, { emoji: '🙂', value: 4 }, { emoji: '😄', value: 5 }];
const FEELING_TAGS = ["Con energía", "Normal", "Cansado/a", "Estresado/a", "Con dolor"];

const GeneralFeelingStep: React.FC<GeneralFeelingStepProps> = ({ data, onUpdate }) => {

  const handleScaleSelect = (value: number) => {
    onUpdate({ ...data, scale: value });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = data.tags.includes(tag)
      ? data.tags.filter(t => t !== tag)
      : [...data.tags, tag];
    onUpdate({ ...data, tags: newTags });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center">¿Cómo te sientes hoy en general?</h2>
      
      <div className="flex-grow flex flex-col justify-center space-y-12">
        {/* Emoji Scale */}
        <div>
            <p className="text-lg font-medium text-slate-600 text-center mb-4">Valora tu estado de ánimo</p>
            <div className="flex justify-around items-center">
                {FEELING_EMOJIS.map(({ emoji, value }) => (
                    <button
                        key={value}
                        onClick={() => handleScaleSelect(value)}
                        className={`text-4xl sm:text-5xl rounded-full p-2 transition-transform duration-200 transform hover:scale-125 focus:outline-none ${data.scale === value ? 'ring-2 ring-cyan-500 ring-offset-2 bg-cyan-100' : ''}`}
                        aria-label={`Nivel de ánimo ${value}`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>

        {/* Tags Selection */}
        <div>
            <p className="text-lg font-medium text-slate-600 text-center mb-4">¿Cuál de estas opciones te describe mejor?</p>
            <div className="flex flex-wrap justify-center gap-3">
                {FEELING_TAGS.map(tag => (
                    <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${data.tags.includes(tag) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralFeelingStep;