import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, HelpCircle, Zap, BarChart3, Shield, CreditCard } from "lucide-react";

const features = [
  "Unlimited projects",
  "Real-time analytics dashboard",
  "AI-powered insights & copilot",
  "Predictive analytics",
  "UX auditor",
  "Marketing copilot",
  "Content gap analysis",
  "Site research",
  "Custom reports & funnels",
  "SEO analysis & site audit",
  "PPC campaign management",
  "Full GDPR/PECR compliance",
  "Consent management",
  "CSV/JSON data export",
  "Custom event tracking",
  "User journey replay",
];

const howItWorks = [
  {
    icon: Zap,
    title: "Use AI features freely",
    description: "All AI features are included. Use AI insights, copilot, predictive analytics, UX auditor, and more with no per-feature charges.",
  },
  {
    icon: BarChart3,
    title: "Track your usage",
    description: "Monitor your AI usage in real-time from your dashboard. See exactly how much each feature costs with full transparency.",
  },
  {
    icon: CreditCard,
    title: "Pay only when you exceed \u00a310",
    description: "We only invoice when your monthly AI usage exceeds \u00a310. You'll receive a detailed invoice via Stripe with a full breakdown.",
  },
  {
    icon: Shield,
    title: "No surprises",
    description: "Analytics tracking, dashboards, reports, and compliance features are always free. You only pay for AI-powered features based on actual usage.",
  },
];

const faqs = [
  { q: "What exactly do I pay for?", a: "You only pay for AI-powered features like AI Insights, Predictive Analytics, UX Auditor, Marketing Copilot, Content Gap Analysis, and Site Research. Core analytics, dashboards, tracking, and compliance features are always free." },
  { q: "How does the \u00a310 threshold work?", a: "We track your AI usage throughout each calendar month. If your total usage stays under \u00a310, there's nothing to pay. Once it exceeds \u00a310, we send a Stripe invoice for the full amount at month-end." },
  { q: "How much does each AI request cost?", a: "AI requests typically cost fractions of a penny each. Most users make hundreds of requests before reaching the \u00a310 threshold. You can monitor your exact usage in real-time from your dashboard." },
  { q: "Can I set a spending limit?", a: "You can monitor your usage at any time from your dashboard. We're working on configurable spending alerts and limits for a future update." },
  { q: "Do I need to provide a credit card upfront?", a: "No. You can start using the platform immediately with no payment details required. We'll only ask for payment information if your usage exceeds the \u00a310 threshold." },
  { q: "Is it GDPR compliant?", a: "Absolutely. My User Journey is built from the ground up for UK GDPR, EU GDPR, PECR, and ePrivacy compliance with consent management, IP anonymisation, and cookieless tracking." },
  { q: "What if I only use basic analytics?", a: "Then it's completely free. Core analytics features including real-time dashboards, traffic analysis, custom reports, and compliance tools have no usage charges." },
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.pricing.title} description={seoData.pricing.description} keywords={seoData.pricing.keywords} canonicalUrl="https://myuserjourney.co.uk/pricing" jsonLd={seoData.pricing.jsonLd} />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Pricing</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Pay as you go
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Core analytics is free. AI-powered features are billed based on actual usage.
              We only invoice when you exceed {"\u00a3"}10 per month.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <Card data-testid="card-plan-free">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Core Analytics</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{"\u00a3"}0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Always free, no limits</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-4">
              <ul className="space-y-3">
                {["Unlimited projects", "Real-time analytics", "Custom reports & funnels", "Traffic & page analysis", "Geography & device stats", "Full GDPR/PECR compliance", "Consent management", "CSV/JSON export", "User journey replay"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="/login">
                <Button className="w-full" size="lg" variant="outline" data-testid="button-get-started-free">
                  Get Started Free
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="border-primary" data-testid="card-plan-payg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge>Pay As You Go</Badge>
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">AI-Powered Features</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">Usage-based</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Invoiced via Stripe when exceeding {"\u00a3"}10/month
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-4">
              <ul className="space-y-3">
                {["Everything in Core Analytics", "AI Insights & chat assistant", "Predictive analytics", "AI UX Auditor", "AI Marketing Copilot", "Content gap analysis", "AI Site Research", "AI funnel generation", "AI report generation"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="/login">
                <Button className="w-full" size="lg" data-testid="button-get-started-payg">
                  Start Using AI Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8" data-testid="text-how-it-works">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <Card key={i} data-testid={`card-how-${i}`}>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-4" data-testid="text-features-title">
            Everything included
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            All these features are available to every user. No tiers, no feature gating.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm p-2">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8" data-testid="text-faq-title">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} data-testid={`card-faq-${i}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{faq.q}</p>
                      <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
