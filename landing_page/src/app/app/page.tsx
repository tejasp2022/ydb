'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Plus } from 'lucide-react'

const interests = [
  "Sports",
  "Entrepreneurship",
  "Technology",
  "Science",
  "Biology",
  "Music",
  "Art",
  "Food",
  "Travel",
  "Fashion"
]

export default function InterestsPage() {
  const [currentSection, setCurrentSection] = useState<'interests' | 'next'>('interests')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [customTopics, setCustomTopics] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInterestClick = (interest: string) => {
    setSelectedInterests(prev => {
      // If already selected, remove it
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest)
      }
      // Otherwise add it
      return [...prev, interest]
    })
  }

  const handleNext = () => {
    setCurrentSection('next')
  }

  const handleBack = () => {
    setCurrentSection('interests')
  }

  const handleAddCustomTopic = () => {
    if (customInput.trim()) {
      setCustomTopics(prev => [...prev, customInput.trim()])
      setCustomInput('')
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCustomTopic()
    }
  }

  // Combine all selected interests and custom topics
  const allSelections = [...selectedInterests, ...customTopics]

  return (
    <div className="h-screen w-full overflow-hidden">
      <AnimatePresence>
        {currentSection === 'interests' && (
          <motion.div 
            key="interests"
            initial={{ x: 0 }}
            exit={{ x: '-100%', opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#FA8072] overflow-y-auto" // Salmon color
          >
            <div className="min-h-full flex flex-col items-center justify-center px-4 md:px-8 py-10">
              <h1 className="text-white text-3xl md:text-5xl font-bold mb-10 text-center">
                What are you interested in?
              </h1>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-3xl">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    className={`${selectedInterests.includes(interest) 
                      ? 'bg-white text-[#FA8072]' 
                      : 'bg-white/20 text-white'} 
                      hover:bg-white/90 hover:text-[#FA8072] font-bold py-4 px-6 rounded-lg 
                      text-xl md:text-2xl transition-all duration-200`}
                    onClick={() => handleInterestClick(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              
              {selectedInterests.length > 0 && (
                <div className="mt-8 w-full max-w-3xl">
                  <h2 className="text-white text-xl font-semibold mb-2">Your Selections:</h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map(interest => (
                      <span key={interest} className="bg-white text-[#FA8072] px-3 py-1 rounded-full font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                onClick={handleNext} 
                className="mt-10 text-white flex items-center gap-2 font-semibold text-lg"
              >
                Continue <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
        
        {currentSection === 'next' && (
          <motion.div 
            key="next"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#FA8072] overflow-y-auto"
          >
            <div className="min-h-full flex flex-col items-center justify-center px-4 md:px-8 py-10">
              <h1 className="text-white text-4xl md:text-6xl font-bold text-center">
                Your Interests
              </h1>
              
              {/* Display all selections in a large text box */}
              <div className="mt-8 w-full max-w-3xl bg-white/10 rounded-xl p-6 shadow-lg">
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">
                  Selected Topics
                </h2>
                
                {allSelections.length > 0 ? (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {allSelections.map((selection, index) => (
                      <span 
                        key={`${selection}-${index}`} 
                        className="bg-white text-[#FA8072] px-4 py-2 rounded-lg font-bold text-xl"
                      >
                        {selection}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white text-xl mb-6">No topics selected yet.</p>
                )}
                
                <h3 className="text-white text-xl font-semibold mb-3">
                  Add Custom Topics
                </h3>
                
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a custom topic"
                    className="flex-1 bg-white/20 text-white placeholder:text-white/70 px-4 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    onClick={handleAddCustomTopic}
                    className="bg-white text-[#FA8072] px-4 py-2 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Plus size={20} />
                    Add
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleBack} 
                className="mt-8 bg-white text-[#FA8072] px-6 py-3 rounded-lg font-bold"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
