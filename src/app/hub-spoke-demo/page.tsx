"use client";

import React from 'react';
import HubSpokeAnimation from '@/components/HubSpokeAnimation';
import Link from 'next/link';

const HubSpokeDemo = () => {
  // Sample content nodes (left side)
  const contentNodes = [
    { id: 'reddit', icon: '/icons/reddit-icon.png' },
    { id: 'medium', icon: '/icons/medium-icon.png' },
    { id: 'hackernews', icon: '/icons/hackernews-icon.png' },
  ];

  // Sample output nodes (right side)
  const outputNodes = [
    { id: 'spotify', icon: '/icons/spotify-icon.png' },
    { id: 'apple-music', icon: '/icons/apple-music-icon.png' },
    { id: 'unknown', icon: '/icons/question-icon.png' },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Hub and Spoke Animation</h1>
      <p className="text-center text-gray-600 mb-8">
        Visualizing data flow from content sources through a processing hub to output destinations
      </p>
      
      <div className="mb-8">
        <HubSpokeAnimation 
          contentNodes={contentNodes}
          outputNodes={outputNodes}
          hubIcon="/icons/hub-icon.png"
          radius={250}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Content Sources</h2>
          <p className="text-gray-600">
            Content nodes represent data sources that feed into the central processing hub.
            In this example, we&apos;re showing content from Reddit, Medium, and Hacker News.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Processing Hub</h2>
          <p className="text-gray-600">
            The central hub represents our processing engine that transforms and routes content
            from various sources to appropriate output destinations based on user preferences.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Output Destinations</h2>
          <p className="text-gray-600">
            Output nodes represent the destinations where processed content is delivered.
            This could be streaming services, newsletters, or other platforms.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">How It Works</h2>
        <p className="mb-4">
          The animation visualizes the flow of data through the system:
        </p>
        <ol className="list-decimal pl-6 space-y-2 mb-4">
          <li>Content is collected from various sources (left side nodes)</li>
          <li>Data flows into the central processing hub</li>
          <li>The hub processes, transforms, and routes the content</li>
          <li>Processed content flows to the appropriate output destinations (right side nodes)</li>
        </ol>
        <p className="text-sm text-gray-500 mt-4">
          Note: This is a demonstration using placeholder icons. In a production environment, 
          you would replace these with actual brand logos or custom icons.
        </p>
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/" className="text-purple-600 hover:text-purple-800 underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default HubSpokeDemo; 