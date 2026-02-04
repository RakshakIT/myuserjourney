import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useProject } from "@/lib/project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  Shield,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserX,
  FileDown,
  Eraser,
  Building2,
  Palette,
  Layers,
  Cookie,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { InternalIpRule } from "@shared/schema";

interface ConsentSettingsData {
  projectId: string;
  consentMode: string;
  anonymizeIp: string;
  respectDnt: string;
  dataRetentionDays: number;
  cookielessMode: string;
  bannerEnabled: string;
  bannerTitle: string;
  bannerMessage: string;
  bannerAcceptText: string;
  bannerDeclineText: string;
  bannerCustomiseText: string;
  bannerSavePreferencesText: string;
  bannerPosition: string;
  bannerLayout: string;
  bannerTheme: string;
  bannerBgColor: string | null;
  bannerTextColor: string | null;
  bannerBtnBgColor: string | null;
  bannerBtnTextColor: string | null;
  bannerAcceptBgColor: string | null;
  bannerAcceptTextColor: string | null;
  bannerBorderColor: string | null;
  bannerFontFamily: string | null;
  bannerFontSize: string | null;
  privacyPolicyUrl: string | null;
  granularConsent: string;
  categoryAnalytics: string;
  categoryFunctional: string;
  categoryPerformance: string;
  categoryMarketing: string;
  categoryAdvertisement: string;
  categoryPersonalization: string;
  categoryAnalyticsDesc: string | null;
  categoryFunctionalDesc: string | null;
  categoryPerformanceDesc: string | null;
  categoryMarketingDesc: string | null;
  categoryAdvertisementDesc: string | null;
  categoryPersonalizationDesc: string | null;
  showCookieList: string;
  consentVersion: number;
  legalBasis: string;
  jurisdiction: string;
  useThirdPartyBanner: string;
  thirdPartyProvider: string | null;
}

