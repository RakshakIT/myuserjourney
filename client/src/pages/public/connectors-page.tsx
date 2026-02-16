import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Search,
  Globe,
  BarChart3,
  Database,
  Mail,
  ShoppingCart,
  MessageSquare,
  Code2,
  Megaphone,
  Shield,
  Zap,
} from "lucide-react";
import { useState } from "react";

const connectorCategories = [
  {
    name: "Analytics",
    connectors: [
      { name: "Google Analytics 4", description: "Import GA4 data and compare metrics", icon: BarChart3 },
      { name: "Google Search Console", description: "Search performance and indexing data", icon: Search },
      { name: "Adobe Analytics", description: "Migrate or compare Adobe Analytics data", icon: BarChart3 },
    ],
  },
  {
    name: "Advertising",
    connectors: [
      { name: "Google Ads", description: "PPC campaign performance and spend tracking", icon: Megaphone },
      { name: "Facebook Ads", description: "Social media ad campaign analytics", icon: Megaphone },
      { name: "LinkedIn Ads", description: "B2B advertising performance data", icon: Megaphone },
    ],
  },
  {
    name: "E-commerce",
    connectors: [
      { name: "Shopify", description: "E-commerce store and order analytics", icon: ShoppingCart },
      { name: "WooCommerce", description: "WordPress e-commerce integration", icon: ShoppingCart },
      { name: "Stripe", description: "Payment and revenue tracking", icon: ShoppingCart },
    ],
  },
  {
    name: "Communication",
    connectors: [
      { name: "Slack", description: "Send analytics alerts to Slack channels", icon: MessageSquare },
      { name: "Email (SMTP)", description: "Automated report delivery via email", icon: Mail },
      { name: "Webhooks", description: "Custom integrations via webhooks", icon: Code2 },
    ],
  },
  {
    name: "Data & Storage",
    connectors: [
      { name: "PostgreSQL", description: "Direct database integration", icon: Database },
      { name: "BigQuery", description: "Export data to Google BigQuery", icon: Database },
      { name: "REST API", description: "Custom API integration endpoint", icon: Globe },
    ],
  },
];

export default function ConnectorsPage() {
  const [search, setSearch] = useState("");

  const filteredCategories = connectorCategories
    .map((cat) => ({
      ...cat,
      connectors: cat.connectors.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.connectors.length > 0);

  return (
    <PublicLayout>
      <SEOHead title={seoData.connectors.title} description={seoData.connectors.description} keywords={seoData.connectors.keywords} canonicalUrl="https://myuserjourney.co.uk/connectors" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Connectors</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Connect your favourite tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Integrate My User Journey with the tools you already use for a unified analytics experience.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search connectors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-connectors"
            />
          </div>
        </div>

        {filteredCategories.map((cat) => (
          <div key={cat.name} className="mb-10">
            <h2 className="text-lg font-semibold mb-4" data-testid={`text-category-${cat.name.toLowerCase()}`}>{cat.name}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {cat.connectors.map((con) => (
                <Card key={con.name} className="hover-elevate" data-testid={`card-connector-${con.name.toLowerCase().replace(/\s/g, "-")}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10 shrink-0">
                        <con.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{con.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{con.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground" data-testid="text-no-results">
            No connectors found matching "{search}"
          </div>
        )}
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Need a custom connector?</h2>
          <p className="text-muted-foreground">
            Use our REST API and webhook integrations to connect My User Journey with any tool in your stack.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="/login">
              <Button size="lg" data-testid="button-get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Button variant="outline" size="lg" data-testid="button-api-docs">
              <Code2 className="mr-2 h-4 w-4" />
              API Documentation
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
