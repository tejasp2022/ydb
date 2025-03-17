declare module "@/data/content.json" {
  export interface HeroSection {
    launchDate: string;
    title: string;
    description: string;
    buttonText: string;
  }

  export interface CardDetailItem {
    icon: string;
    label: string;
    color: string;
  }

  export interface CardDetails {
    title: string;
    items: CardDetailItem[];
  }

  export interface Card {
    id: number;
    title: string;
    description: string;
    icon: string;
    details: CardDetails;
  }

  export interface HowItWorksSection {
    title: string;
    description: string;
    linkText: string;
    linkUrl: string;
    buttonText: string;
    cards: Card[];
  }

  export interface Node {
    id: string;
    icon: string;
  }

  export interface HubSpokeAnimation {
    hubIcon: string;
    contentNodes: Node[];
    outputNodes: Node[];
    techContentNodes: Node[];
    techOutputNodes: Node[];
  }

  export interface FormField {
    label: string;
    placeholder: string;
    error: string;
  }

  export interface Vocation {
    id: string;
    label: string;
  }

  export interface SuccessMessage {
    title: string;
    description: string;
  }

  export interface WaitlistForm {
    successMessage: SuccessMessage;
    loginMessage: string;
    loginButtonText: string;
    formTitle: string;
    submitButtonText: string;
    loadingText: string;
    vocations: Vocation[];
    vocationLabel: string;
    fields: {
      firstName: FormField;
      lastName: FormField;
    };
  }

  export interface FAQItem {
    question: string;
    answer: string;
  }

  export interface FAQSection {
    title: string;
    items: FAQItem[];
  }

  export interface Content {
    heroSection: HeroSection;
    howItWorksSection: HowItWorksSection;
    hubSpokeAnimation: HubSpokeAnimation;
    waitlistForm: WaitlistForm;
    faqSection: FAQSection;
  }

  const content: Content;
  export default content;
} 