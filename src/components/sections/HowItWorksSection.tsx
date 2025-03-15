"use client";

import { useState } from "react";
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
import Link from "next/link";
import HubSpokeAnimation from "@/components/HubSpokeAnimation";

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

  // Content nodes for the hub-spoke animation
  const contentNodes = [
    { id: 'twitter', icon: '/icons/twitter-icon.png' },
    { id: 'reddit', icon: '/icons/reddit-icon.png' },
    { id: 'linkedin', icon: '/icons/linkedin-icon.png' },
  ];

  // Output nodes for the hub-spoke animation
  const outputNodes = [
    { id: 'spotify', icon: '/icons/spotify-icon.png' },
    { id: 'apple', icon: '/icons/apple-music-icon.png' },
    { id: 'podcast', icon: '/icons/question-icon.png' },
  ];

  const cards = [
    {
      title: "1. Choose Your Topics",
      description: "Select your interests and preferred news sources to create your personalized content feed.",
      icon: <Settings className="w-6 h-6 text-purple-600" />,
      details: (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Choose from various content sources:</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Twitter className="w-5 h-5 text-[#1DA1F2]" />, label: "Twitter" },
              { icon: <Linkedin className="w-5 h-5 text-[#0A66C2]" />, label: "LinkedIn" },
              { icon: <MessageSquare className="w-5 h-5 text-[#FF4500]" />, label: "Reddit" },
              { icon: <FileText className="w-5 h-5 text-purple-600" />, label: "RSS Feeds" },
              { icon: <Newspaper className="w-5 h-5 text-purple-600" />, label: "News" },
              { icon: <Radio className="w-5 h-5 text-purple-600" />, label: "Forums" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "2. AI Curation",
      description: "Our AI analyzes and summarizes the most relevant content, creating a concise briefing just for you.",
      icon: <Brain className="w-6 h-6 text-purple-600" />,
      details: (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered content processing:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Content Aggregation</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Smart Summarization</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Script Generation</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Listen & Learn",
      description: "Start your day with a personalized audio briefing that keeps you informed and inspired.",
      icon: <Headphones className="w-6 h-6 text-purple-600" />,
      details: (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Delivery options:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Podcast className="w-4 h-4 text-[#8940FA]" />
              <span className="text-sm">Multiple Podcast Platforms</span>
            </div>
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Customizable AI Voices</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Flexible Scheduling</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, bounce: 0 },
        opacity: { duration: 0.01 }
      }
    }
  };

  // Replace the flowingDash animation with this
  const dashOffset = {
    animate: {
      strokeDashoffset: [0, -20],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900" id="how-it-works">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select Brew transforms how you consume content by curating and delivering personalized audio from your favorite sources.
          </p>
          <div className="mt-4">
            <Link 
              href="/hub-spoke-demo" 
              className="text-purple-600 hover:text-purple-800 underline text-sm inline-flex items-center"
            >
              <span>View Interactive Data Flow Diagram</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto mb-8 md:mb-12">
          {cards.map((card, index) => (
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
                {card.icon}
                <div className="text-xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {card.title}
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">{card.description}</p>
              {selectedCard === index && card.details}
            </div>
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto mb-12">
          {/* Replace the existing visualization with HubSpokeAnimation */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <HubSpokeAnimation 
              contentNodes={contentNodes}
              outputNodes={outputNodes}
              hubIcon="/icons/hub-icon.png"
              radius={200}
              animationDuration={4}
            />
          </div>
          
          {/* Add a simple legend below the animation */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Sources</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Twitter, Reddit, LinkedIn</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Processing</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Summarization & Audio Generation</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Destinations</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Spotify, Apple, Podcast Apps</p>
            </div>
          </div>
        </div>

        <div className="text-center">
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