"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react";
import { Session } from '@supabase/supabase-js';
import content from "@/data/content.json";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, User, Mail, Briefcase, BookOpen, Clock } from "lucide-react";

// Create schema dynamically based on questions
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(), 
  vocation: z.string().min(1, "Please select your vocation"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  podcastLength: z.string().min(1, "Please select preferred podcast length"),
});

export function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsNameInput, setNeedsNameInput] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const supabase = createClientComponentClient();
  // Get questions for easy reference
  const questions = content.waitlistForm?.questions as Question[];

  useEffect(() => {
    // Only run auth check on the client side
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      // Check if we have user metadata with full name
      if (data.session?.user?.user_metadata) {
        const metadata = data.session.user.user_metadata;
        console.log('USER METADATA', metadata);
        
        // Try to extract first and last name from full_name
        if (metadata.full_name) {
          const nameParts = metadata.full_name.split(' ');
          // If we can split the name into at least 2 parts
          if (nameParts.length > 1) {
            // Pre-fill the form with extracted names
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            form.setValue('firstName', firstName);
            form.setValue('lastName', lastName);
            setNeedsNameInput(false);
          } else {
            // Can't properly split the name, need manual input
            setNeedsNameInput(true);
          }
        } else {
          // No full_name available
          setNeedsNameInput(true);
        }
      } else {
        setNeedsNameInput(true);
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vocation: "",
      firstName: "",
      lastName: "",
      interests: [],
      podcastLength: "",
    },
  });

  useEffect(() => {
    // When session changes and we need name input, check for existing values
    if (needsNameInput && session?.user?.email) {
      // Set the email if not a controlled field in the form schema
      // form.setValue("email", session.user.email);
    }
  }, [needsNameInput, session, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!session?.user) {
      console.error("No user session found");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get email from session
      const email = session.user.email;
      
      // Get form data
      const { firstName, lastName, vocation, interests, podcastLength } = data;

      // Ensure we have first and last name
      if (!firstName || !lastName) {
        throw new Error("First name and last name are required");
      }

      console.log('Submitting:', email, firstName, lastName, vocation, interests, podcastLength);

      const { error } = await supabase.from("waitlist").insert([
        {
          email: email,
          firstname: firstName,
          lastname: lastName,
          vocation: vocation,
          interests: interests,
          podcast_length: podcastLength,
        },
      ]);

      if (error) throw error;
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 0 && needsNameInput) {
      form.trigger("firstName").then(isValid => {
        if (isValid) setCurrentStep(prev => prev + 1);
      });
    } else if (currentStep === 1 && needsNameInput) {
      form.trigger("lastName").then(isValid => {
        if (isValid) setCurrentStep(prev => prev + 1);
      });
    } else if (currentStep === (needsNameInput ? 2 : 0)) {
      form.trigger("vocation").then(isValid => {
        if (isValid) {
          if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
          } else {
            setCurrentStep(prev => prev + 1);
          }
        }
      });
    } else if (currentStep === (needsNameInput ? 3 : 1)) {
      form.trigger("interests").then(isValid => {
        if (isValid) {
          if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
          } else {
            setCurrentStep(prev => prev + 1);
          }
        }
      });
    } else if (currentStep === (needsNameInput ? 4 : 2)) {
      form.trigger("podcastLength").then(isValid => {
        if (isValid) {
          if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
          } else {
            setCurrentStep(prev => prev + 1);
          }
        }
      });
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Calculate total steps
  const totalSteps = needsNameInput ? 5 : 3;
  
  // Calculate progress percentage
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Helper function to get the user's first name
  const getUserFirstName = () => {
    // First try to get it from form data if user already entered it
    const formFirstName = form.watch("firstName");
    if (formFirstName) return formFirstName;
    
    // Then try to get it from session metadata
    if (session?.user?.user_metadata?.full_name) {
      const fullName = session.user.user_metadata.full_name;
      return fullName.split(' ')[0]; // Get first part of the name
    }
    
    // If no name is found, try to get first part of email
    if (session?.user?.email) {
      return session.user.email.split('@')[0];
    }
    
    // Fallback
    return "there";
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  // Show login button if user is not authenticated
  if (!session) {
    return (
      <div className="text-center p-12 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-10 text-xl">{content.waitlistForm.loginMessage}</p>
          <Button
            onClick={async () => {
              const redirectUrl = `${window.location.origin}/auth/callback`;
              console.log("Redirect URL:", redirectUrl);
              
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: redirectUrl,
                  queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                  },
                },
              })
            }}
            size="lg"
            className="w-full py-8 text-xl"
          >
            {content.waitlistForm.loginButtonText}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-5">
            <Check className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>
        <h3 className="text-3xl font-semibold mb-5">{content.waitlistForm.successMessage.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-xl">
          {content.waitlistForm.successMessage.description}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-700 h-2">
        <motion.div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div className="p-6 md:p-10">
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-5 border border-blue-100 dark:border-blue-800/30">
          <p className="text-lg text-gray-700 dark:text-gray-100 font-medium flex items-center gap-2">
            <span className="flex-shrink-0 bg-blue-100 dark:bg-blue-800/50 p-2 rounded-full">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </span>
            Hey {getUserFirstName()} 👋, help us get to know you better
          </p>
        </div>
        
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-10 min-h-[400px] flex flex-col"
        >
          <div className="flex-grow relative min-h-[300px] flex items-center justify-center py-6">
            <AnimatePresence mode="wait">
              {needsNameInput && currentStep === 0 && (
                <motion.div
                  key="firstName"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-full max-w-2xl mx-auto"
                >
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {questions[0].label}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">We&apos;ll use this to personalize your experience</p>
                  
                  <div className="relative">
                    <Input
                      id="firstName"
                      type="text"
                      {...form.register("firstName")}
                      placeholder={questions[0].placeholder}
                      className="text-xl p-6 pl-12 h-auto rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          nextStep();
                        }
                      }}
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  
                  {form.formState.errors.firstName && (
                    <p className="text-base text-red-500 mt-3">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </motion.div>
              )}

              {needsNameInput && currentStep === 1 && (
                <motion.div
                  key="lastName"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-full max-w-2xl mx-auto"
                >
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {questions[1].label}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">This helps us create a more personal experience</p>
                  
                  <div className="relative">
                    <Input
                      id="lastName"
                      type="text"
                      {...form.register("lastName")}
                      placeholder={questions[1].placeholder}
                      className="text-xl p-6 pl-12 h-auto rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          nextStep();
                        }
                      }}
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  
                  {form.formState.errors.lastName && (
                    <p className="text-base text-red-500 mt-3">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </motion.div>
              )}

              {currentStep === (needsNameInput ? 2 : 0) && (
                <motion.div
                  key="vocation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-full mx-auto"
                >
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {questions[2].label}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">This helps us tailor content to your professional context</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions[2]?.options?.map((vocation: { id: string; label: string }) => (
                      <motion.div 
                        key={vocation.id} 
                        className={`flex items-center border-2 rounded-xl cursor-pointer p-5 transition-all
                          ${form.watch("vocation") === vocation.id 
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"}`}
                        whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          form.setValue("vocation", vocation.id);
                          setTimeout(nextStep, 300);
                        }}
                      >
                        <div className={`rounded-full p-2 mr-4 
                          ${form.watch("vocation") === vocation.id 
                            ? "bg-blue-100 dark:bg-blue-800/50" 
                            : "bg-gray-100 dark:bg-gray-800"}`}>
                          <Briefcase className={`w-5 h-5 
                            ${form.watch("vocation") === vocation.id 
                              ? "text-blue-600 dark:text-blue-400" 
                              : "text-gray-500 dark:text-gray-400"}`} />
                        </div>
                        <div className="flex-1">
                          <label htmlFor={vocation.id} className="block text-lg font-medium">
                            {vocation.label}
                          </label>
                        </div>
                        <Checkbox
                          id={vocation.id}
                          {...form.register("vocation")}
                          value={vocation.id}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              form.setValue("vocation", vocation.id);
                              setTimeout(nextStep, 300);
                            }
                          }}
                          checked={form.watch("vocation") === vocation.id}
                          className="h-5 w-5"
                        />
                      </motion.div>
                    )) || []}
                  </div>
                  {form.formState.errors.vocation && (
                    <p className="text-sm text-red-500 mt-2">
                      {form.formState.errors.vocation.message}
                    </p>
                  )}
                </motion.div>
              )}

              {currentStep === (needsNameInput ? 3 : 1) && (
                <motion.div
                  key="interests"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-full mx-auto"
                >
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {questions[3].label}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Select topics you&apos;d like to hear about in your daily briefing</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {questions[3]?.options?.map((interest: { id: string; label: string }) => (
                      <motion.div 
                        key={interest.id} 
                        className={`flex items-center border-2 rounded-xl cursor-pointer p-5 transition-all
                          ${(form.watch("interests") || []).includes(interest.id)
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                            : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"}`}
                        whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const currentInterests = form.watch("interests") || [];
                          const isSelected = currentInterests.includes(interest.id);
                          
                          if (isSelected) {
                            form.setValue(
                              "interests",
                              currentInterests.filter((id) => id !== interest.id)
                            );
                          } else {
                            form.setValue("interests", [...currentInterests, interest.id]);
                          }
                        }}
                      >
                        <div className={`rounded-full p-2 mr-4 
                          ${(form.watch("interests") || []).includes(interest.id) 
                            ? "bg-purple-100 dark:bg-purple-800/50" 
                            : "bg-gray-100 dark:bg-gray-800"}`}>
                          <BookOpen className={`w-5 h-5 
                            ${(form.watch("interests") || []).includes(interest.id) 
                              ? "text-purple-600 dark:text-purple-400" 
                              : "text-gray-500 dark:text-gray-400"}`} />
                        </div>
                        <div className="flex-1">
                          <label htmlFor={`interest-${interest.id}`} className="block text-lg font-medium">
                            {interest.label}
                          </label>
                        </div>
                        <Checkbox
                          id={`interest-${interest.id}`}
                          value={interest.id}
                          onCheckedChange={(checked) => {
                            const currentInterests = form.watch("interests") || [];
                            
                            if (checked) {
                              form.setValue("interests", [...currentInterests, interest.id]);
                            } else {
                              form.setValue(
                                "interests",
                                currentInterests.filter((id) => id !== interest.id)
                              );
                            }
                          }}
                          checked={(form.watch("interests") || []).includes(interest.id)}
                          className="h-5 w-5"
                        />
                      </motion.div>
                    )) || []}
                  </div>
                  
                  {form.formState.errors.interests && (
                    <p className="text-sm text-red-500 mt-2">
                      {form.formState.errors.interests.message?.toString()}
                    </p>
                  )}
                  
                  {form.watch("interests")?.length > 0 && (
                    <Button
                      type="button"
                      className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 px-8 rounded-xl text-lg font-medium transition-all"
                      onClick={nextStep}
                    >
                      Continue
                    </Button>
                  )}
                </motion.div>
              )}

              {currentStep === (needsNameInput ? 4 : 2) && (
                <motion.div
                  key="podcastLength"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-full mx-auto"
                >
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {questions[4].label}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Choose the length that fits best into your daily routine</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {questions[4]?.options?.map((option: { id: string; label: string }) => (
                      <motion.div 
                        key={option.id} 
                        className={`flex items-center border-2 rounded-xl cursor-pointer p-5 transition-all
                          ${form.watch("podcastLength") === option.id 
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"}`}
                        whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          form.setValue("podcastLength", option.id);
                          setTimeout(nextStep, 300);
                        }}
                      >
                        <div className={`rounded-full p-2 mr-4 
                          ${form.watch("podcastLength") === option.id 
                            ? "bg-blue-100 dark:bg-blue-800/50" 
                            : "bg-gray-100 dark:bg-gray-800"}`}>
                          <Clock className={`w-5 h-5 
                            ${form.watch("podcastLength") === option.id 
                              ? "text-blue-600 dark:text-blue-400" 
                              : "text-gray-500 dark:text-gray-400"}`} />
                        </div>
                        <div className="flex-1">
                          <label htmlFor={`length-${option.id}`} className="block text-lg font-medium">
                            {option.label}
                          </label>
                        </div>
                        <Checkbox
                          id={`length-${option.id}`}
                          {...form.register("podcastLength")}
                          value={option.id}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              form.setValue("podcastLength", option.id);
                              setTimeout(nextStep, 300);
                            }
                          }}
                          checked={form.watch("podcastLength") === option.id}
                          className="h-5 w-5"
                        />
                      </motion.div>
                    )) || []}
                  </div>
                  {form.formState.errors.podcastLength && (
                    <p className="text-sm text-red-500 mt-2">
                      {form.formState.errors.podcastLength.message}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between mt-6">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex items-center gap-2 py-6 px-8 rounded-xl text-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Button>
            )}
            
            {currentStep < totalSteps - 1 ? (
              <Button
                type="button"
                className="ml-auto flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 px-8 rounded-xl text-lg font-medium"
                onClick={nextStep}
                disabled={
                  (currentStep === (needsNameInput ? 3 : 1) && 
                   (!form.watch("interests") || form.watch("interests").length === 0))
                }
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 px-8 rounded-xl text-lg font-medium" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-pulse mr-2">⏳</span>
                    {content.waitlistForm.loadingText}
                  </>
                ) : (
                  content.waitlistForm.submitButtonText
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 