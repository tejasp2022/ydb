import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';
import AmbientBackground from './AmbientBackground';

interface NextPageProps {
  handleBack: () => void;
  allSelections: string[];
  customTopics: string[];
  setCustomTopics: React.Dispatch<React.SetStateAction<string[]>>;
  customInput: string;
  setCustomInput: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  isAnimating: boolean;
}

export const NextPage: React.FC<NextPageProps> = ({
  handleBack,
  allSelections,
  customTopics,
  setCustomTopics,
  customInput,
  setCustomInput,
  handleKeyDown,
  handleSubmit,
  isSubmitting,
  inputRef,
  isAnimating
}) => {
  return (
    <motion.div 
      key="next"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="absolute inset-0 bg-white overflow-y-auto"
    >
      <div className="min-h-full flex flex-col items-center px-4 md:px-8 py-6 md:py-10 pb-32 md:pb-40 relative">
        <AmbientBackground />
        <div className="relative w-full max-w-3xl">
          <button 
            onClick={handleBack} 
            className="absolute left-0 top-0 text-purple-700 hover:bg-purple-100 p-2 rounded-full transition-colors duration-200"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="font-sans text-purple-700 text-4xl md:text-6xl font-bold text-center mb-10 tracking-tight">
            Your Interests
          </h1>
        </div>
        
        {/* Display all selections in a large text box */}
        <div className="w-full max-w-3xl p-8">
          <h2 className="font-sans text-purple-700 text-3xl md:text-4xl font-bold mb-8 tracking-tight">
            Selected Topics
          </h2>
          
          {/* Vertical list of selected topics */}
          <div className="mb-12">
            {allSelections.length > 0 ? (
              <ul className="space-y-4">
                {allSelections.map((selection, index) => (
                  <motion.li 
                    key={`${selection}-${index}`}
                    initial={isAnimating && index === allSelections.length - 1 ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="border-l-4 border-purple-700 pl-4 py-1 flex items-center justify-between group"
                  >
                    <span className="font-sans text-purple-700 font-bold text-3xl md:text-4xl tracking-tight">
                      {selection}
                    </span>
                    {customTopics.includes(selection) && (
                      <button 
                        onClick={() => {
                          setCustomTopics(prev => prev.filter(topic => topic !== selection));
                        }}
                        className="text-purple-300 hover:text-purple-700 transition-colors duration-200 p-2"
                        aria-label={`Remove ${selection}`}
                      >
                        <X size={20} />
                      </button>
                    )}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-2xl md:text-3xl font-medium pt-2 pb-6">Add some topics to get started</p>
            )}
          </div>
        </div>
        
        {/* Input box at the bottom of the page */}
        <div className="w-full max-w-3xl p-8 mt-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <input
                ref={inputRef}
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add More..."
                disabled={allSelections.length >= 5}
                className="flex-1 border-b-2 border-purple-700 pb-2 text-purple-700 placeholder:text-purple-300 text-3xl md:text-4xl font-bold focus:outline-none focus:border-b-4"
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || allSelections.length === 0}
                className="bg-purple-700 hover:bg-purple-800 text-white rounded-full p-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 md:hidden"
                aria-label="Submit interests"
              >
                {isSubmitting ? (
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ChevronLeft size={24} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NextPage;
