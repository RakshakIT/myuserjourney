import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  FolderKanban,
  BarChart3,
  Shield,
  Zap,
  Settings,
} from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Create your account",
    description: "Sign up with Google, GitHub, Apple, or email. No credit card required to get started.",
    icon: Settings,
  },
  {
    step: 2,
    title: "Set up your first project",
    description: "Add your website details using the guided setup wizard. Configure your tracking preferences and privacy settings.",
    icon: FolderKanban,
  },
  {
    step: 3,
    title: "Install the tracking snippet",
    description: "Copy the auto-generated JavaScript snippet into your website. The snippet handles consent management and GDPR compliance automatically.",
    icon: Code2,
  },
  {
    step: 4,
    title: "Configure privacy settings",
    description: "Set up your consent banner, IP anonymisation rules, and data retention policies to comply with GDPR and PECR.",
    icon: Shield,
  },
  {
    step: 5,
    title: "Start analysing",
    description: "View real-time data on your dashboard. Explore acquisition channels, engagement metrics, and user journeys.",
    icon: BarChart3,
  },
];

export default function StartGuidePage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.startGuide.title} description={seoData.startGuide.description} keywords={seoData.startGuide.keywords} canonicalUrl="https://myuserjourney.co.uk/start-guide" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Start Guide</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Get started in minutes
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow these simple steps to set up My User Journey and start tracking your website analytics.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="space-y-6">
          {steps.map((s) => (
            <Card key={s.step} data-testid={`card-step-${s.step}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                    {s.step}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 space-y-4">
          <h2 className="text-2xl font-bold">Ready to begin?</h2>
          <a href="/login">
            <Button size="lg" data-testid="button-get-started">
              Create Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
