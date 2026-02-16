import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar, PublicFooter } from "@/components/public-navbar";
import {
  BarChart3,
  Shield,
  Zap,
  Globe,
  LineChart,
  Bot,
  Search,
  Target,
  Check,
  ArrowRight,
  Users,
  TrendingUp,
  Eye,
} from "lucide-react";

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={seoData.landing.title} description={seoData.landing.description} keywords={seoData.landing.keywords} canonicalUrl="https://myuserjourney.co.uk/landing" jsonLd={seoData.landing.jsonLd} />
      <PublicNavbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="text-xs">
              Privacy-First Analytics Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
              Understand your users.
              <br />
              <span className="text-primary">Grow your business.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-description">
              Self-hosted, AI-powered analytics with real-time tracking, SEO analysis, and PPC campaign management. Fully GDPR and PECR compliant.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/login">
                <Button size="lg" data-testid="button-hero-signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" data-testid="button-hero-features">
                  See Features
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                GDPR Compliant
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                Real-time Data
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4 text-primary" />
                Self-hosted
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">&lt;50ms</div>
              <div className="text-sm text-muted-foreground mt-1">Avg Response</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Data Ownership</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground mt-1">Third-party Cookies</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold" data-testid="text-features-title">Everything you need to grow</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Comprehensive analytics, SEO tools, and AI-powered insights in one platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: LineChart, title: "Real-time Analytics", desc: "Monitor active users, page views, and conversions as they happen with per-minute granularity." },
              { icon: Users, title: "User Journey Replay", desc: "Reconstruct individual user sessions to understand exactly how visitors interact with your site." },
              { icon: TrendingUp, title: "Acquisition Analysis", desc: "Detailed traffic source breakdown including Direct, Organic Search, Paid Search, Display, and Cross-network channels." },
              { icon: Bot, title: "AI Copilot", desc: "Ask questions about your data in natural language and get instant, actionable insights powered by AI." },
              { icon: Search, title: "SEO Analysis", desc: "Comprehensive site audits with issue detection, scoring, and recommendations for better rankings." },
              { icon: Target, title: "PPC Management", desc: "Track and optimise your paid campaigns across Google, Facebook, LinkedIn, and more." },
              { icon: Shield, title: "GDPR Compliant", desc: "Full UK GDPR, PECR, EU GDPR, and ePrivacy compliance with consent management built in." },
              { icon: Eye, title: "Funnel Exploration", desc: "Create multi-step funnels to visualise conversion paths and identify drop-off points." },
              { icon: Globe, title: "Multi-project Support", desc: "Manage analytics for multiple websites and applications from a single dashboard." },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="hover-elevate" data-testid={`card-feature-${title.toLowerCase().replace(/\s/g, '-')}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold" data-testid="text-pricing-title">Free to use. Pay only for AI.</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              All core analytics features are completely free. AI-powered features are billed on a pay-as-you-go basis.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card data-testid="card-plan-free">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">Core Analytics</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Free</span>
                  <span className="text-muted-foreground"> forever</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Unlimited projects
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 pt-4">
                <ul className="space-y-3">
                  {[
                    "Unlimited Projects",
                    "Real-time Dashboard",
                    "Traffic & Source Analysis",
                    "User Journey Tracking",
                    "Custom Events & Funnels",
                    "SEO Site Audit",
                    "Custom Reports",
                    "CSV/JSON Export",
                    "Full GDPR Compliance",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button className="w-full" size="lg" data-testid="button-get-started-free">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary" data-testid="card-plan-ai">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  <Badge>Pay As You Go</Badge>
                </div>
                <CardTitle className="text-lg">AI-Powered Features</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Usage-based</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Only pay for what you use
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 pt-4">
                <ul className="space-y-3">
                  {[
                    "AI Copilot Chat",
                    "Predictive Analytics",
                    "AI UX Auditor",
                    "AI Marketing Copilot",
                    "AI Funnel Generation",
                    "AI Report Insights",
                    "Content Gap Analysis",
                    "Site Research",
                    "Invoice at $10 usage",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full" size="lg" data-testid="button-view-pricing">
                    View Pricing Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold">Ready to take control of your analytics?</h2>
          <p className="text-muted-foreground max-w-lg">
            Join businesses that trust My User Journey for privacy-first, AI-powered analytics.
          </p>
          <Link href="/login" className="mt-2">
            <Button size="lg" data-testid="button-cta-signup">
              Create Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
