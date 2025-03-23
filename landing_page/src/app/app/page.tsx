'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Plus, ChevronLeft, X } from 'lucide-react'

// Categories with subcategories
const interestCategories = [
  {
    name: "Sports",
    subcategories: ["Basketball", "Football", "Soccer", "Tennis", "Golf", "Swimming", "Running"]
  },
  {
    name: "Entrepreneurship",
    subcategories: ["Startups", "Venture Capital", "Business Strategy", "Marketing", "Leadership"]
  },
  {
    name: "Technology",
    subcategories: ["AI", "Blockchain", "Web Development", "Mobile Apps", "Cloud Computing"]
  },
  {
    name: "Science",
    subcategories: ["Physics", "Chemistry", "Astronomy", "Environmental Science"]
  },
  {
    name: "Biology",
    subcategories: ["Genetics", "Microbiology", "Neuroscience", "Ecology", "Medicine"]
  },
  {
    name: "Music",
    subcategories: ["Rock", "Pop", "Hip Hop", "Jazz", "Classical", "Electronic"]
  },
  {
    name: "Art",
    subcategories: ["Painting", "Sculpture", "Photography", "Digital Art", "Film"]
  },
  {
    name: "Food",
    subcategories: ["Cooking", "Baking", "Restaurants", "Nutrition", "Cuisines"]
  },
  {
    name: "Travel",
    subcategories: ["Adventure", "Backpacking", "Luxury", "Cultural", "Road Trips"]
  },
  {
    name: "Fashion",
    subcategories: ["Clothing", "Accessories", "Footwear", "Styling", "Trends"]
  }
]

