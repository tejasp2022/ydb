"use client";

import { Coffee, Headphones, Sparkles, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HowItWorksSection() {
  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist');
    waitlistSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="how-it-works" className="h-screen flex items-center justify-center bg-purple-50 dark:bg-gray-900">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            How Mornings With Mo Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Staying informed has never been easier
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Coffee,
              title: "Morning Routine",
              description:
                "Start your day with curated content that matters to you",
            },
            {
              icon: Sparkles,
              title: "AI-Powered Selection",
              description:
                "Our AI understands your preferences and selects the perfect mix",
            },
            {
              icon: Headphones,
              title: "Personalized Delivery",
              description:
                "Listen to your personalized podcast on your favorite platform",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center p-5 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-purple-100 dark:bg-gray-700">
                <item.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            onClick={scrollToWaitlist}
            size="lg"
            className="group"
          >
            Join the Waitlist
            <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
} 