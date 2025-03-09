"use client";

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });

  const updatePointerPosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mousePosition.current = {
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
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Adjust number of points and speed based on screen size
    const isMobile = window.innerWidth < 768;
    const numPoints = isMobile ? 40 : 75;
    const speedMultiplier = isMobile ? 0.5 : 1;

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

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      points.current.forEach((point, i) => {
        point.x += point.dx;
        point.y += point.dy;

        if (point.x < 0 || point.x > canvas.width) point.dx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.dy *= -1;

        // Adjust point size for mobile
        const pointSize = isMobile ? 2 : 3;
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(147, 51, 234, 0.8)';
        ctx.fill();

        points.current.forEach((otherPoint, j) => {
          if (i === j) return;
          const dx = point.x - otherPoint.x;
          const dy = point.y - otherPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Adjust connection distance for mobile
          const maxDistance = isMobile ? 100 : 150;
          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(otherPoint.x, otherPoint.y);
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.5 * (1 - distance / maxDistance)})`;
            ctx.lineWidth = isMobile ? 0.5 : 1;
            ctx.stroke();
          }
        });

        // Adjust mouse interaction for mobile
        const mouseDistance = Math.sqrt(
          Math.pow(point.x - mousePosition.current.x, 2) +
          Math.pow(point.y - mousePosition.current.y, 2)
        );

        const maxMouseDistance = isMobile ? 150 : 200;
        if (mouseDistance < maxMouseDistance) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(mousePosition.current.x, mousePosition.current.y);
          ctx.strokeStyle = `rgba(147, 51, 234, ${0.6 * (1 - mouseDistance / maxMouseDistance)})`;
          ctx.lineWidth = isMobile ? 1 : 1.5;
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
  }, []);

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