"use client";

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface AnimatedBackgroundProps {
  mousePosition?: { x: number; y: number };
  reducedMotion?: boolean;
}

export function AnimatedBackground({ mousePosition = { x: 0.5, y: 0.5 }, reducedMotion = false }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const canvasMousePosition = useRef({ x: 0, y: 0 });

  const updatePointerPosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvasMousePosition.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      
      // Initialize canvas mouse position to center when size changes
      canvasMousePosition.current = {
        x: canvas.width / 2,
        y: canvas.height / 2
      };
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);

    // Adjust number of points and speed based on screen size
    const isMobile = window.innerWidth < 768;
    const numPoints = isMobile ? 30 : 50; // Fewer points
    // Very slow movement
    const speedMultiplier = 0.1;

    // Initialize points with adjusted parameters
    const initPoints = () => {
      points.current = Array.from({ length: numPoints }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * speedMultiplier,
        dy: (Math.random() - 0.5) * speedMultiplier,
      }));
    };
    initPoints();

    // Update canvas mouse position based on normalized mousePosition prop
    const updateCanvasMouseFromProps = () => {
      if (!canvas) return;
      canvasMousePosition.current = {
        x: mousePosition.x * canvas.width,
        y: mousePosition.y * canvas.height
      };
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Update mouse position from props
      updateCanvasMouseFromProps();
      
      // Much more subtle fade effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      points.current.forEach((point, i) => {
        // Very subtle mouse influence
        const dx = canvasMousePosition.current.x - point.x;
        const dy = canvasMousePosition.current.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = canvas.width / 4;
        
        if (distance < maxDistance) {
          // Extremely gentle force
          const force = 0.0005 * (1 - distance / maxDistance);
          point.dx += dx * force / (distance || 1);
          point.dy += dy * force / (distance || 1);
          
          // Very low speed limit
          const maxSpeed = 0.2;
          const speed = Math.sqrt(point.dx * point.dx + point.dy * point.dy);
          if (speed > maxSpeed) {
            point.dx = (point.dx / speed) * maxSpeed;
            point.dy = (point.dy / speed) * maxSpeed;
          }
        }
        
        point.x += point.dx;
        point.y += point.dy;

        if (point.x < 0 || point.x > canvas.width) point.dx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.dy *= -1;

        // Smaller points
        const pointSize = isMobile ? 1.5 : 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
        // Much lighter purple
        ctx.fillStyle = 'rgba(180, 160, 220, 0.4)';
        ctx.fill();

        points.current.forEach((otherPoint, j) => {
          if (i === j) return;
          const dx = point.x - otherPoint.x;
          const dy = point.y - otherPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Shorter connection distance
          const maxDistance = isMobile ? 80 : 120;
          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(otherPoint.x, otherPoint.y);
            // Much lighter, more transparent lines
            ctx.strokeStyle = `rgba(180, 160, 220, ${0.2 * (1 - distance / maxDistance)})`;
            ctx.lineWidth = isMobile ? 0.3 : 0.5;
            ctx.stroke();
          }
        });

        // Very subtle mouse connections
        const mouseDistance = Math.sqrt(
          Math.pow(point.x - canvasMousePosition.current.x, 2) +
          Math.pow(point.y - canvasMousePosition.current.y, 2)
        );

        const maxMouseDistance = isMobile ? 100 : 150;
        if (mouseDistance < maxMouseDistance) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(canvasMousePosition.current.x, canvasMousePosition.current.y);
          // Very light, barely visible connection
          ctx.strokeStyle = `rgba(180, 160, 220, ${0.15 * (1 - mouseDistance / maxMouseDistance)})`;
          ctx.lineWidth = isMobile ? 0.3 : 0.5;
          ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    };

    // Handle both mouse and touch events
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      updatePointerPosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      updatePointerPosition(touch.clientX, touch.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      updatePointerPosition(touch.clientX, touch.clientY);
    };

    // Add all event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [mousePosition, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 dark:opacity-50"
      style={{
        background: 'linear-gradient(to bottom, rgb(243, 232, 255), white)',
        touchAction: 'none',
      }}
    />
  );
} 