import { FC } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What makes this service different from just reading my favorite websites or newsletters?",
    answer: "While you could visit each source individually, this service aggregates and curates content specifically for you, saving time and effort. Instead of browsing multiple feeds, you get a concise, digestible audio briefing tailored to your interests—perfect for busy mornings or commutes."
  },
  {
    question: "How do you ensure the quality and credibility of the content?",
    answer: "Our system uses advanced AI algorithms to select reputable sources and prioritize high-quality content. Additionally, the curated script undergoes smart summarization to capture essential insights while reducing noise, ensuring you receive accurate and meaningful updates."
  },
  {
    question: "Isn't this just repackaging content that's already available?",
    answer: "In a way, yes—but the value lies in personalization. We transform scattered content into a coherent narrative that's customized for each user. This unique synthesis allows you to hear just what matters to you without the hassle of filtering through irrelevant information."
  },
  {
    question: "How accurate is the personalization? What if the content doesn't match my interests?",
    answer: "We continuously refine our algorithms based on user feedback and engagement. Early iterations might not be perfect, but as you interact with the service—by adjusting your content sources and providing feedback—the system learns to better tailor the content to your exact preferences."
  },
  {
    question: "Can I trust an AI-generated voice to deliver content naturally?",
    answer: "Advances in text-to-speech technology, such as those from Eleven Labs, have made AI voices sound remarkably natural and engaging. We're committed to using state-of-the-art tools to ensure the audio experience feels both conversational and pleasant to listen to."
  },
  {
    question: "How do you handle potential biases in content selection?",
    answer: "Our approach emphasizes diversity by drawing from multiple sources. We also incorporate mechanisms for users to flag content that doesn't align with their preferences or seems biased, ensuring that the system adapts and maintains balanced curation over time."
  },
  {
    question: "What about my data privacy and security?",
    answer: "User privacy is paramount. We only use your preferences to tailor your experience and do not share personal data with third parties. Security measures and encryption protocols are implemented to protect your data at every stage of the process."
  },
  {
    question: "Why should I pay for this service when there are free alternatives?",
    answer: "A paid subscription model ensures continuous improvement, high-quality personalization, and an ad-free, seamless experience. The value comes from the time saved and the convenience of having a curated, daily briefing that fits into your lifestyle—benefits that free services may not offer."
  }
];

const FAQSection: FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto">
          {faqItems.map((item, index) => (
            <div key={index} className="mb-8">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.question}</h3>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 