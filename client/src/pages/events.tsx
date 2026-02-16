import { useQuery } from "@tanstack/react-query";
import { useProject } from "@/lib/project-context";
import { useState } from "react";
import type { Event } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  Eye,
  MousePointerClick,
  ScrollText,
  FormInput,
  Pointer,
  AlertTriangle,
  Monitor,
  Bot,
  Building2,
  MapPin,
  User,
  Filter,
  Server,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ExportMenu } from "@/components/export-menu";
import { FeatureGuide, GUIDE_CONFIGS } from "@/components/feature-guide";

const eventTypeIcons: Record<string, any> = {
  pageview: Eye,
  click: MousePointerClick,
  scroll: ScrollText,
  form_submit: FormInput,
  hover: Pointer,
  rage_click: AlertTriangle,
};

const eventTypeColors: Record<string, string> = {
  pageview: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  click: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  scroll: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  form_submit: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  hover: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  rage_click: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const sourceLabels: Record<string, string> = {
  direct: "Direct",
  organic_search: "Organic Search",
  social: "Social",
  referral: "Referral",
  email: "Email",
  paid_search: "Paid Search",
  paid_social: "Paid Social",
  display: "Display",
  affiliate: "Affiliate",
  internal: "Internal",
};

export default function Events() {
  const { currentProject } = useProject();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    eventType: "",
    device: "",
    browser: "",
    country: "",
    trafficSource: "",
    isBot: "",
    isInternal: "",
    isServer: "",
    page: "",
  });

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  const filterString = Object.entries(filters)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  const eventsUrl = hasActiveFilters
    ? `/api/projects/${currentProject?.id}/events/filtered?${filterString}&limit=200`
    : `/api/projects/${currentProject?.id}/events`;

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/projects", currentProject?.id, "events", filterString],
    queryFn: async () => {
      const res = await fetch(eventsUrl);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    enabled: !!currentProject,
    refetchInterval: 5000,
  });

  const clearFilters = () => {
    setFilters({
      eventType: "",
      device: "",
      browser: "",
      country: "",
      trafficSource: "",
      isBot: "",
      isInternal: "",
      isServer: "",
      page: "",
    });
  };

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Activity className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No project selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a project to view live events.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <FeatureGuide {...GUIDE_CONFIGS.events} />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-events-title">
            Live Events
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time event stream for {currentProject.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {events && <ExportMenu data={events} filename="events" />}
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.values(filters).filter(v => v !== "").length}
              </Badge>
            )}
          </Button>
          <Badge variant="outline" className="gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Auto-refreshing
          </Badge>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Select value={filters.eventType} onValueChange={(v) => setFilters({ ...filters, eventType: v === "all" ? "" : v })}>
                <SelectTrigger data-testid="filter-event-type">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pageview">Page View</SelectItem>
                  <SelectItem value="click">Click</SelectItem>
                  <SelectItem value="scroll">Scroll</SelectItem>
                  <SelectItem value="form_submit">Form Submit</SelectItem>
                  <SelectItem value="rage_click">Rage Click</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.device} onValueChange={(v) => setFilters({ ...filters, device: v === "all" ? "" : v })}>
                <SelectTrigger data-testid="filter-device">
                  <SelectValue placeholder="Device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="Desktop">Desktop</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.trafficSource} onValueChange={(v) => setFilters({ ...filters, trafficSource: v === "all" ? "" : v })}>
                <SelectTrigger data-testid="filter-traffic-source">
                  <SelectValue placeholder="Traffic Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="organic_search">Organic Search</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="paid_search">Paid Search</SelectItem>
                  <SelectItem value="display">Display</SelectItem>
                  <SelectItem value="affiliate">Affiliate</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.isBot} onValueChange={(v) => setFilters({ ...filters, isBot: v === "all" ? "" : v })}>
                <SelectTrigger data-testid="filter-bot">
                  <SelectValue placeholder="Bot Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Traffic</SelectItem>
                  <SelectItem value="true">Bots Only</SelectItem>
                  <SelectItem value="false">Humans Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.isInternal} onValueChange={(v) => setFilters({ ...filters, isInternal: v === "all" ? "" : v })}>
                <SelectTrigger data-testid="filter-internal">
                  <SelectValue placeholder="Internal Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Traffic</SelectItem>
                  <SelectItem value="true">Internal Only</SelectItem>
                  <SelectItem value="false">External Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.isServer} onValueChange={(v) => setFilters({ ...filters, isServer: v === "all" ? "" : v })}>
                <SelectTrigger data-testid="filter-server">
                  <SelectValue placeholder="Server Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Traffic</SelectItem>
                  <SelectItem value="true">Server/Cron Only</SelectItem>
                  <SelectItem value="false">Browser Only</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Filter by country"
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                data-testid="filter-country"
              />

              <Input
                placeholder="Filter by page URL"
                value={filters.page}
                onChange={(e) => setFilters({ ...filters, page: e.target.value })}
                data-testid="filter-page"
              />

              <Input
                placeholder="Filter by browser"
                value={filters.browser}
                onChange={(e) => setFilters({ ...filters, browser: e.target.value })}
                data-testid="filter-browser"
              />

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !events || events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No events found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {hasActiveFilters
                ? "Try adjusting your filters to see more events."
                : "Install the tracking snippet on your website to start capturing user events."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-2">
            {events.map((event) => {
              const Icon = eventTypeIcons[event.eventType] || Activity;
              const colorClass = eventTypeColors[event.eventType] || "bg-muted text-muted-foreground";

              return (
                <Card key={event.id} data-testid={`card-event-${event.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm capitalize">
                            {event.eventType.replace(/_/g, " ")}
                          </span>
                          {event.page && (
                            <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                              {event.page}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {event.visitorId && (
                            <span className="flex items-center gap-1 font-mono">
                              <User className="h-3 w-3" />
                              {event.visitorId.slice(0, 12)}
                            </span>
                          )}
                          {event.device && (
                            <span className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              {event.device}
                            </span>
                          )}
                          {event.browser && <span>{event.browser}</span>}
                          {(event.city || event.country) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {[event.city, event.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                          {event.trafficSource && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {sourceLabels[event.trafficSource] || event.trafficSource}
                            </Badge>
                          )}
                          {event.isBot === "true" && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              <Bot className="h-2.5 w-2.5 mr-0.5" />
                              Bot
                            </Badge>
                          )}
                          {event.isInternal === "true" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              <Building2 className="h-2.5 w-2.5 mr-0.5" />
                              Internal
                            </Badge>
                          )}
                          {event.isServer === "true" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              <Server className="h-2.5 w-2.5 mr-0.5" />
                              Server
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                        {format(new Date(event.timestamp), "HH:mm:ss")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
