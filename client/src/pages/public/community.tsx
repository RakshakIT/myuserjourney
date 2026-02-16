import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Globe,
  HelpCircle,
  Share2,
  Star,
} from "lucide-react";

const channels = [
  {
    title: "Discussion Forum",
    description: "Ask questions, share insights, and connect with other My User Journey users.",
    icon: MessageSquare,
    action: "Join the Forum",
  },
  {
    title: "Knowledge Base",
    description: "Browse community-contributed guides, tutorials, and best practices.",
    icon: BookOpen,
    action: "Browse Articles",
  },
  {
    title: "Feature Requests",
    description: "Vote on upcoming features and suggest improvements to the platform.",
    icon: Star,
    action: "Submit Ideas",
  },
  {
    title: "Help & Support",
    description: "Get help from the community and our support team for technical questions.",
    icon: HelpCircle,
    action: "Get Help",
  },
];

const stats = [
  { label: "Community Members", value: "2,500+" },
  { label: "Questions Answered", value: "8,000+" },
  { label: "Guides Published", value: "150+" },
  { label: "Countries", value: "45+" },
];

export default function CommunityPage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.community.title} description={seoData.community.description} keywords={seoData.community.keywords} canonicalUrl="https://myuserjourney.co.uk/community" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Community</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Join the My User Journey community
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with analytics professionals, share knowledge, and help shape the future of privacy-first analytics.
            </p>
            <a href="/login">
              <Button size="lg" data-testid="button-join-community">
                Join the Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="border-y bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {channels.map((ch) => (
            <Card key={ch.title} className="hover-elevate" data-testid={`card-${ch.title.toLowerCase().replace(/\s/g, "-")}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-md bg-primary/10 shrink-0">
                    <ch.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{ch.title}</h3>
                    <p className="text-sm text-muted-foreground">{ch.description}</p>
                    <Button variant="outline" size="sm" data-testid={`button-${ch.title.toLowerCase().replace(/\s/g, "-")}`}>
                      {ch.action}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Contribute to My User Journey</h2>
          <p className="text-muted-foreground">
            My User Journey is built for the community. Share your expertise, write guides, and help others succeed with analytics.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button variant="outline" data-testid="button-write-guide">
              <BookOpen className="mr-2 h-4 w-4" />
              Write a Guide
            </Button>
            <Button variant="outline" data-testid="button-share">
              <Share2 className="mr-2 h-4 w-4" />
              Share Your Story
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
