import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { PublicNavbar, PublicFooter } from "@/components/public-navbar";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface CmsPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  customScripts: string | null;
  status: string;
}

export default function CmsPage() {
  const [, params] = useRoute("/page/:slug");
  const slug = params?.slug || "";

  const { data: page, isLoading, error } = useQuery<CmsPageData>({
    queryKey: ["/api/public/pages", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public/pages/${slug}`);
      if (!res.ok) throw new Error("Page not found");
      return res.json();
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (page) {
      document.title = page.metaTitle || page.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && page.metaDescription) {
        metaDesc.setAttribute("content", page.metaDescription);
      } else if (page.metaDescription) {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = page.metaDescription;
        document.head.appendChild(meta);
      }
    }
  }, [page]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-page-not-found">Page Not Found</h1>
          <p className="text-muted-foreground" data-testid="text-page-not-found-desc">The page you're looking for doesn't exist or has been removed.</p>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8" data-testid="text-page-title">{page.title}</h1>
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
          data-testid="div-page-content"
        />
      </div>
      <PublicFooter />
    </div>
  );
}
