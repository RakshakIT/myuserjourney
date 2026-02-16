import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, BookOpen } from "lucide-react";

const guides = [
  {
    title: "Complete GDPR Compliance Guide for Website Analytics",
    description: "A comprehensive walkthrough of setting up fully GDPR-compliant analytics, including consent management, IP anonymisation, and data subject rights.",
    category: "Privacy",
    readTime: "15 min read",
    level: "Beginner",
  },
  {
    title: "Building Effective Conversion Funnels",
    description: "Learn how to design, build, and analyse conversion funnels using the no-code funnel builder to identify and fix drop-off points.",
    category: "Analytics",
    readTime: "10 min read",
    level: "Intermediate",
  },
  {
    title: "Advanced Traffic Source Attribution",
    description: "Understand how My User Journey classifies traffic sources and how to use UTM parameters, referrer analysis, and channel grouping for accurate attribution.",
    category: "Analytics",
    readTime: "12 min read",
    level: "Advanced",
  },
  {
    title: "Getting the Most from AI Features",
    description: "A guide to using AI Copilot, Predictive Analytics, UX Auditor, and Marketing Copilot to automate insights and decision-making.",
    category: "AI",
    readTime: "8 min read",
    level: "Beginner",
  },
  {
    title: "SEO Site Audit Best Practices",
    description: "How to run comprehensive site audits, interpret the results, and prioritise fixes for maximum search engine visibility.",
    category: "SEO",
    readTime: "10 min read",
    level: "Intermediate",
  },
  {
    title: "Setting Up E-commerce Tracking",
    description: "Step-by-step instructions for tracking purchases, transactions, and revenue using custom events and the monetisation module.",
    category: "E-commerce",
    readTime: "12 min read",
    level: "Intermediate",
  },
  {
    title: "Custom Event Templates and Conversion Tracking",
    description: "Create and manage custom event definitions with rule-based matching, AI-generated templates, and conversion path analysis.",
    category: "Analytics",
    readTime: "8 min read",
    level: "Advanced",
  },
  {
    title: "Multi-Project Management for Agencies",
    description: "Best practices for managing multiple client projects, setting up role-based access, and creating automated reports.",
    category: "Management",
    readTime: "7 min read",
    level: "Intermediate",
  },
];

function levelColor(level: string) {
  switch (level) {
    case "Beginner": return "default";
    case "Intermediate": return "secondary";
    case "Advanced": return "outline";
    default: return "secondary";
  }
}

export default function GuidesPage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.guides.title} description={seoData.guides.description} keywords={seoData.guides.keywords} canonicalUrl="https://myuserjourney.co.uk/guides" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Guides</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              In-depth guides and tutorials
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Step-by-step guides to help you master every aspect of My User Journey.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="space-y-4">
          {guides.map((guide, i) => (
            <Card key={i} className="hover-elevate cursor-pointer" data-testid={`card-guide-${i}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{guide.category}</Badge>
                      <Badge variant={levelColor(guide.level) as any} className="text-xs">{guide.level}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {guide.readTime}
                      </span>
                    </div>
                    <h3 className="font-semibold">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground">{guide.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
