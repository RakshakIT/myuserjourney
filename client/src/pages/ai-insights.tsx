import { useProject } from "@/lib/project-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AiApiNotice } from "@/components/ai-api-notice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AiSettings } from "@shared/schema";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  Target,
  AlertCircle,
  BarChart3,
  Search,
  Eye,
  Plus,
  X,
  Globe,
  LineChart,
  MessageSquare,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CopilotTab {
  id: string;
  label: string;
  icon: typeof Sparkles;
  context: string;
  messages: Message[];
  suggestedQueries: { icon: typeof TrendingUp; text: string }[];
}

const tabConfigs: Omit<CopilotTab, "messages">[] = [
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    context: "analytics",
    suggestedQueries: [
      { icon: TrendingUp, text: "What are the top traffic trends this week?" },
      { icon: Target, text: "Which pages have the highest bounce rate?" },
      { icon: Lightbulb, text: "Suggest improvements for user engagement" },
      { icon: AlertCircle, text: "What SEO issues need immediate attention?" },
    ],
  },
  {
    id: "search-console",
    label: "Search Console",
    icon: Search,
    context: "search_console",
    suggestedQueries: [
      { icon: TrendingUp, text: "Which queries are trending up in impressions?" },
      { icon: Target, text: "What pages have the best CTR?" },
      { icon: Lightbulb, text: "Find keyword opportunities with high impressions but low clicks" },
      { icon: Globe, text: "Which countries drive the most organic traffic?" },
    ],
  },
  {
    id: "google-analytics",
    label: "Google Analytics",
    icon: LineChart,
    context: "google_analytics",
    suggestedQueries: [
      { icon: TrendingUp, text: "Compare this month's traffic to last month" },
      { icon: Target, text: "What are the top conversion paths?" },
      { icon: Lightbulb, text: "Which audience segments are most engaged?" },
      { icon: Eye, text: "Analyze the drop in sessions this week" },
    ],
  },
  {
    id: "ai-visibility",
    label: "AI Visibility",
    icon: Eye,
    context: "ai_visibility",
    suggestedQueries: [
      { icon: TrendingUp, text: "How is my site appearing in AI-generated answers?" },
      { icon: Target, text: "Which content is most cited by AI models?" },
      { icon: Lightbulb, text: "How can I improve visibility in AI search results?" },
      { icon: Search, text: "Compare my AI visibility to competitors" },
    ],
  },
];

export default function AiInsights() {
  const { currentProject } = useProject();
  const [activeTab, setActiveTab] = useState("analytics");
  const [tabMessages, setTabMessages] = useState<Record<string, Message[]>>({
    analytics: [],
    "search-console": [],
    "google-analytics": [],
    "ai-visibility": [],
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: aiSettings } = useQuery<AiSettings | null>({
    queryKey: ["/api/ai-settings"],
  });

  const hasAiConfigured = aiSettings?.provider && aiSettings.provider !== "none";

  const askMutation = useMutation({
    mutationFn: async ({ prompt, context }: { prompt: string; context: string }) => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/ai-insights`, {
        prompt,
        context,
      });
      return res.json();
    },
    onSuccess: (data: { insight: string }) => {
      setTabMessages((prev) => ({
        ...prev,
        [activeTab]: [
          ...prev[activeTab],
          { role: "assistant" as const, content: data.insight, timestamp: new Date() },
        ],
      }));
    },
    onError: (err: Error) => {
      setTabMessages((prev) => ({
        ...prev,
        [activeTab]: [
          ...prev[activeTab],
          {
            role: "assistant" as const,
            content: `I encountered an error: ${err.message}. Please check your AI settings.`,
            timestamp: new Date(),
          },
        ],
      }));
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [tabMessages, activeTab]);

  const handleSend = (text?: string) => {
    const prompt = text || input.trim();
    if (!prompt) return;
    const currentConfig = tabConfigs.find((t) => t.id === activeTab);
    setTabMessages((prev) => ({
      ...prev,
      [activeTab]: [
        ...prev[activeTab],
        { role: "user" as const, content: prompt, timestamp: new Date() },
      ],
    }));
    setInput("");
    askMutation.mutate({ prompt, context: currentConfig?.context || "analytics" });
  };

  const clearChat = () => {
    setTabMessages((prev) => ({ ...prev, [activeTab]: [] }));
  };

  const currentMessages = tabMessages[activeTab] || [];
  const currentConfig = tabConfigs.find((t) => t.id === activeTab);

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Sparkles className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No project selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a project to get AI-powered insights.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-49px)]">
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-ai-title">
              AI Copilot
            </h1>
            <Badge variant="secondary">Beta</Badge>
          </div>
          {currentMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              data-testid="button-clear-chat"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 pb-2">
        <AiApiNotice />
      </div>

      <div className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start gap-1 bg-transparent p-0 border-b rounded-none h-auto pb-0">
            {tabConfigs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2.5 pt-1.5 text-sm gap-1.5"
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {(tabMessages[tab.id]?.length || 0) > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {tabMessages[tab.id].length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {!hasAiConfigured && (
        <div className="px-6 pt-3">
          <div className="rounded-md bg-amber-500/5 border border-amber-500/10 p-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-amber-600 dark:text-amber-400">AI not configured</span>
                {" - "}Go to Settings to configure your LLM provider.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden px-6 pt-3">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
              {currentConfig && <currentConfig.icon className="h-6 w-6 text-primary" />}
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {currentConfig?.label} Copilot
            </h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              {activeTab === "analytics" && "Ask questions about your website performance, user behavior, or get actionable recommendations."}
              {activeTab === "search-console" && "Analyze your Search Console data - queries, impressions, clicks, and search visibility."}
              {activeTab === "google-analytics" && "Explore your Google Analytics data - audiences, conversions, and traffic patterns."}
              {activeTab === "ai-visibility" && "Understand how AI search engines reference and cite your content."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {currentConfig?.suggestedQueries.map((q) => (
                <Card
                  key={q.text}
                  className="hover-elevate cursor-pointer"
                  onClick={() => handleSend(q.text)}
                  data-testid={`card-suggestion-${q.text.slice(0, 20)}`}
                >
                  <CardContent className="p-3.5 flex items-start gap-2.5">
                    <q.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm leading-snug">{q.text}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full pr-2" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {currentMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                    data-testid={`text-message-${i}`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {askMutation.isPending && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="p-4 px-6 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-3"
        >
          <div className="flex-1 relative">
            <Textarea
              placeholder={`Ask about ${currentConfig?.label.toLowerCase() || "analytics"}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="resize-none min-h-[44px] max-h-32 pr-3"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              data-testid="input-ai-prompt"
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || askMutation.isPending}
            data-testid="button-send-ai"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex items-center gap-2 mt-2">
          <MessageSquare className="h-3 w-3 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">
            AI responses are based on your project data. Shift+Enter for new line.
          </p>
        </div>
      </div>
    </div>
  );
}
