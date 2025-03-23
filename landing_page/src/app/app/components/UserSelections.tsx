import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

interface UserSelectionsProps {
  selectedInterests: string[];
  customTopics: string[];
  setSelectedInterests: React.Dispatch<React.SetStateAction<string[]>>;
  setCustomTopics: React.Dispatch<React.SetStateAction<string[]>>;
  handleNext: () => void;
  isSubmitting: boolean;
}

export const UserSelections: React.FC<UserSelectionsProps> = ({
  selectedInterests,
  customTopics,
  setSelectedInterests,
  setCustomTopics,
  handleNext,
  isSubmitting
}) => {
  const allSelections = [...selectedInterests, ...customTopics];

  return (
    <div className="w-full max-w-lg md:max-w-3xl mb-4 md:mb-6 sticky top-0 z-20 bg-white pb-2">
      <AnimatePresence>
        {(selectedInterests.length > 0 || customTopics.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-lg bg-purple-50 p-3 border border-purple-100 shadow-sm"
          >
            <motion.h2 
              className="font-sans text-purple-700 text-lg font-semibold mb-2 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Your Selections:
            </motion.h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map((interest) => (
                  <motion.span 
                    key={interest} 
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md font-sans font-medium flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {interest}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInterests(prev => prev.filter(item => item !== interest));
                      }}
                      className="ml-1 hover:text-purple-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.span>
                ))}
                {customTopics.map((topic) => (
                  <motion.span 
                    key={`custom-${topic}`} 
                    className="bg-purple-200 text-purple-800 px-3 py-1 rounded-md font-sans font-medium flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {topic}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomTopics(prev => prev.filter(item => item !== topic));
                      }}
                      className="ml-1 hover:text-purple-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.span>
                ))}
              </div>
              
              {/* Submit button in the selections pane */}
              {allSelections.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting || allSelections.length === 0}
                    className="bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 hover:bg-purple-800 transition-colors shadow-sm disabled:bg-purple-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Generating...' : 'Generate my briefing'} {!isSubmitting && <ChevronRight className="h-4 w-4" />}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSelections;
