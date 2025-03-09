import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { WaitlistSection } from "@/components/sections/WaitlistSection";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <WaitlistSection />
    </main>
  );
}
