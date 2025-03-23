import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface NoResultsPromptProps {
  showNoResultsPrompt: boolean;
  searchQuery: string;
  handleAddCustomTopic: (topic?: string) => void;
}

export const NoResultsPrompt: React.FC<NoResultsPromptProps> = ({ 
  showNoResultsPrompt, 
  searchQuery, 
  handleAddCustomTopic 
}) => {
  if (!showNoResultsPrompt) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-purple-50 p-4 rounded-lg mb-4 text-center"
    >
      <p className="text-purple-700 mb-2">No results found for "{searchQuery}"</p>
      <button
        onClick={() => handleAddCustomTopic(searchQuery)}
        className="bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm inline-flex items-center gap-1"
      >
        <Plus size={16} /> Add as custom interest
      </button>
    </motion.div>
  );
};

export default NoResultsPrompt;
