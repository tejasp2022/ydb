"use client";

import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FC } from "react";
import { Session } from '@supabase/supabase-js';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (): TimeLeft => {
  const launchDate = new Date('2025-04-09T00:00:00').getTime();
  const now = new Date().getTime();
  const difference = launchDate - now;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
};

const TimeUnit: FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="relative min-w-[80px] md:min-w-[120px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
    <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
      {value.toString().padStart(2, '0')}
    </div>
    <div className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
      {label}
    </div>
  </div>
);

export function WaitlistSection() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="animate-pulse">Loading...</div>
      </section>
    );
  }

  return (
    <section id="waitlist" className="min-h-screen relative flex items-center justify-center bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Get Exclusive Early Access to Your Daily Briefing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join our waitlist and get early access to personalized podcasts that match your interests.
          </p>
        </div>

        {session ? (
          <div className="max-w-md mx-auto backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <WaitlistForm />
          </div>
        ) : (
          <div className="max-w-md mx-auto backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
              Please sign in with Google to join our waitlist
            </p>
            <Button 
              onClick={handleSignIn}
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 flex items-center justify-center gap-3 h-12 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <Image
                src="/google-logo.svg"
                alt="Google logo"
                width={18}
                height={18}
              />
              Sign in with Google
            </Button>
          </div>
        )}
      </div>
    </section>
  );
} 