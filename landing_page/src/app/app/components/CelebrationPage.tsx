import React from 'react';
import { motion } from 'framer-motion';
import AmbientBackground from './AmbientBackground';

interface CelebrationPageProps {
  allSelections: string[];
}

export const CelebrationPage: React.FC<CelebrationPageProps> = ({ allSelections }) => {
  return (
    <motion.div 
      key="celebration"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-white overflow-y-auto flex items-center justify-center"
    >
      <div className="min-h-full flex flex-col items-center justify-center px-4 md:px-8 py-10 text-center max-w-3xl mx-auto relative">
        <AmbientBackground />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="mx-auto mb-6">
            <span className="text-7xl">🎉</span>
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-sans text-purple-700 text-4xl md:text-6xl font-bold mb-4 tracking-tight"
        >
          Your briefing is ready!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-600 text-xl md:text-2xl mb-8 max-w-xl mx-auto"
        >
          We&apos;ve created a personalized briefing based on your interests:
          <span className="block mt-2 font-medium text-purple-700">
            {allSelections.join(', ')}
          </span>
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <a 
            href="/dashboard" 
            className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-lg font-medium text-lg inline-flex items-center gap-2 transition-colors shadow-lg"
          >
            View Your Briefing
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CelebrationPage;
