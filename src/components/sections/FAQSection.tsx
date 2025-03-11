import { FC } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What is Mornings With Mo?",
    answer: "Mornings With Mo is an AI-powered platform that helps you create, manage, and optimize your prompts for various AI models, making it easier to get consistent and high-quality results."
  },
  {
    question: "How does it work?",
    answer: "Simply input your prompt requirements, and our platform will help you craft, test, and refine your prompts. You can save, organize, and share your prompts with team members."
  },
  {
    question: "Is there a free plan?",
    answer: "Yes! We offer a free tier that lets you experience the core features of Mornings With Mo. Premium features are available in our paid plans."
  },
  {
    question: "Can I use Mornings With Mo with different AI models?",
    answer: "Absolutely! Mornings With Mo is designed to work with various AI models including GPT-4, Claude, and others, helping you optimize prompts for each specific model."
  },
  {
    question: "How secure is my data?",
    answer: "We take security seriously. All your prompts and data are encrypted and stored securely. We never share your proprietary prompts with other users."
  }
];

const FAQSection: FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <div key={index} className="mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 