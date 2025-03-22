"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { FC, useEffect, useState, useRef } from "react";
import Image from 'next/image';
import content from "@/data/content.json";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (): TimeLeft => {
  const launchDate = new Date(content.heroSection.launchDate).getTime();
  const now = new Date().getTime();
  const difference = launchDate - now;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
};

// Enhanced TimeUnit component with animation
const TimeUnit: FC<{ value: number; label: string }> = ({ value, label }) => (
  <motion.div 
    className="flex flex-col items-center px-3 sm:px-4"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
      {value.toString().padStart(2, '0')}
    </div>
    <div className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
      {label}
    </div>
  </motion.div>
);

// Modified to fill the entire hero section background with taller bars
const BackgroundWaveAnimation: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Set canvas to fill the hero section
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(pixelRatio, pixelRatio);
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Animation variables
    let time = 0;
    const heightFactors: number[] = [];

    // Responsive bar dimensions based on screen size
    const isMobile = window.innerWidth < 768;
    const barWidth = isMobile ? 15 : 25; // Narrower bars on mobile
    const spacing = isMobile ? 12 : 20; // Less spacing on mobile
    
    // Calculate number of bars based on screen width
    const numBars = Math.ceil(window.innerWidth / (barWidth + spacing)) + 4; // Add extra bars
    
    for (let i = 0; i < numBars; i++) {
      // Create a wave-like pattern with heights
      const heightFactor = 0.5 + Math.sin(i * 0.3) * 0.2 + Math.random() * 0.3;
      heightFactors.push(heightFactor);
    }
    
    // Draw audio wave bars
    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);
      
      // Increment time
      time += 0.02;
      
      const totalWidth = numBars * (barWidth + spacing);
      const startX = (canvas.width / pixelRatio - totalWidth) / 2;
      
      // Adjust base height according to screen size
      const baseHeightMultiplier = isMobile ? 0.7 : 1;
      
      // Draw the audio wave bars across the entire canvas
      for (let i = 0; i < numBars; i++) {
        // Add animation with phase differences and variation
        const phase = i * 0.2;
        const animatedHeight = heightFactors[i] * (1 + 0.3 * Math.sin(time + phase));
        
        // Taller base heights for more prominent bars, scaled for mobile
        const baseHeight = (180 + (i % 4) * 40) * baseHeightMultiplier; 
        const height = baseHeight * animatedHeight;
        
        // Calculate position
        const x = startX + (i * (barWidth + spacing));
        
        // Place bars at varied positions across the canvas
        // Centered, but with slight vertical variation
        const centerY = (canvas.height / pixelRatio / 2) + (Math.sin(i * 0.4) * (isMobile ? 30 : 60));
        
        // Draw rounded rectangle
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, centerY - height/2);
        ctx.lineTo(x + barWidth - radius, centerY - height/2);
        ctx.arcTo(x + barWidth, centerY - height/2, x + barWidth, centerY - height/2 + radius, radius);
        ctx.lineTo(x + barWidth, centerY + height/2 - radius);
        ctx.arcTo(x + barWidth, centerY + height/2, x + barWidth - radius, centerY + height/2, radius);
        ctx.lineTo(x + radius, centerY + height/2);
        ctx.arcTo(x, centerY + height/2, x, centerY - height/2 + radius, radius);
        ctx.lineTo(x, centerY - height/2 + radius);
        ctx.arcTo(x, centerY - height/2, x + radius, centerY - height/2, radius);
        ctx.closePath();
        
        // Enhanced gradient fill with better opacity
        const gradient = ctx.createLinearGradient(x, centerY - height/2, x, centerY + height/2);
        gradient.addColorStop(0, 'rgba(124, 58, 237, 0.2)');  // Purple top
        gradient.addColorStop(0.5, 'rgba(79, 70, 229, 0.15)');  // Indigo middle
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');  // Blue bottom
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Request next frame
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-0"
    />
  );
};

export function HeroSection() {
  // Use null as initial state to indicate loading state
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true when component mounts on client
    setIsClient(true);
    
    // Initialize with initial calculation
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToHowItWorks = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
  };

  // Render a placeholder during server-side rendering
  const renderTimeUnit = (value: number | null, label: string) => {
    if (!isClient) {
      return (
        <motion.div 
          className="flex flex-col items-center px-3 sm:px-4"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            00
          </div>
          <div className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
            {label}
          </div>
        </motion.div>
      );
    }
    
    return (
      <TimeUnit value={value || 0} label={label} />
    );
  };

  return (
    <>
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <BackgroundWaveAnimation />
        
        <div className="container px-4 mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex justify-center mb-8"
          >
            <motion.div 
              className="rounded-full border-4 border-purple-600 p-1 shadow-xl overflow-hidden w-28 h-28 md:w-36 md:h-36 flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Image 
                src="/logo.jpeg" 
                alt="Your Daily Briefing Logo"
                width={144}
                height={144}
                className="w-full h-full rounded-full object-cover scale-110"
              />
            </motion.div>
          </motion.div>
          
          <div className="relative mb-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight pb-2 z-10 uppercase"
                style={{
                  fontFamily: "GeistSans, sans-serif", 
                  color: "black",
                  textShadow: "1px 1px 0 rgba(0,0,0,0.1)",
                  letterSpacing: "-0.03em",
                  WebkitTextStroke: "0.5px black",
                  filter: "url(#distressFilter)"
                }}
            >
              {content.heroSection.title}
            </h1>
            
            <svg width="0" height="0" className="absolute">
              <filter id="distressFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                <feComposite operator="in" in2="SourceGraphic" />
              </filter>
            </svg>
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-xl md:text-3xl font-semibold mb-14 max-w-3xl mx-auto relative bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100"
            style={{ fontFamily: "GeistSans, sans-serif" }}
          >
            {content.heroSection.description}
          </motion.p>

          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="inline-flex bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl border border-purple-100/70 dark:border-purple-900/30 py-6 px-3">
              {renderTimeUnit(timeLeft?.days ?? null, "Days")}
              <div className="self-stretch w-px bg-gradient-to-b from-purple-200 to-blue-200 dark:from-purple-700 dark:to-blue-700 mx-1" />
              {renderTimeUnit(timeLeft?.hours ?? null, "Hours")}
              <div className="self-stretch w-px bg-gradient-to-b from-purple-200 to-blue-200 dark:from-purple-700 dark:to-blue-700 mx-1" />
              {renderTimeUnit(timeLeft?.minutes ?? null, "Minutes")}
              <div className="self-stretch w-px bg-gradient-to-b from-purple-200 to-blue-200 dark:from-purple-700 dark:to-blue-700 mx-1" />
              {renderTimeUnit(timeLeft?.seconds ?? null, "Seconds")}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="relative"
          >
            <Button
              size="lg"
              className="group hover:scale-101 transition-all duration-300 text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-sm hover:shadow-purple-500/20 text-sm md:text-base px-6 py-3 md:py-4 h-auto rounded-full font-medium border border-white/20 backdrop-blur-sm"
              onClick={scrollToHowItWorks}
            >
              <span className="relative z-10">{content.heroSection.buttonText}</span>
              <ArrowDown className="ml-1 h-3 w-3 md:h-4 md:w-4 group-hover:translate-y-0.5 transition-transform duration-300 ease-in-out" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-sm group-hover:blur-md transition-all duration-300"></span>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
} 