import { PublicLayout } from "@/components/public-navbar";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, BookOpen, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";

function levelColor(level: string) {
  switch (level) {
    case "Beginner": return "default";
    case "Intermediate": return "secondary";
    case "Advanced": return "outline";
    default: return "secondary";
  }
}

export default function GuideDetailPage() {
  const [, params] = useRoute("/guides/:slug");

  const { data: guide, isLoading, error } = useQuery<any>({
    queryKey: ["/api/public/guides", params?.slug],
    enabled: !!params?.slug,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <SEOHead title="Loading Guide" />
        <div className="flex items-center justify-center py-32" data-testid="loading-spinner">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PublicLayout>
    );
  }

  if (!guide || error) {
    return (
      <PublicLayout>
        <SEOHead title="Guide Not Found" />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-4" data-testid="guide-not-found">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold" data-testid="text-not-found-title">Guide not found</h1>
          <p className="text-muted-foreground">The guide you're looking for doesn't exist or has been removed.</p>
          <Link href="/guides">
            <Button variant="outline" data-testid="button-back-to-guides">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Guides
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEOHead
        title={guide.metaTitle || guide.title}
        description={guide.metaDescription || guide.description}
        ogImage={guide.ogImage}
        canonicalUrl={`https://myuserjourney.co.uk/guides/${guide.slug}`}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/guides" data-testid="link-back-to-guides">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guides
          </Button>
        </Link>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {guide.category && (
                <Badge variant="secondary" className="text-xs" data-testid="badge-category">{guide.category}</Badge>
              )}
              {guide.level && (
                <Badge variant={levelColor(guide.level) as any} className="text-xs" data-testid="badge-level">{guide.level}</Badge>
              )}
              {guide.readTime && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid="text-read-time">
                  <Clock className="h-3 w-3" />
                  {guide.readTime}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-guide-title">
              {guide.title}
            </h1>
            {guide.description && (
              <p className="text-lg text-muted-foreground" data-testid="text-guide-description">
                {guide.description}
              </p>
            )}
          </div>

          {guide.content && (
            <Card data-testid="card-guide-content">
              <CardContent className="p-6 md:p-8 prose prose-sm dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: guide.content }} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
