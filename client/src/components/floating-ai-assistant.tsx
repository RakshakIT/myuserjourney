import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useProject } from "@/lib/project-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Bot,
  X,
  Send,
  Sparkles,
  User,
  Lightbulb,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PAGE_SUGGESTIONS: Record<string, string[]> = {
  "/": [
    "What are my key metrics this week?",
    "Summarise my dashboard performance",
    "How can I improve user engagement?",
  ],
  "/realtime": [
    "What's driving the current traffic spike?",
    "Are there any unusual patterns right now?",
  ],
  "/acquisition": [
    "Which acquisition channel is growing fastest?",
    "How can I improve organic traffic?",
  ],
  "/user-acquisition": [
    "What channels bring the most new users?",
    "Compare my acquisition channels",
  ],
  "/traffic-acquisition": [
    "Which traffic sources have the lowest bounce rate?",
    "How is paid traffic performing vs organic?",
  ],
  "/engagement": [
    "Which pages have the highest engagement?",
    "How can I increase session duration?",
  ],
  "/funnels": [
    "Create a checkout funnel for an e-commerce site",
    "Build a lead generation funnel",
    "Create a signup-to-activation funnel",
  ],
  "/reports": [
    "Generate a weekly traffic report",
    "Create a report showing top pages by country",
    "Build a device breakdown report",
  ],
  "/traffic-sources": [
    "Which referrers drive the most traffic?",
    "Analyse my social media traffic performance",
  ],
  "/pages": [
    "Which pages have high exit rates?",
    "Suggest improvements for my top pages",
  ],
  "/geography": [
    "Which countries should I target for growth?",
    "Compare traffic across regions",
  ],
  "/browsers": [
    "Do I have any browser compatibility issues?",
    "What devices do my users prefer?",
  ],
  "/seo": [
    "What SEO issues should I fix first?",
    "How can I improve my search rankings?",
  ],
  "/site-audit": [
    "What are the critical SEO issues?",
    "Suggest fixes for my meta descriptions",
  ],
  "/ppc": [
    "Which PPC campaigns have the best ROI?",
    "How can I reduce my cost per click?",
  ],
  "/visitors": [
    "What patterns do my returning visitors show?",
    "How can I increase visitor retention?",
  ],
  "/journeys": [
    "What is the most common user journey?",
    "Where do users drop off most?",
  ],
  "/custom-events": [
    "Create a custom event for form submissions",
    "Track button clicks across all pages",
  ],
  "/content-gap": [
    "Find content gaps for my domain",
    "Suggest blog topics for my niche",
    "Identify my top competitors",
  ],
  "/privacy": [
    "Am I GDPR compliant?",
    "What consent settings should I use?",
  ],
};

function getPageContext(path: string): string {
  if (path === "/") return "dashboard";
  const clean = path.replace("/", "");
  return clean || "dashboard";
}

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [location] = useLocation();
  const { currentProject } = useProject();

  const pageContext = getPageContext(location);
  const suggestions = PAGE_SUGGESTIONS[location] || PAGE_SUGGESTIONS["/"] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await apiRequest("POST", "/api/ai/chat", {
        prompt,
        pageContext,
        projectId: currentProject?.id,
      });
      return res.json();
    },
    onSuccess: (data: { response: string }) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    },
    onError: (err: Error) => {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `Sorry, I encountered an error. Please try again. ${err.message}` },
      ]);
    },
  });

  const handleSend = (text?: string) => {
    const prompt = text || input.trim();
    if (!prompt) return;
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    setInput("");
    chatMutation.mutate(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsOpen(true)}
          data-testid="button-ai-assistant-open"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`fixed z-50 shadow-xl border rounded-md bg-background flex flex-col ${
        isExpanded
          ? "bottom-4 right-4 left-4 top-4 md:left-auto md:w-[600px] md:top-4"
          : "bottom-6 right-6 w-[380px] h-[520px]"
      }`}
      data-testid="panel-ai-assistant"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">AI Assistant</span>
          <Badge variant="secondary" className="text-xs">{pageContext}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-ai-expand"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            data-testid="button-ai-assistant-close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">How can I help?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask me anything about your analytics, or use a suggestion below.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Suggestions for this page</p>
              {suggestions.map((s, i) => (
                <Card
                  key={i}
                  className="p-2.5 cursor-pointer hover-elevate"
                  onClick={() => handleSend(s)}
                  data-testid={`button-suggestion-${i}`}
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs">{s}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm">
                  {msg.content.split("\n").map((line, j) => {
                    if (line.startsWith("### ")) return <h3 key={j} className="font-semibold mt-2">{line.slice(4)}</h3>;
                    if (line.startsWith("## ")) return <h2 key={j} className="font-semibold mt-2">{line.slice(3)}</h2>;
                    if (line.startsWith("# ")) return <h1 key={j} className="font-bold mt-2">{line.slice(2)}</h1>;
                    if (line.startsWith("- ")) return <li key={j} className="ml-4">{formatBold(line.slice(2))}</li>;
                    if (line.startsWith("* ")) return <li key={j} className="ml-4">{formatBold(line.slice(2))}</li>;
                    if (line.match(/^\d+\. /)) return <li key={j} className="ml-4 list-decimal">{formatBold(line.replace(/^\d+\. /, ""))}</li>;
                    if (line.trim() === "") return <br key={j} />;
                    return <p key={j}>{formatBold(line)}</p>;
                  })}
                </div>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex gap-2 mb-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-md px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="px-3 py-2 border-t shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Ask anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={chatMutation.isPending}
            data-testid="input-ai-chat"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || chatMutation.isPending}
            data-testid="button-ai-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
