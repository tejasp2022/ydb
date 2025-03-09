import { WaitlistForm } from "@/components/WaitlistForm";

export function WaitlistSection() {
  return (
    <section id="waitlist" className="h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Be the First to Experience Mornings With Mo
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Join our waitlist and get early access to personalized podcasts that match your interests.
          </p>
        </div>
        <WaitlistForm />
      </div>
    </section>
  );
} 