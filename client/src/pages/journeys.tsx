import { useQuery } from "@tanstack/react-query";
import { useProject } from "@/lib/project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Route,
  Eye,
  MousePointerClick,
  ScrollText,
  FormInput,
  AlertTriangle,
  Monitor,
  Globe,
  Clock,
  Bot,
  Building2,
  ChevronDown,
  ChevronRight,
  MapPin,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface JourneyEvent {
  id: string;
  eventType: string;
  page: string;
  timestamp: string;
  metadata: any;
}

interface Journey {
  sessionId: string;
  visitorId: string;
  device: string;
  browser: string;
  os: string;
  country: string | null;
  city: string | null;
  region: string | null;
  isBot: string;
  isInternal: string;
  startTime: string;
  endTime: string;
  duration: number;
  pageCount: number;
  pages: string[];
  eventCount: number;
  events: JourneyEvent[];
  referrer: string;
}

const eventIcons: Record<string, any> = {
  pageview: Eye,
  click: MousePointerClick,
  scroll: ScrollText,
  form_submit: FormInput,
  rage_click: AlertTriangle,
};

function JourneyCard({ journey }: { journey: Journey }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card data-testid={`card-journey-${journey.sessionId}`}>
      <CardContent className="p-4">
        <div
          className="flex items-center gap-3 cursor-pointer flex-wrap"
          onClick={() => setExpanded(!expanded)}
          data-testid={`button-expand-journey-${journey.sessionId}`}
        >
          <Button size="icon" variant="ghost" className="shrink-0">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm font-mono" data-testid={`text-visitor-${journey.visitorId}`}>
                {journey.visitorId.slice(0, 16)}...
              </span>
              {journey.isBot === "true" && (
                <Badge variant="destructive" data-testid={`badge-bot-${journey.sessionId}`}>
                  <Bot className="h-3 w-3 mr-1" />
                  Bot
                </Badge>
              )}
              {journey.isInternal === "true" && (
                <Badge variant="secondary" data-testid={`badge-internal-${journey.sessionId}`}>
                  <Building2 className="h-3 w-3 mr-1" />
                  Internal
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                {journey.device} / {journey.browser}
              </span>
              {(journey.city || journey.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[journey.city, journey.region, journey.country].filter(Boolean).join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {journey.duration}s
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {journey.pageCount} pages
              </span>
              <span>{journey.eventCount} events</span>
            </div>
          </div>

          <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
            {format(new Date(journey.startTime), "MMM d, HH:mm")}
          </span>
        </div>

        {expanded && (
          <div className="mt-4 ml-12 border-l-2 border-muted pl-4 space-y-3">
            <div className="text-xs text-muted-foreground mb-2">
              Referrer: {journey.referrer || "Direct"}
            </div>
            {journey.events.map((evt, i) => {
              const Icon = eventIcons[evt.eventType] || Eye;
              return (
                <div key={evt.id || i} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium capitalize">
                      {evt.eventType.replace(/_/g, " ")}
                    </span>
                    {evt.page && (
                      <span className="text-xs text-muted-foreground ml-2">{evt.page}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {format(new Date(evt.timestamp), "HH:mm:ss")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Journeys() {
  const { currentProject } = useProject();
  const [filter, setFilter] = useState<"all" | "humans" | "bots">("all");

  const { data: journeys, isLoading } = useQuery<Journey[]>({
    queryKey: ["/api/projects", currentProject?.id, "journeys"],
    enabled: !!currentProject,
  });

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Route className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No project selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a project to view user journeys.
        </p>
      </div>
    );
  }

  const filtered = journeys?.filter((j) => {
    if (filter === "humans") return j.isBot !== "true";
    if (filter === "bots") return j.isBot === "true";
    return true;
  }) || [];

  const botCount = journeys?.filter((j) => j.isBot === "true").length || 0;
  const humanCount = journeys?.filter((j) => j.isBot !== "true").length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-journeys-title">
            User Journeys
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete session timelines for {currentProject.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            data-testid="button-filter-all"
          >
            All ({journeys?.length || 0})
          </Button>
          <Button
            variant={filter === "humans" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("humans")}
            data-testid="button-filter-humans"
          >
            Humans ({humanCount})
          </Button>
          <Button
            variant={filter === "bots" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("bots")}
            data-testid="button-filter-bots"
          >
            <Bot className="h-3 w-3 mr-1" />
            Bots ({botCount})
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Route className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No journeys recorded</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Install the tracking snippet on your website to start tracking user journeys.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-2">
            {filtered.map((journey) => (
              <JourneyCard key={journey.sessionId} journey={journey} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
