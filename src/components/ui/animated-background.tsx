"use client";

import { useEffect, useRef, useState } from 'react';

export function AnimatedBackground({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with proper resolution
    const updateCanvasSize = () => {
      if (!canvas || !canvas.parentElement) return;
      
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    // Call once and add resize listener
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Simple wave parameters
    const waveCount = 5;
    const waves = Array.from({ length: waveCount }, (_, i) => ({
      amplitude: 5 + (i * 2), 
      period: 0.02 - (i * 0.002),
      speed: 0.001 + (i * 0.0002),
      offsetY: canvas.height * (0.3 + (i * 0.1)),
      color: `rgba(138, 43, 226, ${0.2 - i * 0.03})`,
      phase: Math.random() * Math.PI * 2
    }));

    // Simple animation function
    const animate = (time: number) => {
      if (!canvas || !ctx) return;

      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgb(243, 232, 255)');
      gradient.addColorStop(1, 'rgb(255, 255, 255)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw each wave
      waves.forEach(wave => {
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = wave.color;

        // Update phase based on time
        const currentPhase = time * wave.speed + wave.phase;

        // Draw simple sine wave
        for (let x = 0; x < canvas.width; x += 2) {
          const y = wave.offsetY + 
                  Math.sin(x * wave.period + currentPhase) * wave.amplitude;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      });

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [reducedMotion]);

  // Only render on client-side
  if (!isMounted) {
    return (
      <div 
        className="absolute inset-0 z-0 dark:opacity-50"
        style={{
          background: 'linear-gradient(to bottom, rgb(243, 232, 255), white)',
        }}
      />
    );
  }
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 dark:opacity-50"
      style={{ 
        background: 'linear-gradient(to bottom, rgb(243, 232, 255), white)' 
      }}
    />
  );
}