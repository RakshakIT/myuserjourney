import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PublicNavbar, PublicFooter } from "@/components/public-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Mail, CheckCircle } from "lucide-react";
import { SEOHead, seoData } from "@/components/seo-head";

export default function ContactPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send message");
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4" data-testid="text-contact-success">Message Sent</h1>
          <p className="text-muted-foreground mb-8" data-testid="text-contact-success-desc">
            Thank you for getting in touch. We'll get back to you as soon as possible.
          </p>
          <Button onClick={() => setSubmitted(false)} data-testid="button-send-another">
            Send Another Message
          </Button>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={seoData.contact.title} description={seoData.contact.description} keywords={seoData.contact.keywords} canonicalUrl="https://myuserjourney.co.uk/contact" />
      <PublicNavbar />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-contact-title">Get in Touch</h1>
          <p className="text-muted-foreground" data-testid="text-contact-desc">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitMutation.mutate(form);
              }}
              className="space-y-4"
              data-testid="form-contact"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    data-testid="input-contact-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    data-testid="input-contact-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  data-testid="input-contact-subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={6}
                  required
                  data-testid="input-contact-message"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={submitMutation.isPending}
                data-testid="button-contact-submit"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <PublicFooter />
    </div>
  );
}
