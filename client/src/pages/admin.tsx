import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Users, Settings, Save, Trash2, Plus, Mail, FileText,
  Upload, Copy, Globe, MessageSquare, Image, File, Loader2, Send, Eye, Code
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      return res.json();
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
          <Users className="h-4 w-4" /> User Management
        </CardTitle>
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-title">CMS Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage site settings, content, users, and more</p>
        </div>
      </div>

      <Tabs defaultValue="site-settings" data-testid="admin-tabs">
        <TabsList className="flex-wrap">
          <TabsTrigger value="site-settings" data-testid="tab-site-settings">
            <Globe className="h-4 w-4 mr-1" /> Site Settings
          </TabsTrigger>
          <TabsTrigger value="smtp" data-testid="tab-smtp">
            <Mail className="h-4 w-4 mr-1" /> SMTP
          </TabsTrigger>
          <TabsTrigger value="pages" data-testid="tab-pages">
            <FileText className="h-4 w-4 mr-1" /> Pages
          </TabsTrigger>
          <TabsTrigger value="files" data-testid="tab-files">
            <Image className="h-4 w-4 mr-1" /> Files
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-1" /> Users
          </TabsTrigger>
          <TabsTrigger value="contacts" data-testid="tab-contacts">
            <MessageSquare className="h-4 w-4 mr-1" /> Contacts
          </TabsTrigger>
          <TabsTrigger value="tracking" data-testid="tab-tracking">
            <Code className="h-4 w-4 mr-1" /> Tracking Codes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="site-settings" className="mt-4">
          <SiteSettingsTab />
        </TabsContent>
        <TabsContent value="smtp" className="mt-4">
          <SmtpTab />
        </TabsContent>
        <TabsContent value="pages" className="mt-4">
          <PagesTab />
        </TabsContent>
        <TabsContent value="files" className="mt-4">
          <FilesTab />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersTab />
        </TabsContent>
        <TabsContent value="contacts" className="mt-4">
          <ContactsTab />
        </TabsContent>
        <TabsContent value="tracking" className="mt-4">
          <TrackingCodesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
