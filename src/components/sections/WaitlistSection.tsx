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
    <section id="waitlist" className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 dark:opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="text-purple-300 dark:text-purple-900">
            <path fill="currentColor" fillOpacity="1" d="M0,192L48,186.7C96,181,192,171,288,186.7C384,203,480,245,576,250.7C672,256,768,224,864,224C960,224,1056,256,1152,240C1248,224,1344,160,1392,128L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-full opacity-20 dark:opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="text-blue-300 dark:text-blue-900">
            <path fill="currentColor" fillOpacity="1" d="M0,192L48,213.3C96,235,192,277,288,277.3C384,277,480,235,576,213.3C672,192,768,192,864,176C960,160,1056,128,1152,138.7C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="container px-4 md:px-8 mx-auto relative z-10 w-full max-w-[1400px]">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Get Exclusive Early Access to Your Daily Briefing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join our waitlist and get early access to personalized podcasts that match your interests.
          </p>
        </div>

        {session ? (
          <div className="w-full max-w-6xl mx-auto">
            <WaitlistForm />
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
              Please sign in with Google to join our waitlist
            </p>
            <Button 
              onClick={handleSignIn}
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 flex items-center justify-center gap-3 h-14 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md text-lg"
            >
              <Image
                src="/google-logo.svg"
                alt="Google logo"
                width={20}
                height={20}
              />
              Sign in with Google
            </Button>
          </div>
        )}
      </div>
    </section>
  );
} 