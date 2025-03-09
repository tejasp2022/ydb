"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  features: z.array(z.string()).min(1, "Select at least one feature"),
});

const features = [
  { id: "customization", label: "Content Customization" },
  { id: "offline", label: "Offline Listening" },
  { id: "sharing", label: "Social Sharing" },
  { id: "transcripts", label: "AI Transcripts" },
];

export function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const supabase = createClientComponentClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      features: [],
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist").insert([
        {
          name: data.name,
          email: data.email,
          desired_features: data.features,
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

  if (submitSuccess) {
    return (
      <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Thank you for signing up!</h3>
        <p className="text-gray-600 dark:text-gray-300">
          We'll notify you when MorningMo launches.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-md mx-auto space-y-6"
    >
      <div>
        <Input
          placeholder="Your name"
          {...form.register("name")}
          className="mb-2"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="email"
          placeholder="Your email"
          {...form.register("email")}
          className="mb-2"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <p className="font-medium">Which features interest you?</p>
        {features.map((feature) => (
          <div key={feature.id} className="flex items-center space-x-2">
            <Checkbox
              id={feature.id}
              {...form.register("features")}
              value={feature.id}
            />
            <label htmlFor={feature.id} className="text-sm">
              {feature.label}
            </label>
          </div>
        ))}
        {form.formState.errors.features && (
          <p className="text-sm text-red-500">
            {form.formState.errors.features.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing up..." : "Join Waitlist"}
      </Button>
    </form>
  );
} 