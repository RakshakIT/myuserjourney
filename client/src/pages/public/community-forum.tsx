import { PublicLayout } from "@/components/public-navbar";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Rocket,
  Shield,
  Code2,
  Star,
  Lightbulb,
} from "lucide-react";

const forumCategories = [
  {
    title: "Getting Started",
    description: "New to My User Journey? Introduce yourself and ask beginner questions.",
    icon: Rocket,
    posts: 342,
  },
  {
    title: "Privacy & Compliance",
    description: "Discuss GDPR, ePrivacy, cookie consent, and data protection best practices.",
    icon: Shield,
    posts: 187,
  },
  {
    title: "Technical Setup",
    description: "Tracking code installation, API integrations, and troubleshooting.",
    icon: Code2,
    posts: 256,
  },
  {
    title: "Feature Requests",
    description: "Suggest new features and vote on what should be built next.",
    icon: Lightbulb,
    posts: 129,
  },
  {
    title: "Show & Tell",
    description: "Share your analytics dashboards, success stories, and creative use cases.",
    icon: Star,
    posts: 94,
  },
];

export default function CommunityForumPage() {
  return (
    <PublicLayout>
      <SEOHead title="Discussion Forum - My User Journey Community" description="Join the My User Journey community forum to ask questions, share insights, and connect with analytics professionals." />
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
            <Badge variant="secondary" className="text-xs">Community Forum</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Discussion Forum
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ask questions, share knowledge, and connect with the My User Journey community.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="space-y-4">
          {forumCategories.map((cat) => (
            <Card key={cat.title} className="hover-elevate" data-testid={`card-forum-${cat.title.toLowerCase().replace(/\s/g, "-")}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-md bg-primary/10 shrink-0">
                    <cat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <h3 className="font-semibold">{cat.title}</h3>
                      <span className="text-xs text-muted-foreground">{cat.posts} posts</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Have a question or topic to discuss?</h2>
          <p className="text-muted-foreground">
            Start a new discussion and get help from the community and our team.
          </p>
          <Link href="/contact">
            <Button size="lg" data-testid="button-start-discussion">
              <MessageSquare className="mr-2 h-4 w-4" />
              Start a Discussion
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
