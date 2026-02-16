import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Shield,
  Lock,
  Eye,
  Server,
  Key,
  CheckCircle2,
  ArrowRight,
  Globe,
  Database,
  ShieldCheck,
} from "lucide-react";

const securityFeatures = [
  {
    title: "Self-Hosted Architecture",
    description: "Your data never leaves your infrastructure. Full control over storage, processing, and access. No third-party data processors involved.",
    icon: Server,
  },
  {
    title: "Encryption at Rest & Transit",
    description: "All data is encrypted using industry-standard AES-256 encryption at rest and TLS 1.3 for data in transit.",
    icon: Lock,
  },
  {
    title: "IP Anonymisation",
    description: "Automatically anonymise the last octet of visitor IP addresses to protect user privacy while maintaining geographic analytics.",
    icon: Eye,
  },
  {
    title: "Cookieless Tracking",
    description: "Track user activity without cookies, localStorage, or any persistent client-side identifiers.",
    icon: ShieldCheck,
  },
  {
    title: "Access Control",
    description: "Role-based access control with admin and user roles. Session management with secure, HTTP-only cookies.",
    icon: Key,
  },
  {
    title: "Data Sovereignty",
    description: "Choose where your data is stored. Self-hosted deployment ensures compliance with local data residency requirements.",
    icon: Database,
  },
];

const complianceItems = [
  { standard: "UK GDPR", description: "Full compliance with the UK General Data Protection Regulation" },
  { standard: "EU GDPR", description: "Full compliance with the EU General Data Protection Regulation" },
  { standard: "UK PECR", description: "Privacy and Electronic Communications Regulations compliance" },
  { standard: "EU ePrivacy", description: "EU ePrivacy Directive compliance for electronic communications" },
  { standard: "DNT Support", description: "Respects Do Not Track browser signals" },
  { standard: "Data Portability", description: "Export all visitor data in JSON or CSV format on request" },
  { standard: "Right to Erasure", description: "Delete individual visitor data on request" },
  { standard: "Consent Management", description: "Customisable consent banners with 6 consent categories" },
];

export default function SecurityPage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.security.title} description={seoData.security.description} keywords={seoData.security.keywords} canonicalUrl="https://myuserjourney.co.uk/security" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Security</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Secure, compliant data handling
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              My User Journey is built from the ground up with security and privacy at its core. Self-hosted means your data stays yours.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold mb-6">Security Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityFeatures.map((f) => (
            <Card key={f.title} data-testid={`card-security-${f.title.toLowerCase().replace(/\s/g, "-")}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10 shrink-0">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-bold mb-6 text-center">Compliance Standards</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {complianceItems.map((c) => (
              <div key={c.standard} className="flex items-start gap-3 p-4" data-testid={`item-compliance-${c.standard.toLowerCase().replace(/\s/g, "-")}`}>
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{c.standard}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Questions about security?</h2>
          <p className="text-muted-foreground">
            Contact our team for detailed information about our security practices and compliance certifications.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/contact">
              <Button data-testid="button-contact-security">
                Contact Security Team
              </Button>
            </Link>
            <Link href="/trust-center">
              <Button variant="outline" data-testid="button-trust-center" className="flex items-center gap-2">
                Visit Trust Center
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
