import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { AiSettings } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Settings, ExternalLink, Key, Cpu, Save, CheckCircle2, ArrowRightLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useProject } from "@/lib/project-context";

const providers = [
  { value: "none", label: "No AI Provider" },
  { value: "openai", label: "OpenAI" },
  { value: "cohere", label: "Cohere" },
  { value: "huggingface", label: "Hugging Face" },
  { value: "gpt4all", label: "GPT4All (Local)" },
  { value: "openassistant", label: "OpenAssistant" },
];

const freeLlmOptions = [
  {
    name: "GPT4All",
    description: "Local/cloud hosted, no API key needed",
    link: "https://gpt4all.io",
  },
  {
    name: "MPT-7B",
    description: "Self-hosted model by MosaicML",
    link: "https://www.mosaicml.com/models/mpt",
  },
  {
    name: "OpenAssistant",
    description: "Open-source conversational AI",
    link: "https://open-assistant.io",
  },
  {
    name: "Hugging Face",
    description: "Many free models available",
    link: "https://huggingface.co/models",
  },
  {
    name: "Cohere",
    description: "Free tier available for developers",
    link: "https://cohere.com",
  },
];

export default function SettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<AiSettings | null>({
    queryKey: ["/api/ai-settings"],
  });

  const form = useForm({
    defaultValues: {
      provider: "none",
      apiKey: "",
      model: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        provider: settings.provider || "none",
        apiKey: settings.apiKey || "",
        model: settings.model || "",
      });
    }
  }, [settings, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/ai-settings", {
        ...data,
        userId: "default",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-settings"] });
      toast({ title: "Settings saved" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const selectedProvider = form.watch("provider");
  const needsApiKey = ["openai", "cohere", "huggingface"].includes(selectedProvider);

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-settings-title">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure your AI provider and platform preferences
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">AI Provider Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LLM Provider</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-provider">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providers.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your preferred AI/LLM provider for generating insights
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {needsApiKey && (
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Enter your API key"
                                className="pl-9"
                                {...field}
                                value={field.value || ""}
                                data-testid="input-api-key"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Your API key is encrypted and stored securely
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., gpt-4, command-xlarge"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-model"
                          />
                        </FormControl>
                        <FormDescription>
                          Specify a model name, or leave blank for the default
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-settings">
                    <Save className="h-4 w-4 mr-2" />
                    {saveMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Free LLM Options</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You can use these free or open-source LLM providers instead of paid APIs.
              </p>
              <div className="space-y-3">
                {freeLlmOptions.map((opt) => (
                  <div
                    key={opt.name}
                    className="flex items-center justify-between gap-3 rounded-md border p-3 flex-wrap"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{opt.name}</span>
                        <Badge variant="secondary">Free</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                    <a href={opt.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" data-testid={`button-visit-${opt.name.toLowerCase().replace(/\s+/g, "-")}`}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Visit
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <ProjectTransferSection />
        </>
      )}
    </div>
  );
}

function ProjectTransferSection() {
  const { currentProject, setCurrentProject } = useProject();
  const [transferEmail, setTransferEmail] = useState("");
  const { toast } = useToast();

  const transferMutation = useMutation({
    mutationFn: async ({ projectId, email }: { projectId: string; email: string }) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/transfer`, { email });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setTransferEmail("");
      setCurrentProject(null);
      toast({
        title: "Ownership transferred",
        description: `Project transferred to ${data.newOwnerUsername}`,
      });
    },
    onError: (err: any) => {
      toast({ title: "Transfer failed", description: err.message, variant: "destructive" });
    },
  });

  if (!currentProject) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Transfer Project Ownership</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a project first to transfer ownership.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Transfer Project Ownership</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Transfer ownership of <span className="font-medium text-foreground">{currentProject.name}</span> to another user. 
          The new owner will have full control of the project and its data.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (transferEmail.trim() && currentProject) {
              transferMutation.mutate({ projectId: currentProject.id, email: transferEmail.trim() });
            }
          }}
        >
          <Input
            type="email"
            placeholder="Enter recipient's email address"
            value={transferEmail}
            onChange={(e) => setTransferEmail(e.target.value)}
            data-testid="input-transfer-email"
          />
          <Button
            type="submit"
            variant="destructive"
            disabled={transferMutation.isPending || !transferEmail.trim()}
            data-testid="button-transfer-ownership"
          >
            {transferMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Transferring...
              </>
            ) : (
              "Transfer"
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          This action cannot be undone. Make sure you have the correct email address.
        </p>
      </CardContent>
    </Card>
  );
}
