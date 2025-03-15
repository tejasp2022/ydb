"use client";

import React, { useEffect, useRef, useState, useMemo, useId } from 'react';
import { motion } from 'framer-motion';

type NodeType = 'content' | 'output' | 'hub' | 'processing';

interface Node {
  id: string;
  type: NodeType;
  icon: string;
  position: { x: number; y: number };
  angle?: number;
  label?: string;
}

interface AnimatedSegment {
  id: string;
  pathId: string;
  startProgress: number;
  endProgress: number;
  speed: number;
  sourceNode: string;
  targetNode: string;
}

interface HubSpokeAnimationProps {
  contentNodes?: Omit<Node, 'type' | 'position' | 'angle'>[];
  outputNodes?: Omit<Node, 'type' | 'position' | 'angle'>[];
  hubIcon?: string;
  radius?: number;
  useTechLogos?: boolean;
}

const HubSpokeAnimation: React.FC<HubSpokeAnimationProps> = ({
  contentNodes: propContentNodes,
  outputNodes: propOutputNodes,
  hubIcon = '/logo.jpeg',
  radius = 250,
  useTechLogos = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [segments, setSegments] = useState<AnimatedSegment[]>([]);
  const animationRef = useRef<number | null>(null);
  
  // Mark component as client-side rendered after mount
  useEffect(() => {
    setIsClient(true);
    
    // Add a small delay to ensure the component is fully mounted
    const initTimeout = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height,
        });
      }
    }, 500);
    
    return () => clearTimeout(initTimeout);
  }, []);

  // Tech logos for the reference diagram style
  const techContentNodes = [
    { id: 'celery', icon: '/logos/celery.svg' },
    { id: 'ai', icon: '/logos/ai.svg' },
    { id: 'google', icon: '/logos/google.svg' },
    { id: 'aws', icon: '/logos/aws.svg' },
    { id: 'meta', icon: '/logos/meta.svg' },
    { id: 'hf', icon: '/logos/huggingface.svg' },
  ];

  const techOutputNodes = [
    { id: 'spotify', icon: '/icons/spotify-icon.png' },
    { id: 'apple-music', icon: '/icons/apple-music-icon.png' },
  ];

  // Use tech logos or provided nodes - memoize to prevent unnecessary re-renders
  const contentNodes = useMemo(() => 
    useTechLogos ? techContentNodes : propContentNodes || [],
    [useTechLogos, propContentNodes]
  );
  
  const outputNodes = useMemo(() => 
    useTechLogos ? techOutputNodes : propOutputNodes || [],
    [useTechLogos, propOutputNodes]
  );

  // Calculate node positions in a circular layout
  useEffect(() => {
    if (!containerRef.current || !isClient) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    setContainerSize({
      width: containerRect.width,
      height: containerRect.height,
    });

    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    // Calculate responsive radius based on container width
    // Use at least 40% of container width, but respect the provided radius as minimum
    const responsiveRadius = Math.max(radius, containerRect.width * 0.4);
    
    // Limit maximum radius for very large screens
    const effectiveRadius = Math.min(responsiveRadius, 500);

    // Create only the central hub node
    const hubNode: Node = {
      id: 'hub',
      type: 'hub',
      icon: '/logo.jpeg',
      position: { x: centerX, y: centerY }
    };

    // Position content nodes on the left side with wider angle range (150° to 210°)
    const contentNodeCount = contentNodes.length;
    const contentNodesWithPosition = contentNodes.map((node, index) => {
      const angleRange = 60; // 210° - 150°
      const angleStep = angleRange / (contentNodeCount - 1 || 1);
      const angle = (150 + index * angleStep) * (Math.PI / 180);
      
      return {
        ...node,
        type: 'content' as NodeType,
        position: {
          x: centerX + effectiveRadius * Math.cos(angle),
          y: centerY + effectiveRadius * Math.sin(angle),
        },
        angle,
      };
    });

    // Position output nodes on the right side with narrower angle range
    const outputNodeCount = outputNodes.length;
    const outputNodesWithPosition = outputNodes.map((node, index) => {
      // Use a narrower angle range (20° instead of 60°) to position output nodes closer together
      const angleRange = 20; // 10° - (-10°)
      const angleStep = angleRange / (outputNodeCount - 1 || 1);
      const angle = (-10 + index * angleStep) * (Math.PI / 180);
      
      return {
        ...node,
        type: 'output' as NodeType,
        position: {
          x: centerX + effectiveRadius * Math.cos(angle),
          y: centerY + effectiveRadius * Math.sin(angle),
        },
        angle,
      };
    });

    setNodes([hubNode, ...contentNodesWithPosition, ...outputNodesWithPosition]);
  }, [contentNodes, outputNodes, hubIcon, radius, useTechLogos, isClient]);

  // Generate animated segments for data flow animation
  useEffect(() => {
    if (!isClient || nodes.length === 0) return;
    
    // Clear any existing animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Initialize segments
    const initialSegments: AnimatedSegment[] = [];
    const contentNodesList = nodes.filter(node => node.type === 'content');
    const outputNodesList = nodes.filter(node => node.type === 'output');
    const hubNode = nodes.find(node => node.type === 'hub');
    
    if (!hubNode) return;
    
    // Create segments from content nodes to hub
    contentNodesList.forEach(contentNode => {
      const pathId = `path-${contentNode.id}-to-hub`;
      // Add 1-3 segments per path with different speeds and lengths
      for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
        // const segmentLength = 0.1 + Math.random() * 0.1; // 10-20% of the path
        const segmentLength = 0.1; // 10-20% of the path
        const startProgress = Math.random() * (1 - segmentLength); // Random starting position
        
        initialSegments.push({
          id: `segment-${contentNode.id}-to-hub-${i}`,
          pathId,
          startProgress,
          endProgress: startProgress + segmentLength,
        //   speed: 0.005 + Math.random() * 0.003, // Faster speed
          speed: 0.015, // Faster speed
          sourceNode: contentNode.id,
          targetNode: 'hub'
        });
      }
    });
    
    // Create segments from hub to output nodes
    outputNodesList.forEach(outputNode => {
      const pathId = `path-hub-to-${outputNode.id}`;
      // Add 1-3 segments per path with different speeds and lengths
      for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
        const segmentLength = 0.1 + Math.random() * 0.1; // 10-20% of the path
        const startProgress = Math.random() * (1 - segmentLength); // Random starting position
        
        initialSegments.push({
          id: `segment-hub-to-${outputNode.id}-${i}`,
          pathId,
          startProgress,
          endProgress: startProgress + segmentLength,
          speed: 0.005 + Math.random() * 0.003, // Faster speed
          sourceNode: 'hub',
          targetNode: outputNode.id
        });
      }
    });
    
    setSegments(initialSegments);
    
    // Animation function to update segment positions
    const animateSegments = () => {
      setSegments(prevSegments => 
        prevSegments.map(segment => {
          // Update progress
          let newStartProgress = segment.startProgress + segment.speed;
          let newEndProgress = segment.endProgress + segment.speed;
          
          // Reset when the segment goes off the path
          if (newStartProgress >= 1) {
            const segmentLength = segment.endProgress - segment.startProgress;
            newStartProgress = 0;
            newEndProgress = segmentLength;
          }
          
          return {
            ...segment,
            startProgress: newStartProgress,
            endProgress: newEndProgress
          };
        })
      );
      
      animationRef.current = requestAnimationFrame(animateSegments);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animateSegments);
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isClient, nodes]);

  // Helper function to get point coordinates along a path
  const getPointAlongPath = (pathId: string, progress: number): { x: number, y: number } | null => {
    if (!isClient) return null;
    
    const path = document.getElementById(pathId);
    if (!path) return null;
    
    try {
      const pathLength = (path as SVGPathElement).getTotalLength();
      const point = (path as SVGPathElement).getPointAtLength(pathLength * progress);
      return { x: point.x, y: point.y };
    } catch (error) {
      return null;
    }
  };

  // Helper function to generate curved path between two points
  const createCurvedPath = (startX: number, startY: number, endX: number, endY: number, nodeAngle?: number) => {
    // Calculate control points for the curve
    const isLeftSide = startX < endX; // Content nodes are on the left of the hub
    const isHorizontal = Math.abs(startY - endY) < 50; // For horizontal connections between processing nodes
    
    // For horizontal connections between processing nodes, use a simpler path
    if (isHorizontal && Math.abs(startX - endX) < 200) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
    
    // Calculate the midpoint
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Calculate the distance between points
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Get the angle in radians, then convert to degrees
    const angle = nodeAngle !== undefined ? nodeAngle * (180 / Math.PI) : Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
    
    // Normalize angle to 0-360 range
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Calculate curvature factor based on position in the diagram
    let curveFactor;
    
    if (isLeftSide) {
      // For content nodes (left side)
      // We want a smooth transition from concave up at the top to concave down at the bottom
      // Left side nodes are in the 135° to 225° range
      
      // Top nodes (around 135°-150°) should be concave up (positive curvature)
      // Middle nodes (around 180°) should be nearly straight (small curvature)
      // Bottom nodes (around 210°-225°) should be concave down (negative curvature)
      
      if (normalizedAngle < 160) {
        // Top left - strong concave up
        curveFactor = 0.3;
      } else if (normalizedAngle < 180) {
        // Upper middle left - moderate concave up
        curveFactor = 0.15;
      } else if (normalizedAngle < 200) {
        // Middle left - nearly straight
        curveFactor = 0.05;
      } else if (normalizedAngle < 220) {
        // Lower middle left - moderate concave down
        curveFactor = -0.15;
      } else {
        // Bottom left - strong concave down
        curveFactor = -0.3;
      }
    } else {
      // For output nodes (right side)
      // We want a smooth transition from concave up at the top to concave down at the bottom
      // Right side nodes are in the -30° to 30° range (or 330° to 30° in normalized form)
      
      // Top nodes (around 330°-350° or 0°-10°) should be concave up (positive curvature)
      // Middle nodes (around 0°) should be nearly straight (small curvature)
      // Bottom nodes (around 10°-30°) should be concave down (negative curvature)
      
      if (normalizedAngle > 340 || normalizedAngle < 10) {
        // Top right - strong concave up
        curveFactor = 0.3;
      } else if (normalizedAngle < 20) {
        // Upper middle right - moderate concave up
        curveFactor = 0.15;
      } else if (normalizedAngle < 30) {
        // Middle right - nearly straight
        curveFactor = 0.05;
      } else if (normalizedAngle < 40) {
        // Lower middle right - moderate concave down
        curveFactor = -0.15;
      } else {
        // Bottom right - strong concave down
        curveFactor = -0.3;
      }
    }
    
    // Calculate the perpendicular offset for the control point
    const offsetX = -dy * curveFactor;
    const offsetY = dx * curveFactor;
    
    // Apply the offset
    const controlX = midX + offsetX;
    const controlY = midY + offsetY;
    
    return `M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`;
  };

  // If not client-side yet, render a completely transparent placeholder
  if (!isClient) {
    return (
      <div 
        ref={containerRef} 
        className="relative w-full h-[600px] overflow-hidden"
        style={{ minHeight: Math.max(radius * 2, 500) + 100 }}
      >
        {/* No background or styling at all */}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[600px] overflow-hidden"
      style={{ minHeight: Math.max(radius * 2, 500) + 100 }}
    >
      {nodes.length > 0 && containerSize.width > 0 && (
        <>
          {/* Add a very subtle background to make the diagram more visible */}
          <div className="absolute inset-0 bg-gray-50/10 dark:bg-gray-900/10"></div>
          
          {/* Draw lines connecting nodes */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Define gradients for the paths */}
            <defs>
              {/* Hub connections - purple gradient */}
              <linearGradient 
                id="gradient-hub" 
                gradientUnits="userSpaceOnUse"
                x1="0%" y1="0%" x2="100%" y2="0%"
              >
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              
              {/* Content to hub connections - gray-300 */}
              {contentNodes.map((node, index) => (
                <linearGradient 
                  key={`gradient-${node.id}-to-hub`} 
                  id={`gradient-${node.id}-to-hub`} 
                  gradientUnits="userSpaceOnUse"
                  x1="0%" y1="0%" x2="100%" y2="0%"
                >
                  <stop offset="0%" stopColor="#D1D5DB" />
                  <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
              ))}
              
              {/* Hub to output connections - gray-300 */}
              {outputNodes.map((node, index) => (
                <linearGradient 
                  key={`gradient-hub-to-${node.id}`} 
                  id={`gradient-hub-to-${node.id}`} 
                  gradientUnits="userSpaceOnUse"
                  x1="0%" y1="0%" x2="100%" y2="0%"
                >
                  <stop offset="0%" stopColor="#D1D5DB" />
                  <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
              ))}
            </defs>
            
            {/* Content to hub connections */}
            {nodes.filter(node => node.type === 'content').map((contentNode) => {
              const hubNode = nodes.find(n => n.id === 'hub')!;
              const pathData = createCurvedPath(
                contentNode.position.x, 
                contentNode.position.y, 
                hubNode.position.x, 
                hubNode.position.y, 
                contentNode.angle
              );
              const pathId = `path-${contentNode.id}-to-hub`;
              const gradientId = `url(#gradient-${contentNode.id}-to-hub)`;
              const isHighlighted = hoveredNode === contentNode.id || hoveredNode === 'hub';
              
              return (
                <g key={`path-group-${pathId}`}>
                  {/* Static background path */}
                  <path
                    id={pathId}
                    d={pathData}
                    fill="none"
                    stroke={gradientId}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeOpacity={isHighlighted ? 1 : 0.7}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}
            
            {/* Hub to output connections */}
            {nodes.filter(node => node.type === 'output').map((outputNode) => {
              const hubNode = nodes.find(n => n.id === 'hub')!;
              const pathData = createCurvedPath(
                hubNode.position.x, 
                hubNode.position.y, 
                outputNode.position.x, 
                outputNode.position.y, 
                outputNode.angle
              );
              const pathId = `path-hub-to-${outputNode.id}`;
              const gradientId = `url(#gradient-hub-to-${outputNode.id})`;
              const isHighlighted = hoveredNode === outputNode.id || hoveredNode === 'hub';
              
              return (
                <g key={`path-group-${pathId}`}>
                  {/* Static background path */}
                  <path
                    id={pathId}
                    d={pathData}
                    fill="none"
                    stroke={gradientId}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeOpacity={isHighlighted ? 1 : 0.7}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}
            
            {/* Render animated segments */}
            {segments.map(segment => {
              const path = document.getElementById(segment.pathId);
              if (!path) return null;
              
              try {
                const pathElement = path as SVGPathElement;
                const pathLength = pathElement.getTotalLength();
                const startPoint = pathElement.getPointAtLength(pathLength * segment.startProgress);
                const endPoint = pathElement.getPointAtLength(pathLength * segment.endProgress);
                
                // Create a new path for just the segment
                const segmentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                
                // Get points along the path for the segment
                const numPoints = 10;
                const points = [];
                
                for (let i = 0; i <= numPoints; i++) {
                  const progress = segment.startProgress + (segment.endProgress - segment.startProgress) * (i / numPoints);
                  const point = pathElement.getPointAtLength(pathLength * progress);
                  points.push(point);
                }
                
                // Create a path data string from the points
                let pathData = `M ${points[0].x} ${points[0].y}`;
                for (let i = 1; i <= numPoints; i++) {
                  pathData += ` L ${points[i].x} ${points[i].y}`;
                }
                
                const isContentToHub = segment.sourceNode !== 'hub';
                const isHighlighted = hoveredNode === segment.sourceNode || 
                                     hoveredNode === segment.targetNode;
                
                return (
                  <path
                    key={segment.id}
                    d={pathData}
                    fill="none"
                    stroke={isContentToHub ? "#9333ea" : "#7c3aed"}
                    strokeWidth={isHighlighted ? 4 : 3}
                    strokeOpacity={isHighlighted ? 0.9 : 0.7}
                    strokeLinecap="round"
                    className="transition-all duration-200"
                  />
                );
              } catch (error) {
                return null;
              }
            })}
          </svg>

          {/* Render nodes with simplified styling - no borders or shadows */}
          {nodes.map(node => {
            const isHovered = hoveredNode === node.id;
            const nodeScale = isHovered ? 'scale-110' : 'scale-100';
            
            return (
              <div
                key={node.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  node.type === 'hub' 
                    ? 'w-24 h-24 bg-white/80'
                    : node.type === 'processing'
                      ? 'w-20 h-20 bg-white/80'
                      : 'w-16 h-16 bg-white/80'
                } ${
                  node.type === 'content' || node.type === 'output'
                    ? isHovered 
                      ? 'border-2 border-purple-500 shadow-lg shadow-purple-200/50' 
                      : 'border-2 border-gray-300'
                    : isHovered ? 'shadow-lg shadow-purple-200/50' : ''
                } ${nodeScale} transition-all duration-300 ease-in-out cursor-pointer`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: node.type === 'hub' || node.type === 'processing' ? 10 : 5,
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {node.type === 'processing' ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className={`w-10 h-10 flex items-center justify-center ${isHovered ? 'bg-purple-100' : 'bg-purple-50'} rounded-full transition-colors duration-300`}>
                      {node.id === 'aggregation' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                        </svg>
                      )}
                      {node.id === 'script' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      )}
                    </div>
                    <span className="text-xs font-medium mt-1 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">{node.label}</span>
                  </div>
                ) : node.type === 'hub' ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isHovered ? 'bg-white shadow-md' : 'bg-white/90'} p-1 transition-all duration-300`}>
                      <img 
                        src={node.icon} 
                        alt={`${node.id} icon`} 
                        className={`w-14 h-14 object-contain ${isHovered ? 'scale-110' : 'scale-100'} transition-transform duration-300`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${isHovered ? 'bg-white shadow-sm' : 'bg-white/90'} p-1 transition-all duration-300`}>
                    <img 
                      src={node.icon} 
                      alt={`${node.id} icon`} 
                      className={`w-10 h-10 ${isHovered ? 'scale-110' : 'scale-100'} transition-transform duration-300`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default HubSpokeAnimation;