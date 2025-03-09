"use client";

import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedText } from "@/components/ui/animated-text";
import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="absolute inset-0">
        <AnimatedBackground />
      </div>
      
      <div className="container px-4 mx-auto text-center relative z-10">
        <AnimatedText
          text="Mornings With Mo"
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent relative leading-tight pb-2"
        />
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 relative"
        >
          A personalized morning brew, selected for you!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="relative"
        >
          <Button
            size="lg"
            className="group hover:scale-105 transition-transform text-white hover:bg-[rgb(80,54,231)]"
            style={{ backgroundColor: 'rgb(100, 74, 251)' }}
            onClick={() => {
              const howItWorksSection = document.getElementById("how-it-works");
              howItWorksSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Learn More
            <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
} 