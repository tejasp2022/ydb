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

const formSchema = z.object({
  vocation: z.string().min(1, "Please select your vocation"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
});

const vocations = [
  { id: "student", label: "Student" },
  { id: "academic", label: "Academic" },
  { id: "professional", label: "Professional" },
  { id: "other", label: "Other" },
];

export function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsNameInput, setNeedsNameInput] = useState(false);
  const supabase = createClientComponentClient();

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
      
      // Get first and last name from form data
      const { firstName, lastName, vocation } = data;

      // Ensure we have first and last name
      if (!firstName || !lastName) {
        throw new Error("First name and last name are required");
      }

      console.log('Submitting:', email, firstName, lastName, vocation);

      const { error } = await supabase.from("waitlist").insert([
        {
          email: email,
          firstname: firstName,
          lastname: lastName,
          vocation: vocation,
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Show login button if user is not authenticated
  if (!session) {
    return (
      <div className="text-center">
        <p className="mb-4">Please sign in with Google to join the waitlist</p>
        <Button
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                },
              },
            })
          }}
          className="w-full"
        >
          Sign in with Google
        </Button>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Thank you for signing up!</h3>
        <p className="text-gray-600 dark:text-gray-300">
          We&apos;ll notify you when Your Daily Briefing launches.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-md mx-auto space-y-6"
    >
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Signed in as: {session.user.email}
          </p>
        </div>

        {needsNameInput && (
          <>
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium">
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                {...form.register("firstName")}
                placeholder="Your first name"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                {...form.register("lastName")}
                placeholder="Your last name"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </>
        )}

        <p className="font-medium">What best describes you?</p>
        {vocations.map((vocation) => (
          <div key={vocation.id} className="flex items-center space-x-2">
            <Checkbox
              id={vocation.id}
              {...form.register("vocation")}
              value={vocation.id}
              onCheckedChange={(checked) => {
                if (checked) {
                  form.setValue("vocation", vocation.id);
                }
              }}
              checked={form.watch("vocation") === vocation.id}
            />
            <label htmlFor={vocation.id} className="text-sm">
              {vocation.label}
            </label>
          </div>
        ))}
        {form.formState.errors.vocation && (
          <p className="text-sm text-red-500">
            {form.formState.errors.vocation.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing up..." : "Join Waitlist"}
      </Button>
    </form>
  );
} 