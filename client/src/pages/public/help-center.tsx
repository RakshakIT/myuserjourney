import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  MessageSquare,
  Mail,
  BookOpen,
  HelpCircle,
  ArrowRight,
  FileText,
  Shield,
  Code2,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

const helpTopics = [
  {
    title: "Getting Started",
    icon: BarChart3,
    articles: [
      "How to create your first project",
      "Installing the tracking snippet",
      "Understanding the dashboard overview",
      "Setting up project goals",
    ],
  },
  {
    title: "Privacy & Compliance",
    icon: Shield,
    articles: [
      "How to configure GDPR consent banners",
      "Setting up IP anonymisation",
      "Enabling cookieless tracking mode",
      "Handling data subject requests",
    ],
  },
  {
    title: "Tracking & Events",
    icon: Code2,
    articles: [
      "Custom event tracking setup",
      "Verifying your tracking code",
      "Debugging tracking issues",
      "UTM parameter configuration",
    ],
  },
  {
    title: "Reports & Analysis",
    icon: FileText,
    articles: [
      "Creating custom reports",
      "Exporting data to CSV or JSON",
      "Setting up conversion funnels",
      "Using the AI copilot for insights",
    ],
  },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");

  return (
    <PublicLayout>
      <SEOHead title={seoData.helpCenter.title} description={seoData.helpCenter.description} keywords={seoData.helpCenter.keywords} canonicalUrl="https://myuserjourney.co.uk/help-center" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Help Center</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              How can we help you?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search our knowledge base or browse popular topics to find answers to your questions.
            </p>
            <div className="max-w-md mx-auto pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for help..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-help"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {helpTopics.map((topic) => (
            <Card key={topic.title} data-testid={`card-topic-${topic.title.toLowerCase().replace(/\s/g, "-")}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-md bg-primary/10">
                    <topic.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{topic.title}</h3>
                </div>
                <ul className="space-y-2">
                  {topic.articles.map((article) => (
                    <li key={article} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      {article}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Still need help?</h2>
          <p className="text-muted-foreground">
            Our support team is ready to help you with any questions about My User Journey.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button data-testid="button-contact-support">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline" data-testid="button-email-support">
              <Mail className="mr-2 h-4 w-4" />
              Email Us
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
