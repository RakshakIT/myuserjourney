import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.terms.title} description={seoData.terms.description} keywords={seoData.terms.keywords} canonicalUrl="https://myuserjourney.co.uk/terms" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Legal</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Terms & Conditions
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By accessing or using My User Journey ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service. These terms apply to all users, including visitors, registered users, and administrators.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">2. Description of Service</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            My User Journey is a self-hosted, AI-powered analytics platform that provides website analytics, SEO analysis, PPC campaign management, and AI-powered insights. The Service is designed to be fully compliant with UK GDPR, EU GDPR, PECR, and ePrivacy regulations.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">3. User Accounts</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You must create an account to use certain features of the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use of your account.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">4. Data Processing</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            As a self-hosted solution, you are the data controller for all analytics data processed through your installation of My User Journey. We do not access, process, or store your analytics data on our servers. You are responsible for ensuring your use of the Service complies with applicable data protection laws.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">5. Acceptable Use</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You agree not to use the Service for any unlawful purpose, to violate any applicable laws or regulations, to infringe upon the rights of others, to transmit malicious code, or to attempt to gain unauthorised access to the Service or its systems.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">6. Intellectual Property</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Service and its original content, features, and functionality are owned by My User Journey and are protected by international copyright, trademark, and other intellectual property laws. Your analytics data remains your property at all times.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">7. Subscription & Payment</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Certain features of the Service require a paid subscription. Subscription fees are billed in advance on a monthly basis. You may cancel your subscription at any time, and cancellation will take effect at the end of the current billing period. No refunds are provided for partial months.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">8. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, My User Journey shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service. Our total liability shall not exceed the amount you have paid us in the twelve months preceding the claim.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">9. Changes to Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. We will provide notice of significant changes by posting the updated terms on the Service. Your continued use of the Service following such changes constitutes acceptance of the new terms.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">10. Governing Law</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
