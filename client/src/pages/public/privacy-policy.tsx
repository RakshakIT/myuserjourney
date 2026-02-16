import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.privacyPolicy.title} description={seoData.privacyPolicy.description} keywords={seoData.privacyPolicy.keywords} canonicalUrl="https://myuserjourney.co.uk/privacy-policy" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Legal</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">1. Introduction</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            My User Journey ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our analytics platform. As a self-hosted solution, your analytics data is processed entirely within your own infrastructure.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">2. Information We Collect</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Account Information:</strong> When you create an account, we collect your name, email address, and authentication credentials provided through your chosen sign-in method (Google, GitHub, Apple, or email).
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Analytics Data:</strong> As a self-hosted platform, all analytics data (page views, events, visitor information) is processed and stored on your own servers. We do not have access to this data.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Usage Data:</strong> We may collect aggregated, non-identifying usage data about how the platform features are used to improve the Service.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">3. How We Use Your Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use the information we collect to provide and maintain the Service, authenticate your identity, send important notices about the Service, provide customer support, and improve the platform based on aggregated usage patterns.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">4. Data Protection</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We implement industry-standard security measures including encryption at rest (AES-256), encryption in transit (TLS 1.3), secure session management with HTTP-only cookies, and role-based access control. Your analytics data is self-hosted, ensuring complete data sovereignty.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">5. GDPR Compliance</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            My User Journey is designed for full compliance with UK GDPR, EU GDPR, UK PECR, and EU ePrivacy Directives. Key compliance features include:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
            <li>Customisable consent management with 6 consent categories</li>
            <li>IP anonymisation (last octet masking)</li>
            <li>Do Not Track (DNT) browser signal support</li>
            <li>Cookieless tracking mode</li>
            <li>Right to Erasure (data deletion on request)</li>
            <li>Data Portability (export in JSON/CSV format)</li>
            <li>Configurable data retention policies</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">6. Data Sharing</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties. We do not share your analytics data with anyone. As a self-hosted solution, your analytics data never leaves your infrastructure. We may use third-party services for authentication (as selected by you) and optional AI features (with your explicit configuration).
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">7. Your Rights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Under applicable data protection laws, you have the right to access the personal data we hold about you, rectify any inaccurate information, request deletion of your data, object to or restrict processing, receive your data in a portable format, and withdraw consent at any time.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">8. Cookies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The My User Journey platform uses essential session cookies for authentication. The tracking snippet deployed on your websites can operate in cookieless mode. When cookies are used for analytics tracking, they are subject to consent management and never shared with third parties.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">9. Data Retention</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Account data is retained for as long as your account is active. Analytics data retention is configurable per project, with options for automatic purging. When you delete your account, all associated data is permanently removed.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">10. Changes to This Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">11. Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at privacy@digitalanalyst.io.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
