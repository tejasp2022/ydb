import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 right-0 w-[70%] h-[40%] opacity-[0.07]">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#8B5CF6" d="M45.7,-77.2C58.9,-69.2,69.3,-55.7,76.4,-41.3C83.6,-26.9,87.4,-11.5,85.6,3C83.8,17.6,76.4,31.2,67.4,43.8C58.3,56.4,47.6,68,34.4,75.3C21.2,82.6,5.6,85.7,-9.8,84.3C-25.1,82.9,-40.3,77.1,-53.2,68C-66.1,58.9,-76.7,46.5,-82.4,32.1C-88.1,17.8,-88.9,1.4,-84.5,-12.9C-80.1,-27.2,-70.5,-39.5,-58.9,-48.3C-47.3,-57.1,-33.7,-62.3,-20.4,-69.8C-7.2,-77.3,5.9,-87,20.2,-87.6C34.5,-88.2,50,-85.1,45.7,-77.2Z" transform="translate(100 100)" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-[60%] h-[35%] opacity-[0.05]">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#8B5CF6" d="M38.5,-65.1C52.9,-60.2,69.7,-55.2,76.8,-44.1C84,-33,81.4,-16.5,79.9,-1.5C78.4,13.6,77.9,27.1,71.6,38.1C65.3,49.1,53.1,57.6,40.1,62.5C27.1,67.4,13.6,68.7,-0.5,69.2C-14.6,69.7,-29.1,69.4,-41.2,64.3C-53.2,59.1,-62.7,49.1,-69.8,37.3C-76.9,25.4,-81.6,12.7,-82.2,-0.6C-82.9,-13.9,-79.5,-27.8,-72.4,-39.8C-65.2,-51.8,-54.3,-61.8,-41.8,-67.5C-29.2,-73.2,-14.6,-74.6,-1.2,-72.7C12.2,-70.8,24.1,-70,38.5,-65.1Z" transform="translate(100 100)" />
        </svg>
      </div>
      <div className="absolute top-[40%] left-[20%] w-[40%] h-[30%] opacity-[0.04]">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#8B5CF6" d="M47.7,-80.4C62.9,-71.9,77.2,-62.2,83.8,-48.3C90.5,-34.4,89.4,-16.2,85.6,-0.8C81.8,14.6,75.3,29.3,66.2,41.4C57.2,53.5,45.6,63.1,32.5,70.7C19.4,78.3,4.9,83.9,-9.1,82.3C-23.1,80.7,-36.6,71.9,-48.2,61.6C-59.8,51.3,-69.5,39.5,-76.4,25.8C-83.3,12.1,-87.4,-3.6,-84.8,-18.1C-82.2,-32.6,-73,-45.9,-60.8,-55.4C-48.7,-64.9,-33.6,-70.5,-18.8,-78.5C-4,-86.4,10.6,-96.7,24.8,-93.7C39,-90.7,52.9,-74.4,47.7,-80.4Z" transform="translate(100 100)" />
        </svg>
      </div>
    </div>
  );
};

export default AmbientBackground;
