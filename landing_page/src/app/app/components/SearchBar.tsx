import React, { KeyboardEvent, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleAddCustomTopic: (topic?: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  filteredInterests: string[];
  selectedInterests: string[];
  handleInterestClick: (interest: string) => void;
  allSelections: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleSearchKeyDown,
  handleAddCustomTopic,
  searchInputRef,
  filteredInterests,
  selectedInterests,
  handleInterestClick,
  allSelections
}) => {
  return (
    <div className="fixed bottom-6 left-0 right-0 md:fixed md:bottom-8 md:left-0 md:right-0 md:px-8 z-30 px-4">
      {/* Search results popup */}
      <AnimatePresence>
        {searchQuery.trim() !== '' && filteredInterests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-purple-100 max-h-[40vh] overflow-y-auto md:max-w-2xl md:mx-auto"
          >
            <div className="p-3">
              <h3 className="text-sm font-medium text-purple-600 mb-2">Search Results:</h3>
              <div className="flex flex-wrap gap-2">
                {filteredInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestClick(interest)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedInterests.includes(interest) ? 'bg-purple-200 text-purple-800' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-lg border border-purple-100 md:max-w-2xl md:mx-auto">
        <div className="relative flex gap-2 w-full md:flex-grow items-center">
          <div className="relative flex-grow">    
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search or add interests..."
              className="font-sans w-full p-4 pl-12 pr-10 rounded-lg border-2 border-purple-300 focus:border-purple-700 focus:outline-none text-lg shadow-lg bg-white/95 backdrop-blur-sm"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery.trim() !== '' && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {searchQuery.trim() !== '' && (
            <button
              onClick={() => handleAddCustomTopic(searchQuery)}
              disabled={allSelections.length >= 5}
              className="bg-purple-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              aria-label="Add custom interest"
              title="Add custom interest"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
