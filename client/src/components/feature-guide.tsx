import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, ChevronLeft, Lightbulb, Sparkles } from "lucide-react";

interface GuideStep {
  title: string;
  description: string;
  tip?: string;
}

interface FeatureGuideProps {
  featureKey: string;
  title: string;
  steps: GuideStep[];
}

const DISMISSED_GUIDES_KEY = "myuj_dismissed_guides";

function getDismissedGuides(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_GUIDES_KEY) || "[]");
  } catch {
    return [];
  }
}

function dismissGuide(key: string) {
  const dismissed = getDismissedGuides();
  if (!dismissed.includes(key)) {
    dismissed.push(key);
    localStorage.setItem(DISMISSED_GUIDES_KEY, JSON.stringify(dismissed));
  }
}

export function FeatureGuide({ featureKey, title, steps }: FeatureGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = getDismissedGuides();
    if (!dismissed.includes(featureKey)) {
      setVisible(true);
    }
  }, [featureKey]);

  if (!visible) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleDismiss = () => {
    dismissGuide(featureKey);
    setVisible(false);
  };

  const handleNext = () => {
    if (isLast) {
      handleDismiss();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <Card className="border-primary/30 bg-primary/5 mb-6" data-testid={`guide-${featureKey}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 mt-0.5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold" data-testid="text-guide-title">{title}</h3>
                <Badge variant="secondary" className="text-xs">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>
              <h4 className="text-sm font-medium">{step.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              {step.tip && (
                <div className="flex items-start gap-2 mt-2 p-2.5 rounded-md bg-background/80">
                  <Lightbulb className="h-3.5 w-3.5 text-chart-4 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{step.tip}</p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                {!isFirst && (
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(currentStep - 1)} data-testid="button-guide-prev">
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={handleNext} data-testid="button-guide-next">
                  {isLast ? "Got it!" : "Next"}
                  {!isLast && <ChevronRight className="h-3.5 w-3.5 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="shrink-0" data-testid="button-guide-dismiss">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const GUIDE_CONFIGS = {
  dashboard: {
    featureKey: "dashboard",
    title: "Welcome to your Dashboard",
    steps: [
      {
        title: "Overview at a glance",
        description: "Your dashboard shows key metrics like page views, unique visitors, sessions, and events. Use the period selector at the top right to change the time range.",
        tip: "Try switching between 'Last 7 Days' and 'Last 30 Days' to spot trends.",
      },
      {
        title: "Comparison stats",
        description: "Each stat card shows the percentage change compared to the previous period. Green means growth, red means decline.",
        tip: "Click the calendar icon to set a custom date range for more specific analysis.",
      },
      {
        title: "Charts and breakdowns",
        description: "Scroll down to see traffic trends over time, device breakdowns, top pages, and traffic sources. You can export this data using the export button.",
      },
    ],
  },
  realtime: {
    featureKey: "realtime",
    title: "Realtime Analytics",
    steps: [
      {
        title: "Live activity monitoring",
        description: "See active users on your site right now. The data updates automatically every few seconds.",
        tip: "Use this to monitor the impact of campaigns or content launches in real-time.",
      },
      {
        title: "Per-minute breakdown",
        description: "The activity chart shows user activity minute by minute, helping you identify peak usage times.",
      },
    ],
  },
  acquisition: {
    featureKey: "acquisition",
    title: "Acquisition Analytics",
    steps: [
      {
        title: "Where your users come from",
        description: "Acquisition analytics shows how visitors find your website — through search engines, social media, direct visits, referrals, or paid campaigns.",
        tip: "Focus on channels with high conversion rates rather than just traffic volume.",
      },
      {
        title: "Traffic source breakdown",
        description: "The pie chart and table show the proportion of traffic from each source. Click on a source type to drill deeper.",
      },
    ],
  },
  events: {
    featureKey: "events",
    title: "Live Events Stream",
    steps: [
      {
        title: "Real-time event feed",
        description: "Every user interaction — page views, clicks, scrolls — appears here as it happens. Use the filters to narrow down specific event types.",
        tip: "Filter by event type to focus on specific user actions like form submissions or button clicks.",
      },
    ],
  },
  funnels: {
    featureKey: "funnels",
    title: "Funnel Explorer",
    steps: [
      {
        title: "Track conversion paths",
        description: "Create funnels to visualise how users move through key steps on your site. See where they drop off and optimise those steps.",
        tip: "Start with simple 3-step funnels (e.g., Landing Page > Sign Up > Dashboard) before creating complex ones.",
      },
      {
        title: "Drop-off analysis",
        description: "The funnel chart shows conversion rates between each step. Focus on steps with the biggest drop-offs for the highest impact improvements.",
      },
    ],
  },
  journeys: {
    featureKey: "journeys",
    title: "User Journeys",
    steps: [
      {
        title: "Session replay & timelines",
        description: "Reconstruct individual user sessions to understand exactly how visitors navigate your site. See the sequence of pages they visited and actions they took.",
        tip: "Look for common patterns in high-converting sessions to understand what works.",
      },
    ],
  },
  privacy: {
    featureKey: "privacy",
    title: "Privacy & GDPR Settings",
    steps: [
      {
        title: "Configure compliance settings",
        description: "Set up your privacy preferences including consent management, IP anonymization, Do Not Track support, and cookieless tracking mode.",
        tip: "Enable IP anonymization and DNT support for maximum privacy compliance across all regions.",
      },
      {
        title: "Data subject requests",
        description: "Handle Right to Erasure and Data Portability requests from this panel. You can search for visitors and process their data requests.",
      },
    ],
  },
  ai: {
    featureKey: "ai",
    title: "AI Copilot",
    steps: [
      {
        title: "Ask questions in natural language",
        description: "Type any analytics question and the AI will analyse your data and provide insights. Try asking things like 'What are my top traffic sources this week?'",
        tip: "Be specific with your questions for better results. Include time ranges and metrics you care about.",
      },
    ],
  },
  seo: {
    featureKey: "seo",
    title: "SEO Analysis",
    steps: [
      {
        title: "Audit your site's SEO health",
        description: "Enter a URL to scan for SEO issues including missing titles, meta descriptions, broken links, and more. Get actionable recommendations to improve your search rankings.",
        tip: "Start by auditing your homepage, then move to your most important landing pages.",
      },
    ],
  },
  admin: {
    featureKey: "admin",
    title: "Admin Panel",
    steps: [
      {
        title: "Manage your platform",
        description: "The admin panel lets you configure site settings, SMTP email, CMS pages, file uploads, user management, contact submissions, tracking codes, and payment gateways.",
        tip: "Start with Site Settings to set your branding, then configure SMTP for email notifications.",
      },
      {
        title: "CMS Pages",
        description: "Create and publish dynamic pages that appear on your public site. Each page has its own URL, SEO metadata, and content.",
      },
      {
        title: "Payment Gateways",
        description: "Configure Stripe and/or PayPal to accept payments. Set your API keys and webhook secrets in the Payment Gateways tab.",
      },
    ],
  },
};
