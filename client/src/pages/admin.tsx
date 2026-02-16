import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Users, Settings, Save, Trash2, Plus, Mail, FileText,
  Upload, Copy, Globe, MessageSquare, Image, File, Loader2, Send, Eye, Code, CreditCard, BookOpen
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FeatureGuide, GUIDE_CONFIGS } from "@/components/feature-guide";
import { HtmlEditor } from "@/components/html-editor";

interface SiteSettingsData {
  id?: string;
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  footerText: string;
  primaryColor: string;
  customCss: string;
  customHeaderScripts: string;
  customFooterScripts: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialGithub: string;
}

interface SmtpSettingsData {
  id?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
}

interface CmsPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  customScripts: string | null;
  status: string;
  sortOrder: number;
  showInNav: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CmsFileData {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string | null;
  createdAt: string;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  authProvider: string;
  isActive: boolean;
  subscriptionTier: string;
  subscriptionStatus: string;
  createdAt: string;
}

interface ContactData {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const defaultSiteSettings: SiteSettingsData = {
  siteName: "",
  siteTagline: "",
  logoUrl: "",
  faviconUrl: "",
  contactEmail: "",
  footerText: "",
  primaryColor: "",
  customCss: "",
  customHeaderScripts: "",
  customFooterScripts: "",
  socialTwitter: "",
  socialLinkedin: "",
  socialGithub: "",
};

const defaultSmtpSettings: SmtpSettingsData = {
  host: "",
  port: 587,
  username: "",
  password: "",
  encryption: "tls",
  fromEmail: "",
  fromName: "",
  isActive: false,
};

function SiteSettingsTab() {
  const { toast } = useToast();
  const [form, setForm] = useState<SiteSettingsData | null>(null);

  const { data: settings, isLoading } = useQuery<SiteSettingsData>({
    queryKey: ["/api/admin/site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/site-settings", { credentials: "include" });
      return res.json();
    },
  });

  const current = form || settings || defaultSiteSettings;

