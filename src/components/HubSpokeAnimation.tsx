"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type NodeType = 'content' | 'output' | 'hub';

interface Node {
  id: string;
  type: NodeType;
  icon: string;
  position: { x: number; y: number };
  angle?: number;
}

interface HubSpokeAnimationProps {
  contentNodes: Omit<Node, 'type' | 'position' | 'angle'>[];
  outputNodes: Omit<Node, 'type' | 'position' | 'angle'>[];
  hubIcon?: string;
  radius?: number;
  animationDuration?: number;
}

const HubSpokeAnimation: React.FC<HubSpokeAnimationProps> = ({
  contentNodes,
  outputNodes,
  hubIcon = '/hub-icon.png',
  radius = 250,
  animationDuration = 3,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate node positions in a circular layout
  useEffect(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    setContainerSize({
      width: containerRect.width,
      height: containerRect.height,
    });

    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // Create hub node
    const hubNode: Node = {
      id: 'hub',
      type: 'hub',
      icon: hubIcon,
      position: { x: centerX, y: centerY },
    };

    // Position content nodes on the left side (135° to 225°)
    const contentNodeCount = contentNodes.length;
    const contentNodesWithPosition = contentNodes.map((node, index) => {
      const angleRange = 90; // 225° - 135°
      const angleStep = angleRange / (contentNodeCount - 1 || 1);
      const angle = (135 + index * angleStep) * (Math.PI / 180);
      
      return {
        ...node,
        type: 'content' as NodeType,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
        angle,
      };
    });

    // Position output nodes on the right side (-45° to 45°)
    const outputNodeCount = outputNodes.length;
    const outputNodesWithPosition = outputNodes.map((node, index) => {
      const angleRange = 90; // 45° - (-45°)
      const angleStep = angleRange / (outputNodeCount - 1 || 1);
      const angle = (-45 + index * angleStep) * (Math.PI / 180);
      
      return {
        ...node,
        type: 'output' as NodeType,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
        angle,
      };
    });

    setNodes([hubNode, ...contentNodesWithPosition, ...outputNodesWithPosition]);
  }, [contentNodes, outputNodes, hubIcon, radius, containerRef]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[600px]"
      style={{ minHeight: radius * 2 + 100 }}
    >
      {nodes.length > 0 && containerSize.width > 0 && (
        <>
          {/* Draw lines connecting nodes */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Static lines */}
            {nodes
              .filter(node => node.type !== 'hub')
              .map(node => {
                const hubNode = nodes.find(n => n.type === 'hub')!;
                
                return (
                  <line
                    key={`static-line-${node.id}`}
                    x1={node.position.x}
                    y1={node.position.y}
                    x2={hubNode.position.x}
                    y2={hubNode.position.y}
                    stroke="#e5e7eb"
                    strokeWidth={2}
                  />
                );
              })}
              
            {/* Animated flows from content nodes to hub */}
            {nodes
              .filter(node => node.type === 'content')
              .map((node, index) => {
                const hubNode = nodes.find(n => n.type === 'hub')!;
                // Stagger the animations
                const delay = index * (animationDuration / contentNodes.length / 2);
                
                return (
                  <motion.line
                    key={`flow-in-${node.id}`}
                    x1={node.position.x}
                    y1={node.position.y}
                    x2={hubNode.position.x}
                    y2={hubNode.position.y}
                    stroke="#a855f7"
                    strokeWidth={4}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, pathOffset: 0 }}
                    animate={{ 
                      pathLength: 0.4,
                      pathOffset: [0, 1],
                      transition: { 
                        pathOffset: {
                          duration: animationDuration,
                          repeat: Infinity,
                          ease: "linear",
                          delay,
                        },
                        pathLength: {
                          duration: 0,
                        }
                      }
                    }}
                  />
                );
              })}
              
            {/* Animated flows from hub to output nodes */}
            {nodes
              .filter(node => node.type === 'output')
              .map((node, index) => {
                const hubNode = nodes.find(n => n.type === 'hub')!;
                // Stagger the animations
                const delay = index * (animationDuration / outputNodes.length / 2) + animationDuration / 2;
                
                return (
                  <motion.line
                    key={`flow-out-${node.id}`}
                    x1={hubNode.position.x}
                    y1={hubNode.position.y}
                    x2={node.position.x}
                    y2={node.position.y}
                    stroke="#a855f7"
                    strokeWidth={4}
                    strokeLinecap="round"
                    initial={{ pathLength: 0.4, pathOffset: 0 }}
                    animate={{ 
                      pathLength: 0.4,
                      pathOffset: [0, 1],
                      transition: { 
                        pathOffset: {
                          duration: animationDuration,
                          repeat: Infinity,
                          ease: "linear",
                          delay,
                        },
                        pathLength: {
                          duration: 0,
                        }
                      }
                    }}
                  />
                );
              })}
          </svg>

          {/* Hub glow effect */}
          <div 
            className="absolute rounded-full bg-purple-400 opacity-30 animate-pulse"
            style={{
              left: nodes.find(n => n.type === 'hub')?.position.x,
              top: nodes.find(n => n.type === 'hub')?.position.y,
              width: 100,
              height: 100,
              transform: 'translate(-50%, -50%)',
              filter: 'blur(10px)',
              zIndex: 1
            }}
          />

          {/* Render nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full ${
                node.type === 'hub' 
                  ? 'w-24 h-24 bg-purple-500 border-4 border-purple-300' 
                  : 'w-16 h-16 bg-white shadow-lg'
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: node.type === 'hub' ? 10 : 5,
              }}
            >
              <img 
                src={node.icon} 
                alt={`${node.id} icon`} 
                className={`${node.type === 'hub' ? 'w-16 h-16' : 'w-10 h-10'}`}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default HubSpokeAnimation;