import { useProject } from "@/lib/project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Code2, Copy, Check, Info } from "lucide-react";
import { useState } from "react";

export default function Snippet() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Code2 className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No project selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a project to get the tracking code.
        </p>
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const snippetCode = `<script>
(function(w,d,pID){
  var s = d.createElement('script');
  s.src='${baseUrl}/snippet.js';
  s.async=true;
  s.dataset.projectId=pID;
  d.head.appendChild(s);
})(window, document, '${currentProject.id}');
</script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-snippet-title">
          Tracking Code
        </h1>
        <p className="text-sm text-muted-foreground">
          Install this snippet on your website to start tracking
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium">JavaScript Snippet</CardTitle>
          <Badge variant="secondary">
            {currentProject.name}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="rounded-md bg-muted p-4 text-sm font-mono overflow-x-auto">
              <code data-testid="text-snippet-code">{snippetCode}</code>
            </pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={handleCopy}
              data-testid="button-copy-snippet"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="rounded-md bg-blue-500/5 border border-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-600 dark:text-blue-400">Installation Guide</p>
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                  <li>Copy the code snippet above</li>
                  <li>
                    Paste it inside the <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> tag of your website
                  </li>
                  <li>The snippet loads asynchronously and won't affect page speed</li>
                  <li>Events will appear in the Live Events tab within seconds</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">What gets tracked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Page Views", desc: "Every page navigation" },
              { label: "Clicks", desc: "User click interactions" },
              { label: "Scroll Depth", desc: "How far users scroll" },
              { label: "Form Submissions", desc: "Form completion events" },
              { label: "Rage Clicks", desc: "Repeated rapid clicks" },
              { label: "Device & Browser", desc: "Technical environment" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-green-500" />
            <CardTitle className="text-sm font-medium">UK & EU Privacy Compliance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The tracking snippet is compliant with UK GDPR, UK PECR, EU GDPR, and EU ePrivacy Directive. It automatically:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Consent Banner", desc: "Opt-in consent with equal Accept/Reject buttons" },
                { label: "Granular Categories", desc: "Per-category toggles (analytics, marketing, personalisation)" },
                { label: "Cookie List", desc: "Displays all cookies with purpose and duration" },
                { label: "Consent Withdrawal", desc: "Persistent Cookie Settings button on every page" },
                { label: "IP Anonymisation", desc: "Masks IPs, no third-party geo API calls" },
                { label: "DNT Respect", desc: "Honours Do Not Track browser headers" },
                { label: "Cookieless Option", desc: "Track without cookies or localStorage" },
                { label: "Consent Records", desc: "Versioned audit trail with categories accepted" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs">
              Configure privacy settings in the <span className="font-medium">Privacy & GDPR</span> section under Management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
