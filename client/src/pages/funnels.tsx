import { useProject } from "@/lib/project-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AiApiNotice } from "@/components/ai-api-notice";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { GitFork, Plus, Trash2, ArrowDown, Eye, ChevronRight, Sparkles, Loader2, GripVertical, ArrowRight, MousePointerClick, FileText, Zap, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useDateRange } from "@/hooks/use-date-range";
import { DateRangePicker } from "@/components/date-range-picker";
import type { Funnel } from "@shared/schema";
import { FeatureGuide, GUIDE_CONFIGS } from "@/components/feature-guide";

interface FunnelStep {
  name: string;
  type: string;
  value: string;
}

interface FunnelAnalysis {
  funnel: { id: string; name: string };
  dateRange: { from: string; to: string };
  totalSessions: number;
  steps: {
    name: string;
    type: string;
    value: string;
    users: number;
    dropOff: number;
    dropOffRate: number;
  }[];
  overallConversion: number;
}

const stepTypeConfig: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  pageview: { icon: FileText, label: "Page View", color: "hsl(210, 65%, 55%)" },
  event: { icon: Zap, label: "Event", color: "hsl(280, 65%, 55%)" },
  click: { icon: MousePointerClick, label: "Click", color: "hsl(340, 65%, 55%)" },
};

