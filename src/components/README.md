# Hub and Spoke Animation Component

This component creates an animated hub-and-spoke diagram that visualizes data flow between content nodes (inputs) and output nodes through a central hub.

## Usage

```tsx
import HubSpokeAnimation from '@/components/HubSpokeAnimation';

// Define your content nodes (inputs)
const contentNodes = [
  { id: 'source1', icon: '/path/to/icon1.png' },
  { id: 'source2', icon: '/path/to/icon2.png' },
  // Add more as needed
];

// Define your output nodes
const outputNodes = [
  { id: 'output1', icon: '/path/to/output1.png' },
  { id: 'output2', icon: '/path/to/output2.png' },
  // Add more as needed
];

// Use the component
<HubSpokeAnimation 
  contentNodes={contentNodes}
  outputNodes={outputNodes}
  hubIcon="/path/to/hub-icon.png" // Optional
  radius={250} // Optional, controls the size of the diagram
  animationDuration={4} // Optional, in seconds
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contentNodes` | `Array` | Required | Array of content nodes (inputs) with `id` and `icon` properties |
| `outputNodes` | `Array` | Required | Array of output nodes with `id` and `icon` properties |
| `hubIcon` | `string` | `/hub-icon.png` | Path to the icon for the central hub |
| `radius` | `number` | `250` | Radius of the circle on which nodes are positioned |
| `animationDuration` | `number` | `3` | Duration of the animation in seconds |

## Animation

The component animates data flow from content nodes through the hub to output nodes. The animation is visualized as a purple line flowing along the connections.

## Customization

You can customize the appearance by modifying the component's CSS classes or by extending the component with additional props.

## Requirements

This component requires:
- React
- Framer Motion
- Tailwind CSS (for styling) 