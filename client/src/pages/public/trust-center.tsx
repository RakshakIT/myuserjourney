import { PublicLayout } from "@/components/public-navbar";
import { SEOHead, seoData } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileText,
  Download,
  CheckCircle2,
  Lock,
  Globe,
  Server,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const trustDocuments = [
  {
    title: "Security Whitepaper",
    description: "Detailed overview of our security architecture, encryption standards, and data protection measures.",
    icon: Shield,
  },
  {
    title: "Privacy Impact Assessment",
    description: "Our privacy impact assessment covering data processing activities and risk mitigation strategies.",
    icon: Lock,
  },
  {
    title: "Data Processing Agreement",
    description: "Standard DPA template for organisations requiring formal data processing documentation.",
    icon: FileText,
  },
  {
    title: "Compliance Checklist",
    description: "A comprehensive checklist showing how My User Journey meets GDPR, PECR, and ePrivacy requirements.",
    icon: CheckCircle2,
  },
];

const principles = [
  {
    title: "Data Minimisation",
    description: "We only collect the data necessary for analytics. No unnecessary personal data is ever processed or stored.",
  },
  {
    title: "Purpose Limitation",
    description: "Data is used solely for the analytics purposes defined by our customers. No secondary use or data selling.",
  },
  {
    title: "Storage Limitation",
    description: "Configurable data retention periods ensure data is automatically purged when no longer needed.",
  },
  {
    title: "Transparency",
    description: "Clear, customisable consent banners inform visitors exactly what data is being collected and why.",
  },
  {
    title: "Individual Rights",
    description: "Built-in tools for Right to Erasure and Data Portability enable quick compliance with data subject requests.",
  },
  {
    title: "Security by Design",
    description: "Security is embedded into every layer of the platform, from data collection to storage and access control.",
  },
];

export default function TrustCenterPage() {
  return (
    <PublicLayout>
      <SEOHead title={seoData.trustCenter.title} description={seoData.trustCenter.description} keywords={seoData.trustCenter.keywords} canonicalUrl="https://myuserjourney.co.uk/trust-center" />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Trust Center</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Trust Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Resources for security and compliance. Everything you need to evaluate My User Journey for your organisation.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold mb-6">Security Documentation</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {trustDocuments.map((doc) => (
            <Card key={doc.title} className="hover-elevate" data-testid={`card-doc-${doc.title.toLowerCase().replace(/\s/g, "-")}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10 shrink-0">
                    <doc.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{doc.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                    <Button variant="ghost" size="sm" className="mt-2 -ml-2">
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-bold mb-6 text-center">Privacy Principles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {principles.map((p) => (
              <Card key={p.title} data-testid={`card-principle-${p.title.toLowerCase().replace(/\s/g, "-")}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Need more information?</h2>
          <p className="text-muted-foreground">
            Our security team is available to answer any questions about our security practices and compliance.
          </p>
          <Button data-testid="button-contact">
            Contact Security Team
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
