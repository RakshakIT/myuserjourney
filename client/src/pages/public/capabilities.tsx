import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  Zap,
  Bot,
  Shield,
  Globe,
  LineChart,
  Users,
  Target,
  Search,
  GitFork,
  Eye,
  FileBarChart,
  MapPin,
  Monitor,
  Layers,
  Code2,
  CreditCard,
  BrainCircuit,
  Gauge,
  Wand2,
} from "lucide-react";

const capabilityGroups = [
  {
    title: "Real-time Analytics",
    items: [
      { title: "Live Dashboard", description: "Monitor active users, page views, and events in real-time with per-minute granularity.", icon: Zap },
      { title: "Real-time Alerts", description: "Get notified when traffic spikes, drops, or unusual patterns are detected.", icon: BarChart3 },
    ],
  },
  {
    title: "Lifecycle Analysis",
    items: [
      { title: "Acquisition Tracking", description: "User, traffic, and lead acquisition reports with detailed channel attribution.", icon: Globe },
      { title: "Engagement Metrics", description: "Events, pages, landing pages, and session duration analysis.", icon: Eye },
      { title: "Monetisation", description: "E-commerce purchases, purchase journeys, and transaction tracking.", icon: CreditCard },
    ],
  },
  {
    title: "Traffic & Content",
    items: [
      { title: "Traffic Sources", description: "Detailed breakdown by channel, source, medium, and campaign.", icon: Target },
      { title: "Geography", description: "Country, city, and language analytics with visitor distribution.", icon: MapPin },
      { title: "Browsers & Systems", description: "Browser, OS, and device type breakdowns.", icon: Monitor },
    ],
  },
  {
    title: "Exploration Tools",
    items: [
      { title: "Funnel Builder", description: "Visual no-code funnel builder with drag-and-drop and AI generation.", icon: GitFork },
      { title: "Custom Events", description: "Define custom events with rule-based matching and conversion tracking.", icon: Layers },
      { title: "User Journeys", description: "Session replay and timeline views of visitor interactions.", icon: Users },
      { title: "Custom Reports", description: "Flexible report builder with custom metrics, dimensions, and charts.", icon: FileBarChart },
    ],
  },
  {
    title: "AI-Powered Features",
    items: [
      { title: "AI Copilot", description: "Ask questions about your data in natural language.", icon: Bot },
      { title: "Predictive Analytics", description: "Churn risk, revenue forecasting, and conversion predictions.", icon: BrainCircuit },
      { title: "UX Auditor", description: "Automated detection of slow pages, bad flows, and navigation issues.", icon: Gauge },
      { title: "Marketing Copilot", description: "AI-driven SEO, PPC, and UX recommendations.", icon: Wand2 },
    ],
  },
  {
    title: "Marketing & SEO",
    items: [
      { title: "Site Audit", description: "HTML crawling with SEO issue detection and scoring.", icon: Search },
      { title: "Content Gap Analysis", description: "Keyword research and competitor content analysis.", icon: Target },
      { title: "Search Console Integration", description: "Google Search Console data within your dashboard.", icon: Search },
      { title: "PPC Management", description: "Track and optimise paid campaigns across platforms.", icon: BarChart3 },
    ],
  },
];

export default function CapabilitiesPage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.capabilities.title} description={seoData.capabilities.description} keywords={seoData.capabilities.keywords} canonicalUrl="https://myuserjourney.co.uk/capabilities" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Capabilities</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Everything you need in one platform
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive overview of all analytics, AI, and marketing capabilities built into My User Journey.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16 space-y-12">
        {capabilityGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xl font-bold mb-4" data-testid={`text-group-${group.title.toLowerCase().replace(/\s/g, "-")}`}>
              {group.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item) => (
                <Card key={item.title} className="hover-elevate" data-testid={`card-capability-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10 shrink-0">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Start using all capabilities today</h2>
          <a href="/login">
            <Button size="lg" data-testid="button-get-started">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
