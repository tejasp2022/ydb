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
    <section id="how-it-works" className="min-h-screen flex flex-col justify-center bg-white dark:bg-gray-900 py-12 md:py-0">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          How It Works
        </h2>
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
          <motion.div
            className="w-full h-[500px] md:h-[200px] relative"
            initial="hidden"
            animate="visible"
            viewport={{ once: true }}
          >
            {/* Sources */}
            <motion.div 
              className="absolute left-1/2 md:left-12 top-0 md:top-[40%] -translate-x-1/2 md:-translate-y-1/2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative w-48 h-48">
                {/* Twitter - Top */}
                <motion.div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
                    <Twitter className="w-8 h-8 text-[#1DA1F2]" />
                  </div>
                  <span className="text-xs mt-2">Twitter</span>
                </motion.div>

                {/* Twitter Topic Nodes */}
                <div className="absolute hidden md:block">
                  {/* Topic 1: #tech */}
                  <motion.div
                    className="absolute top-[25px] -left-[120px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="relative">
                      <svg width="160" height="20" className="absolute top-1/2 right-0 -mr-2 -mt-[1px]">
                        <line x1="0" y1="10" x2="145" y2="10" stroke="#1DA1F2" strokeWidth="2" />
                      </svg>
                      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full shadow-md border border-blue-200 dark:border-blue-800 ml-2">
                        <span className="text-sm text-blue-600 dark:text-blue-200">#tech</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Topic 2: #AI */}
                  <motion.div
                    className="absolute -top-[20px] right-[120px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.75 }}
                  >
                    <div className="relative">
                      <svg width="140" height="60" className="absolute -top-[10px] left-0">
                        <line x1="0" y1="30" x2="120" y2="30" stroke="#1DA1F2" strokeWidth="2" />
                      </svg>
                      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full shadow-md border border-blue-200 dark:border-blue-800 ml-2">
                        <span className="text-sm text-blue-600 dark:text-blue-200">#AI</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Topic 3: #productivity */}
                  <motion.div
                    className="absolute -top-[60px] left-[40px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="relative">
                      <svg width="40" height="100" className="absolute bottom-0 left-1/2 -ml-[1px]">
                        <line x1="20" y1="0" x2="20" y2="80" stroke="#1DA1F2" strokeWidth="2" />
                      </svg>
                      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full shadow-md border border-blue-200 dark:border-blue-800">
                        <span className="text-sm text-blue-600 dark:text-blue-200">#productivity</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* LinkedIn - Bottom Left */}
                <motion.div 
                  className="absolute bottom-0 left-0 flex flex-col items-center z-10"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
                    <Linkedin className="w-8 h-8 text-[#0A66C2]" />
                  </div>
                  <span className="text-xs mt-2">LinkedIn</span>
                </motion.div>

                {/* LinkedIn Topic Nodes */}
                <div className="absolute hidden md:block">
                  {/* Topic 1: Satya Nadella */}
                  <motion.div
                    className="absolute bottom-[110px] -left-[160px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.85 }}
                  >
                    <div className="relative">
                      <svg width="160" height="100" className="absolute bottom-0 right-0">
                        <line x1="0" y1="80" x2="140" y2="10" stroke="#0A66C2" strokeWidth="2" />
                      </svg>
                      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full shadow-md border border-blue-200 dark:border-blue-800">
                        <span className="text-sm text-blue-600 dark:text-blue-200">Satya Nadella</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Topic 2: Sam Altman */}
                  <motion.div
                    className="absolute bottom-[50px] -left-[140px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="relative">
                      <svg width="140" height="40" className="absolute bottom-0 right-0">
                        <line x1="0" y1="20" x2="120" y2="20" stroke="#0A66C2" strokeWidth="2" />
                      </svg>
                      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full shadow-md border border-blue-200 dark:border-blue-800">
                        <span className="text-sm text-blue-600 dark:text-blue-200">Sam Altman</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Topic 3: Tech CEOs */}
                  <motion.div
                    className="absolute -bottom-[40px] -left-[100px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.95 }}
                  >
                    <div className="relative">
                      <svg width="120" height="80" className="absolute top-0 right-0">
                        <line x1="10" y1="0" x2="100" y2="60" stroke="#0A66C2" strokeWidth="2" />
                      </svg>
                      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full shadow-md border border-blue-200 dark:border-blue-800">
                        <span className="text-sm text-blue-600 dark:text-blue-200">Tech CEOs</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Reddit - Bottom Right */}
                <motion.div 
                  className="absolute bottom-0 right-0 flex flex-col items-center z-10"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-[#FF4500]" />
                  </div>
                  <span className="text-xs mt-2">Reddit</span>
                </motion.div>

                {/* Reddit Topic Nodes */}
                <div className="absolute hidden md:block">
                  {/* Topic 1: r/technology */}
                  <motion.div
                    className="absolute bottom-[110px] -right-[160px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="relative">
                      <svg width="160" height="100" className="absolute bottom-0 left-0">
                        <line x1="160" y1="80" x2="20" y2="10" stroke="#FF4500" strokeWidth="2" />
                      </svg>
                      <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-full shadow-md border border-orange-200 dark:border-orange-800">
                        <span className="text-sm text-orange-600 dark:text-orange-200">r/technology</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Topic 2: r/MachineLearning */}
                  <motion.div
                    className="absolute bottom-[50px] -right-[180px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.05 }}
                  >
                    <div className="relative">
                      <svg width="180" height="40" className="absolute bottom-0 left-0">
                        <line x1="160" y1="20" x2="20" y2="20" stroke="#FF4500" strokeWidth="2" />
                      </svg>
                      <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-full shadow-md border border-orange-200 dark:border-orange-800">
                        <span className="text-sm text-orange-600 dark:text-orange-200">r/MachineLearning</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Topic 3: r/science */}
                  <motion.div
                    className="absolute -bottom-[40px] -right-[100px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    <div className="relative">
                      <svg width="120" height="80" className="absolute top-0 left-0">
                        <line x1="110" y1="0" x2="20" y2="60" stroke="#FF4500" strokeWidth="2" />
                      </svg>
                      <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-full shadow-md border border-orange-200 dark:border-orange-800">
                        <span className="text-sm text-orange-600 dark:text-orange-200">r/science</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* AI Brain - Center it on mobile */}
            <motion.div
              className="absolute left-1/2 top-[45%] md:top-[40%] -translate-x-1/2 -translate-y-1/2 z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="bg-purple-100/50 dark:bg-purple-900/30 p-6 rounded-full">
                <Brain className="w-10 h-10 text-purple-600" />
              </div>
              <span className="text-sm mt-2 font-medium text-center block">AI Processing</span>
            </motion.div>

            {/* Output Platforms */}
            <motion.div 
              className="absolute left-1/2 md:right-12 md:left-auto bottom-0 md:bottom-auto md:top-[40%] -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 }}
            >
              <div className="relative w-48 h-48">
                {/* Spotify - Top */}
                <motion.div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.6 }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg flex items-center justify-center">
                    <SpotifyIcon />
                  </div>
                  <span className="text-xs mt-2">Spotify</span>
                </motion.div>

                {/* Apple - Bottom Left */}
                <motion.div 
                  className="absolute bottom-0 left-0 flex flex-col items-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.7 }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg flex items-center justify-center">
                    <ApplePodcastIcon />
                  </div>
                  <span className="text-xs mt-2">Apple</span>
                </motion.div>

                {/* Additional Platform - Bottom Right */}
                <motion.div 
                  className="absolute bottom-0 right-0 flex flex-col items-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg flex items-center justify-center">
                    <Podcast className="w-8 h-8 text-[#8940FA]" />
                  </div>
                  <span className="text-xs mt-2">More</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Connecting Lines - Adjust for mobile */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
              {/* Mobile paths */}
              <g className="md:hidden">
                {/* Top to middle path - base */}
                <motion.path
                  d="M 400,100 L 400,200"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  fill="none"
                  opacity={0.3}
                />
                {/* Top to middle path - animated */}
                <motion.path
                  d="M 400,100 L 400,200"
                  stroke="#9333EA"
                  strokeWidth="2"
                  strokeDasharray="10 10"
                  fill="none"
                  animate="animate"
                  variants={dashOffset}
                />
                {/* Middle to bottom path - base */}
                <motion.path
                  d="M 400,250 L 400,350"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  fill="none"
                  opacity={0.3}
                />
                {/* Middle to bottom path - animated */}
                <motion.path
                  d="M 400,250 L 400,350"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeDasharray="10 10"
                  fill="none"
                  animate="animate"
                  variants={dashOffset}
                />
              </g>

              {/* Desktop paths */}
              <g className="hidden md:inline">
                {/* Left curved line - base path */}
                <motion.path
                  d="M 150,80 C 250,80 300,100 400,100"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  fill="none"
                  opacity={0.3}
                />
                {/* Left curved line - animated dashes */}
                <motion.path
                  d="M 150,80 C 250,80 300,100 400,100"
                  stroke="#9333EA"
                  strokeWidth="2"
                  strokeDasharray="10 10"
                  fill="none"
                  animate="animate"
                  variants={dashOffset}
                />
                {/* Right curved line - base path */}
                <motion.path
                  d="M 400,100 C 500,100 550,80 650,80"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  fill="none"
                  opacity={0.3}
                />
                {/* Right curved line - animated dashes */}
                <motion.path
                  d="M 400,100 C 500,100 550,80 650,80"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeDasharray="10 10"
                  fill="none"
                  animate="animate"
                  variants={dashOffset}
                />
              </g>

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9333EA" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>

            {/* Processing Steps */}
            <motion.div 
              className="hidden md:flex absolute left-1/2 bottom-4 -translate-x-1/2 space-x-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              <div className="flex flex-col items-center">
                <FileText className="w-6 h-6 text-purple-600" />
                <span className="text-xs mt-1">Aggregate</span>
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <span className="text-xs mt-1">Generate</span>
              </div>
              <div className="flex flex-col items-center">
                <Mic className="w-6 h-6 text-purple-600" />
                <span className="text-xs mt-1">Narrate</span>
              </div>
            </motion.div>
          </motion.div>
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