import { PublicLayout } from "@/components/public-navbar";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowUp,
  Lightbulb,
  Clock,
  CheckCircle2,
  Rocket,
} from "lucide-react";

const categories = [
  {
    title: "Upcoming Features",
    description: "Features currently being developed for the next release.",
    icon: Rocket,
    items: [
      { title: "Multi-project dashboard view", votes: 87 },
      { title: "Slack integration for alerts", votes: 64 },
      { title: "Custom date comparison ranges", votes: 52 },
    ],
  },
  {
    title: "Under Consideration",
    description: "Ideas being evaluated by the team based on community feedback.",
    icon: Clock,
    items: [
      { title: "White-label analytics reports", votes: 143 },
      { title: "API rate limit dashboard", votes: 98 },
    ],
  },
  {
    title: "Recently Shipped",
    description: "Features that were requested by the community and recently released.",
    icon: CheckCircle2,
    items: [
      { title: "CSV and JSON data export", votes: 201 },
      { title: "AI-powered insights copilot", votes: 176 },
      { title: "Cookieless tracking mode", votes: 159 },
    ],
  },
];

export default function CommunityIdeasPage() {
  return (
    <PublicLayout>
      <SEOHead title="Feature Requests - My User Journey" description="Submit feature requests and vote on ideas to help shape the future of My User Journey analytics platform." />
      <section className="max-w-7xl mx-auto px-6 pt-8">
        <Link href="/community" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" data-testid="link-back-community">
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </Link>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Ideas</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Feature Requests & Ideas
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help shape the future of My User Journey by submitting and voting on feature ideas.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">{cat.title}</h2>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </div>
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <Card key={item.title} data-testid={`card-idea-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-sm font-medium">{item.title}</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ArrowUp className="h-3.5 w-3.5" />
                          {item.votes}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Have an idea?</h2>
          <p className="text-muted-foreground">
            Submit your feature request and let the community vote on it.
          </p>
          <Link href="/contact">
            <Button size="lg" data-testid="button-submit-idea">
              <Lightbulb className="mr-2 h-4 w-4" />
              Submit Your Idea
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
