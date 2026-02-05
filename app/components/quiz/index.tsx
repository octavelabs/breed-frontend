import React from 'react';

interface QuizQuestionProps {
  question: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  onSelect: (optionId: string) => void;
  selectedAnswer: string | null;
  primaryColor?: string;
  multiSelect?: boolean;
}

const QuizQuestion:React.FC<QuizQuestionProps>  = ({ 
  question,
  options = [],
  onSelect,
  selectedAnswer = null,
}) => {

  const handleOptionClick = (optionId: string) => {
    if (onSelect) {
      onSelect(optionId);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-400px)]">
          <div className="flex gap-[48px]">
        {/* Question */}
        <h2 className="text-[32px] mb-8 leading-snug w-1/2">
          {question}
        </h2>

        {/* Options */}
        <div className="space-y-3 w-1/2">
          {options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={`w-full p-5 rounded-[20px] text-left font-medium transition-all duration-200 flex items-center justify-between group ${
                  isSelected
                    ? `bg-[#870BD6] text-white`
                    : 'bg-[#E6EAEEB2]'
                }`}
                style={isSelected ? { backgroundColor: `rgb(147 51 234)` } : {}}
              >
                <span className="flex-1 pr-4 text-[20px] leading-[30px] font-semibold">{option.text}</span>
                
                {/* Radio Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? 'border-white bg-white'
                    : 'border-gray-400 group-hover:border-gray-600'
                }`}>
                  {isSelected && (
                    <div 
                      className={`w-3 h-3 rounded-full bg-[#870BD6]`}
                      style={{ backgroundColor: `rgb(147 51 234)` }}
                    ></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
        </div>
  );
};

export default QuizQuestion;