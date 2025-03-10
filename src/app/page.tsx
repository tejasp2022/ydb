import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { WaitlistSection } from "@/components/sections/WaitlistSection";
import FAQSection from '@/components/sections/FAQSection';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <WaitlistSection />
      <FAQSection />
    </main>
  );
}