export default function InterestsPage() {
  const [currentSection, setCurrentSection] = useState<'interests' | 'next' | 'celebration'>('interests')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [customTopics, setCustomTopics] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [showNoResultsPrompt, setShowNoResultsPrompt] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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
  
  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(prev => prev === categoryName ? null : categoryName)
  }

  const handleNext = () => {
    // Skip the next page and directly submit interests
    handleSubmit()
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

  const handleAddCustomTopic = (topic: string = customInput) => {
    if (topic.trim()) {
      // Limit total selections to 5
      const allSelections = [...selectedInterests, ...customTopics]
      if (allSelections.length < 5) {
        setIsAnimating(true)
        // Check if this custom topic already exists
        if (!customTopics.includes(topic.trim()) && !selectedInterests.includes(topic.trim())) {
          setCustomTopics(prev => [...prev, topic.trim()])
          // Reset animation state after animation completes
          setTimeout(() => setIsAnimating(false), 800)
        }
      }
      setCustomInput('')
      setSearchQuery('')
      setShowNoResultsPrompt(false)
      searchInputRef.current?.focus()
    }
  }
  
  // Function to handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setShowNoResultsPrompt(false)
    
    // If search is cleared, reset the no results prompt and expanded category
    if (query.trim() === '') {
      setShowNoResultsPrompt(false)
      setExpandedCategory(null)
    } else {
      // Auto-expand matching categories
      autoExpandMatchingCategory(query)
    }
  }
  
  // Function to auto-expand categories that match the search
  const autoExpandMatchingCategory = (query: string) => {
    if (query.trim() === '') return
    
    // Find the first category that matches the search
    const matchingCategory = interestCategories.find(category => {
      // Check if category name matches
      if (category.name.toLowerCase().includes(query.toLowerCase())) return true
      
      // Check if any subcategory matches
      return category.subcategories.some(sub => 
        sub.toLowerCase().includes(query.toLowerCase())
      )
    })
    
    // If we found a matching category, expand it
    if (matchingCategory) {
      setExpandedCategory(matchingCategory.name)
    }
  }
  
  // Function to check if we have search results
  const checkSearchResults = () => {
    if (searchQuery.trim() === '') return true
    
    // Check if any category or subcategory matches the search
    const hasResults = interestCategories.some(category => {
      // Check category name
      if (category.name.toLowerCase().includes(searchQuery.toLowerCase())) return true
      
      // Check subcategories
      return category.subcategories.some(sub => 
        sub.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
    
    setShowNoResultsPrompt(!hasResults)
    return hasResults
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCustomTopic()
    }
  }
  
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() && !checkSearchResults()) {
      // If Enter is pressed with search text and no results, add as custom topic
      handleAddCustomTopic(searchQuery)
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
            <div className="min-h-full flex flex-col items-center px-4 md:px-8 py-6 md:py-10 pb-20 md:pb-24 relative">
              <h1 className="font-sans text-purple-700 text-3xl md:text-6xl font-bold mb-4 md:mb-8 text-center tracking-tight">
                What are you interested in?
              </h1>
              
              <div className="w-full max-w-lg mb-3 md:mb-4">
                <div className="relative flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Search or add interests..."
                      className="font-sans w-full p-4 pl-12 rounded-lg border-2 border-purple-300 focus:border-purple-700 focus:outline-none text-lg"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchQuery.trim() !== '' && (
                    <button
                      onClick={() => handleAddCustomTopic(searchQuery)}
                      disabled={allSelections.length >= 5}
                      className="bg-purple-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Add custom interest"
                      title="Add custom interest"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="w-full max-w-lg flex-grow overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50 rounded-lg mb-4">
                {/* No results prompt with add button */}
                <AnimatePresence>
                  {showNoResultsPrompt && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-purple-50 p-4 rounded-lg mb-4 text-center"
                    >
                      <p className="text-purple-700 mb-2">No results found for "{searchQuery}"</p>
                      <button
                        onClick={() => handleAddCustomTopic(searchQuery)}
                        className="bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm inline-flex items-center gap-1"
                      >
                        <Plus size={16} /> Add as custom interest
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {interestCategories.map((category) => {
                  // Filter based on search query
                  if (searchQuery.trim() !== '') {
                    const query = searchQuery.toLowerCase();
                    const categoryMatches = category.name.toLowerCase().includes(query);
                    const subcategoryMatches = category.subcategories.some(
                      sub => sub.toLowerCase().includes(query)
                    );
                    
                    if (!categoryMatches && !subcategoryMatches) return null;
                  }
                  
                  return (
                  <div key={category.name} className="mb-4">
                    <button
                      className={`w-full text-left py-3 pl-6 pr-5 rounded-lg flex justify-between items-center transition-all duration-200 ${expandedCategory === category.name ? 'bg-purple-100' : 'hover:bg-purple-50'}`}
                      onClick={() => toggleCategory(category.name)}
                    >
                      <span className="font-sans text-purple-700 font-medium text-xl tracking-tight">{category.name}</span>
                      <ChevronRight 
                        className={`h-5 w-5 text-purple-700 transition-transform duration-200 ${expandedCategory === category.name ? 'transform rotate-90' : ''}`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {expandedCategory === category.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden pl-4"
                        >
                          <div className="pt-2 pb-2 pl-2 border-l-2 border-purple-300">
                            {category.subcategories.map((subcategory) => (
                              <button
                                key={subcategory}
                                className={`${selectedInterests.includes(subcategory) 
                                  ? 'bg-purple-700 text-white' 
                                  : 'bg-white text-purple-700 hover:bg-purple-50'} 
                                  py-2 px-4 rounded-lg text-base transition-all duration-200 w-full text-left mb-2 flex justify-between items-center`}
                                onClick={() => handleInterestClick(subcategory)}
                              >
                                <span className="font-sans font-light">{subcategory}</span>
                                {selectedInterests.includes(subcategory) && (
                                  <span className="text-white">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              </div>
              
              <div className="w-full max-w-3xl" style={{ minHeight: (selectedInterests.length > 0 || customTopics.length > 0) ? 'auto' : '0' }}>
                <AnimatePresence>
                  {(selectedInterests.length > 0 || customTopics.length > 0) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden fixed bottom-0 left-0 right-0 bg-white pt-2 px-4 md:px-8 border-t border-purple-100 md:static md:border-0 md:pt-0 md:px-0 z-10 pb-16 md:pb-0 max-h-[30vh] md:max-h-none overflow-y-auto"
                    >
                      <motion.h2 
                        className="font-sans text-purple-700 text-xl font-semibold mb-3 tracking-tight"
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
                            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md font-sans font-medium flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                          >
                            {interest}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInterests(prev => prev.filter(item => item !== interest));
                              }}
                              className="ml-1 hover:text-purple-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </motion.span>
                        ))}
                        {customTopics.map((topic) => (
                          <motion.span 
                            key={`custom-${topic}`} 
                            className="bg-purple-200 text-purple-800 px-3 py-1 rounded-md font-sans font-medium flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                          >
                            {topic}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomTopics(prev => prev.filter(t => t !== topic));
                              }}
                              className="ml-1 hover:text-purple-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button 
                onClick={handleNext} 
                disabled={isSubmitting || allSelections.length === 0}
                className="fixed bottom-0 left-0 right-0 md:fixed md:bottom-8 md:left-1/2 md:transform md:-translate-x-1/2 md:w-auto bg-purple-700 text-white px-8 py-3 md:rounded-lg font-bold text-lg flex items-center justify-center gap-2 z-20 shadow-lg disabled:bg-purple-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'} {!isSubmitting && <ChevronRight className="h-5 w-5" />}
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
            <div className="min-h-full flex flex-col items-center px-4 md:px-8 py-6 md:py-10 pb-20 md:pb-24 relative">
              <div className="relative w-full max-w-2xl">
                <button 
                  onClick={handleBack} 
                  className="absolute left-0 top-0 text-purple-700 hover:bg-purple-100 p-2 rounded-full transition-colors duration-200"
                >
                  <ChevronLeft size={28} />
                </button>
                <h1 className="font-sans text-purple-700 text-4xl md:text-6xl font-bold text-center mb-10 tracking-tight">
                  Your Interests
                </h1>
              </div>
              
              {/* Display all selections in a large text box */}
              <div className="w-full max-w-2xl p-8">
                <h2 className="font-sans text-purple-700 text-3xl md:text-4xl font-bold mb-8 tracking-tight">
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
                          <span className="font-sans text-purple-700 font-bold text-3xl md:text-4xl tracking-tight">
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
                className="font-sans text-purple-700 text-4xl md:text-6xl font-bold mb-6 tracking-tight"
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
