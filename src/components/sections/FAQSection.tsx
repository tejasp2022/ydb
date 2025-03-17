"use client";

import { FC, useState } from 'react';
import content from "@/data/content.json";

const FAQSection: FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">{content.faqSection.title}</h2>
        <div className="max-w-3xl mx-auto">
          {content.faqSection.items.map((item, index) => (
            <div key={index} className="mb-4">
              <div 
                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:bg-gray-50"
                onClick={() => handleToggle(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{item.question}</h3>
                  <span className="text-2xl text-gray-500">
                    {openItem === index ? '−' : '+'}
                  </span>
                </div>
                
                {openItem === index && (
                  <div className="mt-3 text-gray-600">
                    <p className="pt-2">{item.answer}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 