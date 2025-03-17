"use client";

import { useState, useMemo } from "react";
import { UserCircle, Sparkles, Mic, Upload, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  Linkedin, 
  FileText, 
  Radio, 
  MessageSquare, 
  Newspaper,
  Brain,
  Headphones,
  Podcast,
  Music,
  Clock,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";
import HubSpokeAnimation from "@/components/HubSpokeAnimation";
import content from "@/data/content.json";
import * as Icons from "lucide-react";

const SpotifyIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-8 h-8 text-[#1DB954]"
    fill="currentColor"
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm4.521 17.34c-.24.371-.841.491-1.271.231-3.051-1.86-6.672-2.131-10.162-1.2-.36.09-.75-.15-.84-.51-.09-.36.15-.75.51-.84 3.931-1.021 8.012-.63 11.452 1.38.42.26.54.87.27 1.29zm1.2-2.64c-.3.42-.84.6-1.261.3-3.091-1.891-7.651-2.461-11.442-1.35-.45.12-.9-.12-1.021-.57-.12-.45.12-.9.57-1.021 4.471-1.35 9.672-.69 13.232 1.5.42.3.6.84.3 1.261zm.099-2.76c-3.721-2.191-9.792-2.401-13.332-1.33-.54.15-1.08-.15-1.23-.69-.15-.54.15-1.08.69-1.23 4.111-1.23 10.932-.99 15.262 1.53.51.3.69.99.39 1.53-.3.51-.991.69-1.53.39z"/>
  </svg>
);

const ApplePodcastIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-8 h-8 text-[#DA2C84]"
    fill="currentColor"
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6c3.213 0 5.827 2.614 5.827 5.827 0 .72-.132 1.407-.374 2.04-.138.362-.518.553-.88.416-.362-.138-.553-.518-.416-.88.186-.49.283-1.017.283-1.576 0-2.431-1.978-4.409-4.44-4.409s-4.44 1.978-4.44 4.409c0 .559.097 1.086.283 1.576.138.362-.054.742-.416.88-.362.138-.742-.054-.88-.416A5.828 5.828 0 0 1 6.173 9.427C6.173 6.214 8.787 3.6 12 3.6zm0 3.6c1.227 0 2.227 1 2.227 2.227s-1 2.227-2.227 2.227-2.227-1-2.227-2.227S10.773 7.2 12 7.2zm0 4.8c2.813 0 5.093 2.28 5.093 5.093 0 .36-.293.653-.653.653s-.653-.293-.653-.653c0-2.084-1.703-3.787-3.787-3.787s-3.787 1.703-3.787 3.787c0 .36-.293.653-.653.653s-.653-.293-.653-.653C6.907 14.28 9.187 12 12 12z"/>
  </svg>
);

export function HowItWorksSection() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist');
    waitlistSection?.scrollIntoView({ behavior: 'smooth' });
  };

  // Dynamic icon rendering helper
  const renderIcon = (iconName: string, className: string, color?: string) => {
    // @ts-ignore - Using dynamic icon reference
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent className={className} style={color ? {color} : {}} /> : null;
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900" id="how-it-works">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{content.howItWorksSection.title}</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {content.howItWorksSection.description}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto mb-8 md:mb-12">
          {content.howItWorksSection.cards.map((card, index) => (
            <div
              key={index}
              className={`
                bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-5 md:p-8 
                rounded-xl md:rounded-2xl shadow-lg border border-gray-200/50 
                dark:border-gray-700/50 cursor-pointer transition-all duration-300
                ${selectedCard === index ? 'ring-2 ring-purple-600' : 'hover:shadow-xl hover:-translate-y-1'}
              `}
              onClick={() => setSelectedCard(selectedCard === index ? null : index)}
            >
              <div className="flex items-center gap-3 mb-3">
                {renderIcon(card.icon, "w-6 h-6 text-purple-600")}
                <div className="text-xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {card.title}
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">{card.description}</p>
              {selectedCard === index && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{card.details.title}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {card.details.items.map((item, i) => (
                      <div key={i} className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {renderIcon(item.icon, "w-5 h-5", item.color)}
                        <span className="text-xs mt-1">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto mb-12">
          <HubSpokeAnimation 
            contentNodes={content.hubSpokeAnimation.contentNodes}
            outputNodes={content.hubSpokeAnimation.outputNodes}
            hubIcon={content.hubSpokeAnimation.hubIcon}
            radius={200}
            useTechLogos={true}
          />
        </div>

        <div className="text-center">
          <Button 
            onClick={scrollToWaitlist}
            size="lg"
            className="group"
          >
            {content.howItWorksSection.buttonText}
            <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
} 