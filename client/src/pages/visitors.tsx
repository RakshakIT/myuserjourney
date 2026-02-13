import { useQuery } from "@tanstack/react-query";
import { useProject } from "@/lib/project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Download,
  Bot,
  Building2,
  Monitor,
  Globe,
  MapPin,
  Clock,
  Eye,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { ExportMenu } from "@/components/export-menu";

interface Visitor {
  visitorId: string;
  device: string;
  browser: string;
  os: string;
  country: string | null;
  city: string | null;
  region: string | null;
  ip: string | null;
  isBot: string;
  isInternal: string;
  firstSeen: string;
  lastSeen: string;
  totalEvents: number;
  totalPageViews: number;
  totalSessions: number;
  pages: string[];
}

export default function Visitors() {
  const { currentProject } = useProject();
  const [filter, setFilter] = useState<"all" | "humans" | "bots" | "internal">("all");

  const { data: visitors, isLoading } = useQuery<Visitor[]>({
    queryKey: ["/api/projects", currentProject?.id, "visitors"],
    enabled: !!currentProject,
  });

  const handleExport = (fmt: "json" | "csv") => {
    if (!currentProject) return;
    window.open(`/api/projects/${currentProject.id}/export?format=${fmt}`, "_blank");
  };

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Users className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No project selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a project to view visitors and export data.
        </p>
      </div>
    );
  }

  const filtered = visitors?.filter((v) => {
    if (filter === "humans") return v.isBot !== "true" && v.isInternal !== "true";
    if (filter === "bots") return v.isBot === "true";
    if (filter === "internal") return v.isInternal === "true";
    return true;
  }) || [];

  const botCount = visitors?.filter((v) => v.isBot === "true").length || 0;
  const humanCount = visitors?.filter((v) => v.isBot !== "true" && v.isInternal !== "true").length || 0;
  const internalCount = visitors?.filter((v) => v.isInternal === "true").length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-visitors-title">
            Visitors & Export
          </h1>
          <p className="text-sm text-muted-foreground">
            Unique visitors and data export for {currentProject.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {visitors && <ExportMenu data={visitors} filename="visitors" />}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            data-testid="button-export-csv"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
            data-testid="button-export-json"
          >
            <FileJson className="h-4 w-4 mr-1" />
            Export JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Visitors</p>
            <p className="text-xl font-bold" data-testid="text-total-visitors">{visitors?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Human Visitors</p>
            <p className="text-xl font-bold" data-testid="text-human-visitors">{humanCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Bot Traffic</p>
            <p className="text-xl font-bold" data-testid="text-bot-visitors">{botCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Internal Traffic</p>
            <p className="text-xl font-bold" data-testid="text-internal-visitors">{internalCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          data-testid="button-filter-all-visitors"
        >
          All ({visitors?.length || 0})
        </Button>
        <Button
          variant={filter === "humans" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("humans")}
          data-testid="button-filter-humans-visitors"
        >
          Humans ({humanCount})
        </Button>
        <Button
          variant={filter === "bots" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("bots")}
          data-testid="button-filter-bots-visitors"
        >
          <Bot className="h-3 w-3 mr-1" />
          Bots ({botCount})
        </Button>
        <Button
          variant={filter === "internal" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("internal")}
          data-testid="button-filter-internal-visitors"
        >
          <Building2 className="h-3 w-3 mr-1" />
          Internal ({internalCount})
        </Button>
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
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No visitors found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Install the tracking snippet to start collecting visitor data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-2">
            {filtered.map((visitor) => (
              <Card key={visitor.visitorId} data-testid={`card-visitor-${visitor.visitorId}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm font-mono">
                          {visitor.visitorId.length > 20
                            ? visitor.visitorId.slice(0, 20) + "..."
                            : visitor.visitorId}
                        </span>
                        {visitor.isBot === "true" && (
                          <Badge variant="destructive">
                            <Bot className="h-3 w-3 mr-1" />
                            Bot
                          </Badge>
                        )}
                        {visitor.isInternal === "true" && (
                          <Badge variant="secondary">
                            <Building2 className="h-3 w-3 mr-1" />
                            Internal
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          {visitor.device} / {visitor.browser} / {visitor.os}
                        </span>
                        {(visitor.city || visitor.country) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[visitor.city, visitor.region, visitor.country].filter(Boolean).join(", ")}
                          </span>
                        )}
                        {visitor.ip && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {visitor.ip}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{visitor.totalSessions} sessions</span>
                        <span>{visitor.totalPageViews} pages</span>
                        <span>{visitor.totalEvents} events</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Last: {format(new Date(visitor.lastSeen), "MMM d, HH:mm")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
