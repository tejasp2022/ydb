"use client";

import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedText } from "@/components/ui/animated-text";
import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { FC, useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface MousePosition {
  x: number;
  y: number;
}

const calculateTimeLeft = (): TimeLeft => {
  const launchDate = new Date('2025-03-24T00:00:00').getTime();
  const now = new Date().getTime();
  const difference = launchDate - now;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
};

const TimeUnit: FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center px-4">
    <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
      {value.toString().padStart(2, '0')}
    </div>
    <div className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
      {label}
    </div>
  </div>
);

export function HeroSection() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Get mouse position relative to the window size
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToHowItWorks = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="absolute inset-0">
        <AnimatedBackground mousePosition={mousePosition} reducedMotion={true} />
      </div>
      
      <div className="container px-4 mx-auto text-center relative z-10">
        <AnimatedText
          text="Mornings With Mo"
          className="text-5xl md:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent relative leading-tight pb-2"
        />
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-2xl md:text-3xl font-semibold mb-12 relative bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100"
        >
          A personalized morning brew style podcast, launching in...
        </motion.p>

        <div className="mb-12">
          <div className="inline-flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 py-6 px-2">
            <TimeUnit value={timeLeft.days} label="Days" />
            <div className="self-stretch w-px bg-gray-200 dark:bg-gray-700 mx-2" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <div className="self-stretch w-px bg-gray-200 dark:bg-gray-700 mx-2" />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <div className="self-stretch w-px bg-gray-200 dark:bg-gray-700 mx-2" />
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="relative"
        >
          <Button
            size="lg"
            className="group hover:scale-105 transition-transform text-white hover:bg-[rgb(80,54,231)] text-lg md:text-xl px-6 md:px-8 py-4 md:py-6 h-auto"
            style={{ backgroundColor: 'rgb(100, 74, 251)' }}
            onClick={scrollToHowItWorks}
          >
            Learn More
            <ArrowDown className="ml-2 h-5 w-5 md:h-6 md:w-6 group-hover:translate-y-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
} 