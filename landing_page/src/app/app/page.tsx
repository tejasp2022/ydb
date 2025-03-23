'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Plus, ChevronLeft, X } from 'lucide-react'

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
  const [currentSection, setCurrentSection] = useState<'interests' | 'next' | 'celebration'>('interests')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [customTopics, setCustomTopics] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInterestClick = (interest: string) => {
    setSelectedInterests(prev => {
      // If already selected, remove it
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest)
      }
      // Otherwise add it, but limit to 5 total interests
      const newInterests = [...prev, interest]
      return newInterests.slice(0, 5)
    })
  }

  const handleNext = () => {
    setCurrentSection('next')
  }

  const handleBack = () => {
    // Setting interests page to slide from left to right (backwards direction)
    setCurrentSection('interests')
  }
  
  const handleSubmit = async () => {
    // Don't submit if there are no selections
    if (allSelections.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Submit interests to API
      const response = await fetch('/api/submit-interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: allSelections
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit interests');
      }
      
      // Navigate to celebration screen
      setCurrentSection('celebration');
    } catch (error) {
      console.error('Error submitting interests:', error);
      // You could add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAddCustomTopic = () => {
    if (customInput.trim()) {
      // Limit total selections to 5
      const allSelections = [...selectedInterests, ...customTopics]
      if (allSelections.length < 5) {
        setIsAnimating(true)
        setCustomTopics(prev => [...prev, customInput.trim()])
        // Reset animation state after animation completes
        setTimeout(() => setIsAnimating(false), 800)
      }
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
    <div className="h-screen w-full overflow-hidden bg-white">
      <AnimatePresence mode="sync">
        {currentSection === 'interests' && (
          <motion.div 
            key="interests"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 bg-white overflow-y-auto"
          >
            <div className="min-h-full flex flex-col items-center justify-between px-4 md:px-8 py-10">
              <h1 className="text-purple-700 text-4xl md:text-6xl font-bold mb-12 text-center">
                What are you interested in?
              </h1>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-3xl">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    className={`${selectedInterests.includes(interest) 
                      ? 'bg-purple-700 text-white' 
                      : 'border-2 border-purple-700 text-purple-700'} 
                      hover:bg-purple-700 hover:text-white font-bold py-3 px-3 md:py-4 md:px-6 rounded-lg 
                      text-sm sm:text-lg md:text-xl lg:text-2xl transition-all duration-200 break-words h-full flex items-center justify-center text-center`}
                    onClick={() => handleInterestClick(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              
              <div className="mt-10 w-full max-w-3xl" style={{ minHeight: selectedInterests.length > 0 ? 'auto' : '0' }}>
                <AnimatePresence>
                  {selectedInterests.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <motion.h2 
                        className="text-purple-700 text-xl font-semibold mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        Your Selections:
                      </motion.h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedInterests.map((interest) => (
                          <motion.span 
                            key={interest} 
                            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                          >
                            {interest}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button 
                onClick={handleNext} 
                className="mt-12 bg-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg flex items-center gap-2"
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
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 bg-white overflow-y-auto"
          >
            <div className="min-h-full flex flex-col items-center justify-between px-4 md:px-8 py-10">
              <div className="relative w-full max-w-2xl">
                <button 
                  onClick={handleBack} 
                  className="absolute left-0 top-0 text-purple-700 hover:bg-purple-100 p-2 rounded-full transition-colors duration-200"
                >
                  <ChevronLeft size={28} />
                </button>
                <h1 className="text-purple-700 text-4xl md:text-6xl font-bold text-center mb-10">
                  Your Interests
                </h1>
              </div>
              
              {/* Display all selections in a large text box */}
              <div className="w-full max-w-2xl p-8">
                <h2 className="text-purple-700 text-3xl md:text-4xl font-bold mb-8">
                  Selected Topics
                </h2>
                
                {/* Vertical list of selected topics */}
                <div className="mb-12">
                  {allSelections.length > 0 ? (
                    <ul className="space-y-4">
                      {allSelections.map((selection, index) => (
                        <motion.li 
                          key={`${selection}-${index}`}
                          initial={isAnimating && index === allSelections.length - 1 ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="border-l-4 border-purple-700 pl-4 py-1 flex items-center justify-between group"
                        >
                          <span className="text-purple-700 font-bold text-3xl md:text-4xl">
                            {selection}
                          </span>
                          {customTopics.includes(selection) && (
                            <button 
                              onClick={() => {
                                setCustomTopics(prev => prev.filter(topic => topic !== selection));
                              }}
                              className="text-purple-300 hover:text-purple-700 transition-colors duration-200 p-2"
                              aria-label={`Remove ${selection}`}
                            >
                              <X size={20} />
                            </button>
                          )}
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-2xl md:text-3xl font-medium pt-2 pb-6">Add some topics to get started</p>
                  )}
                </div>
              </div>
              
              {/* Input box at the bottom of the page */}
              <div className="w-full max-w-2xl p-8 mt-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add More..."
                      disabled={allSelections.length >= 5}
                      className="flex-1 border-b-2 border-purple-700 pb-2 text-purple-700 placeholder:text-purple-300 text-3xl md:text-4xl font-bold focus:outline-none focus:border-b-4"
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || allSelections.length === 0}
                      className="bg-purple-700 hover:bg-purple-800 text-white rounded-full p-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      aria-label="Submit interests"
                    >
                      {isSubmitting ? (
                        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ChevronRight size={24} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentSection === 'celebration' && (
          <motion.div 
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white overflow-y-auto flex items-center justify-center"
          >
            <div className="min-h-full flex flex-col items-center justify-center px-4 md:px-8 py-10 text-center max-w-2xl mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <div className="mx-auto mb-6">
                  <span className="text-7xl">🎉</span>
                </div>
              </motion.div>
              
              <motion.h1 
                className="text-purple-700 text-4xl md:text-6xl font-bold mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Thank You!
              </motion.h1>
              
              <motion.p 
                className="text-gray-700 text-xl md:text-2xl mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Your personalized podcast based on your interests will appear in your inbox shortly.
              </motion.p>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <button 
                  onClick={() => setCurrentSection('interests')}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors duration-200"
                >
                  Start Over
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
