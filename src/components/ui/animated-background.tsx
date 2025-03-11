"use client";

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  dx: number;
  dy: number;
  row: number;
  col: number;
}

interface AnimatedBackgroundProps {
  mousePosition?: { x: number; y: number };
  reducedMotion?: boolean;
}

export function AnimatedBackground({ mousePosition = { x: 0.5, y: 0.5 }, reducedMotion = false }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const canvasMousePosition = useRef({ x: 0, y: 0 });
  const gridInfo = useRef({ rows: 0, cols: 0, spacing: 0 });

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

    // Create a triangular grid of points
    const initPoints = () => {
      points.current = [];
      
      const isMobile = window.innerWidth < 768;
      // Grid spacing
      const spacing = isMobile ? 40 : 60;
      const rows = Math.ceil(canvas.height / spacing);
      const cols = Math.ceil(canvas.width / spacing);
      
      // Store grid info for triangle connections
      gridInfo.current = { rows, cols, spacing };
      
      // Create triangular grid
      for (let j = 0; j < rows; j++) {
        const isOddRow = j % 2 === 1;
        const xOffset = isOddRow ? spacing / 2 : 0;
        
        for (let i = 0; i < cols; i++) {
          const x = i * spacing + xOffset;
          const y = j * spacing;
          
          // Skip points that would be outside the canvas
          if (x > canvas.width) continue;
          
          points.current.push({
            x,
            y,
            originalX: x,
            originalY: y,
            dx: 0,
            dy: 0,
            row: j,
            col: i
          });
        }
      }
    };

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
      
      // Reinitialize points when canvas size changes
      initPoints();
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);

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
      
      // Clear canvas with white background
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw triangular connections first
      drawTriangularConnections(ctx);
      
      // Update point positions with more noticeable movement
      points.current.forEach(point => {
        // Calculate distance to mouse
        const dx = canvasMousePosition.current.x - point.x;
        const dy = canvasMousePosition.current.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Larger influence radius for more noticeable effect
        const influenceRadius = 200;
        
        if (distance < influenceRadius) {
          // Much stronger push away from mouse
          const pushFactor = 0.15 * Math.pow(1 - distance / influenceRadius, 2);
          point.dx -= dx * pushFactor / (distance || 1);
          point.dy -= dy * pushFactor / (distance || 1);
        }
        
        // Snap back to original position with spring-like effect
        const snapFactor = 0.05; // Slower return for more visible movement
        point.dx += (point.originalX - point.x) * snapFactor;
        point.dy += (point.originalY - point.y) * snapFactor;
        
        // Apply movement
        point.x += point.dx;
        point.y += point.dy;
        
        // Less damping for more visible movement
        point.dx *= 0.9;
        point.dy *= 0.9;
        
        // Draw dot - slightly larger and more opaque
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180, 160, 220, 0.6)';
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    // Function to draw triangular connections
    const drawTriangularConnections = (ctx: CanvasRenderingContext2D) => {
      const { rows, cols } = gridInfo.current;
      
      // Helper function to find a point by row and column
      const findPoint = (row: number, col: number) => {
        return points.current.find(p => p.row === row && p.col === col);
      };
      
      // Draw triangles
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
          const isOddRow = j % 2 === 1;
          
          // Get the points for this cell
          const topLeft = findPoint(j, i);
          const topRight = findPoint(j, i + 1);
          const bottomLeft = findPoint(j + 1, i);
          const bottomRight = findPoint(j + 1, i + 1);
          
          // Skip if any point is missing
          if (!topLeft || !topRight || !bottomLeft) continue;
          
          // Draw first triangle (top-left, top-right, bottom-left)
          drawTriangle(ctx, topLeft, topRight, bottomLeft);
          
          // Draw second triangle if we have all points
          if (bottomRight) {
            // For even rows, connect bottom-right, bottom-left, top-right
            // For odd rows, adjust the pattern
            if (!isOddRow && bottomRight) {
              drawTriangle(ctx, bottomRight, bottomLeft, topRight);
            } else if (isOddRow && bottomRight) {
              // Different pattern for odd rows to maintain triangular grid
              drawTriangle(ctx, bottomRight, bottomLeft, topRight);
            }
          }
        }
      }
    };
    
    // Function to draw a single triangle
    const drawTriangle = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point, p3: Point) => {
      // Calculate average distance from mouse
      const mouseX = canvasMousePosition.current.x;
      const mouseY = canvasMousePosition.current.y;
      
      const d1 = Math.sqrt(Math.pow(p1.x - mouseX, 2) + Math.pow(p1.y - mouseY, 2));
      const d2 = Math.sqrt(Math.pow(p2.x - mouseX, 2) + Math.pow(p2.y - mouseY, 2));
      const d3 = Math.sqrt(Math.pow(p3.x - mouseX, 2) + Math.pow(p3.y - mouseY, 2));
      
      const avgDist = (d1 + d2 + d3) / 3;
      const maxDist = canvas.width / 2;
      const opacity = 0.3 * (1 - Math.min(avgDist / maxDist, 1));
      
      // Draw triangle edges
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      
      // Very light fill
      ctx.fillStyle = `rgba(180, 160, 220, ${opacity * 0.1})`;
      ctx.fill();
      
      // Draw edges
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(180, 160, 220, ${opacity * 0.8})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
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