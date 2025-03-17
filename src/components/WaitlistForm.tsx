import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronRight, ChevronLeft, Check, User } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import content from "@/data/content.json";
import { motion, AnimatePresence } from "framer-motion";
import { User as SupabaseUser } from '@supabase/supabase-js';

type QuestionType = {
  id: string;
  dbField: string;
  type: string;
  label: string;
  placeholder?: string;
  errorMessage: string;
  options?: Array<{
    id: string;
    label: string;
  }>;
};

// Define the types for form values
type FormValue = string | string[];
type FormData = Record<string, FormValue>;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    transition: { 
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export function WaitlistForm() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userData, setUserData] = useState<SupabaseUser | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  const questions = content.waitlistForm.questions as QuestionType[];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Fetch user data from Supabase on component mount
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserData(data.user);
      }
    };
    
    getUserData();
  }, [supabase.auth]);

  useEffect(() => {
    // Initialize formData with empty values for all question types
    const initialData: FormData = {};
    questions.forEach((question) => {
      // Use dbField from the question instead of mapping
      const fieldName = question.dbField;
      
      if (question.type === 'multi-select') {
        initialData[fieldName] = [] as string[];
      } else {
        initialData[fieldName] = '';
      }
    });
    setFormData(initialData);
  }, []);

  // Scroll to top when changing questions
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentQuestionIndex]);

  const validateCurrentQuestion = (): boolean => {
    const question = questions[currentQuestionIndex];
    let isValid = true;
    const newErrors = { ...errors };

    // Use dbField for validation
    if (question.type === 'text' && !formData[question.dbField]) {
      newErrors[question.id] = question.errorMessage;
      isValid = false;
    } else if (question.type === 'single-select' && !formData[question.dbField]) {
      newErrors[question.id] = question.errorMessage;
      isValid = false;
    } else if (question.type === 'multi-select' && 
               (!formData[question.dbField] || (formData[question.dbField] as string[]).length === 0)) {
      newErrors[question.id] = question.errorMessage;
      isValid = false;
    } else {
      delete newErrors[question.id];
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      if (isLastQuestion) {
        handleSubmit();
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleTextChange = (id: string, value: string, dbField: string) => {
    setFormData({ ...formData, [dbField]: value });
    
    // Clear error if value is entered
    if (value && errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const handleSingleSelectChange = (id: string, value: string, dbField: string) => {
    setFormData({ ...formData, [dbField]: value });
    
    // Clear error if value is selected
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const handleMultiSelectChange = (id: string, value: string, checked: boolean, dbField: string) => {
    const currentValues = [...((formData[dbField] || []) as string[])];
    
    if (checked) {
      currentValues.push(value);
    } else {
      const index = currentValues.indexOf(value);
      if (index !== -1) {
        currentValues.splice(index, 1);
      }
    }
    
    setFormData({ ...formData, [dbField]: currentValues });
    
    // Clear error if at least one option is selected
    if (currentValues.length > 0 && errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLastQuestion) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentQuestion()) return;
    if (!userData) return;

    setIsSubmitting(true);
    
    try {
      // Extract user metadata (name) from Google auth
      const userMetadata = userData.user_metadata;
      const firstName = userMetadata?.full_name?.split(' ')[0] || '';
      const lastName = userMetadata?.full_name?.split(' ').slice(1).join(' ') || '';
      
      // For multi-select fields like interests, join array values into comma-separated string
      const preparedData: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          preparedData[key] = value.join(',');
        } else {
          preparedData[key] = value;
        }
      });
      
      // Save form data to database with user info from Google
      const { error } = await supabase
        .from('waitlist')
        .insert([
          { 
            email: userData.email,
            firstname: firstName,
            lastname: lastName,
            ...preparedData
          }
        ]);
        
      if (error) {
        console.error("Error submitting form:", error);
        return;
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show user info at the start of the form
  const renderUserInfo = () => {
    if (!userData) return null;
    
    const userMetadata = userData.user_metadata;
    const fullName = userMetadata?.full_name || 'User';
    const email = userData.email;
    
    return (
      <div className="mb-6 p-4 bg-white/50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{fullName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
          </div>
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{content.waitlistForm.successMessage.title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{content.waitlistForm.successMessage.description}</p>
      </div>
    );
  }

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'text':
        return (
          <motion.div variants={itemVariants}>
            <Label 
              htmlFor={currentQuestion.id} 
              className="block text-xl font-medium mb-4 text-gray-800 dark:text-gray-100"
            >
              {currentQuestion.label}
            </Label>
            <div className="relative">
              <Input
                id={currentQuestion.id}
                placeholder={currentQuestion.placeholder}
                value={formData[currentQuestion.dbField] as string || ''}
                onChange={(e) => handleTextChange(currentQuestion.id, e.target.value, currentQuestion.dbField)}
                onKeyDown={handleKeyDown}
                className="w-full p-4 pl-5 text-lg bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                ref={inputRef}
                autoFocus
              />
              {formData[currentQuestion.dbField] && (
                <motion.div 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 dark:text-purple-400"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </div>
            {currentQuestion.placeholder && (
              <motion.p 
                className="mt-2 text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.3 }}
              >
                {currentQuestion.placeholder}
              </motion.p>
            )}
          </motion.div>
        );
      
      case 'single-select':
        return (
          <motion.div variants={itemVariants}>
            <Label className="block text-xl font-medium mb-6 text-gray-800 dark:text-gray-100">
              {currentQuestion.label}
            </Label>
            <RadioGroup
              value={formData[currentQuestion.dbField] as string || ''}
              onValueChange={(value: string) => handleSingleSelectChange(currentQuestion.id, value, currentQuestion.dbField)}
              className="space-y-4 grid grid-cols-1 gap-3"
            >
              {currentQuestion.options?.map((option, idx) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    formData[currentQuestion.dbField] === option.id
                      ? 'ring-2 ring-purple-500 dark:ring-purple-400 ring-offset-2 dark:ring-offset-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/70'
                  }`}
                >
                  <label
                    htmlFor={`${currentQuestion.id}-${option.id}`}
                    className={`flex items-center w-full p-4 cursor-pointer ${
                      formData[currentQuestion.dbField] === option.id
                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30'
                        : 'bg-white/70 dark:bg-gray-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 mr-3 ${
                        formData[currentQuestion.dbField] === option.id
                          ? 'border-purple-500 dark:border-purple-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData[currentQuestion.dbField] === option.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-400"
                          />
                        )}
                      </div>
                      <RadioGroupItem 
                        value={option.id} 
                        id={`${currentQuestion.id}-${option.id}`}
                        className="sr-only"
                      />
                      <span className="font-medium text-lg">{option.label}</span>
                    </div>
                    
                    {formData[currentQuestion.dbField] === option.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto text-purple-600 dark:text-purple-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </label>
                  
                  {/* Animated highlight effect when selected */}
                  {formData[currentQuestion.dbField] === option.id && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              ))}
            </RadioGroup>
          </motion.div>
        );
      
      case 'multi-select':
        return (
          <motion.div variants={itemVariants}>
            <Label className="block text-xl font-medium mb-6 text-gray-800 dark:text-gray-100">
              {currentQuestion.label}
            </Label>
            <div className="space-y-4 grid grid-cols-1 gap-3">
              {currentQuestion.options?.map((option, idx) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    (formData[currentQuestion.dbField] as string[])?.includes(option.id)
                      ? 'ring-2 ring-purple-500 dark:ring-purple-400 ring-offset-2 dark:ring-offset-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/70'
                  }`}
                >
                  <label
                    htmlFor={`${currentQuestion.id}-${option.id}`}
                    className={`flex items-center w-full p-4 cursor-pointer ${
                      (formData[currentQuestion.dbField] as string[])?.includes(option.id)
                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30'
                        : 'bg-white/70 dark:bg-gray-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-md border-2 mr-3 ${
                        (formData[currentQuestion.dbField] as string[])?.includes(option.id)
                          ? 'border-purple-500 dark:border-purple-400 bg-purple-500 dark:bg-purple-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {(formData[currentQuestion.dbField] as string[])?.includes(option.id) && (
                          <motion.svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 text-white" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </motion.svg>
                        )}
                      </div>
                      <Checkbox
                        id={`${currentQuestion.id}-${option.id}`}
                        checked={(formData[currentQuestion.dbField] as string[])?.includes(option.id) || false}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange(currentQuestion.id, option.id, checked as boolean, currentQuestion.dbField)
                        }
                        className="sr-only"
                      />
                      <span className="font-medium text-lg">{option.label}</span>
                    </div>
                  </label>
                  
                  {/* Animated highlight effect when selected */}
                  {(formData[currentQuestion.dbField] as string[])?.includes(option.id) && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      ref={formRef}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{content.waitlistForm.formTitle}</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {renderUserInfo()}

      <div className="min-h-[200px] md:min-h-[240px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="py-4"
          >
            {renderQuestionContent()}
            {errors[currentQuestion?.id] && (
              <p className="mt-2 text-red-500 dark:text-red-400 text-sm">
                {errors[currentQuestion?.id]}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center gap-2 ${
            currentQuestionIndex === 0 ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        
        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2"
        >
          {isSubmitting ? (
            content.waitlistForm.loadingText
          ) : isLastQuestion ? (
            content.waitlistForm.submitButtonText
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 