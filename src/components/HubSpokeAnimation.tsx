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
  sparsity?: number; // 0-1 value: 0 = dense (many animations), 1 = sparse (few animations)
}

const HubSpokeAnimation: React.FC<HubSpokeAnimationProps> = ({
  contentNodes: propContentNodes,
  outputNodes: propOutputNodes,
  hubIcon = '/logo.jpeg',
  radius = 250,
  useTechLogos = false,
  sparsity = 0.4, // Default to medium sparsity
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
    const isMobile = containerRect.width < 640; // Standard Tailwind sm breakpoint
    const isLargeScreen = containerRect.width >= 1024; // lg breakpoint
    
    // Adjust radius calculation for different screen sizes
    const responsiveRadius = isMobile
      ? {
          x: Math.min(containerRect.width * 0.35, 120), // Limit horizontal radius on mobile
          y: Math.min(containerRect.height * 0.35, 180)  // Allow more vertical space
        }
      : isLargeScreen
      ? {
          // For large screens, use more horizontal space
          x: Math.min(containerRect.width * 0.45, 400), // Increased horizontal radius
          y: Math.min(containerRect.width * 0.35, 300)  // Keep vertical radius more constrained
        }
      : {
          // For medium screens
          x: Math.min(radius, containerRect.width * 0.4, 320),
          y: Math.min(radius, containerRect.width * 0.4, 300)
        };
    
    // Create only the central hub node
    const hubNode: Node = {
      id: 'hub',
      type: 'hub',
      icon: '/logo.jpeg',
      position: { x: centerX, y: centerY }
    };

    // Position content nodes on the left side with wider angle range
    const contentNodeCount = contentNodes.length;
    
    // Adjust angle ranges based on screen size
    const contentAngleRange = isMobile ? 120 : 80; // Slightly narrower on desktop for more horizontal spread
    const contentStartAngle = isMobile ? 120 : 140; // Adjusted for more horizontal spread
    
    const contentNodesWithPosition = contentNodes.map((node, index) => {
      const angleStep = contentAngleRange / (contentNodeCount - 1 || 1);
      const angle = (contentStartAngle + index * angleStep) * (Math.PI / 180);
      
      return {
        ...node,
        type: 'content' as NodeType,
        position: {
          x: centerX + responsiveRadius.x * Math.cos(angle),
          y: centerY + responsiveRadius.y * Math.sin(angle),
        },
        angle,
      };
    });

    // Position output nodes on the right side
    const outputNodeCount = outputNodes.length;
    
    // Adjust angle ranges based on screen size
    const outputAngleRange = isMobile ? 60 : 30; // Narrower on desktop for more horizontal spread
    const outputStartAngle = isMobile ? -30 : -15; // Adjusted for more horizontal spread
    
    const outputNodesWithPosition = outputNodes.map((node, index) => {
      const angleStep = outputAngleRange / (outputNodeCount - 1 || 1);
      const angle = (outputStartAngle + index * angleStep) * (Math.PI / 180);
      
      return {
        ...node,
        type: 'output' as NodeType,
        position: {
          x: centerX + responsiveRadius.x * Math.cos(angle),
          y: centerY + responsiveRadius.y * Math.sin(angle),
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
    
    // Define a consistent animation speed
    const animationSpeed = 0.025;
    
    // Initialize segments
    const initialSegments: AnimatedSegment[] = [];
    const contentNodesList = nodes.filter(node => node.type === 'content');
    const outputNodesList = nodes.filter(node => node.type === 'output');
    const hubNode = nodes.find(node => node.type === 'hub');
    
    if (!hubNode) return;
    
    // Create a pool of all possible paths
    const allPaths: {id: string, sourceNode: string, targetNode: string}[] = [];
    
    // Add content-to-hub paths
    contentNodesList.forEach(contentNode => {
      allPaths.push({
        id: `path-${contentNode.id}-to-hub`,
        sourceNode: contentNode.id,
        targetNode: 'hub'
      });
    });
    
    // Add hub-to-output paths
    outputNodesList.forEach(outputNode => {
      allPaths.push({
        id: `path-hub-to-${outputNode.id}`,
        sourceNode: 'hub',
        targetNode: outputNode.id
      });
    });
    
    // Keep track of recently used paths to avoid immediate reselection
    const recentlyUsedPaths = new Set<string>();
    
    // Calculate active paths based on sparsity
    // Higher sparsity = fewer active paths
    const maxActivePaths = Math.max(1, Math.floor(allPaths.length * (1 - sparsity * 0.8)));
    const minActivePaths = Math.max(1, Math.floor(allPaths.length * (1 - sparsity * 0.9)));
    
    // Randomly select a subset of paths to animate initially
    const pathCount = Math.floor(minActivePaths + Math.random() * (maxActivePaths - minActivePaths));
    const shuffledPaths = [...allPaths].sort(() => Math.random() - 0.5).slice(0, pathCount);
    
    // Create segments for the selected paths
    shuffledPaths.forEach(path => {
      const segmentLength = 0.15; // 15% of the path
      const startProgress = Math.random() * (1 - segmentLength);
      
      initialSegments.push({
        id: `segment-${path.id}`,
        pathId: path.id,
        startProgress,
        endProgress: startProgress + segmentLength,
        speed: animationSpeed, // Use consistent speed
        sourceNode: path.sourceNode,
        targetNode: path.targetNode
      });
      
      // Mark this path as recently used
      recentlyUsedPaths.add(path.id);
    });
    
    setSegments(initialSegments);
    
    // Animation function to update segment positions
    const animateSegments = () => {
      setSegments(prevSegments => {
        // Create a new array for the updated segments
        const updatedSegments: AnimatedSegment[] = [];
        
        // Process each existing segment
        prevSegments.forEach(segment => {
          // Update progress
          let newStartProgress = segment.startProgress + segment.speed;
          let newEndProgress = segment.endProgress + segment.speed;
          
          // If segment completes its path
          if (newStartProgress >= 1) {
            // Higher sparsity = higher chance to remove segment
            const removalChance = 0.7 + (sparsity * 0.2); // 0.7-0.9 based on sparsity
            
            if (Math.random() < removalChance) {
              // Don't add this segment to updatedSegments (effectively removing it)
              
              // Add this path to recently used paths to prevent immediate reselection
              recentlyUsedPaths.add(segment.pathId);
              
              // Limit the size of recentlyUsedPaths to half of all paths
              // This ensures we don't eventually block all paths
              if (recentlyUsedPaths.size > Math.ceil(allPaths.length / 2)) {
                // Remove the oldest path (assuming it's the first one in the set)
                const oldestPath = recentlyUsedPaths.values().next().value;
                if (oldestPath) {
                  recentlyUsedPaths.delete(oldestPath);
                }
              }
              
              // Lower sparsity = higher chance to add a new segment
              const addChance = 0.5 - (sparsity * 0.3); // 0.5-0.2 based on sparsity
              
              if (Math.random() < addChance) {
                // Select a random path that doesn't already have a segment AND isn't recently used
                const activePaths = updatedSegments.map(s => s.pathId);
                const availablePaths = allPaths.filter(p => 
                  !activePaths.includes(p.id) && 
                  !recentlyUsedPaths.has(p.id)
                );
                
                if (availablePaths.length > 0) {
                  const randomPath = availablePaths[Math.floor(Math.random() * availablePaths.length)];
                  const segmentLength = 0.15;
                  
                  updatedSegments.push({
                    id: `segment-${randomPath.id}-${Date.now()}`,
                    pathId: randomPath.id,
                    startProgress: 0,
                    endProgress: segmentLength,
                    speed: animationSpeed, // Use consistent speed
                    sourceNode: randomPath.sourceNode,
                    targetNode: randomPath.targetNode
                  });
                  
                  // Mark this path as recently used
                  recentlyUsedPaths.add(randomPath.id);
                } else if (allPaths.length > activePaths.length) {
                  // If all available paths are recently used, pick from any unused path
                  const anyUnusedPaths = allPaths.filter(p => !activePaths.includes(p.id));
                  if (anyUnusedPaths.length > 0) {
                    const randomPath = anyUnusedPaths[Math.floor(Math.random() * anyUnusedPaths.length)];
                    const segmentLength = 0.15;
                    
                    updatedSegments.push({
                      id: `segment-${randomPath.id}-${Date.now()}`,
                      pathId: randomPath.id,
                      startProgress: 0,
                      endProgress: segmentLength,
                      speed: animationSpeed,
                      sourceNode: randomPath.sourceNode,
                      targetNode: randomPath.targetNode
                    });
                  }
                }
              }
            } else {
              // Reset the segment to the beginning of the path
              updatedSegments.push({
                ...segment,
                startProgress: 0,
                endProgress: segment.endProgress - segment.startProgress
              });
            }
          } else {
            // Keep the segment with updated position
            updatedSegments.push({
              ...segment,
              startProgress: newStartProgress,
              endProgress: newEndProgress
            });
          }
        });
        
        // Calculate minimum active segments based on sparsity
        const minSegments = Math.max(1, Math.floor(allPaths.length * (0.2 - sparsity * 0.15))); // 0.2-0.05 based on sparsity
        
        // If we have too few segments, randomly add some more
        if (updatedSegments.length < minSegments) {
          const activePaths = updatedSegments.map(s => s.pathId);
          
          // Prefer paths that aren't recently used
          const preferredPaths = allPaths.filter(p => 
            !activePaths.includes(p.id) && 
            !recentlyUsedPaths.has(p.id)
          );
          
          // If no preferred paths are available, use any available path
          const availablePaths = preferredPaths.length > 0 
            ? preferredPaths 
            : allPaths.filter(p => !activePaths.includes(p.id));
          
          // Add 1-2 new segments
          const newSegmentsCount = Math.min(
            Math.floor(1 + Math.random()), 
            availablePaths.length
          );
          
          for (let i = 0; i < newSegmentsCount; i++) {
            if (availablePaths.length > 0) {
              const randomIndex = Math.floor(Math.random() * availablePaths.length);
              const randomPath = availablePaths[randomIndex];
              availablePaths.splice(randomIndex, 1); // Remove the selected path
              
              const segmentLength = 0.15;
              updatedSegments.push({
                id: `segment-${randomPath.id}-${Date.now()}-${i}`,
                pathId: randomPath.id,
                startProgress: 0,
                endProgress: segmentLength,
                speed: animationSpeed, // Use consistent speed
                sourceNode: randomPath.sourceNode,
                targetNode: randomPath.targetNode
              });
              
              // Mark this path as recently used
              recentlyUsedPaths.add(randomPath.id);
            }
          }
        }
        
        return updatedSegments;
      });
      
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
  }, [isClient, nodes, sparsity]);

  // Helper function to get point coordinates along a path
  const getPointAlongPath = (pathId: string, progress: number): { x: number, y: number } | null => {
    if (!isClient) return null;
    
    const path = document.getElementById(pathId);
    if (!path) return null;
    try {
      const pathLength = (path as unknown as SVGPathElement).getTotalLength();
      const point = (path as unknown as SVGPathElement).getPointAtLength(pathLength * progress);
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
        className="relative w-full overflow-hidden"
        style={{ 
          minHeight: "500px" // Fixed height for server-side rendering
        }}
      >
        {/* No background or styling at all */}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full overflow-hidden"
      style={{ 
        minHeight: isClient && typeof window !== 'undefined' 
          ? (window.innerWidth < 640 
              ? Math.max(350, window.innerHeight * 0.6) // Taller on mobile
              : Math.max(radius * 2, 500) + 100)
          : 500, // Fallback height
        // Add max-width to ensure the diagram doesn't get too stretched on very wide screens
        maxWidth: '1600px',
        margin: '0 auto'
      }}
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
              
              {/* Animated segment gradients - content to hub */}
              <linearGradient id="segment-content-to-hub" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              
              {/* Animated segment gradients - hub to output */}
              <linearGradient id="segment-hub-to-output" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF0000" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
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
                const pathElement = path as unknown as SVGPathElement;
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
                
                // Use gradient based on direction
                const gradientId = isContentToHub ? "url(#segment-content-to-hub)" : "url(#segment-hub-to-output)";
                
                return (
                  <path
                    key={segment.id}
                    d={pathData}
                    fill="none"
                    stroke={gradientId}
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

          {/* Render nodes with responsive sizing */}
          {nodes.map(node => {
            const isHovered = hoveredNode === node.id;
            const nodeScale = isHovered ? 'scale-110' : 'scale-100';
            const isMobile = containerSize.width < 640;
            
            return (
              <div
                key={node.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  node.type === 'hub' 
                    ? isMobile ? 'w-16 h-16 bg-white/80' : 'w-24 h-24 bg-white/80'
                    : node.type === 'processing'
                      ? isMobile ? 'w-14 h-14 bg-white/80' : 'w-20 h-20 bg-white/80'
                      : isMobile ? 'w-12 h-12 bg-white/80' : 'w-16 h-16 bg-white/80'
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
                    <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} rounded-full flex items-center justify-center ${isHovered ? 'bg-white shadow-md' : 'bg-white/90'} p-1 transition-all duration-300`}>
                      <img 
                        src={node.icon} 
                        alt={`${node.id} icon`} 
                        className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} object-contain ${isHovered ? 'scale-110' : 'scale-100'} transition-transform duration-300`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${isHovered ? 'bg-white shadow-sm' : 'bg-white/90'} p-1 transition-all duration-300`}>
                    <img 
                      src={node.icon} 
                      alt={`${node.id} icon`} 
                      className={`${isMobile ? 'w-7 h-7' : 'w-10 h-10'} ${isHovered ? 'scale-110' : 'scale-100'} transition-transform duration-300`}
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