import { PublicLayout } from "@/components/public-navbar";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";

interface HelpArticle {
  title: string;
  topic: string;
  content: string;
}

const defaultArticles: Record<string, HelpArticle> = {
  "how-to-create-your-first-project": {
    title: "How to create your first project",
    topic: "Getting Started",
    content: `<h2>Creating Your First Project</h2>
<p>Getting started with My User Journey is straightforward. Follow these steps to create your first analytics project:</p>
<ol>
<li><strong>Sign in</strong> to your My User Journey account.</li>
<li>Navigate to <strong>Projects</strong> from the sidebar.</li>
<li>Click <strong>Create New Project</strong> and enter your website name and URL.</li>
<li>Choose your preferred tracking mode (cookie-based or cookieless).</li>
<li>Copy the generated tracking snippet and add it to your website's <code>&lt;head&gt;</code> tag.</li>
<li>Return to the dashboard to verify data is being collected.</li>
</ol>
<p>Once your project is created, data will start appearing within a few minutes of your first visitor.</p>`,
  },
  "installing-the-tracking-snippet": {
    title: "Installing the tracking snippet",
    topic: "Getting Started",
    content: `<h2>Installing the Tracking Snippet</h2>
<p>The tracking snippet is a small piece of JavaScript code that collects visitor analytics on your website.</p>
<ol>
<li>Go to <strong>Settings &gt; Tracking Code</strong> in your project dashboard.</li>
<li>Copy the provided snippet.</li>
<li>Paste it into the <code>&lt;head&gt;</code> section of every page on your website.</li>
<li>If you use a CMS like WordPress, add it via your theme's header settings or a plugin.</li>
</ol>
<p>The snippet is lightweight and privacy-focused, with no impact on page load speed.</p>`,
  },
  "understanding-the-dashboard-overview": {
    title: "Understanding the dashboard overview",
    topic: "Getting Started",
    content: `<h2>Dashboard Overview</h2>
<p>The dashboard provides a real-time summary of your website's performance:</p>
<ul>
<li><strong>Visitors</strong> - Total unique visitors for the selected date range.</li>
<li><strong>Page Views</strong> - Total pages viewed across all visitors.</li>
<li><strong>Bounce Rate</strong> - Percentage of single-page sessions.</li>
<li><strong>Session Duration</strong> - Average time visitors spend on your site.</li>
</ul>
<p>Use the date picker to adjust the reporting period and compare performance over time.</p>`,
  },
  "setting-up-project-goals": {
    title: "Setting up project goals",
    topic: "Getting Started",
    content: `<h2>Setting Up Goals</h2>
<p>Goals help you track important actions on your website such as sign-ups, purchases, or form submissions.</p>
<ol>
<li>Navigate to <strong>Project Settings &gt; Goals</strong>.</li>
<li>Click <strong>Add Goal</strong> and choose a goal type (page visit, event, or duration).</li>
<li>Configure the goal conditions and give it a descriptive name.</li>
<li>Save and start tracking conversions immediately.</li>
</ol>`,
  },
  "how-to-configure-gdpr-consent-banners": {
    title: "How to configure GDPR consent banners",
    topic: "Privacy & Compliance",
    content: `<h2>Configuring GDPR Consent Banners</h2>
<p>My User Journey includes built-in consent management with 6 customisable consent categories:</p>
<ol>
<li>Go to <strong>Privacy Settings</strong> in your project dashboard.</li>
<li>Enable the consent banner feature.</li>
<li>Customise the banner text, colours, and position.</li>
<li>Configure which consent categories to display.</li>
<li>Set the default consent state for each category.</li>
</ol>
<p>The consent banner automatically handles visitor preferences and stores consent records for compliance.</p>`,
  },
  "setting-up-ip-anonymisation": {
    title: "Setting up IP anonymisation",
    topic: "Privacy & Compliance",
    content: `<h2>IP Anonymisation</h2>
<p>IP anonymisation removes the last octet of visitor IP addresses to protect privacy while maintaining geographic accuracy.</p>
<ol>
<li>Navigate to <strong>Privacy Settings</strong>.</li>
<li>Toggle <strong>IP Anonymisation</strong> to enabled.</li>
<li>Choose your preferred anonymisation level.</li>
</ol>
<p>When enabled, IP addresses like <code>192.168.1.100</code> are stored as <code>192.168.1.0</code>.</p>`,
  },
  "enabling-cookieless-tracking-mode": {
    title: "Enabling cookieless tracking mode",
    topic: "Privacy & Compliance",
    content: `<h2>Cookieless Tracking</h2>
<p>Cookieless tracking allows you to collect analytics without using cookies, localStorage, or any persistent client-side identifiers.</p>
<ol>
<li>Go to <strong>Project Settings &gt; Tracking</strong>.</li>
<li>Select <strong>Cookieless Mode</strong>.</li>
<li>Update your tracking snippet if needed.</li>
</ol>
<p>This mode is fully compliant with GDPR and ePrivacy regulations without requiring a consent banner for analytics.</p>`,
  },
  "handling-data-subject-requests": {
    title: "Handling data subject requests",
    topic: "Privacy & Compliance",
    content: `<h2>Data Subject Requests</h2>
<p>Under GDPR, individuals have the right to access, correct, and delete their personal data.</p>
<ul>
<li><strong>Right of Access</strong> - Export visitor data in JSON or CSV format.</li>
<li><strong>Right to Erasure</strong> - Delete individual visitor records on request.</li>
<li><strong>Data Portability</strong> - Provide data in a machine-readable format.</li>
</ul>
<p>Use the <strong>Privacy &gt; Data Requests</strong> section to manage incoming requests.</p>`,
  },
  "custom-event-tracking-setup": {
    title: "Custom event tracking setup",
    topic: "Tracking & Events",
    content: `<h2>Custom Event Tracking</h2>
<p>Track custom events to measure specific user interactions on your website.</p>
<ol>
<li>Add the tracking snippet to your website.</li>
<li>Use the JavaScript API to send custom events: <code>muj.track('event_name', { key: 'value' })</code></li>
<li>View events in the <strong>Events</strong> section of your dashboard.</li>
</ol>`,
  },
  "verifying-your-tracking-code": {
    title: "Verifying your tracking code",
    topic: "Tracking & Events",
    content: `<h2>Verifying Your Tracking Code</h2>
<p>After installing the tracking snippet, verify it is working correctly:</p>
<ol>
<li>Visit your website in a browser.</li>
<li>Check the <strong>Realtime</strong> dashboard for your visit.</li>
<li>Use browser developer tools to confirm the tracking script loads without errors.</li>
</ol>`,
  },
  "debugging-tracking-issues": {
    title: "Debugging tracking issues",
    topic: "Tracking & Events",
    content: `<h2>Debugging Tracking Issues</h2>
<p>If your tracking code is not sending data, try these steps:</p>
<ul>
<li>Check the browser console for JavaScript errors.</li>
<li>Verify the snippet is placed in the <code>&lt;head&gt;</code> tag.</li>
<li>Ensure your domain matches the project URL in settings.</li>
<li>Check if ad blockers are preventing the script from loading.</li>
</ul>`,
  },
  "utm-parameter-configuration": {
    title: "UTM parameter configuration",
    topic: "Tracking & Events",
    content: `<h2>UTM Parameter Configuration</h2>
<p>UTM parameters help you track the effectiveness of marketing campaigns.</p>
<p>My User Journey automatically captures the following UTM parameters:</p>
<ul>
<li><code>utm_source</code> - Identifies the traffic source.</li>
<li><code>utm_medium</code> - Identifies the marketing medium.</li>
<li><code>utm_campaign</code> - Identifies the specific campaign.</li>
<li><code>utm_term</code> - Identifies paid search keywords.</li>
<li><code>utm_content</code> - Differentiates similar content or links.</li>
</ul>`,
  },
  "creating-custom-reports": {
    title: "Creating custom reports",
    topic: "Reports & Analysis",
    content: `<h2>Creating Custom Reports</h2>
<p>Build custom reports to focus on the metrics that matter most to your business.</p>
<ol>
<li>Navigate to <strong>Reports</strong> in the sidebar.</li>
<li>Click <strong>Create Report</strong>.</li>
<li>Select your data sources and metrics.</li>
<li>Add filters and date ranges.</li>
<li>Save and schedule automated delivery.</li>
</ol>`,
  },
  "exporting-data-to-csv-or-json": {
    title: "Exporting data to CSV or JSON",
    topic: "Reports & Analysis",
    content: `<h2>Exporting Data</h2>
<p>Export your analytics data for external analysis or reporting.</p>
<ol>
<li>Navigate to the report or data view you want to export.</li>
<li>Click the <strong>Export</strong> button.</li>
<li>Choose CSV or JSON format.</li>
<li>Download the file to your computer.</li>
</ol>`,
  },
  "setting-up-conversion-funnels": {
    title: "Setting up conversion funnels",
    topic: "Reports & Analysis",
    content: `<h2>Conversion Funnels</h2>
<p>Funnels help you understand where visitors drop off in multi-step processes.</p>
<ol>
<li>Go to <strong>Funnels</strong> in the sidebar.</li>
<li>Click <strong>Create Funnel</strong>.</li>
<li>Define each step using page URLs or custom events.</li>
<li>Save and monitor conversion rates between steps.</li>
</ol>`,
  },
  "using-the-ai-copilot-for-insights": {
    title: "Using the AI copilot for insights",
    topic: "Reports & Analysis",
    content: `<h2>AI Copilot for Insights</h2>
<p>The AI copilot analyses your data and provides actionable recommendations.</p>
<ol>
<li>Navigate to <strong>AI Insights</strong> in the sidebar.</li>
<li>Ask a question in natural language, such as "What are my top traffic sources this month?"</li>
<li>Review the AI-generated analysis and suggestions.</li>
<li>Apply recommended optimisations directly from the insights panel.</li>
</ol>`,
  },
};

function formatSlugToTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function HelpArticlePage() {
  const [, params] = useRoute("/help-center/:slug");
  const slug = params?.slug || "";

  const { data: apiArticle, isLoading } = useQuery<HelpArticle | null>({
    queryKey: ['/api/public/help-articles', slug],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/public/help-articles/${slug}`);
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    enabled: !!slug,
  });

  const article = apiArticle || defaultArticles[slug] || null;
  const fallbackTitle = formatSlugToTitle(slug);

  return (
    <PublicLayout>
      <SEOHead title={`${article?.title || fallbackTitle} - Help Center`} description={`Help article: ${article?.title || fallbackTitle}`} />
      <section className="max-w-4xl mx-auto px-6 pt-8">
        <Link href="/help-center" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" data-testid="link-back-help-center">
          <ArrowLeft className="h-4 w-4" />
          Back to Help Center
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20" data-testid="loading-spinner">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : article ? (
          <Card data-testid="card-article-content">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-xs" data-testid="badge-article-topic">{article.topic}</Badge>
                <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-article-title">{article.title}</h1>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-6 [&_h2]:mb-3 [&_strong]:text-foreground [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:leading-relaxed [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                  data-testid="content-article-body"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="card-article-not-found">
            <CardContent className="p-6 md:p-8 text-center space-y-4">
              <h1 className="text-2xl font-bold" data-testid="text-article-title">{fallbackTitle}</h1>
              <p className="text-muted-foreground">
                This article is coming soon. In the meantime, please visit our Help Center or contact support for assistance.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link href="/help-center">
                  <Button variant="outline" data-testid="button-back-help">Browse Help Center</Button>
                </Link>
                <Link href="/contact">
                  <Button data-testid="button-contact-support">Contact Support</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </PublicLayout>
  );
}
