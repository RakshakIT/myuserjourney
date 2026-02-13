import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useProject } from "@/lib/project-context";
import type { PpcCampaign } from "@shared/schema";
import { insertPpcCampaignSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Megaphone,
  Plus,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Target,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: any;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PpcPage() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { data: campaigns, isLoading } = useQuery<PpcCampaign[]>({
    queryKey: ["/api/projects", currentProject?.id, "ppc"],
    enabled: !!currentProject,
  });

  const form = useForm({
    resolver: zodResolver(
      insertPpcCampaignSchema.pick({
        name: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        budget: true,
      })
    ),
    defaultValues: {
      name: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      budget: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/ppc`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "ppc"] });
      setOpen(false);
      form.reset();
      toast({ title: "Campaign created" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Megaphone className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No project selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a project to manage PPC campaigns.
        </p>
      </div>
    );
  }

  const totalClicks = campaigns?.reduce((s, c) => s + c.clicks, 0) || 0;
  const totalConversions = campaigns?.reduce((s, c) => s + c.conversions, 0) || 0;
  const totalCost = campaigns?.reduce((s, c) => s + c.cost, 0) || 0;
  const totalImpressions = campaigns?.reduce((s, c) => s + c.impressions, 0) || 0;
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0";
  const convRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0";

  const chartData = campaigns?.map((c) => ({
    name: c.name.length > 15 ? c.name.slice(0, 15) + "..." : c.name,
    clicks: c.clicks,
    conversions: c.conversions,
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-ppc-title">
            PPC Campaigns
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and optimize your advertising campaigns
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-campaign">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createMutation.mutate({ ...d, projectId: currentProject.id }))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Sale 2025" {...field} data-testid="input-campaign-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="utmSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Source</FormLabel>
                        <FormControl>
                          <Input placeholder="google" {...field} value={field.value || ""} data-testid="input-utm-source" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="utmMedium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Medium</FormLabel>
                        <FormControl>
                          <Input placeholder="cpc" {...field} value={field.value || ""} data-testid="input-utm-medium" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="utmCampaign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Campaign</FormLabel>
                        <FormControl>
                          <Input placeholder="summer25" {...field} value={field.value || ""} data-testid="input-utm-campaign" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-campaign-budget"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-campaign">
                  {createMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Clicks" value={totalClicks.toLocaleString()} icon={MousePointerClick} />
        <MetricCard title="Conversions" value={totalConversions.toLocaleString()} icon={Target} />
        <MetricCard title="Avg CTR" value={`${avgCtr}%`} icon={TrendingUp} />
        <MetricCard title="Total Spend" value={`$${totalCost.toLocaleString()}`} icon={DollarSign} />
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : campaigns && campaigns.length > 0 ? (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 60%)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid hsl(0, 0%, 91%)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="clicks" fill="hsl(217, 91%, 35%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" fill="hsl(187, 71%, 32%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">All Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Conv.</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => {
                    const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : "0";
                    return (
                      <TableRow key={c.id} data-testid={`row-campaign-${c.id}`}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{c.utmSource || "-"}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.impressions.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums">{ctr}%</TableCell>
                        <TableCell className="text-right tabular-nums">{c.conversions}</TableCell>
                        <TableCell className="text-right tabular-nums">${c.cost.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={c.status === "active" ? "default" : "secondary"}>
                            {c.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first PPC campaign to start tracking ad performance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
