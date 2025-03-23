import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface InterestCategoryProps {
  name: string;
  subcategories: string[];
  expandedCategory: string | null;
  selectedInterests: string[];
  toggleCategory: (categoryName: string) => void;
  handleInterestClick: (interest: string) => void;
}

export const InterestCategory: React.FC<InterestCategoryProps> = ({
  name,
  subcategories,
  expandedCategory,
  selectedInterests,
  toggleCategory,
  handleInterestClick
}) => {
  return (
    <div className="mb-4">
      <button
        className={`w-full text-left py-3 pl-6 pr-5 rounded-lg flex justify-between items-center transition-all duration-200 ${expandedCategory === name ? 'bg-purple-100' : 'hover:bg-purple-50'}`}
        onClick={() => toggleCategory(name)}
      >
        <span className="font-sans text-purple-700 font-medium text-xl tracking-tight">{name}</span>
        <ChevronRight 
          className={`h-5 w-5 text-purple-700 transition-transform duration-200 ${expandedCategory === name ? 'transform rotate-90' : ''}`} 
        />
      </button>
      
      <AnimatePresence>
        {expandedCategory === name && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden pl-4"
          >
            <div className="pt-2 pb-2 pl-2 border-l-2 border-purple-300">
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  className={`${selectedInterests.includes(subcategory) 
                    ? 'bg-purple-700 text-white' 
                    : 'bg-white text-purple-700 hover:bg-purple-50'} 
                    py-2 px-4 rounded-lg text-base transition-all duration-200 w-full text-left mb-2 flex justify-between items-center`}
                  onClick={() => handleInterestClick(subcategory)}
                >
                  <span className="font-sans font-light">{subcategory}</span>
                  {selectedInterests.includes(subcategory) && (
                    <span className="text-white">✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterestCategory;
