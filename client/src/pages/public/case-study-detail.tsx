import { PublicLayout } from "@/components/public-navbar";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";

export default function CaseStudyDetailPage() {
  const [, params] = useRoute("/case-studies/:slug");

  const { data: caseStudy, isLoading, error } = useQuery<any>({
    queryKey: ["/api/public/case-studies", params?.slug],
    enabled: !!params?.slug,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <SEOHead title="Loading Case Study" />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loading-spinner" />
        </div>
      </PublicLayout>
    );
  }

  if (!caseStudy || error) {
    return (
      <PublicLayout>
        <SEOHead title="Case Study Not Found" />
        <div className="max-w-3xl mx-auto px-6 py-32 text-center space-y-6" data-testid="not-found-message">
          <h1 className="text-3xl font-bold">Case Study Not Found</h1>
          <p className="text-muted-foreground">The case study you're looking for doesn't exist or has been removed.</p>
          <Link href="/case-studies">
            <Button variant="outline" data-testid="button-back-to-case-studies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Case Studies
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEOHead
        title={caseStudy.metaTitle || caseStudy.title}
        description={caseStudy.metaDescription || caseStudy.summary}
        ogImage={caseStudy.ogImage}
        canonicalUrl={`https://myuserjourney.co.uk/case-studies/${caseStudy.slug}`}
      />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <Link href="/case-studies">
          <Button variant="ghost" size="sm" data-testid="button-back-to-case-studies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Case Studies
          </Button>
        </Link>

        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold" data-testid="text-company">{caseStudy.company}</h2>
            {caseStudy.industry && (
              <Badge variant="secondary" data-testid="badge-industry">{caseStudy.industry}</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-case-study-title">
            {caseStudy.title}
          </h1>
          {caseStudy.summary && (
            <p className="text-lg text-muted-foreground" data-testid="text-summary">{caseStudy.summary}</p>
          )}
        </div>

        {caseStudy.featuredImage && (
          <img
            src={caseStudy.featuredImage}
            alt={caseStudy.title}
            className="w-full rounded-md object-cover max-h-96"
            data-testid="img-featured"
          />
        )}

        {caseStudy.metrics && caseStudy.metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-testid="metrics-grid">
            {caseStudy.metrics.map((m: any) => (
              <Card key={m.label}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary" data-testid={`metric-value-${m.label}`}>{m.value}</div>
                  <div className="text-xs text-muted-foreground mt-1" data-testid={`metric-label-${m.label}`}>{m.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {caseStudy.quote && (
          <blockquote className="border-l-2 border-primary pl-6 py-4 italic text-muted-foreground" data-testid="blockquote">
            <p className="text-base">"{caseStudy.quote}"</p>
            {caseStudy.quoteAuthor && (
              <footer className="mt-3 not-italic text-sm font-medium text-foreground" data-testid="text-quote-author">
                — {caseStudy.quoteAuthor}
              </footer>
            )}
          </blockquote>
        )}

        {caseStudy.content && (
          <Card>
            <CardContent className="p-6 md:p-8 prose prose-sm dark:prose-invert max-w-none" data-testid="content-body">
              <div dangerouslySetInnerHTML={{ __html: caseStudy.content }} />
            </CardContent>
          </Card>
        )}

        <div className="pt-8 border-t">
          <Link href="/case-studies">
            <Button variant="outline" data-testid="button-back-bottom">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Case Studies
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