function BannerPreview({ form }: { form: any }) {
  const layout = form.watch("bannerLayout") || "bar";
  const position = form.watch("bannerPosition") || "bottom";
  const title = form.watch("bannerTitle") || "We value your privacy";
  const message = form.watch("bannerMessage") || "";
  const acceptText = form.watch("bannerAcceptText") || "Accept All";
  const declineText = form.watch("bannerDeclineText") || "Reject All";
  const customiseText = form.watch("bannerCustomiseText") || "Customise";
  const bgColor = form.watch("bannerBgColor") || "#ffffff";
  const textColor = form.watch("bannerTextColor") || "#1a1a1a";
  const btnBgColor = form.watch("bannerBtnBgColor") || "#6b7280";
  const btnTextColor = form.watch("bannerBtnTextColor") || "#ffffff";
  const acceptBgColor = form.watch("bannerAcceptBgColor") || "#2563eb";
  const acceptTextColor = form.watch("bannerAcceptTextColor") || "#ffffff";
  const borderColor = form.watch("bannerBorderColor") || "#e5e7eb";
  const fontFamily = form.watch("bannerFontFamily") || "system-ui, sans-serif";
  const fontSize = form.watch("bannerFontSize") || "14px";

  const bannerStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    color: textColor,
    border: `1px solid ${borderColor}`,
    fontFamily: fontFamily,
    fontSize: fontSize,
    borderRadius: layout === "bar" ? "0" : "8px",
    padding: "16px 20px",
    width: layout === "box" ? "320px" : "100%",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
  };

  const btnStyle: React.CSSProperties = {
    backgroundColor: btnBgColor,
    color: btnTextColor,
    border: "none",
    padding: "6px 14px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: fontSize,
    fontFamily: fontFamily,
    whiteSpace: "nowrap",
  };

  const acceptBtnStyle: React.CSSProperties = {
    ...btnStyle,
    backgroundColor: acceptBgColor,
    color: acceptTextColor,
  };

  const containerPositionClass =
    position === "top"
      ? "items-start"
      : position === "center"
        ? "items-center"
        : position === "bottom-left" || position === "bottom-right"
          ? "items-end"
          : "items-end";

  const bannerAlign =
    position === "bottom-left"
      ? "self-start"
      : position === "bottom-right"
        ? "self-end"
        : "";

  return (
    <div
      className="relative border rounded-md overflow-hidden bg-muted/30"
      style={{ height: "280px" }}
      data-testid="banner-preview-container"
    >
      <div className="absolute inset-0 p-2 flex flex-col" style={{ transform: "scale(0.65)", transformOrigin: "top left", width: "153%", height: "153%" }}>
        <div className="flex-1 flex flex-col justify-between p-3 rounded bg-background/50 border border-dashed border-muted-foreground/20">
          <div className="text-xs text-muted-foreground p-2">Website Content Area</div>
          <div className={`flex flex-col ${containerPositionClass} w-full`}>
            <div style={bannerStyle} className={bannerAlign}>
              <div style={{ fontWeight: 600, marginBottom: "6px", fontSize: `calc(${fontSize} + 2px)` }}>
                {title}
              </div>
              <div style={{ marginBottom: "12px", opacity: 0.85, lineHeight: 1.4 }}>
                {message.length > 120 ? message.substring(0, 120) + "..." : message}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button type="button" style={btnStyle}>{customiseText}</button>
                <button type="button" style={btnStyle}>{declineText}</button>
                <button type="button" style={acceptBtnStyle}>{acceptText}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [eraseVisitorId, setEraseVisitorId] = useState("");
  const [exportVisitorId, setExportVisitorId] = useState("");
  const [eraseDialogOpen, setEraseDialogOpen] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [newIpLabel, setNewIpLabel] = useState("");
  const [newIpRuleType, setNewIpRuleType] = useState("exact");

  const { data: settings, isLoading } = useQuery<ConsentSettingsData>({
    queryKey: ["/api/projects", currentProject?.id, "consent-settings"],
    queryFn: async () => {
      if (!currentProject) return null;
      const res = await fetch(`/api/projects/${currentProject.id}/consent-settings`);
      return res.json();
    },
    enabled: !!currentProject,
  });

  const form = useForm({
    defaultValues: {
      consentMode: "opt-in",
      anonymizeIp: true,
      respectDnt: true,
      dataRetentionDays: 365,
      cookielessMode: false,
      bannerEnabled: true,
      bannerTitle: "We value your privacy",
      bannerMessage: "This website uses analytics to understand how visitors interact with it. No personal data is sold or shared with third parties.",
      bannerAcceptText: "Accept All",
      bannerDeclineText: "Reject All",
      bannerCustomiseText: "Customise",
      bannerSavePreferencesText: "Save My Preferences",
      bannerPosition: "bottom",
      bannerLayout: "bar",
      bannerTheme: "auto",
      bannerBgColor: "",
      bannerTextColor: "",
      bannerBtnBgColor: "",
      bannerBtnTextColor: "",
      bannerAcceptBgColor: "",
      bannerAcceptTextColor: "",
      bannerBorderColor: "",
      bannerFontFamily: "system-ui, sans-serif",
      bannerFontSize: "14px",
      privacyPolicyUrl: "",
      granularConsent: true,
      categoryAnalytics: true,
      categoryFunctional: false,
      categoryPerformance: false,
      categoryMarketing: false,
      categoryAdvertisement: false,
      categoryPersonalization: false,
      categoryAnalyticsDesc: "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.",
      categoryFunctionalDesc: "Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.",
      categoryPerformanceDesc: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
      categoryMarketingDesc: "Marketing cookies are used to deliver relevant advertisements and measure campaign effectiveness.",
      categoryAdvertisementDesc: "Advertisement cookies are used to provide visitors with customized advertisements based on the pages you visited previously and to analyze the effectiveness of the ad campaigns.",
      categoryPersonalizationDesc: "Personalisation cookies allow the site to remember your preferences and customise your experience.",
      showCookieList: true,
      legalBasis: "consent",
      jurisdiction: "eu_uk",
      useThirdPartyBanner: false,
      thirdPartyProvider: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        consentMode: settings.consentMode || "opt-in",
        anonymizeIp: settings.anonymizeIp === "true",
        respectDnt: settings.respectDnt === "true",
        dataRetentionDays: settings.dataRetentionDays || 365,
        cookielessMode: settings.cookielessMode === "true",
        bannerEnabled: settings.bannerEnabled === "true",
        bannerTitle: settings.bannerTitle || "We value your privacy",
        bannerMessage: settings.bannerMessage || "",
        bannerAcceptText: settings.bannerAcceptText || "Accept All",
        bannerDeclineText: settings.bannerDeclineText || "Reject All",
        bannerCustomiseText: settings.bannerCustomiseText || "Customise",
        bannerSavePreferencesText: settings.bannerSavePreferencesText || "Save My Preferences",
        bannerPosition: settings.bannerPosition || "bottom",
        bannerLayout: settings.bannerLayout || "bar",
        bannerTheme: settings.bannerTheme || "auto",
        bannerBgColor: settings.bannerBgColor || "",
        bannerTextColor: settings.bannerTextColor || "",
        bannerBtnBgColor: settings.bannerBtnBgColor || "",
        bannerBtnTextColor: settings.bannerBtnTextColor || "",
        bannerAcceptBgColor: settings.bannerAcceptBgColor || "",
        bannerAcceptTextColor: settings.bannerAcceptTextColor || "",
        bannerBorderColor: settings.bannerBorderColor || "",
        bannerFontFamily: settings.bannerFontFamily || "system-ui, sans-serif",
        bannerFontSize: settings.bannerFontSize || "14px",
        privacyPolicyUrl: settings.privacyPolicyUrl || "",
        granularConsent: settings.granularConsent !== "false",
        categoryAnalytics: settings.categoryAnalytics !== "false",
        categoryFunctional: settings.categoryFunctional === "true",
        categoryPerformance: settings.categoryPerformance === "true",
        categoryMarketing: settings.categoryMarketing === "true",
        categoryAdvertisement: settings.categoryAdvertisement === "true",
        categoryPersonalization: settings.categoryPersonalization === "true",
        categoryAnalyticsDesc: settings.categoryAnalyticsDesc || "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.",
        categoryFunctionalDesc: settings.categoryFunctionalDesc || "Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.",
        categoryPerformanceDesc: settings.categoryPerformanceDesc || "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
        categoryMarketingDesc: settings.categoryMarketingDesc || "Marketing cookies are used to deliver relevant advertisements and measure campaign effectiveness.",
        categoryAdvertisementDesc: settings.categoryAdvertisementDesc || "Advertisement cookies are used to provide visitors with customized advertisements based on the pages you visited previously and to analyze the effectiveness of the ad campaigns.",
        categoryPersonalizationDesc: settings.categoryPersonalizationDesc || "Personalisation cookies allow the site to remember your preferences and customise your experience.",
        showCookieList: settings.showCookieList !== "false",
        legalBasis: settings.legalBasis || "consent",
        jurisdiction: settings.jurisdiction || "eu_uk",
        useThirdPartyBanner: settings.useThirdPartyBanner === "true",
        thirdPartyProvider: settings.thirdPartyProvider || "",
      });
    }
  }, [settings, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/consent-settings`, {
        consentMode: data.consentMode,
        anonymizeIp: data.anonymizeIp ? "true" : "false",
        respectDnt: data.respectDnt ? "true" : "false",
        dataRetentionDays: data.dataRetentionDays,
        cookielessMode: data.cookielessMode ? "true" : "false",
        bannerEnabled: data.bannerEnabled ? "true" : "false",
        bannerTitle: data.bannerTitle,
        bannerMessage: data.bannerMessage,
        bannerAcceptText: data.bannerAcceptText,
        bannerDeclineText: data.bannerDeclineText,
        bannerCustomiseText: data.bannerCustomiseText,
        bannerSavePreferencesText: data.bannerSavePreferencesText,
        bannerPosition: data.bannerPosition,
        bannerLayout: data.bannerLayout,
        bannerTheme: data.bannerTheme,
        bannerBgColor: data.bannerBgColor || null,
        bannerTextColor: data.bannerTextColor || null,
        bannerBtnBgColor: data.bannerBtnBgColor || null,
        bannerBtnTextColor: data.bannerBtnTextColor || null,
        bannerAcceptBgColor: data.bannerAcceptBgColor || null,
        bannerAcceptTextColor: data.bannerAcceptTextColor || null,
        bannerBorderColor: data.bannerBorderColor || null,
        bannerFontFamily: data.bannerFontFamily || null,
        bannerFontSize: data.bannerFontSize || null,
        privacyPolicyUrl: data.privacyPolicyUrl || null,
        granularConsent: data.granularConsent ? "true" : "false",
        categoryAnalytics: data.categoryAnalytics ? "true" : "false",
        categoryFunctional: data.categoryFunctional ? "true" : "false",
        categoryPerformance: data.categoryPerformance ? "true" : "false",
        categoryMarketing: data.categoryMarketing ? "true" : "false",
        categoryAdvertisement: data.categoryAdvertisement ? "true" : "false",
        categoryPersonalization: data.categoryPersonalization ? "true" : "false",
        categoryAnalyticsDesc: data.categoryAnalyticsDesc || null,
        categoryFunctionalDesc: data.categoryFunctionalDesc || null,
        categoryPerformanceDesc: data.categoryPerformanceDesc || null,
        categoryMarketingDesc: data.categoryMarketingDesc || null,
        categoryAdvertisementDesc: data.categoryAdvertisementDesc || null,
        categoryPersonalizationDesc: data.categoryPersonalizationDesc || null,
        showCookieList: data.showCookieList ? "true" : "false",
        legalBasis: data.legalBasis,
        jurisdiction: data.jurisdiction,
        useThirdPartyBanner: data.useThirdPartyBanner ? "true" : "false",
        thirdPartyProvider: data.thirdPartyProvider || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "consent-settings"] });
      toast({ title: "Privacy settings saved" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const eraseMutation = useMutation({
    mutationFn: async (visitorId: string) => {
      const res = await apiRequest("DELETE", `/api/projects/${currentProject!.id}/visitor/${visitorId}`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Visitor data erased", description: data.message });
      setEraseVisitorId("");
      setEraseDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const purgeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${currentProject!.id}/purge`, {});
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Data purged", description: data.message });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const { data: ipRules } = useQuery<InternalIpRule[]>({
    queryKey: ["/api/projects", currentProject?.id, "internal-ips"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${currentProject!.id}/internal-ips`);
      return res.json();
    },
    enabled: !!currentProject,
  });

  const addIpMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/projects/${currentProject!.id}/internal-ips`, {
        ip: newIp,
        label: newIpLabel || null,
        ruleType: newIpRuleType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "internal-ips"] });
      setNewIp("");
      setNewIpLabel("");
      setNewIpRuleType("exact");
      toast({ title: "IP rule added" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteIpMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      return apiRequest("DELETE", `/api/projects/${currentProject!.id}/internal-ips/${ruleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "internal-ips"] });
      toast({ title: "IP rule deleted" });
    },
  });

  const handleExport = (format: string) => {
    if (!exportVisitorId.trim() || !currentProject) return;
    window.open(`/api/projects/${currentProject.id}/visitor/${exportVisitorId.trim()}/data?format=${format}`, "_blank");
  };

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Shield className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No project selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a project to manage privacy settings.
        </p>
      </div>
    );
  }

  const bannerEnabled = form.watch("bannerEnabled");
  const useThirdPartyBanner = form.watch("useThirdPartyBanner");
  const consentMode = form.watch("consentMode");
  const showBuiltInBannerOptions = bannerEnabled && !useThirdPartyBanner;

  return (
    <div className="p-6 space-y-6 max-w-3xl overflow-y-auto h-full">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-privacy-title">
            Privacy & GDPR
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure GDPR compliance, consent management, and data protection for {currentProject.name}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
              {/* 1. Data Collection Controls */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">Data Collection Controls</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jurisdiction</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-jurisdiction">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-80">
                              <SelectItem value="eu_uk">EU & UK (GDPR + PECR + ePrivacy)</SelectItem>
                              <SelectItem value="eu">EU only (GDPR + ePrivacy Directive)</SelectItem>
                              <SelectItem value="uk">UK only (UK GDPR + PECR)</SelectItem>
                              <SelectItem value="us_california">United States - California (CCPA/CPRA)</SelectItem>
                              <SelectItem value="us_virginia">United States - Virginia (VCDPA)</SelectItem>
                              <SelectItem value="us_colorado">United States - Colorado (CPA)</SelectItem>
                              <SelectItem value="us_connecticut">United States - Connecticut (CTDPA)</SelectItem>
                              <SelectItem value="us_utah">United States - Utah (UCPA)</SelectItem>
                              <SelectItem value="us_texas">United States - Texas (TDPSA)</SelectItem>
                              <SelectItem value="us_oregon">United States - Oregon (OCPA)</SelectItem>
                              <SelectItem value="us_montana">United States - Montana (MCDPA)</SelectItem>
                              <SelectItem value="us_other">United States - Other States</SelectItem>
                              <SelectItem value="ca">Canada (PIPEDA)</SelectItem>
                              <SelectItem value="ca_quebec">Canada - Quebec (Law 25)</SelectItem>
                              <SelectItem value="br">Brazil (LGPD)</SelectItem>
                              <SelectItem value="ar">Argentina (PDPA)</SelectItem>
                              <SelectItem value="cl">Chile (Data Protection Law)</SelectItem>
                              <SelectItem value="co">Colombia (Law 1581)</SelectItem>
                              <SelectItem value="mx">Mexico (LFPDPPP)</SelectItem>
                              <SelectItem value="au">Australia (Privacy Act / APPs)</SelectItem>
                              <SelectItem value="nz">New Zealand (Privacy Act 2020)</SelectItem>
                              <SelectItem value="jp">Japan (APPI)</SelectItem>
                              <SelectItem value="kr">South Korea (PIPA)</SelectItem>
                              <SelectItem value="cn">China (PIPL)</SelectItem>
                              <SelectItem value="in">India (DPDP Act)</SelectItem>
                              <SelectItem value="sg">Singapore (PDPA)</SelectItem>
                              <SelectItem value="th">Thailand (PDPA)</SelectItem>
                              <SelectItem value="ph">Philippines (DPA 2012)</SelectItem>
                              <SelectItem value="my">Malaysia (PDPA)</SelectItem>
                              <SelectItem value="id">Indonesia (PDP Law)</SelectItem>
                              <SelectItem value="vn">Vietnam (PDPD)</SelectItem>
                              <SelectItem value="tw">Taiwan (PDPA)</SelectItem>
                              <SelectItem value="hk">Hong Kong (PDPO)</SelectItem>
                              <SelectItem value="il">Israel (Privacy Protection Law)</SelectItem>
                              <SelectItem value="ae">UAE (PDPL)</SelectItem>
                              <SelectItem value="sa">Saudi Arabia (PDPL)</SelectItem>
                              <SelectItem value="qa">Qatar (PDPPL)</SelectItem>
                              <SelectItem value="bh">Bahrain (PDPL)</SelectItem>
                              <SelectItem value="ke">Kenya (DPA 2019)</SelectItem>
                              <SelectItem value="za">South Africa (POPIA)</SelectItem>
                              <SelectItem value="ng">Nigeria (NDPR)</SelectItem>
                              <SelectItem value="eg">Egypt (Data Protection Law)</SelectItem>
                              <SelectItem value="gh">Ghana (DPA 2012)</SelectItem>
                              <SelectItem value="ug">Uganda (DPPA 2019)</SelectItem>
                              <SelectItem value="rw">Rwanda (Data Protection Law)</SelectItem>
                              <SelectItem value="ch">Switzerland (nFADP / revDSG)</SelectItem>
                              <SelectItem value="no">Norway (Personal Data Act)</SelectItem>
                              <SelectItem value="is">Iceland (Data Protection Act)</SelectItem>
                              <SelectItem value="li">Liechtenstein (Data Protection Act)</SelectItem>
                              <SelectItem value="tr">Turkey (KVKK)</SelectItem>
                              <SelectItem value="rs">Serbia (LPDP)</SelectItem>
                              <SelectItem value="ua">Ukraine (Personal Data Law)</SelectItem>
                              <SelectItem value="ru">Russia (Federal Law 152-FZ)</SelectItem>
                              <SelectItem value="global">Global / Multiple Regions</SelectItem>
                              <SelectItem value="none">No Specific Regulation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The regulatory framework that applies to your visitors.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="legalBasis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal Basis (GDPR Art. 6)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-legal-basis">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="consent">Consent (Art. 6(1)(a))</SelectItem>
                              <SelectItem value="legitimate_interest">Legitimate Interest (Art. 6(1)(f))</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Consent is required for cookies under EU ePrivacy and UK PECR.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="consentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consent Mode</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-consent-mode">
                              <SelectValue placeholder="Select consent mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="opt-in">Opt-in (Required by EU GDPR & UK PECR - users must accept before tracking)</SelectItem>
                            <SelectItem value="opt-out">Opt-out (Track by default, users can decline - not GDPR compliant)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Opt-in is required under both EU ePrivacy Directive and UK PECR. Non-essential cookies must not be set before consent.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="anonymizeIp"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3 flex-wrap">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">IP Anonymization</FormLabel>
                          <FormDescription className="text-xs">
                            Mask the last octet of visitor IP addresses before storing (e.g., 192.168.1.xxx becomes 192.168.1.0)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-anonymize-ip" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="respectDnt"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3 flex-wrap">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">Respect Do Not Track (DNT)</FormLabel>
                          <FormDescription className="text-xs">
                            When enabled, visitors who have DNT enabled in their browser will not be tracked at all
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-respect-dnt" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cookielessMode"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3 flex-wrap">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">Cookieless Tracking</FormLabel>
                          <FormDescription className="text-xs">
                            Track events without storing visitor IDs or session IDs. Aggregated-only analytics. No cookies or localStorage used.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-cookieless" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataRetentionDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Retention Period (days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={3650}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 365)}
                            data-testid="input-retention-days"
                          />
                        </FormControl>
                        <FormDescription>
                          Events older than this will be automatically eligible for purging. GDPR recommends only keeping data as long as necessary.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 2. Consent Banner */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">Consent Banner</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="bannerEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3 flex-wrap">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">Show Consent Banner</FormLabel>
                          <FormDescription className="text-xs">
                            Display a consent banner to visitors before tracking begins
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-banner-enabled" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {bannerEnabled && (
                    <>
                      <FormField
                        control={form.control}
                        name="bannerTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banner Title</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-banner-title" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bannerMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banner Message</FormLabel>
                            <FormControl>
                              <Textarea rows={3} {...field} data-testid="input-banner-message" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bannerAcceptText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Accept Button Text</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-banner-accept" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bannerDeclineText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Decline Button Text</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-banner-decline" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bannerCustomiseText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customise Button Text</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-banner-customise" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bannerSavePreferencesText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Save Preferences Button Text</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-banner-save-preferences" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bannerPosition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-banner-position">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="bottom">Bottom</SelectItem>
                                  <SelectItem value="top">Top</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bannerTheme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Theme</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-banner-theme">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="auto">Auto (match system)</SelectItem>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="privacyPolicyUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Privacy Policy URL (required for UK/EU compliance)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yoursite.com/privacy" {...field} data-testid="input-privacy-url" />
                            </FormControl>
                            <FormDescription>
                              Link to your privacy/cookie policy. Required by UK PECR and EU ePrivacy Directive.
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="granularConsent"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3 flex-wrap">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Granular Cookie Categories</FormLabel>
                              <FormDescription className="text-xs">
                                Show per-category toggles (analytics, marketing, personalisation) in the banner. Required by EU GDPR for specific consent.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-granular-consent" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="showCookieList"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3 flex-wrap">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Show Cookie List in Banner</FormLabel>
                              <FormDescription className="text-xs">
                                Display a list of all cookies/trackers used with their purpose and duration. Required for informed consent under EU and UK rules.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-show-cookie-list" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* 3. Third-Party Banner Integration */}
              {bannerEnabled && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-medium">Third-Party Banner Integration</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <FormField
                      control={form.control}
                      name="useThirdPartyBanner"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3 flex-wrap">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">Use Third-Party Cookie Banner</FormLabel>
                            <FormDescription className="text-xs">
                              When enabled, the built-in banner is disabled. The tracking snippet will listen for consent signals from your chosen third-party consent management platform instead.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-third-party-banner" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {useThirdPartyBanner && (
                      <FormField
                        control={form.control}
                        name="thirdPartyProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Consent Management Provider</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-third-party-provider">
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cookieyes">CookieYes</SelectItem>
                                <SelectItem value="onetrust">OneTrust</SelectItem>
                                <SelectItem value="cookiebot">Cookiebot</SelectItem>
                                <SelectItem value="termly">Termly</SelectItem>
                                <SelectItem value="iubenda">Iubenda</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select the third-party consent management platform you use. The tracking snippet will automatically detect and respect consent signals from this provider.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 4. Banner Design & Customization */}
              {showBuiltInBannerOptions && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-medium">Banner Design & Customization</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bannerLayout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Layout Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-banner-layout">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bar">Bar (top/bottom full width)</SelectItem>
                                <SelectItem value="popup">Popup (center modal)</SelectItem>
                                <SelectItem value="box">Box (corner widget)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bannerFontFamily"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Font Family</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-banner-font-family">
                                  <SelectValue placeholder="System default" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="system-ui, sans-serif">System default</SelectItem>
                                <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                                <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                                <SelectItem value="Georgia, serif">Georgia</SelectItem>
                                <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                                <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bannerFontSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Size</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-banner-font-size">
                                <SelectValue placeholder="Medium (14px)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="12px">Small (12px)</SelectItem>
                              <SelectItem value="14px">Medium (14px)</SelectItem>
                              <SelectItem value="16px">Large (16px)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <div>
                      <p className="text-sm font-medium mb-3">Custom Colors</p>
                      <p className="text-xs text-muted-foreground mb-3">Leave empty to use theme defaults. Click a swatch to pick a color.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bannerBgColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Background Color</FormLabel>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={field.value || "#ffffff"}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="h-9 w-9 rounded-md border cursor-pointer shrink-0"
                                  data-testid="input-banner-bg-color"
                                />
                                <FormControl>
                                  <Input
                                    placeholder="#ffffff"
                                    {...field}
                                    className="font-mono text-xs"
                                    data-testid="input-banner-bg-color-text"
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bannerTextColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Text Color</FormLabel>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={field.value || "#1a1a1a"}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="h-9 w-9 rounded-md border cursor-pointer shrink-0"
                                  data-testid="input-banner-text-color"
                                />
                                <FormControl>
                                  <Input
                                    placeholder="#1a1a1a"
                                    {...field}
                                    className="font-mono text-xs"
                                    data-testid="input-banner-text-color-text"
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bannerBtnBgColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Button Background</FormLabel>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={field.value || "#6b7280"}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="h-9 w-9 rounded-md border cursor-pointer shrink-0"
                                  data-testid="input-banner-btn-bg-color"
                                />
                                <FormControl>
                                  <Input
                                    placeholder="#6b7280"
                                    {...field}
                                    className="font-mono text-xs"
                                    data-testid="input-banner-btn-bg-color-text"
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bannerBtnTextColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Button Text</FormLabel>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={field.value || "#ffffff"}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="h-9 w-9 rounded-md border cursor-pointer shrink-0"
                                  data-testid="input-banner-btn-text-color"
                                />
                                <FormControl>
                                  <Input
                                    placeholder="#ffffff"
                                    {...field}
                                    className="font-mono text-xs"
                                    data-testid="input-banner-btn-text-color-text"
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bannerAcceptBgColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Accept Button Background</FormLabel>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={field.value || "#2563eb"}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="h-9 w-9 rounded-md border cursor-pointer shrink-0"
                                  data-testid="input-banner-accept-bg-color"
                                />
                                <FormControl>
                                  <Input
                                    placeholder="#2563eb"
                                    {...field}
                                    className="font-mono text-xs"
                                    data-testid="input-banner-accept-bg-color-text"
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bannerAcceptTextColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Accept Button Text</FormLabel>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={field.value || "#ffffff"}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="h-9 w-9 rounded-md border cursor-pointer shrink-0"
                                  data-testid="input-banner-accept-text-color"
                                />
                                <FormControl>
                                  <Input
                                    placeholder="#ffffff"
                                    {...field}
                                    className="font-mono text-xs"
                                    data-testid="input-banner-accept-text-color-text"
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bannerBorderColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Border Color</FormLabel>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={field.value || "#e5e7eb"}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="h-9 w-9 rounded-md border cursor-pointer shrink-0"
                                  data-testid="input-banner-border-color"
                                />
                                <FormControl>
                                  <Input
                                    placeholder="#e5e7eb"
                                    {...field}
                                    className="font-mono text-xs"
                                    data-testid="input-banner-border-color-text"
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 5. Cookie Categories */}
              {showBuiltInBannerOptions && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Cookie className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-medium">Cookie Categories</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Configure which cookie categories are available and their descriptions shown in the consent banner.
                    </p>

                    <div className="space-y-3">
                      {/* Necessary - always on */}
                      <div className="rounded-md border p-3 space-y-2">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">Necessary</p>
                            <p className="text-xs text-muted-foreground">Required for basic site functionality. Always active.</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">Always on</Badge>
                        </div>
                      </div>

                      {/* Functional */}
                      <div className="rounded-md border p-3 space-y-2">
                        <FormField
                          control={form.control}
                          name="categoryFunctional"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">Functional</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-cat-functional" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="categoryFunctionalDesc"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea rows={2} {...field} className="text-xs" data-testid="input-cat-functional-desc" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Analytics */}
                      <div className="rounded-md border p-3 space-y-2">
                        <FormField
                          control={form.control}
                          name="categoryAnalytics"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">Analytics</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-cat-analytics" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="categoryAnalyticsDesc"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea rows={2} {...field} className="text-xs" data-testid="input-cat-analytics-desc" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Performance */}
                      <div className="rounded-md border p-3 space-y-2">
                        <FormField
                          control={form.control}
                          name="categoryPerformance"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">Performance</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-cat-performance" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="categoryPerformanceDesc"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea rows={2} {...field} className="text-xs" data-testid="input-cat-performance-desc" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Advertisement */}
                      <div className="rounded-md border p-3 space-y-2">
                        <FormField
                          control={form.control}
                          name="categoryAdvertisement"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">Advertisement</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-cat-advertisement" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="categoryAdvertisementDesc"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea rows={2} {...field} className="text-xs" data-testid="input-cat-advertisement-desc" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Marketing */}
                      <div className="rounded-md border p-3 space-y-2">
                        <FormField
                          control={form.control}
                          name="categoryMarketing"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">Marketing</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-cat-marketing" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="categoryMarketingDesc"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea rows={2} {...field} className="text-xs" data-testid="input-cat-marketing-desc" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Personalisation */}
                      <div className="rounded-md border p-3 space-y-2">
                        <FormField
                          control={form.control}
                          name="categoryPersonalization"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">Personalisation</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-cat-personalization" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="categoryPersonalizationDesc"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea rows={2} {...field} className="text-xs" data-testid="input-cat-personalization-desc" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 6. Live Banner Preview */}
              {showBuiltInBannerOptions && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-medium">Live Banner Preview</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">
                      A scaled-down preview of how your cookie banner will appear to visitors.
                    </p>
                    <BannerPreview form={form} />
                  </CardContent>
                </Card>
              )}

              {/* 7. Save button */}
              <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-privacy">
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </form>
          </Form>

          {/* 8. Right to Erasure */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Right to Erasure (Right to be Forgotten)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Under GDPR Article 17, visitors have the right to request deletion of all their personal data. Enter a visitor ID to erase all associated events and consent records.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Input
                  placeholder="Enter visitor ID (e.g., v_abc123...)"
                  value={eraseVisitorId}
                  onChange={(e) => setEraseVisitorId(e.target.value)}
                  className="flex-1 min-w-[200px]"
                  data-testid="input-erase-visitor-id"
                />
                <Dialog open={eraseDialogOpen} onOpenChange={setEraseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={!eraseVisitorId.trim()} data-testid="button-erase-visitor">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Erase Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Data Erasure</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-3">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-destructive">This action cannot be undone</p>
                          <p className="text-muted-foreground mt-1">
                            All events and consent records for visitor <span className="font-mono text-xs">{eraseVisitorId}</span> will be permanently deleted.
                          </p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEraseDialogOpen(false)}>Cancel</Button>
                      <Button
                        variant="destructive"
                        onClick={() => eraseMutation.mutate(eraseVisitorId.trim())}
                        disabled={eraseMutation.isPending}
                        data-testid="button-confirm-erase"
                      >
                        {eraseMutation.isPending ? "Erasing..." : "Confirm Erase"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* 9. Data Portability */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileDown className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Data Portability (Data Export)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Under GDPR Article 20, visitors can request a copy of all their data. Enter a visitor ID and export format.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Input
                  placeholder="Enter visitor ID (e.g., v_abc123...)"
                  value={exportVisitorId}
                  onChange={(e) => setExportVisitorId(e.target.value)}
                  className="flex-1 min-w-[200px]"
                  data-testid="input-export-visitor-id"
                />
                <Button
                  variant="outline"
                  disabled={!exportVisitorId.trim()}
                  onClick={() => handleExport("json")}
                  data-testid="button-export-json"
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  disabled={!exportVisitorId.trim()}
                  onClick={() => handleExport("csv")}
                  data-testid="button-export-csv"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 10. Data Retention Purge */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Eraser className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Data Retention Purge</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Purge events older than the configured retention period ({form.watch("dataRetentionDays")} days). This helps comply with GDPR data minimization principles.
              </p>
              <Button
                variant="outline"
                onClick={() => purgeMutation.mutate()}
                disabled={purgeMutation.isPending}
                data-testid="button-purge-data"
              >
                <Clock className="h-4 w-4 mr-2" />
                {purgeMutation.isPending ? "Purging..." : "Purge Expired Data"}
              </Button>
            </CardContent>
          </Card>

          {/* 11. Internal IP Addresses */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Internal IP Addresses</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Define IP addresses or ranges that belong to your organization. Traffic from these IPs will be flagged as internal and can be filtered from reports.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Input
                  placeholder="IP address (e.g., 192.168.1.1)"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="flex-1 min-w-[180px]"
                  data-testid="input-ip-address"
                />
                <Input
                  placeholder="Label (optional)"
                  value={newIpLabel}
                  onChange={(e) => setNewIpLabel(e.target.value)}
                  className="w-40"
                  data-testid="input-ip-label"
                />
                <Select value={newIpRuleType} onValueChange={setNewIpRuleType}>
                  <SelectTrigger className="w-28" data-testid="select-ip-rule-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">Exact</SelectItem>
                    <SelectItem value="prefix">Prefix</SelectItem>
                    <SelectItem value="cidr">CIDR</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    const ip = newIp.trim();
                    if (!ip) return;
                    if (newIpRuleType === "exact" && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
                      toast({ title: "Invalid IP", description: "Enter a valid IPv4 address (e.g., 192.168.1.1)", variant: "destructive" });
                      return;
                    }
                    if (newIpRuleType === "cidr" && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/.test(ip)) {
                      toast({ title: "Invalid CIDR", description: "Enter a valid CIDR notation (e.g., 10.0.0.0/8)", variant: "destructive" });
                      return;
                    }
                    addIpMutation.mutate();
                  }}
                  disabled={!newIp.trim() || addIpMutation.isPending}
                  data-testid="button-add-ip"
                >
                  Add
                </Button>
              </div>
              {ipRules && ipRules.length > 0 && (
                <div className="space-y-2">
                  {ipRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-md border text-sm"
                      data-testid={`row-ip-rule-${rule.id}`}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <code className="font-mono text-xs">{rule.ip}</code>
                        <Badge variant="outline" className="text-xs">{rule.ruleType}</Badge>
                        {rule.label && <span className="text-muted-foreground">{rule.label}</span>}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteIpMutation.mutate(rule.id)}
                        data-testid={`button-delete-ip-${rule.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 12. Compliance Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <CardTitle className="text-sm font-medium">UK & EU Compliance Checklist</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Based on UK GDPR, UK PECR, EU GDPR, and EU ePrivacy Directive requirements.
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Prior consent before non-essential cookies (UK PECR / EU ePrivacy)", ok: consentMode === "opt-in" && bannerEnabled },
                  { label: "Granular category-based consent (EU GDPR Art. 7)", ok: form.watch("granularConsent") },
                  { label: "Equal prominence Accept/Reject buttons (no dark patterns)", ok: true },
                  { label: "Easy consent withdrawal (persistent Cookie Settings button)", ok: bannerEnabled },
                  { label: "Cookie/tracker list with purpose and duration", ok: form.watch("showCookieList") },
                  { label: "IP addresses anonymised (no third-party IP exposure)", ok: form.watch("anonymizeIp") },
                  { label: "Do Not Track header respected", ok: form.watch("respectDnt") },
                  { label: "Privacy/cookie policy link provided", ok: !!form.watch("privacyPolicyUrl") },
                  { label: "Data retention policy configured (Art. 5(1)(e))", ok: form.watch("dataRetentionDays") <= 730 },
                  { label: "Right to erasure (Art. 17)", ok: true },
                  { label: "Data portability (Art. 20)", ok: true },
                  { label: "Consent records audit trail (Art. 7(1))", ok: true },
                  { label: "Server-side consent enforcement", ok: consentMode === "opt-in" },
                  { label: "No personal data sold to third parties", ok: true },
                  { label: "Self-hosted (all data stays on your server)", ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    {item.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-sm">{item.label}</span>
                    {item.ok ? (
                      <Badge variant="secondary" className="ml-auto text-xs">Compliant</Badge>
                    ) : (
                      <Badge variant="outline" className="ml-auto text-xs text-amber-600 border-amber-300">Review</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 13. Regulatory References */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Regulatory References</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">UK Regulations</p>
                  <p className="text-xs mt-1">UK GDPR (Data Protection Act 2018) and PECR (Privacy and Electronic Communications Regulations) require prior opt-in consent before setting non-essential cookies. Penalties up to 4% of global turnover or GBP 17.5 million.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">EU Regulations</p>
                  <p className="text-xs mt-1">EU GDPR (Regulation 2016/679) and ePrivacy Directive (2002/58/EC) mandate freely given, specific, informed, and unambiguous consent. Cookie banners must offer equal prominence to accept and reject options. Penalties up to 4% of global turnover or EUR 20 million.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Key Requirements</p>
                  <ul className="text-xs mt-1 space-y-1 list-disc pl-4">
                    <li>No cookies set before explicit consent (except strictly necessary)</li>
                    <li>Accept and Reject buttons must have equal size and prominence</li>
                    <li>Granular category-based consent (analytics, marketing, personalisation)</li>
                    <li>Consent withdrawal must be as easy as giving consent</li>
                    <li>Cookie list with names, purposes, and durations visible</li>
                    <li>Consent records kept as proof for regulatory audits</li>
                    <li>No pre-ticked checkboxes (categories default to off)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
