import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";

const posts = [
  {
    title: "Introducing Predictive Analytics: AI-Powered Churn and Revenue Forecasting",
    excerpt: "Our latest AI feature helps you predict churn risk, forecast revenue trends, and estimate conversion probability using your existing analytics data.",
    category: "Product",
    date: "Feb 10, 2026",
    readTime: "5 min read",
    author: "My User Journey Team",
  },
  {
    title: "The Complete Guide to GDPR-Compliant Analytics in 2026",
    excerpt: "Everything you need to know about running analytics that comply with UK GDPR, EU GDPR, PECR, and ePrivacy directives without losing valuable insights.",
    category: "Privacy",
    date: "Feb 5, 2026",
    readTime: "8 min read",
    author: "My User Journey Team",
  },
  {
    title: "How to Build Conversion Funnels with the No-Code Builder",
    excerpt: "A step-by-step tutorial on using our visual funnel builder to create, analyse, and optimise conversion paths without writing a single line of code.",
    category: "Tutorial",
    date: "Jan 28, 2026",
    readTime: "6 min read",
    author: "My User Journey Team",
  },
  {
    title: "Why Self-Hosted Analytics Matter More Than Ever",
    excerpt: "With increasing privacy regulations and third-party cookie deprecation, self-hosted analytics gives you full control over your data and compliance.",
    category: "Insights",
    date: "Jan 20, 2026",
    readTime: "4 min read",
    author: "My User Journey Team",
  },
  {
    title: "AI Marketing Copilot: Automated SEO, PPC, and UX Recommendations",
    excerpt: "Learn how our AI Marketing Copilot analyses your analytics data to provide prioritised, actionable recommendations for SEO, PPC, and user experience.",
    category: "Product",
    date: "Jan 15, 2026",
    readTime: "5 min read",
    author: "My User Journey Team",
  },
  {
    title: "Cookieless Tracking: A Privacy-First Approach to Analytics",
    excerpt: "Discover how My User Journey enables accurate user tracking without cookies, localStorage, or persistent identifiers while maintaining GDPR compliance.",
    category: "Privacy",
    date: "Jan 8, 2026",
    readTime: "7 min read",
    author: "My User Journey Team",
  },
];

const categories = ["All", "Product", "Privacy", "Tutorial", "Insights"];

export default function BlogPage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.blog.title} description={seoData.blog.description} keywords={seoData.blog.keywords} canonicalUrl="https://myuserjourney.co.uk/blog" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Blog</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Latest news, trends, and insights
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay up to date with product updates, analytics best practices, and privacy guides.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={cat === "All" ? "default" : "secondary"}
              className="cursor-pointer"
              data-testid={`badge-category-${cat.toLowerCase()}`}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="space-y-6">
          {posts.map((post, i) => (
            <Card key={i} className="hover-elevate cursor-pointer" data-testid={`card-post-${i}`}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold">{post.title}</h2>
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <span className="text-sm text-primary font-medium flex items-center gap-1">
                      Read more <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
