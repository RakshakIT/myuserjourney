import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, TrendingUp, Users, BarChart3, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

const fallbackCaseStudies = [
  {
    company: "AthenaHQ",
    industry: "B2B SaaS",
    slug: "athenahq-conversions",
    title: "How AthenaHQ increased conversions by 45% with funnel analysis",
    summary: "AthenaHQ used My User Journey's funnel explorer and AI insights to identify key drop-off points in their onboarding flow, leading to targeted improvements that boosted trial-to-paid conversion by 45%.",
    metrics: [
      { label: "Conversion increase", value: "+45%" },
      { label: "Onboarding completion", value: "+32%" },
      { label: "Time to value", value: "-28%" },
    ],
    quote: "My User Journey gave us the granular, privacy-compliant data we needed to understand exactly where users were dropping off. The AI recommendations were spot on.",
  },
  {
    company: "Spellbook",
    industry: "Legal Tech",
    slug: "spellbook-gdpr-compliance",
    title: "Spellbook achieved full GDPR compliance while scaling analytics",
    summary: "Spellbook needed enterprise-grade analytics that could handle sensitive legal data while maintaining strict GDPR and PECR compliance. My User Journey's self-hosted approach and consent management gave them complete control.",
    metrics: [
      { label: "Compliance audit", value: "100%" },
      { label: "Data processing cost", value: "-60%" },
      { label: "Analytics coverage", value: "+85%" },
    ],
    quote: "Moving to My User Journey meant we could self-host our analytics data, eliminating third-party data processing concerns entirely. The consent management system handles our complex requirements perfectly.",
  },
  {
    company: "NovaMart",
    industry: "E-commerce",
    slug: "novamart-revenue",
    title: "NovaMart doubled revenue per visitor with predictive analytics",
    summary: "NovaMart leveraged My User Journey's predictive analytics and marketing copilot to identify high-value customer segments and optimise their marketing spend, resulting in a 2x increase in revenue per visitor.",
    metrics: [
      { label: "Revenue per visitor", value: "+100%" },
      { label: "Ad spend efficiency", value: "+38%" },
      { label: "Cart abandonment", value: "-22%" },
    ],
    quote: "The predictive analytics feature helped us focus on customers most likely to convert, and the marketing copilot automated our SEO and PPC optimisation. It's like having an extra team member.",
  },
];

export default function CaseStudiesPage() {
  const { data: apiCaseStudies, isLoading } = useQuery<any[]>({
    queryKey: ["/api/public/case-studies"],
  });

  const caseStudies = apiCaseStudies && apiCaseStudies.length > 0 ? apiCaseStudies : fallbackCaseStudies;

  return (
    <PublicLayout>
      <SEOHead title={seoData.caseStudies.title} description={seoData.caseStudies.description} keywords={seoData.caseStudies.keywords} canonicalUrl="https://myuserjourney.co.uk/case-studies" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Case Studies</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Success stories from our customers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how teams use My User Journey to grow their business with privacy-first analytics.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16 space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          caseStudies.map((cs: any, i: number) => (
            <Card key={cs.slug || i} data-testid={`card-case-study-${cs.company.toLowerCase()}`}>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold">{cs.company}</h2>
                  <Badge variant="secondary">{cs.industry}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-primary">{cs.title}</h3>
                <p className="text-sm text-muted-foreground">{cs.summary}</p>
                <div className="grid grid-cols-3 gap-4">
                  {(cs.metrics || []).map((m: any) => (
                    <div key={m.label} className="text-center">
                      <div className="text-2xl font-bold text-primary">{m.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
                {cs.quote && (
                  <blockquote className="border-l-2 border-primary pl-4 italic text-sm text-muted-foreground">
                    "{cs.quote}"
                    {cs.quoteAuthor && <footer className="mt-2 not-italic font-medium text-foreground">— {cs.quoteAuthor}</footer>}
                  </blockquote>
                )}
                <Link href={`/case-studies/${cs.slug}`}>
                  <Button variant="outline" data-testid={`button-read-${cs.company.toLowerCase()}`}>
                    Read Full Case Study
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Ready to write your success story?</h2>
          <Link href="/login">
            <Button size="lg" data-testid="button-get-started">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
