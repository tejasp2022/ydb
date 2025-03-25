import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { interestCategories } from '../data/interestCategories';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Session } from '@supabase/supabase-js';

// Get API base URL from environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export const useInterests = () => {
  const [currentSection, setCurrentSection] = useState<'interests' | 'next' | 'celebration'>('interests');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customTopics, setCustomTopics] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showNoResultsPrompt, setShowNoResultsPrompt] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  // Initialize and set up Supabase auth listener
  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Set up listener for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Clean up subscription when component unmounts
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Combine all selected interests and custom topics
  const allSelections = [...selectedInterests, ...customTopics];

  const handleInterestClick = (interest: string) => {
    setSelectedInterests(prev => {
      // If already selected, remove it
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest);
      }
      // Otherwise add it, but limit to 5 total interests
      const newInterests = [...prev, interest];
      return newInterests.slice(0, 5);
    });
  };
  
  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(prev => prev === categoryName ? null : categoryName);
  };

  const handleNext = () => {
    // Skip the next page and directly submit interests
    handleSubmit();
  };

  const handleBack = () => {
    // Setting interests page to slide from left to right (backwards direction)
    setCurrentSection('interests');
  };
  
  const handleSubmit = async () => {
    // Don't submit if there are no selections
    if (allSelections.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Get token from supabase client
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      // Submit interests to API using environment variable
      const response = await fetch(`${API_BASE_URL}/update-interests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interests: allSelections
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update interests');
      }
      
      // Navigate to celebration screen
      setCurrentSection('celebration');
    } catch (error) {
      console.error('Error updating interests:', error);
      // You could add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomTopic = (topic: string = customInput) => {
    if (topic.trim()) {
      // Limit total selections to 5
      if (allSelections.length < 5) {
        setIsAnimating(true);
        // Check if this custom topic already exists
        if (!customTopics.includes(topic.trim()) && !selectedInterests.includes(topic.trim())) {
          setCustomTopics(prev => [...prev, topic.trim()]);
          // Reset animation state after animation completes
          setTimeout(() => setIsAnimating(false), 800);
        }
      }
      setCustomInput('');
      setSearchQuery('');
      setShowNoResultsPrompt(false);
      searchInputRef.current?.focus();
    }
  };
  
  // Function to handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowNoResultsPrompt(false);
    
    // If search is cleared, reset the no results prompt and expanded category
    if (query.trim() === '') {
      setShowNoResultsPrompt(false);
      setExpandedCategory(null);
    }
  };
  
  // Function to check if we have search results
  const checkSearchResults = () => {
    if (searchQuery.trim() === '') return true;
    
    // Check if any category or subcategory matches the search
    const hasResults = interestCategories.some(category => {
      // Check category name
      if (category.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
      
      // Check subcategories
      return category.subcategories.some(sub => 
        sub.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    
    setShowNoResultsPrompt(!hasResults);
    return hasResults;
  };
  
  // Get filtered interests based on search query for the search results popup
  const getFilteredInterests = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results: string[] = [];
    
    interestCategories.forEach(category => {
      category.subcategories.forEach(interest => {
        if (interest.toLowerCase().includes(query) && 
            !results.includes(interest)) {
          results.push(interest);
        }
      });
    });
    
    return results.slice(0, 10); // Limit to 10 results for performance
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCustomTopic();
    }
  };
  
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() && !checkSearchResults()) {
      // If Enter is pressed with search text and no results, add as custom topic
      handleAddCustomTopic(searchQuery);
    }
  };

  return {
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
    filteredInterests: getFilteredInterests(),
    handleInterestClick,
    toggleCategory,
    handleNext,
    handleBack,
    handleSubmit,
    handleAddCustomTopic,
    handleSearch,
    checkSearchResults,
    handleKeyDown,
    handleSearchKeyDown,
    setSelectedInterests,
    setCustomTopics,
    setCustomInput,
    setSearchQuery
  };
};

export default useInterests;
