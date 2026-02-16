import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  LineChart,
  Target,
  ShoppingCart,
  Globe,
  ArrowRight,
  Megaphone,
  Layers,
  Shield,
  TrendingUp,
  Search,
} from "lucide-react";

const useCases = [
  {
    id: "marketing",
    title: "Marketing Teams",
    description: "Track campaign performance, measure ROI, and optimise your marketing spend across all channels.",
    icon: Megaphone,
    features: [
      "Multi-channel campaign tracking with UTM support",
      "Real-time conversion and goal monitoring",
      "Traffic source attribution and analysis",
      "PPC campaign management and budget optimisation",
      "AI-powered marketing recommendations",
    ],
  },
  {
    id: "product",
    title: "Product Teams",
    description: "Understand user behaviour, identify friction points, and make data-driven product decisions.",
    icon: Layers,
    features: [
      "User journey replay and session analysis",
      "Funnel exploration with drop-off visualisation",
      "Custom event tracking for feature usage",
      "Engagement metrics and retention analysis",
      "AI UX auditor for experience optimisation",
    ],
  },
  {
    id: "agencies",
    title: "Agencies",
    description: "Manage analytics across multiple clients from a single dashboard with white-label reporting.",
    icon: Globe,
    features: [
      "Multi-project support with project switching",
      "Custom report builder with client branding",
      "Automated reporting and data export",
      "Role-based access control",
      "Unified dashboard for all client sites",
    ],
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    description: "Track purchase journeys, optimise conversion funnels, and increase revenue per visitor.",
    icon: ShoppingCart,
    features: [
      "Purchase journey tracking and analysis",
      "Transaction monitoring and revenue metrics",
      "Cart abandonment funnel analysis",
      "Product page performance insights",
      "Predictive analytics for revenue forecasting",
    ],
  },
  {
    id: "compliance",
    title: "Privacy-First Companies",
    description: "Full GDPR, PECR, and ePrivacy compliance without sacrificing analytics depth.",
    icon: Shield,
    features: [
      "Cookieless tracking mode available",
      "Consent management with customisable banners",
      "IP anonymisation and DNT support",
      "Data subject rights (erasure, portability)",
      "Self-hosted for complete data ownership",
    ],
  },
  {
    id: "seo",
    title: "SEO Professionals",
    description: "Comprehensive site auditing, content gap analysis, and search console integration.",
    icon: Search,
    features: [
      "Automated site audits with scoring",
      "Content gap analysis and keyword research",
      "Google Search Console integration",
      "Page performance and Core Web Vitals",
      "AI-powered SEO recommendations",
    ],
  },
];

export default function UseCasesPage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.useCases.title} description={seoData.useCases.description} keywords={seoData.useCases.keywords} canonicalUrl="https://myuserjourney.co.uk/use-cases" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Use Cases</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Built for every team
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From marketing and product to agencies and e-commerce, My User Journey adapts to your workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        {useCases.map((uc) => (
          <div key={uc.id} id={uc.id} className="scroll-mt-24">
            <Card data-testid={`card-usecase-${uc.id}`}>
              <CardContent className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-md bg-primary/10">
                        <uc.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">{uc.title}</h2>
                    </div>
                    <p className="text-muted-foreground">{uc.description}</p>
                    <a href="/login">
                      <Button data-testid={`button-start-${uc.id}`}>
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                  <ul className="space-y-3">
                    {uc.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <TrendingUp className="h-3 w-3 text-primary" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">
            Join teams that trust My User Journey for privacy-first, AI-powered analytics.
          </p>
          <a href="/login">
            <Button size="lg" data-testid="button-cta-signup">
              Create Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