function VisualFunnelBuilder({
  steps,
  onStepsChange,
}: {
  steps: FunnelStep[];
  onStepsChange: (steps: FunnelStep[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((idx: number) => {
    setDragIndex(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  }, []);

  const handleDrop = useCallback((idx: number) => {
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...steps];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(idx, 0, moved);
    onStepsChange(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex, steps, onStepsChange]);

  const updateStep = (idx: number, field: keyof FunnelStep, value: string) => {
    const updated = [...steps];
    updated[idx] = { ...updated[idx], [field]: value };
    onStepsChange(updated);
  };

  const removeStep = (idx: number) => {
    if (steps.length > 1) {
      onStepsChange(steps.filter((_, i) => i !== idx));
    }
  };

  const addStep = () => {
    onStepsChange([...steps, { name: `Step ${steps.length + 1}`, type: "pageview", value: "" }]);
  };

  return (
    <div className="space-y-2">
      {steps.map((step, idx) => {
        const config = stepTypeConfig[step.type] || stepTypeConfig.pageview;
        const StepIcon = config.icon;
        const isDragging = dragIndex === idx;
        const isDragOver = dragOverIndex === idx;

        return (
          <div key={idx}>
            <div
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              className={`flex items-stretch gap-0 border rounded-md transition-all ${isDragging ? "opacity-40" : ""} ${isDragOver ? "border-primary border-dashed" : ""}`}
              data-testid={`builder-step-${idx}`}
            >
              <div
                className="flex items-center px-2 cursor-grab active:cursor-grabbing border-r"
                data-testid={`drag-handle-${idx}`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center px-3 border-r" style={{ color: config.color }}>
                <StepIcon className="h-4 w-4" />
              </div>

              <div className="flex-1 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="shrink-0">Step {idx + 1}</Badge>
                  <Input
                    value={step.name}
                    onChange={(e) => updateStep(idx, "name", e.target.value)}
                    className="h-7 text-sm"
                    data-testid={`input-builder-step-name-${idx}`}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={step.type} onValueChange={(v) => updateStep(idx, "type", v)}>
                    <SelectTrigger className="w-28 h-7 text-xs" data-testid={`select-builder-step-type-${idx}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pageview">Page View</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="click">Click</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={step.type === "pageview" ? "/page-url" : step.type === "click" ? "Click target" : "Event type"}
                    value={step.value}
                    onChange={(e) => updateStep(idx, "value", e.target.value)}
                    className="flex-1 h-7 text-xs"
                    data-testid={`input-builder-step-value-${idx}`}
                  />
                </div>
              </div>

              <div className="flex items-center px-2 border-l">
                {steps.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeStep(idx)}
                    data-testid={`button-builder-remove-step-${idx}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      })}

      <Button variant="outline" onClick={addStep} className="w-full" data-testid="button-builder-add-step">
        <Plus className="h-4 w-4 mr-2" />
        Add Step
      </Button>
    </div>
  );
}

function VisualFunnelPreview({ steps }: { steps: FunnelStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const config = stepTypeConfig[step.type] || stepTypeConfig.pageview;
        const StepIcon = config.icon;
        const widthPercent = 100 - (idx * (60 / Math.max(steps.length - 1, 1)));

        return (
          <div key={idx} className="flex items-center gap-1 shrink-0">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-md border text-xs"
              style={{ borderColor: config.color, minWidth: `${Math.max(widthPercent, 40)}px` }}
              data-testid={`preview-step-${idx}`}
            >
              <StepIcon className="h-3 w-3 shrink-0" style={{ color: config.color }} />
              <span className="truncate">{step.name}</span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function FunnelsPage() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const { queryParams, headerProps } = useDateRange();
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSteps, setNewSteps] = useState<FunnelStep[]>([
    { name: "Step 1", type: "pageview", value: "/" },
  ]);
  const [showAiGenerate, setShowAiGenerate] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("builder");

  const { data: funnelList, isLoading } = useQuery<Funnel[]>({
    queryKey: ["/api/projects", currentProject?.id, "funnels"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/funnels`);
      return res.json();
    },
    enabled: !!currentProject,
  });

  const { data: analysis } = useQuery<FunnelAnalysis>({
    queryKey: ["/api/projects", currentProject?.id, "funnels", selectedFunnel, "analysis", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/funnels/${selectedFunnel}/analysis?${queryParams}`);
      return res.json();
    },
    enabled: !!currentProject && !!selectedFunnel,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/projects/${currentProject!.id}/funnels`, {
        name: newName,
        description: newDescription,
        steps: newSteps,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "funnels"] });
      setShowCreate(false);
      setNewName("");
      setNewDescription("");
      setNewSteps([{ name: "Step 1", type: "pageview", value: "/" }]);
      toast({ title: "Funnel created" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const aiGenerateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/ai-generate-funnel`, { prompt });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "funnels"] });
      setShowAiGenerate(false);
      setAiPrompt("");
      toast({ title: "AI Funnel created", description: "Funnel generated from your description." });
    },
    onError: (err: any) => {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (funnelId: string) => {
      return apiRequest("DELETE", `/api/projects/${currentProject!.id}/funnels/${funnelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "funnels"] });
      if (selectedFunnel) setSelectedFunnel(null);
      toast({ title: "Funnel deleted" });
    },
  });

  if (!currentProject) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground" data-testid="text-no-project">Select a project to manage funnels.</p>
      </div>
    );
  }

  const getStepColor = (idx: number, total: number) => {
    const hue = 200 + (idx * 40);
    const lightness = 55 - (idx * (20 / Math.max(total - 1, 1)));
    return `hsl(${hue}, 65%, ${lightness}%)`;
  };

  return (
    <div className="p-6 space-y-6">
      <FeatureGuide {...GUIDE_CONFIGS.funnels} />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <GitFork className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-funnels-title">No-Code Funnel Builder</h1>
            <p className="text-sm text-muted-foreground">Visually build, reorder, and analyse conversion funnels</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker {...headerProps} />
          <Dialog open={showAiGenerate} onOpenChange={setShowAiGenerate}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-ai-generate-funnel">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Funnel with AI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Describe the conversion funnel you want to create and AI will generate the steps for you.</p>
                <Textarea
                  placeholder="e.g., Create a checkout funnel for an e-commerce website selling electronics"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  data-testid="input-ai-funnel-prompt"
                />
                <Button
                  className="w-full"
                  onClick={() => aiGenerateMutation.mutate(aiPrompt)}
                  disabled={!aiPrompt.trim() || aiGenerateMutation.isPending}
                  data-testid="button-ai-funnel-generate"
                >
                  {aiGenerateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Funnel
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreate} onOpenChange={(open) => {
            setShowCreate(open);
            if (open) setActiveTab("builder");
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-funnel">
                <Plus className="h-4 w-4 mr-2" />
                New Funnel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <PenLine className="h-5 w-5" />
                  Build Your Funnel
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Funnel name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    data-testid="input-funnel-name"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    data-testid="input-funnel-description"
                  />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="builder" className="flex-1" data-testid="tab-visual-builder">
                      <PenLine className="h-4 w-4 mr-1" /> Visual Builder
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex-1" data-testid="tab-preview">
                      <Eye className="h-4 w-4 mr-1" /> Flow Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="builder" className="mt-3">
                    <p className="text-xs text-muted-foreground mb-3">Drag steps to reorder. Each step defines a point in your conversion path.</p>
                    <VisualFunnelBuilder steps={newSteps} onStepsChange={setNewSteps} />
                  </TabsContent>

                  <TabsContent value="preview" className="mt-3">
                    <p className="text-xs text-muted-foreground mb-3">Visual preview of your funnel flow</p>
                    <Card>
                      <CardContent className="p-4">
                        {newSteps.length > 0 ? (
                          <div className="space-y-3">
                            <VisualFunnelPreview steps={newSteps} />
                            <div className="grid gap-2 mt-4">
                              {newSteps.map((step, idx) => {
                                const config = stepTypeConfig[step.type] || stepTypeConfig.pageview;
                                return (
                                  <div key={idx} className="flex items-center gap-3 text-sm">
                                    <Badge variant="outline" className="shrink-0 w-16 justify-center">Step {idx + 1}</Badge>
                                    <Badge variant="secondary" className="shrink-0">{config.label}</Badge>
                                    <span className="font-medium truncate">{step.name}</span>
                                    {step.value && (
                                      <span className="text-muted-foreground text-xs truncate">{step.value}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">Add steps in the builder tab to see a preview</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={!newName || newSteps.some(s => !s.value) || createMutation.isPending}
                  className="w-full"
                  data-testid="button-save-funnel"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Funnel"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AiApiNotice />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Your Funnels</h2>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded" />)}
            </div>
          ) : !funnelList || funnelList.length === 0 ? (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground" data-testid="text-no-funnels">No funnels yet. Create one to start analysing conversion paths.</p>
              </CardContent>
            </Card>
          ) : (
            funnelList.map((f) => (
              <Card
                key={f.id}
                className={`cursor-pointer transition-colors hover-elevate ${selectedFunnel === f.id ? "border-primary" : ""}`}
                onClick={() => setSelectedFunnel(f.id)}
                data-testid={`card-funnel-${f.id}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{f.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">{(f.steps as FunnelStep[]).length} steps</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(f.id);
                        }}
                        data-testid={`button-delete-funnel-${f.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <VisualFunnelPreview steps={f.steps as FunnelStep[]} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {!selectedFunnel ? (
            <Card>
              <CardContent className="p-8 text-center">
                <GitFork className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium" data-testid="text-select-funnel">Select a funnel to view analysis</p>
                <p className="text-sm text-muted-foreground mt-1">Or create a new one using the visual builder</p>
              </CardContent>
            </Card>
          ) : analysis ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="text-base">{analysis.funnel.name}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{analysis.totalSessions} sessions</Badge>
                    <Badge variant="outline">{analysis.overallConversion}% conversion</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysis.steps}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                          {analysis.steps.map((_, i) => (
                            <Cell key={i} fill={getStepColor(i, analysis.steps.length)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {analysis.steps.map((step, idx) => (
                  <Card key={idx} data-testid={`card-step-${idx}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Step {idx + 1}</Badge>
                          <div>
                            <p className="font-medium text-sm">{step.name}</p>
                            <p className="text-xs text-muted-foreground">{step.type}: {step.value}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-right">
                            <p className="font-medium">{step.users}</p>
                            <p className="text-xs text-muted-foreground">users</p>
                          </div>
                          {idx > 0 && (
                            <div className="flex items-center gap-1 text-right">
                              <ArrowDown className="h-3 w-3 text-destructive" />
                              <div>
                                <p className="font-medium text-destructive">{step.dropOffRate}%</p>
                                <p className="text-xs text-muted-foreground">{step.dropOff} dropped</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
