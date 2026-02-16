import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Code2,
  Shield,
  BarChart3,
  Globe,
  Zap,
  Search,
  ArrowRight,
  Layers,
  Settings,
  Bot,
  GitFork,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const docSections = [
  {
    title: "Getting Started",
    icon: Zap,
    articles: [
      { title: "Quick Start Guide", description: "Set up your first project in under 5 minutes", slug: "quick-start-guide" },
      { title: "Installing the Tracking Snippet", description: "Add analytics tracking to your website", slug: "installing-the-tracking-snippet" },
      { title: "Project Configuration", description: "Configure project settings and preferences", slug: "project-configuration" },
      { title: "Understanding the Dashboard", description: "Navigate the analytics dashboard", slug: "understanding-the-dashboard" },
    ],
  },
  {
    title: "Analytics & Tracking",
    icon: BarChart3,
    articles: [
      { title: "Real-time Analytics", description: "Monitor live user activity on your site", slug: "real-time-analytics" },
      { title: "Acquisition Reports", description: "Understand where your traffic comes from", slug: "acquisition-reports" },
      { title: "Engagement Metrics", description: "Measure how users interact with your content", slug: "engagement-metrics" },
      { title: "Custom Events", description: "Track specific user actions and conversions", slug: "custom-events" },
    ],
  },
  {
    title: "Privacy & Compliance",
    icon: Shield,
    articles: [
      { title: "GDPR Compliance Guide", description: "Ensure your tracking is fully compliant", slug: "gdpr-compliance-guide" },
      { title: "Consent Management", description: "Configure consent banners and categories", slug: "consent-management" },
      { title: "IP Anonymisation", description: "Protect user privacy with IP masking", slug: "ip-anonymisation" },
      { title: "Cookieless Tracking", description: "Track without cookies or persistent IDs", slug: "cookieless-tracking" },
    ],
  },
  {
    title: "AI Features",
    icon: Bot,
    articles: [
      { title: "AI Copilot", description: "Ask questions about your data in natural language", slug: "ai-copilot" },
      { title: "Predictive Analytics", description: "Forecast churn, revenue, and conversions", slug: "predictive-analytics" },
      { title: "UX Auditor", description: "Automated UX issue detection and scoring", slug: "ux-auditor" },
      { title: "Marketing Copilot", description: "AI-powered SEO, PPC, and UX recommendations", slug: "marketing-copilot" },
    ],
  },
  {
    title: "Integrations",
    icon: Layers,
    articles: [
      { title: "Google Analytics 4", description: "Import and compare GA4 data", slug: "google-analytics-4" },
      { title: "Google Search Console", description: "Search performance integration", slug: "google-search-console" },
      { title: "REST API Reference", description: "Integrate with your own tools", slug: "rest-api-reference" },
      { title: "Webhooks", description: "Set up event-driven integrations", slug: "webhooks" },
    ],
  },
  {
    title: "Advanced",
    icon: Settings,
    articles: [
      { title: "Funnel Analysis", description: "Create and analyse conversion funnels", slug: "funnel-analysis" },
      { title: "User Journey Replay", description: "Reconstruct individual sessions", slug: "user-journey-replay" },
      { title: "Custom Reports", description: "Build reports with custom dimensions", slug: "custom-reports" },
      { title: "Data Export", description: "Export your data in CSV or JSON format", slug: "data-export" },
    ],
  },
];

export default function DocsPage() {
  const [search, setSearch] = useState("");

  const filtered = docSections
    .map((s) => ({
      ...s,
      articles: s.articles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((s) => s.articles.length > 0);

  return (
    <PublicLayout>
      <SEOHead title={seoData.docs.title} description={seoData.docs.description} keywords={seoData.docs.keywords} canonicalUrl="https://myuserjourney.co.uk/docs" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Documentation</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Documentation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about My User Journey. Browse guides, API references, and tutorials.
            </p>
            <div className="max-w-md mx-auto pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-docs"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        {filtered.map((section) => (
          <div key={section.title} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <section.icon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{section.title}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {section.articles.map((article) => (
                <Link key={article.title} href={`/docs/${article.slug}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-doc-${article.slug}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{article.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{article.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground" data-testid="text-no-results">
            No articles found matching "{search}"
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
