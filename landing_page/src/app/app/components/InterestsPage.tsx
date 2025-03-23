import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { interestCategories } from '../data/interestCategories';
import useInterests from '../hooks/useInterests';
import AmbientBackground from './AmbientBackground';
import UserSelections from './UserSelections';
import InterestCategory from './InterestCategory';
import SearchBar from './SearchBar';
import NoResultsPrompt from './NoResultsPrompt';
import NextPage from './NextPage';
import CelebrationPage from './CelebrationPage';

export const InterestsPage: React.FC = () => {
  const {
    currentSection,
    selectedInterests,
    customTopics,
    customInput,
    searchQuery,
    isAnimating,
    isSubmitting,
    expandedCategory,
    showNoResultsPrompt,
    inputRef,
    searchInputRef,
    allSelections,
    filteredInterests,
    handleInterestClick,
    toggleCategory,
    handleNext,
    handleBack,
    handleSubmit,
    handleAddCustomTopic,
    handleSearch,
    handleKeyDown,
    handleSearchKeyDown,
    setSelectedInterests,
    setCustomTopics,
    setCustomInput,
    setSearchQuery
  } = useInterests();

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
            <div className="min-h-full flex flex-col items-center px-4 md:px-8 py-6 md:py-10 pb-32 md:pb-40 relative">
              <AmbientBackground />
              <h1 className="font-sans text-purple-700 text-3xl md:text-6xl font-bold mb-4 md:mb-6 text-center tracking-tight">
                What are you interested in?
              </h1>
              
              {/* User Selections at the top */}
              <UserSelections 
                selectedInterests={selectedInterests}
                customTopics={customTopics}
                setSelectedInterests={setSelectedInterests}
                setCustomTopics={setCustomTopics}
                handleNext={handleNext}
                isSubmitting={isSubmitting}
              />
              
              <div className="w-full max-w-lg md:max-w-3xl flex-grow overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50 rounded-lg mb-4 pb-32 md:pb-40">
                {/* No results prompt with add button */}
                <AnimatePresence>
                  {showNoResultsPrompt && (
                    <NoResultsPrompt 
                      showNoResultsPrompt={showNoResultsPrompt}
                      searchQuery={searchQuery}
                      handleAddCustomTopic={handleAddCustomTopic}
                    />
                  )}
                </AnimatePresence>
                
                {interestCategories.map((category) => (
                  <InterestCategory 
                    key={category.name}
                    name={category.name}
                    subcategories={category.subcategories}
                    expandedCategory={expandedCategory}
                    selectedInterests={selectedInterests}
                    toggleCategory={toggleCategory}
                    handleInterestClick={handleInterestClick}
                  />
                ))}
              </div>
              
              {/* Search container */}
              <SearchBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
                handleSearchKeyDown={handleSearchKeyDown}
                handleAddCustomTopic={handleAddCustomTopic}
                searchInputRef={searchInputRef as React.RefObject<HTMLInputElement>}
                filteredInterests={filteredInterests}
                selectedInterests={selectedInterests}
                handleInterestClick={handleInterestClick}
                allSelections={allSelections}
              />
            </div>
          </motion.div>
        )}
        
        {currentSection === 'next' && (
          <NextPage 
            handleBack={handleBack}
            allSelections={allSelections}
            customTopics={customTopics}
            setCustomTopics={setCustomTopics}
            customInput={customInput}
            setCustomInput={setCustomInput}
            handleKeyDown={handleKeyDown}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            inputRef={inputRef as React.RefObject<HTMLInputElement>}
            isAnimating={isAnimating}
          />
        )}

        {currentSection === 'celebration' && (
          <CelebrationPage allSelections={allSelections} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterestsPage;
