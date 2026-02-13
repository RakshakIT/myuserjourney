import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/public-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, HelpCircle } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  projectLimit: number;
  features: string[];
}

const faqs = [
  { q: "Can I try My User Journey for free?", a: "Yes, every plan includes a free trial. Sign up and start tracking immediately with no credit card required." },
  { q: "What happens if I exceed my project limit?", a: "You can upgrade your plan at any time to unlock more projects. Your existing data is always preserved." },
  { q: "Is my data stored securely?", a: "Absolutely. My User Journey is self-hosted, meaning your data never leaves your infrastructure. We support full encryption at rest and in transit." },
  { q: "Do you offer custom enterprise plans?", a: "Yes, contact our sales team for custom pricing, dedicated support, and SLA guarantees for larger organisations." },
  { q: "Can I cancel at any time?", a: "Yes. All plans are month-to-month with no long-term commitment. You can cancel or change your plan at any time." },
  { q: "Is it GDPR compliant?", a: "My User Journey is built from the ground up for UK GDPR, EU GDPR, PECR, and ePrivacy compliance with consent management, IP anonymisation, and cookieless tracking." },
];

export default function PricingPage() {
  const { data: plans } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-xs">Pricing</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight" data-testid="text-page-title">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include core analytics features.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {(plans || []).map((plan, i) => (
            <Card
              key={plan.id}
              className={`relative ${i === 1 ? "border-primary" : ""}`}
              data-testid={`card-plan-${plan.slug}`}
            >
              {i === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.currency === "GBP" ? "\u00a3" : "$"}{plan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.projectLimit === -1
                    ? "Unlimited projects"
                    : `Up to ${plan.projectLimit} project${plan.projectLimit > 1 ? "s" : ""}`}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href="/login">
                  <Button
                    className="w-full"
                    variant={i === 1 ? "default" : "outline"}
                    data-testid={`button-select-${plan.slug}`}
                  >
                    Get Started
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-card/30 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8" data-testid="text-faq-title">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} data-testid={`card-faq-${i}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{faq.q}</p>
                      <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
