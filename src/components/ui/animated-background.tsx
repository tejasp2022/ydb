// "use client";

// import { useEffect, useRef } from 'react';

// interface Point {
//   x: number;
//   y: number;
//   originalX: number;
//   originalY: number;
//   dx: number;
//   dy: number;
//   row: number;
//   col: number;
// }

// interface AnimatedBackgroundProps {
//   // Remove mousePosition prop if not needed elsewhere
// }

// export function AnimatedBackground({}: AnimatedBackgroundProps) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const points = useRef<Point[]>([]);
//   const gridInfo = useRef({ rows: 0, cols: 0, spacing: 0 });

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     // Create a grid of points
//     const initPoints = () => {
//       points.current = [];
      
//       const spacing = window.innerWidth < 768 ? 40 : 60;
//       const rows = Math.ceil(canvas.height / spacing);
//       const cols = Math.ceil(canvas.width / spacing);
      
//       gridInfo.current = { rows, cols, spacing };
      
//       for (let j = 0; j < rows; j++) {
//         const isOddRow = j % 2 === 1;
//         const xOffset = isOddRow ? spacing / 2 : 0;
        
//         for (let i = 0; i < cols; i++) {
//           const x = i * spacing + xOffset;
//           const y = j * spacing;
          
//           if (x > canvas.width) continue;
          
//           points.current.push({
//             x,
//             y,
//             originalX: x,
//             originalY: y,
//             dx: 0,
//             dy: 0,
//             row: j,
//             col: i
//           });
//         }
//       }
//     };

//     // Set canvas size
//     const updateSize = () => {
//       const parent = canvas.parentElement;
//       if (!parent) return;
//       canvas.width = parent.clientWidth;
//       canvas.height = parent.clientHeight;
      
//       initPoints();
//     };
    
//     updateSize();
//     window.addEventListener('resize', updateSize);

//     // Animation variables
//     let time = 0;
    
//     // Audio wave bars configuration
//     const numBars = 5;
//     const barWidth = 20;
//     const spacing = 15;
//     const maxHeight = 150;
    
//     const animate = () => {
//       if (!ctx || !canvas) return;
      
//       // Clear canvas
//       ctx.fillStyle = 'rgba(255, 255, 255, 1)';
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       // Increment time
//       time += 0.03;
      
//       // Create multiple audio wave patterns across the canvas
//       const patterns = 7; // Number of patterns to draw
//       const patternSpacing = canvas.width / (patterns + 1);
      
//       for (let p = 1; p <= patterns; p++) {
//         const centerX = patternSpacing * p;
//         const centerY = canvas.height / 2;
//         const scale = 0.5 + (Math.sin(time * 0.2 + p * 0.5) * 0.2 + 0.2); // Scale varies between 0.5 and 0.9
        
//         // Calculate total width of this pattern
//         const totalWidth = (numBars * barWidth + (numBars - 1) * spacing) * scale;
//         const startX = centerX - totalWidth / 2;
        
//         // Draw audio wave bars
//         for (let i = 0; i < numBars; i++) {
//           // Calculate height based on position (middle bar tallest)
//           let heightFactor;
//           if (i === 2) { // Middle bar
//             heightFactor = 1.0;
//           } else if (i === 1 || i === 3) { // Adjacent to middle
//             heightFactor = 0.8;
//           } else { // Outer bars
//             heightFactor = 0.5;
//           }
          
//           // Add subtle animation
//           const animatedHeight = heightFactor * (1 + Math.sin(time + i * 0.5 + p * 0.7) * 0.1);
//           const height = maxHeight * animatedHeight * scale;
          
//           // Calculate position
//           const x = startX + (i * (barWidth + spacing) * scale);
//           const scaledBarWidth = barWidth * scale;
          
//           // Draw rounded rectangle
//           const radius = scaledBarWidth / 2;
//           ctx.beginPath();
//           ctx.moveTo(x + radius, centerY - height/2);
//           ctx.lineTo(x + scaledBarWidth - radius, centerY - height/2);
//           ctx.arcTo(x + scaledBarWidth, centerY - height/2, x + scaledBarWidth, centerY - height/2 + radius, radius);
//           ctx.lineTo(x + scaledBarWidth, centerY + height/2 - radius);
//           ctx.arcTo(x + scaledBarWidth, centerY + height/2, x + scaledBarWidth - radius, centerY + height/2, radius);
//           ctx.lineTo(x + radius, centerY + height/2);
//           ctx.arcTo(x, centerY + height/2, x, centerY + height/2 - radius, radius);
//           ctx.lineTo(x, centerY - height/2 + radius);
//           ctx.arcTo(x, centerY - height/2, x + radius, centerY - height/2, radius);
//           ctx.closePath();
          
//           // Calculate opacity based on distance from center
//           const distanceFromCenter = Math.abs(centerX - canvas.width/2) / (canvas.width/2);
//           const opacity = 0.1 + (1 - distanceFromCenter) * 0.2;
          
//           // Fill with purple color
//           ctx.fillStyle = `rgba(180, 160, 220, ${opacity})`;
//           ctx.fill();
//         }
//       }
      
//       requestAnimationFrame(animate);
//     };

//     animate();

//     return () => {
//       window.removeEventListener('resize', updateSize);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="absolute inset-0 z-0 dark:opacity-50"
//       style={{
//         background: 'linear-gradient(to bottom, rgb(243, 232, 255), white)',
//         touchAction: 'none',
//       }}
//     />
//   );
// } 