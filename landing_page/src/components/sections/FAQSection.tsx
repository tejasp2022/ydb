"use client";

import { FC, useState } from 'react';
import content from "@/data/content.json";
import { motion, AnimatePresence } from 'framer-motion';
import { GeistSans } from 'geist/font/sans';

const FAQSection: FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <section className={`py-20 bg-gradient-to-br from-indigo-50 to-purple-50 ${GeistSans.className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 left-1/4 w-64 h-64 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl opacity-70 -z-10"></div>
          <div className="absolute -top-5 right-1/4 w-48 h-48 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl opacity-70 -z-10"></div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center justify-center mb-10">
              <div className="h-[3px] w-32 md:w-48 bg-gradient-to-r from-transparent to-purple-500 dark:to-purple-400 mr-8"></div>
              <span className="text-3xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 uppercase tracking-wide">
                {content.faqSection.title}
              </span>
              <div className="h-[3px] w-32 md:w-48 bg-gradient-to-l from-transparent to-purple-500 dark:to-purple-400 ml-8"></div>
            </div>
          </motion.div>
        </div>
        
        <div className="max-w-5xl mx-auto">
          {content.faqSection.items.map((item, index) => (
            <motion.div 
              key={index} 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div 
                className={`bg-white rounded-xl shadow-md border-l-4 ${
                  openItem === index ? 'border-indigo-500' : 'border-purple-300'
                } p-6 cursor-pointer hover:shadow-lg transition-all duration-300`}
                onClick={() => handleToggle(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-gray-800">{item.question}</h3>
                  <motion.div
                    animate={{ rotate: openItem === index ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      openItem === index ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-500'
                    }`}
                  >
                    <span className="text-xl font-medium">+</span>
                  </motion.div>
                </div>
                
                <AnimatePresence>
                  {openItem === index && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <motion.p 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="pt-4 text-gray-600 leading-relaxed font-normal"
                      >
                        {item.answer}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 