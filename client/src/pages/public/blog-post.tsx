import { PublicLayout } from "@/components/public-navbar";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/public/blog-posts", params?.slug],
    enabled: !!params?.slug,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <SEOHead title="Loading..." />
        <div className="flex items-center justify-center py-24" data-testid="loading-spinner">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PublicLayout>
    );
  }

  if (!post || error) {
    return (
      <PublicLayout>
        <SEOHead title="Post Not Found" />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-4" data-testid="post-not-found">
          <h1 className="text-3xl font-bold">Post not found</h1>
          <p className="text-muted-foreground">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog">
            <Button variant="outline" data-testid="button-back-to-blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEOHead
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        ogImage={post.ogImage || undefined}
        ogType="article"
        canonicalUrl={`https://myuserjourney.co.uk/blog/${post.slug}`}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/blog">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        <Card>
          <CardContent className="p-6 md:p-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary" data-testid="badge-post-category">{post.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span data-testid="text-post-date">
                      {new Date(post.createdAt).toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span data-testid="text-post-readtime">{post.readTime}</span>
                  </div>
                </div>

                <h1 className="text-2xl md:text-4xl font-bold tracking-tight" data-testid="text-post-title">
                  {post.title}
                </h1>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span data-testid="text-post-author">{post.author}</span>
                </div>
              </div>

              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full rounded-md object-cover max-h-96"
                  data-testid="img-post-featured"
                />
              )}

              <div
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
                data-testid="content-post-body"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
