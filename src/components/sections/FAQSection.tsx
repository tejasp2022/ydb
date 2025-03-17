"use client";

import { FC, useState } from 'react';
import content from "@/data/content.json";
import { motion, AnimatePresence } from 'framer-motion';

const FAQSection: FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          {content.faqSection.title}
        </motion.h2>
        <div className="max-w-3xl mx-auto">
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
                  <h3 className="text-xl font-semibold text-gray-800">{item.question}</h3>
                  <motion.div
                    animate={{ rotate: openItem === index ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      openItem === index ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-500'
                    }`}
                  >
                    <span className="text-xl font-semibold">+</span>
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
                        className="pt-4 text-gray-600 leading-relaxed"
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