  const saveMutation = useMutation({
    mutationFn: async (data: SiteSettingsData) => {
      await apiRequest("PUT", "/api/admin/site-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      toast({ title: "Site settings saved" });
      setForm(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateField = (key: keyof SiteSettingsData, value: string) => {
    setForm(prev => ({ ...(prev || current), [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4" /> Site Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input
              value={current.siteName || ""}
              onChange={e => updateField("siteName", e.target.value)}
              data-testid="input-site-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Site Tagline</Label>
            <Input
              value={current.siteTagline || ""}
              onChange={e => updateField("siteTagline", e.target.value)}
              data-testid="input-site-tagline"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input
              value={current.contactEmail || ""}
              onChange={e => updateField("contactEmail", e.target.value)}
              data-testid="input-contact-email"
            />
          </div>
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <Input
              value={current.primaryColor || ""}
              onChange={e => updateField("primaryColor", e.target.value)}
              placeholder="#3b82f6"
              data-testid="input-primary-color"
            />
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              value={current.logoUrl || ""}
              onChange={e => updateField("logoUrl", e.target.value)}
              data-testid="input-logo-url"
            />
          </div>
          <div className="space-y-2">
            <Label>Favicon URL</Label>
            <Input
              value={current.faviconUrl || ""}
              onChange={e => updateField("faviconUrl", e.target.value)}
              data-testid="input-favicon-url"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Footer Text</Label>
          <Input
            value={current.footerText || ""}
            onChange={e => updateField("footerText", e.target.value)}
            data-testid="input-footer-text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Twitter / X</Label>
            <Input
              value={current.socialTwitter || ""}
              onChange={e => updateField("socialTwitter", e.target.value)}
              placeholder="https://twitter.com/..."
              data-testid="input-social-twitter"
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input
              value={current.socialLinkedin || ""}
              onChange={e => updateField("socialLinkedin", e.target.value)}
              placeholder="https://linkedin.com/..."
              data-testid="input-social-linkedin"
            />
          </div>
          <div className="space-y-2">
            <Label>GitHub</Label>
            <Input
              value={current.socialGithub || ""}
              onChange={e => updateField("socialGithub", e.target.value)}
              placeholder="https://github.com/..."
              data-testid="input-social-github"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Custom CSS</Label>
          <Textarea
            value={current.customCss || ""}
            onChange={e => updateField("customCss", e.target.value)}
            rows={4}
            data-testid="input-custom-css"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Custom Header Scripts</Label>
            <Textarea
              value={current.customHeaderScripts || ""}
              onChange={e => updateField("customHeaderScripts", e.target.value)}
              rows={4}
              data-testid="input-header-scripts"
            />
          </div>
          <div className="space-y-2">
            <Label>Custom Footer Scripts</Label>
            <Textarea
              value={current.customFooterScripts || ""}
              onChange={e => updateField("customFooterScripts", e.target.value)}
              rows={4}
              data-testid="input-footer-scripts"
            />
          </div>
        </div>

        <Button
          onClick={() => saveMutation.mutate(current)}
          disabled={saveMutation.isPending}
          data-testid="button-save-site-settings"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}

function SmtpTab() {
  const { toast } = useToast();
  const [form, setForm] = useState<SmtpSettingsData | null>(null);
  const [testEmail, setTestEmail] = useState("");

  const { data: settings, isLoading } = useQuery<SmtpSettingsData>({
    queryKey: ["/api/admin/smtp-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/smtp-settings", { credentials: "include" });
      return res.json();
    },
  });

  const current = form || settings || defaultSmtpSettings;

  const saveMutation = useMutation({
    mutationFn: async (data: SmtpSettingsData) => {
      await apiRequest("PUT", "/api/admin/smtp-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/smtp-settings"] });
      toast({ title: "SMTP settings saved" });
      setForm(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("POST", "/api/admin/smtp-test", { testEmail: email });
    },
    onSuccess: () => {
      toast({ title: "Test email sent" });
    },
    onError: (err: Error) => {
      toast({ title: "Test failed", description: err.message, variant: "destructive" });
    },
  });

  const updateField = (key: keyof SmtpSettingsData, value: string | number | boolean) => {
    setForm(prev => ({ ...(prev || current), [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" /> SMTP Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <Label>SMTP Active</Label>
          <Switch
            checked={current.isActive}
            onCheckedChange={v => updateField("isActive", v)}
            data-testid="switch-smtp-active"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Host</Label>
            <Input
              value={current.host}
              onChange={e => updateField("host", e.target.value)}
              placeholder="smtp.example.com"
              data-testid="input-smtp-host"
            />
          </div>
          <div className="space-y-2">
            <Label>Port</Label>
            <Input
              type="number"
              value={current.port}
              onChange={e => updateField("port", Number(e.target.value))}
              data-testid="input-smtp-port"
            />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={current.username}
              onChange={e => updateField("username", e.target.value)}
              data-testid="input-smtp-username"
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={current.password}
              onChange={e => updateField("password", e.target.value)}
              data-testid="input-smtp-password"
            />
          </div>
          <div className="space-y-2">
            <Label>Encryption</Label>
            <Select value={current.encryption} onValueChange={v => updateField("encryption", v)}>
              <SelectTrigger data-testid="select-smtp-encryption">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>From Email</Label>
            <Input
              value={current.fromEmail}
              onChange={e => updateField("fromEmail", e.target.value)}
              placeholder="noreply@example.com"
              data-testid="input-smtp-from-email"
            />
          </div>
          <div className="space-y-2">
            <Label>From Name</Label>
            <Input
              value={current.fromName}
              onChange={e => updateField("fromName", e.target.value)}
              data-testid="input-smtp-from-name"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => saveMutation.mutate(current)}
            disabled={saveMutation.isPending}
            data-testid="button-save-smtp"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saveMutation.isPending ? "Saving..." : "Save SMTP Settings"}
          </Button>
        </div>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-2 flex-1 min-w-[200px]">
                <Label>Test Email Address</Label>
                <Input
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  data-testid="input-test-email"
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => testMutation.mutate(testEmail)}
                disabled={testMutation.isPending || !testEmail}
                data-testid="button-send-test-email"
              >
                {testMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send Test Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

function PagesTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPageData | null>(null);
  const [pageForm, setPageForm] = useState({
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    status: "draft",
    sortOrder: 0,
    showInNav: false,
  });

  const { data: pages, isLoading } = useQuery<CmsPageData[]>({
    queryKey: ["/api/admin/pages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pages", { credentials: "include" });
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof pageForm) => {
      await apiRequest("POST", "/api/admin/pages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "Page created" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof pageForm }) => {
      await apiRequest("PATCH", `/api/admin/pages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "Page updated" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "Page deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setShowDialog(false);
    setEditingPage(null);
    setPageForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", status: "draft", sortOrder: 0, showInNav: false });
  };

  const openEdit = (page: CmsPageData) => {
    setEditingPage(page);
    setPageForm({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      status: page.status,
      sortOrder: page.sortOrder,
      showInNav: page.showInNav,
    });
    setShowDialog(true);
  };

  const openCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleTitleChange = (title: string) => {
    setPageForm(prev => ({
      ...prev,
      title,
      slug: editingPage ? prev.slug : generateSlug(title),
    }));
  };

  const handleSave = () => {
    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data: pageForm });
    } else {
      createMutation.mutate(pageForm);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" /> CMS Pages
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={v => { if (!v) resetForm(); else openCreate(); }}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-page">
              <Plus className="h-4 w-4 mr-1" /> Add Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? "Edit Page" : "Create New Page"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={pageForm.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    data-testid="input-page-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={pageForm.slug}
                    onChange={e => setPageForm(p => ({ ...p, slug: e.target.value }))}
                    data-testid="input-page-slug"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={pageForm.content}
                  onChange={e => setPageForm(p => ({ ...p, content: e.target.value }))}
                  rows={10}
                  data-testid="input-page-content"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={pageForm.metaTitle}
                    onChange={e => setPageForm(p => ({ ...p, metaTitle: e.target.value }))}
                    data-testid="input-page-meta-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Input
                    value={pageForm.metaDescription}
                    onChange={e => setPageForm(p => ({ ...p, metaDescription: e.target.value }))}
                    data-testid="input-page-meta-description"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={pageForm.status} onValueChange={v => setPageForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger data-testid="select-page-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={pageForm.sortOrder}
                    onChange={e => setPageForm(p => ({ ...p, sortOrder: Number(e.target.value) }))}
                    data-testid="input-page-sort-order"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Show in Navigation</Label>
                  <div className="pt-1">
                    <Switch
                      checked={pageForm.showInNav}
                      onCheckedChange={v => setPageForm(p => ({ ...p, showInNav: v }))}
                      data-testid="switch-page-show-nav"
                    />
                  </div>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={!pageForm.title || !pageForm.slug || createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-page"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingPage ? "Update Page" : "Create Page"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {(!pages || pages.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-pages">No pages yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Slug</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Order</th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(page => (
                  <tr key={page.id} className="border-b last:border-0" data-testid={`row-page-${page.id}`}>
                    <td className="py-3 pr-4 font-medium">{page.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">/{page.slug}</td>
                    <td className="py-3 px-4">
                      <Badge variant={page.status === "published" ? "default" : "secondary"} data-testid={`badge-status-${page.id}`}>
                        {page.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{page.sortOrder}</td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(page)} data-testid={`button-edit-page-${page.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)} data-testid={`button-delete-page-${page.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FilesTab() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data: files, isLoading } = useQuery<CmsFileData[]>({
    queryKey: ["/api/admin/files"],
    queryFn: async () => {
      const res = await fetch("/api/admin/files", { credentials: "include" });
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: globalThis.File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/files", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/files"] });
      toast({ title: "File uploaded" });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/files"] });
      toast({ title: "File deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach(f => uploadMutation.mutate(f));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied to clipboard" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4" /> File Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          data-testid="dropzone-files"
        >
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">Drag and drop files here, or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
            data-testid="input-file-upload"
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} data-testid="button-browse-files">
            Browse Files
          </Button>
          {uploadMutation.isPending && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
            </div>
          )}
        </div>

        {(!files || files.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-files">No files uploaded yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(file => (
              <Card key={file.id} data-testid={`card-file-${file.id}`}>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {file.mimeType.startsWith("image/") ? (
                      <div className="aspect-video rounded-md overflow-hidden bg-muted">
                        <img
                          src={file.url}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                          data-testid={`img-preview-${file.id}`}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                        <File className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate" data-testid={`text-filename-${file.id}`}>{file.originalName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span data-testid={`text-filesize-${file.id}`}>{formatFileSize(file.size)}</span>
                        <span>{file.mimeType}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => copyUrl(file.url)} data-testid={`button-copy-url-${file.id}`}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(file.id)} data-testid={`button-delete-file-${file.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UsersTab() {
  const { toast } = useToast();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      return res.json();
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: { email: string; password: string; username?: string; role: string }) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User created successfully" });
      setShowAddUser(false);
      setNewEmail("");
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser.mutate(id);
    }
  };

  const handleAddUser = () => {
    if (!newEmail || !newPassword) {
      toast({ title: "Error", description: "Email and password are required", variant: "destructive" });
      return;
    }
    createUser.mutate({ email: newEmail, password: newPassword, username: newUsername || undefined, role: newRole });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" /> User Management
        </CardTitle>
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-user">
              <Plus className="h-4 w-4 mr-1" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with email and password.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="new-user-email">Email *</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  data-testid="input-new-user-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-username">Username (optional)</Label>
                <Input
                  id="new-user-username"
                  placeholder="Leave blank to auto-generate from email"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  data-testid="input-new-user-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-password">Password *</Label>
                <Input
                  id="new-user-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  data-testid="input-new-user-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-role">Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger data-testid="select-new-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddUser(false)} data-testid="button-cancel-add-user">Cancel</Button>
              <Button onClick={handleAddUser} disabled={createUser.isPending} data-testid="button-save-new-user">
                {createUser.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Email</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Provider</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Plan</th>
                <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map(u => (
                <tr key={u.id} className="border-b last:border-0" data-testid={`row-user-${u.id}`}>
                  <td className="py-3 pr-4 font-medium">{u.username}</td>
                  <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" data-testid={`badge-provider-${u.id}`}>{u.authProvider}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={u.role}
                      onValueChange={v => updateUser.mutate({ id: u.id, data: { role: v } })}
                    >
                      <SelectTrigger className="w-24" data-testid={`select-role-${u.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={u.isActive ? "default" : "secondary"} data-testid={`badge-active-${u.id}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={u.subscriptionTier}
                      onValueChange={v => updateUser.mutate({ id: u.id, data: { subscriptionTier: v } })}
                    >
                      <SelectTrigger className="w-32" data-testid={`select-tier-${u.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} data-testid={`button-delete-user-${u.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ContactsTab() {
  const { toast } = useToast();

  const { data: contacts, isLoading } = useQuery<ContactData[]>({
    queryKey: ["/api/admin/contacts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/contacts", { credentials: "include" });
      return res.json();
    },
  });

  const updateContact = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { status: string } }) => {
      await apiRequest("PATCH", `/api/admin/contacts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({ title: "Contact updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({ title: "Contact deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      deleteContact.mutate(id);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "new": return "default" as const;
      case "read": return "secondary" as const;
      case "replied": return "secondary" as const;
      default: return "secondary" as const;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Contact Submissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(!contacts || contacts.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-contacts">No contact submissions yet</p>
        ) : (
          <div className="space-y-4">
            {contacts.map(contact => (
              <Card key={contact.id} data-testid={`card-contact-${contact.id}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium" data-testid={`text-contact-name-${contact.id}`}>{contact.name}</span>
                        <Badge variant={statusColor(contact.status)} data-testid={`badge-contact-status-${contact.id}`}>
                          {contact.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-contact-email-${contact.id}`}>{contact.email}</p>
                      {contact.subject && (
                        <p className="text-sm font-medium">{contact.subject}</p>
                      )}
                      <p className="text-sm" data-testid={`text-contact-message-${contact.id}`}>{contact.message}</p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-contact-date-${contact.id}`}>
                        {new Date(contact.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Select
                        value={contact.status}
                        onValueChange={v => updateContact.mutate({ id: contact.id, data: { status: v } })}
                      >
                        <SelectTrigger className="w-28" data-testid={`select-contact-status-${contact.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(contact.id)} data-testid={`button-delete-contact-${contact.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TrackingCodesData {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  googleSearchConsoleCode: string;
  googleAdsId: string;
  googleAdsConversionLabel: string;
  facebookPixelId: string;
  facebookConversionsApiToken: string;
  microsoftAdsId: string;
  tiktokPixelId: string;
  linkedinInsightTagId: string;
  pinterestTagId: string;
  snapchatPixelId: string;
  twitterPixelId: string;
  bingVerificationCode: string;
  yandexVerificationCode: string;
  hotjarSiteId: string;
  clarityProjectId: string;
  customTrackingHead: string;
  customTrackingBody: string;
}

const defaultTrackingCodes: TrackingCodesData = {
  googleAnalyticsId: "",
  googleTagManagerId: "",
  googleSearchConsoleCode: "",
  googleAdsId: "",
  googleAdsConversionLabel: "",
  facebookPixelId: "",
  facebookConversionsApiToken: "",
  microsoftAdsId: "",
  tiktokPixelId: "",
  linkedinInsightTagId: "",
  pinterestTagId: "",
  snapchatPixelId: "",
  twitterPixelId: "",
  bingVerificationCode: "",
  yandexVerificationCode: "",
  hotjarSiteId: "",
  clarityProjectId: "",
  customTrackingHead: "",
  customTrackingBody: "",
};

function TrackingCodesTab() {
  const { toast } = useToast();
  const [form, setForm] = useState<TrackingCodesData | null>(null);

  const { data: settings, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/site-settings", { credentials: "include" });
      return res.json();
    },
  });

  const trackingData: TrackingCodesData = form || {
    googleAnalyticsId: settings?.googleAnalyticsId || "",
    googleTagManagerId: settings?.googleTagManagerId || "",
    googleSearchConsoleCode: settings?.googleSearchConsoleCode || "",
    googleAdsId: settings?.googleAdsId || "",
    googleAdsConversionLabel: settings?.googleAdsConversionLabel || "",
    facebookPixelId: settings?.facebookPixelId || "",
    facebookConversionsApiToken: settings?.facebookConversionsApiToken || "",
    microsoftAdsId: settings?.microsoftAdsId || "",
    tiktokPixelId: settings?.tiktokPixelId || "",
    linkedinInsightTagId: settings?.linkedinInsightTagId || "",
    pinterestTagId: settings?.pinterestTagId || "",
    snapchatPixelId: settings?.snapchatPixelId || "",
    twitterPixelId: settings?.twitterPixelId || "",
    bingVerificationCode: settings?.bingVerificationCode || "",
    yandexVerificationCode: settings?.yandexVerificationCode || "",
    hotjarSiteId: settings?.hotjarSiteId || "",
    clarityProjectId: settings?.clarityProjectId || "",
    customTrackingHead: settings?.customTrackingHead || "",
    customTrackingBody: settings?.customTrackingBody || "",
  };

  const saveMutation = useMutation({
    mutationFn: async (data: TrackingCodesData) => {
      await apiRequest("PUT", "/api/admin/site-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      toast({ title: "Tracking codes saved" });
      setForm(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateField = (key: keyof TrackingCodesData, value: string) => {
    setForm(prev => ({ ...(prev || trackingData), [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const sections = [
    {
      title: "Google",
      description: "Google Analytics, Tag Manager, Search Console, and Ads tracking",
      fields: [
        { key: "googleAnalyticsId" as const, label: "Google Analytics Measurement ID", placeholder: "G-XXXXXXXXXX", hint: "Found in GA4 > Admin > Data Streams" },
        { key: "googleTagManagerId" as const, label: "Google Tag Manager Container ID", placeholder: "GTM-XXXXXXX", hint: "Found in GTM > Admin > Container Settings" },
        { key: "googleSearchConsoleCode" as const, label: "Google Search Console Verification", placeholder: "Meta tag content value or full HTML tag", hint: "Found in Search Console > Settings > Ownership verification" },
        { key: "googleAdsId" as const, label: "Google Ads Conversion ID", placeholder: "AW-XXXXXXXXX", hint: "Found in Google Ads > Tools > Conversions" },
        { key: "googleAdsConversionLabel" as const, label: "Google Ads Conversion Label", placeholder: "AbCdEfGh123", hint: "Specific conversion action label" },
      ],
    },
    {
      title: "Social Media Pixels",
      description: "Facebook, TikTok, LinkedIn, Pinterest, Snapchat, and Twitter/X tracking",
      fields: [
        { key: "facebookPixelId" as const, label: "Meta (Facebook) Pixel ID", placeholder: "123456789012345", hint: "Found in Meta Events Manager > Data Sources" },
        { key: "facebookConversionsApiToken" as const, label: "Meta Conversions API Access Token", placeholder: "EAAxxxxxxxxx...", hint: "For server-side event tracking (optional)" },
        { key: "tiktokPixelId" as const, label: "TikTok Pixel ID", placeholder: "CXXXXXXXXXXXXXXXXX", hint: "Found in TikTok Ads Manager > Events" },
        { key: "linkedinInsightTagId" as const, label: "LinkedIn Insight Tag Partner ID", placeholder: "123456", hint: "Found in LinkedIn Campaign Manager > Insight Tag" },
        { key: "pinterestTagId" as const, label: "Pinterest Tag ID", placeholder: "2612345678901", hint: "Found in Pinterest Ads > Conversions" },
        { key: "snapchatPixelId" as const, label: "Snapchat Pixel ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", hint: "Found in Snapchat Ads Manager > Events Manager" },
        { key: "twitterPixelId" as const, label: "Twitter (X) Pixel ID", placeholder: "xxxxx", hint: "Found in X Ads Manager > Events Manager" },
      ],
    },
    {
      title: "Microsoft & Other Search Engines",
      description: "Microsoft Ads, Bing, and Yandex verification codes",
      fields: [
        { key: "microsoftAdsId" as const, label: "Microsoft (Bing) Ads UET Tag ID", placeholder: "12345678", hint: "Found in Microsoft Advertising > UET Tags" },
        { key: "bingVerificationCode" as const, label: "Bing Webmaster Verification Code", placeholder: "Meta tag content value", hint: "Found in Bing Webmaster Tools > Verify ownership" },
        { key: "yandexVerificationCode" as const, label: "Yandex Verification Code", placeholder: "Meta tag content value", hint: "Found in Yandex Webmaster > Add site" },
      ],
    },
    {
      title: "Behaviour & Heatmap Tools",
      description: "Session recording and heatmap tracking tools",
      fields: [
        { key: "hotjarSiteId" as const, label: "Hotjar Site ID", placeholder: "1234567", hint: "Found in Hotjar > Sites & Organizations" },
        { key: "clarityProjectId" as const, label: "Microsoft Clarity Project ID", placeholder: "abcdefghij", hint: "Found in Clarity > Settings > Overview" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map(section => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map(field => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-sm">{field.label}</Label>
                  <Input
                    value={trackingData[field.key] || ""}
                    onChange={e => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    data-testid={`input-tracking-${field.key}`}
                  />
                  <p className="text-xs text-muted-foreground">{field.hint}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Tracking Code</CardTitle>
          <p className="text-sm text-muted-foreground">Add any additional tracking scripts or verification tags not covered above</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm">Custom Head Code</Label>
            <Textarea
              value={trackingData.customTrackingHead || ""}
              onChange={e => updateField("customTrackingHead", e.target.value)}
              rows={5}
              placeholder={"<!-- Paste tracking scripts here -->\n<script>...</script>\n<meta name=\"verification\" content=\"...\" />"}
              className="font-mono text-sm"
              data-testid="input-tracking-custom-head"
            />
            <p className="text-xs text-muted-foreground">Injected into the &lt;head&gt; of every public page. Use for verification meta tags, analytics scripts, or pixel base codes.</p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Custom Body Code</Label>
            <Textarea
              value={trackingData.customTrackingBody || ""}
              onChange={e => updateField("customTrackingBody", e.target.value)}
              rows={5}
              placeholder={"<!-- Paste tracking scripts here -->\n<noscript>...</noscript>\n<script>...</script>"}
              className="font-mono text-sm"
              data-testid="input-tracking-custom-body"
            />
            <p className="text-xs text-muted-foreground">Injected at the end of the &lt;body&gt; on every public page. Use for noscript fallbacks or deferred scripts.</p>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => saveMutation.mutate(trackingData)}
        disabled={saveMutation.isPending}
        data-testid="button-save-tracking-codes"
      >
        {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Save Tracking Codes
      </Button>
    </div>
  );
}

interface PaymentSettingsData {
  id?: string;
  provider: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  paypalClientId: string;
  paypalSecretKey: string;
  isActive: boolean;
}

function PaymentGatewaysTab() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<PaymentSettingsData>({
    queryKey: ["/api/admin/payment-settings"],
  });

  const [paymentData, setPaymentData] = useState<PaymentSettingsData>({
    provider: "stripe",
    stripePublishableKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",
    paypalClientId: "",
    paypalSecretKey: "",
    isActive: false,
  });

  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (settings && !initialized) {
    setPaymentData({
      provider: settings.provider || "stripe",
      stripePublishableKey: settings.stripePublishableKey || "",
      stripeSecretKey: settings.stripeSecretKey || "",
      stripeWebhookSecret: settings.stripeWebhookSecret || "",
      paypalClientId: settings.paypalClientId || "",
      paypalSecretKey: settings.paypalSecretKey || "",
      isActive: settings.isActive || false,
    });
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (data: PaymentSettingsData) => {
      await apiRequest("PUT", "/api/admin/payment-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-settings"] });
      toast({ title: "Payment settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save payment settings", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Gateway Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Label>Enable Payment Processing</Label>
            <Switch
              checked={paymentData.isActive}
              onCheckedChange={(checked) => setPaymentData({ ...paymentData, isActive: checked })}
              data-testid="switch-payment-active"
            />
            <Badge variant={paymentData.isActive ? "default" : "secondary"}>
              {paymentData.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>Payment Provider</Label>
            <Select
              value={paymentData.provider}
              onValueChange={(value) => setPaymentData({ ...paymentData, provider: value })}
            >
              <SelectTrigger data-testid="select-payment-provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="both">Both (Stripe + PayPal)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(paymentData.provider === "stripe" || paymentData.provider === "both") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stripe Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Publishable Key</Label>
                  <Input
                    value={paymentData.stripePublishableKey}
                    onChange={(e) => setPaymentData({ ...paymentData, stripePublishableKey: e.target.value })}
                    placeholder="pk_live_..."
                    data-testid="input-stripe-publishable-key"
                  />
                  <p className="text-xs text-muted-foreground">Your Stripe publishable key (starts with pk_live_ or pk_test_)</p>
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showStripeSecret ? "text" : "password"}
                      value={paymentData.stripeSecretKey}
                      onChange={(e) => setPaymentData({ ...paymentData, stripeSecretKey: e.target.value })}
                      placeholder="sk_live_..."
                      data-testid="input-stripe-secret-key"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      data-testid="button-toggle-stripe-secret"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Your Stripe secret key (starts with sk_live_ or sk_test_)</p>
                </div>
                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showWebhookSecret ? "text" : "password"}
                      value={paymentData.stripeWebhookSecret}
                      onChange={(e) => setPaymentData({ ...paymentData, stripeWebhookSecret: e.target.value })}
                      placeholder="whsec_..."
                      data-testid="input-stripe-webhook-secret"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      data-testid="button-toggle-webhook-secret"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Used to verify webhook events from Stripe (starts with whsec_)</p>
                </div>
              </CardContent>
            </Card>
          )}

          {(paymentData.provider === "paypal" || paymentData.provider === "both") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PayPal Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    value={paymentData.paypalClientId}
                    onChange={(e) => setPaymentData({ ...paymentData, paypalClientId: e.target.value })}
                    placeholder="PayPal Client ID"
                    data-testid="input-paypal-client-id"
                  />
                  <p className="text-xs text-muted-foreground">Your PayPal REST API Client ID</p>
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showPaypalSecret ? "text" : "password"}
                      value={paymentData.paypalSecretKey}
                      onChange={(e) => setPaymentData({ ...paymentData, paypalSecretKey: e.target.value })}
                      placeholder="PayPal Secret Key"
                      data-testid="input-paypal-secret-key"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                      data-testid="button-toggle-paypal-secret"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Your PayPal REST API Secret Key</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={() => saveMutation.mutate(paymentData)}
            disabled={saveMutation.isPending}
            data-testid="button-save-payment-settings"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Payment Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

function BlogPostsTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostData | null>(null);
  const [postForm, setPostForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "General",
    author: "",
    readTime: "",
    status: "draft",
    metaTitle: "",
    metaDescription: "",
  });

  const { data: posts, isLoading } = useQuery<BlogPostData[]>({
    queryKey: ["/api/admin/blog-posts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blog-posts", { credentials: "include" });
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof postForm) => {
      await apiRequest("POST", "/api/admin/blog-posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({ title: "Blog post created" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof postForm }) => {
      await apiRequest("PATCH", `/api/admin/blog-posts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({ title: "Blog post updated" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/blog-posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({ title: "Blog post deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setShowDialog(false);
    setEditingPost(null);
    setPostForm({ title: "", slug: "", excerpt: "", content: "", category: "General", author: "", readTime: "", status: "draft", metaTitle: "", metaDescription: "" });
  };

  const openEdit = (post: BlogPostData) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category || "General",
      author: post.author || "",
      readTime: post.readTime || "",
      status: post.status,
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
    });
    setShowDialog(true);
  };

  const openCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleTitleChange = (title: string) => {
    setPostForm(prev => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title),
    }));
  };

  const handleSave = () => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: postForm });
    } else {
      createMutation.mutate(postForm);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Blog Posts
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={v => { if (!v) resetForm(); else openCreate(); }}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-blog-post">
              <Plus className="h-4 w-4 mr-1" /> Add Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={postForm.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    data-testid="input-blog-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={postForm.slug}
                    onChange={e => setPostForm(p => ({ ...p, slug: e.target.value }))}
                    data-testid="input-blog-slug"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={postForm.excerpt}
                  onChange={e => setPostForm(p => ({ ...p, excerpt: e.target.value }))}
                  rows={3}
                  data-testid="input-blog-excerpt"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <HtmlEditor
                  value={postForm.content}
                  onChange={v => setPostForm(p => ({ ...p, content: v }))}
                  data-testid="input-blog-content"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={postForm.category} onValueChange={v => setPostForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger data-testid="select-blog-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Privacy">Privacy</SelectItem>
                      <SelectItem value="Tutorial">Tutorial</SelectItem>
                      <SelectItem value="Insights">Insights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={postForm.author}
                    onChange={e => setPostForm(p => ({ ...p, author: e.target.value }))}
                    data-testid="input-blog-author"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Read Time</Label>
                  <Input
                    value={postForm.readTime}
                    onChange={e => setPostForm(p => ({ ...p, readTime: e.target.value }))}
                    placeholder="5 min read"
                    data-testid="input-blog-read-time"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={postForm.status} onValueChange={v => setPostForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger data-testid="select-blog-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={postForm.metaTitle}
                    onChange={e => setPostForm(p => ({ ...p, metaTitle: e.target.value }))}
                    data-testid="input-blog-meta-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Input
                    value={postForm.metaDescription}
                    onChange={e => setPostForm(p => ({ ...p, metaDescription: e.target.value }))}
                    data-testid="input-blog-meta-description"
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={!postForm.title || !postForm.slug || createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-blog-post"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingPost ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {(!posts || posts.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-blog-posts">No blog posts yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Slug</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className="border-b last:border-0" data-testid={`row-blog-post-${post.id}`}>
                    <td className="py-3 pr-4 font-medium">{post.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">/{post.slug}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" data-testid={`badge-blog-category-${post.id}`}>
                        {post.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={post.status === "published" ? "default" : "secondary"} data-testid={`badge-blog-status-${post.id}`}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(post)} data-testid={`button-edit-blog-post-${post.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} data-testid={`button-delete-blog-post-${post.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface GuideData {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  level: string;
  readTime: string;
  sortOrder: number;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

function GuidesTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingGuide, setEditingGuide] = useState<GuideData | null>(null);
  const [guideForm, setGuideForm] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    category: "General",
    level: "Beginner",
    readTime: "",
    sortOrder: 0,
    status: "draft",
    metaTitle: "",
    metaDescription: "",
  });

  const { data: guides, isLoading } = useQuery<GuideData[]>({
    queryKey: ["/api/admin/guides"],
    queryFn: async () => {
      const res = await fetch("/api/admin/guides", { credentials: "include" });
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof guideForm) => {
      await apiRequest("POST", "/api/admin/guides", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guides"] });
      toast({ title: "Guide created" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof guideForm }) => {
      await apiRequest("PATCH", `/api/admin/guides/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guides"] });
      toast({ title: "Guide updated" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/guides/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guides"] });
      toast({ title: "Guide deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setShowDialog(false);
    setEditingGuide(null);
    setGuideForm({ title: "", slug: "", description: "", content: "", category: "General", level: "Beginner", readTime: "", sortOrder: 0, status: "draft", metaTitle: "", metaDescription: "" });
  };

  const openEdit = (guide: GuideData) => {
    setEditingGuide(guide);
    setGuideForm({
      title: guide.title,
      slug: guide.slug,
      description: guide.description || "",
      content: guide.content || "",
      category: guide.category || "General",
      level: guide.level || "Beginner",
      readTime: guide.readTime || "",
      sortOrder: guide.sortOrder || 0,
      status: guide.status,
      metaTitle: guide.metaTitle || "",
      metaDescription: guide.metaDescription || "",
    });
    setShowDialog(true);
  };

  const openCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleTitleChange = (title: string) => {
    setGuideForm(prev => ({
      ...prev,
      title,
      slug: editingGuide ? prev.slug : generateSlug(title),
    }));
  };

  const handleSave = () => {
    if (editingGuide) {
      updateMutation.mutate({ id: editingGuide.id, data: guideForm });
    } else {
      createMutation.mutate(guideForm);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this guide?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Guides
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={v => { if (!v) resetForm(); else openCreate(); }}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-guide">
              <Plus className="h-4 w-4 mr-1" /> Add Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGuide ? "Edit Guide" : "Create New Guide"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={guideForm.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    data-testid="input-guide-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={guideForm.slug}
                    onChange={e => setGuideForm(p => ({ ...p, slug: e.target.value }))}
                    data-testid="input-guide-slug"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={guideForm.description}
                  onChange={e => setGuideForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  data-testid="input-guide-description"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <HtmlEditor
                  value={guideForm.content}
                  onChange={v => setGuideForm(p => ({ ...p, content: v }))}
                  data-testid="input-guide-content"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={guideForm.category} onValueChange={v => setGuideForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger data-testid="select-guide-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="Privacy">Privacy</SelectItem>
                      <SelectItem value="AI">AI</SelectItem>
                      <SelectItem value="SEO">SEO</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={guideForm.level} onValueChange={v => setGuideForm(p => ({ ...p, level: v }))}>
                    <SelectTrigger data-testid="select-guide-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Read Time</Label>
                  <Input
                    value={guideForm.readTime}
                    onChange={e => setGuideForm(p => ({ ...p, readTime: e.target.value }))}
                    placeholder="10 min read"
                    data-testid="input-guide-read-time"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={guideForm.sortOrder}
                    onChange={e => setGuideForm(p => ({ ...p, sortOrder: Number(e.target.value) }))}
                    data-testid="input-guide-sort-order"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={guideForm.status} onValueChange={v => setGuideForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger data-testid="select-guide-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={guideForm.metaTitle}
                    onChange={e => setGuideForm(p => ({ ...p, metaTitle: e.target.value }))}
                    data-testid="input-guide-meta-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Input
                    value={guideForm.metaDescription}
                    onChange={e => setGuideForm(p => ({ ...p, metaDescription: e.target.value }))}
                    data-testid="input-guide-meta-description"
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={!guideForm.title || !guideForm.slug || createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-guide"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingGuide ? "Update Guide" : "Create Guide"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {(!guides || guides.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-guides">No guides yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Level</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.map(guide => (
                  <tr key={guide.id} className="border-b last:border-0" data-testid={`row-guide-${guide.id}`}>
                    <td className="py-3 pr-4 font-medium">{guide.title}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" data-testid={`badge-guide-category-${guide.id}`}>
                        {guide.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" data-testid={`badge-guide-level-${guide.id}`}>
                        {guide.level}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={guide.status === "published" ? "default" : "secondary"} data-testid={`badge-guide-status-${guide.id}`}>
                        {guide.status}
                      </Badge>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(guide)} data-testid={`button-edit-guide-${guide.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(guide.id)} data-testid={`button-delete-guide-${guide.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CaseStudyData {
  id: string;
  title: string;
  slug: string;
  company: string;
  industry: string;
  summary: string;
  content: string;
  quote: string;
  quoteAuthor: string;
  metrics: string;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

function CaseStudiesTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingStudy, setEditingStudy] = useState<CaseStudyData | null>(null);
  const [studyForm, setStudyForm] = useState({
    title: "",
    slug: "",
    company: "",
    industry: "",
    summary: "",
    content: "",
    quote: "",
    quoteAuthor: "",
    metrics: "{}",
    status: "draft",
    metaTitle: "",
    metaDescription: "",
  });

  const { data: studies, isLoading } = useQuery<CaseStudyData[]>({
    queryKey: ["/api/admin/case-studies"],
    queryFn: async () => {
      const res = await fetch("/api/admin/case-studies", { credentials: "include" });
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof studyForm) => {
      const parsed = { ...data, metrics: JSON.parse(data.metrics) };
      await apiRequest("POST", "/api/admin/case-studies", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      toast({ title: "Case study created" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof studyForm }) => {
      const parsed = { ...data, metrics: JSON.parse(data.metrics) };
      await apiRequest("PATCH", `/api/admin/case-studies/${id}`, parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      toast({ title: "Case study updated" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/case-studies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      toast({ title: "Case study deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setShowDialog(false);
    setEditingStudy(null);
    setStudyForm({ title: "", slug: "", company: "", industry: "", summary: "", content: "", quote: "", quoteAuthor: "", metrics: "{}", status: "draft", metaTitle: "", metaDescription: "" });
  };

  const openEdit = (study: CaseStudyData) => {
    setEditingStudy(study);
    setStudyForm({
      title: study.title,
      slug: study.slug,
      company: study.company || "",
      industry: study.industry || "",
      summary: study.summary || "",
      content: study.content || "",
      quote: study.quote || "",
      quoteAuthor: study.quoteAuthor || "",
      metrics: typeof study.metrics === "object" ? JSON.stringify(study.metrics, null, 2) : (study.metrics || "{}"),
      status: study.status,
      metaTitle: study.metaTitle || "",
      metaDescription: study.metaDescription || "",
    });
    setShowDialog(true);
  };

  const openCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleTitleChange = (title: string) => {
    setStudyForm(prev => ({
      ...prev,
      title,
      slug: editingStudy ? prev.slug : generateSlug(title),
    }));
  };

  const handleSave = () => {
    try {
      JSON.parse(studyForm.metrics);
    } catch {
      toast({ title: "Invalid JSON in metrics field", variant: "destructive" });
      return;
    }
    if (editingStudy) {
      updateMutation.mutate({ id: editingStudy.id, data: studyForm });
    } else {
      createMutation.mutate(studyForm);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this case study?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" /> Case Studies
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={v => { if (!v) resetForm(); else openCreate(); }}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-case-study">
              <Plus className="h-4 w-4 mr-1" /> Add Case Study
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudy ? "Edit Case Study" : "Create New Case Study"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={studyForm.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    data-testid="input-case-study-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={studyForm.slug}
                    onChange={e => setStudyForm(p => ({ ...p, slug: e.target.value }))}
                    data-testid="input-case-study-slug"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={studyForm.company}
                    onChange={e => setStudyForm(p => ({ ...p, company: e.target.value }))}
                    data-testid="input-case-study-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    value={studyForm.industry}
                    onChange={e => setStudyForm(p => ({ ...p, industry: e.target.value }))}
                    data-testid="input-case-study-industry"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  value={studyForm.summary}
                  onChange={e => setStudyForm(p => ({ ...p, summary: e.target.value }))}
                  rows={3}
                  data-testid="input-case-study-summary"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <HtmlEditor
                  value={studyForm.content}
                  onChange={v => setStudyForm(p => ({ ...p, content: v }))}
                  data-testid="input-case-study-content"
                />
              </div>
              <div className="space-y-2">
                <Label>Quote</Label>
                <Textarea
                  value={studyForm.quote}
                  onChange={e => setStudyForm(p => ({ ...p, quote: e.target.value }))}
                  rows={3}
                  data-testid="input-case-study-quote"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quote Author</Label>
                  <Input
                    value={studyForm.quoteAuthor}
                    onChange={e => setStudyForm(p => ({ ...p, quoteAuthor: e.target.value }))}
                    data-testid="input-case-study-quote-author"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={studyForm.status} onValueChange={v => setStudyForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger data-testid="select-case-study-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Metrics (JSON)</Label>
                <Textarea
                  value={studyForm.metrics}
                  onChange={e => setStudyForm(p => ({ ...p, metrics: e.target.value }))}
                  rows={5}
                  className="font-mono text-sm"
                  data-testid="input-case-study-metrics"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={studyForm.metaTitle}
                    onChange={e => setStudyForm(p => ({ ...p, metaTitle: e.target.value }))}
                    data-testid="input-case-study-meta-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Input
                    value={studyForm.metaDescription}
                    onChange={e => setStudyForm(p => ({ ...p, metaDescription: e.target.value }))}
                    data-testid="input-case-study-meta-description"
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={!studyForm.title || !studyForm.slug || createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-case-study"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingStudy ? "Update Case Study" : "Create Case Study"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {(!studies || studies.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-case-studies">No case studies yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Company</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Industry</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studies.map(study => (
                  <tr key={study.id} className="border-b last:border-0" data-testid={`row-case-study-${study.id}`}>
                    <td className="py-3 pr-4 font-medium">{study.company}</td>
                    <td className="py-3 px-4">{study.title}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" data-testid={`badge-case-study-industry-${study.id}`}>
                        {study.industry}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={study.status === "published" ? "default" : "secondary"} data-testid={`badge-case-study-status-${study.id}`}>
                        {study.status}
                      </Badge>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(study)} data-testid={`button-edit-case-study-${study.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(study.id)} data-testid={`button-delete-case-study-${study.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const [activeSection, setActiveSection] = useState("site-settings");

  const navGroups = [
    {
      label: "General",
      items: [
        { id: "site-settings", label: "Site Settings", icon: Globe },
        { id: "smtp", label: "SMTP", icon: Mail },
        { id: "tracking", label: "Tracking Codes", icon: Code },
        { id: "payments", label: "Payment Gateways", icon: CreditCard },
      ],
    },
    {
      label: "Content",
      items: [
        { id: "pages", label: "Pages", icon: FileText },
        { id: "files", label: "Files", icon: Image },
        { id: "blog-posts", label: "Blog Posts", icon: BookOpen },
        { id: "guides", label: "Guides", icon: BookOpen },
        { id: "case-studies", label: "Case Studies", icon: FileText },
      ],
    },
    {
      label: "People",
      items: [
        { id: "users", label: "Users", icon: Users },
        { id: "contacts", label: "Contacts", icon: MessageSquare },
      ],
    },
  ];

  const sectionComponents: Record<string, JSX.Element> = {
    "site-settings": <SiteSettingsTab />,
    "smtp": <SmtpTab />,
    "pages": <PagesTab />,
    "files": <FilesTab />,
    "users": <UsersTab />,
    "contacts": <ContactsTab />,
    "tracking": <TrackingCodesTab />,
    "payments": <PaymentGatewaysTab />,
    "blog-posts": <BlogPostsTab />,
    "guides": <GuidesTab />,
    "case-studies": <CaseStudiesTab />,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-title">CMS Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage site settings, content, users, and more</p>
        </div>
      </div>

      <FeatureGuide {...GUIDE_CONFIGS.admin} />

      <div className="flex gap-6" data-testid="admin-tabs">
        <nav className="w-56 shrink-0 space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      data-testid={`tab-${item.id}`}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover-elevate"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="flex-1 min-w-0">
          {sectionComponents[activeSection]}
        </div>
      </div>
    </div>
  );
}
