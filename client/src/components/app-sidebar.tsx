import { AnimatedLogo } from "@/components/animated-logo";
import {
  BarChart3,
  FolderKanban,
  Search,
  Megaphone,
  Sparkles,
  Settings,
  Code2,
  Activity,
  Route,
  Users,
  FileBarChart,
  Shield,
  Zap,
  Globe,
  MousePointerClick,
  LayoutDashboard,
  GitFork,
  Layers,
  FileText,
  Monitor,
  MapPin,
  ScanSearch,
  ChevronRight,
  ShoppingCart,
  CreditCard,
  Receipt,
  TrendingUp,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  Target,
  Newspaper,
  Bot,
  Eye,
  BrainCircuit,
  Gauge,
  Wand2,
  GraduationCap,
  Award,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useProject } from "@/lib/project-context";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Project } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  title: string;
  icon: typeof LayoutDashboard;
  items: NavItem[];
}

const topLevelItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Realtime", url: "/realtime", icon: Zap },
];

const acquisitionSection: NavSection = {
  title: "Acquisition",
  icon: Globe,
  items: [
    { title: "Acquisition overview", url: "/acquisition", icon: TrendingUp },
    { title: "User acquisition", url: "/user-acquisition", icon: UserPlus },
    { title: "Traffic acquisition", url: "/traffic-acquisition", icon: ArrowRightLeft },
    { title: "Lead acquisition", url: "/lead-acquisition", icon: Target },
  ],
};

const engagementSection: NavSection = {
  title: "Engagement",
  icon: MousePointerClick,
  items: [
    { title: "Engagement overview", url: "/engagement", icon: Eye },
    { title: "Events", url: "/events", icon: Activity },
    { title: "Pages & screens", url: "/pages", icon: FileText },
    { title: "Landing page", url: "/landing-pages", icon: Newspaper },
  ],
};

const monetisationSection: NavSection = {
  title: "Monetisation",
  icon: CreditCard,
  items: [
    { title: "Overview", url: "/monetisation", icon: ShoppingCart },
    { title: "E-commerce purchases", url: "/ecommerce", icon: Receipt },
    { title: "Purchase journey", url: "/purchase-journey", icon: Route },
    { title: "Transactions", url: "/transactions", icon: CreditCard },
  ],
};

const trafficItems: NavItem[] = [
  { title: "Traffic Sources", url: "/traffic-sources", icon: Megaphone },
  { title: "Geography", url: "/geography", icon: MapPin },
  { title: "Browsers & Systems", url: "/browsers", icon: Monitor },
];

const explorationItems: NavItem[] = [
  { title: "Funnel Explorer", url: "/funnels", icon: GitFork },
  { title: "Custom Events", url: "/custom-events", icon: Layers },
  { title: "Custom Reports", url: "/reports", icon: FileBarChart },
  { title: "User Journeys", url: "/journeys", icon: Route },
  { title: "Visitors", url: "/visitors", icon: Users },
];

const marketingItems: NavItem[] = [
  { title: "SEO Analysis", url: "/seo", icon: Search },
  { title: "Site Audit", url: "/site-audit", icon: ScanSearch },
  { title: "Content Gap", url: "/content-gap", icon: Target },
  { title: "Site Research", url: "/site-research", icon: Globe },
  { title: "Search Console", url: "/search-console", icon: ScanSearch },
  { title: "PPC Campaigns", url: "/ppc", icon: BarChart3 },
];

const aiItems: NavItem[] = [
  { title: "AI Copilot", url: "/ai", icon: Bot },
  { title: "Predictive Analytics", url: "/predictive-analytics", icon: BrainCircuit },
  { title: "UX Auditor", url: "/ux-auditor", icon: Gauge },
  { title: "Marketing Copilot", url: "/marketing-copilot", icon: Wand2 },
];

const learningItems: NavItem[] = [
  { title: "Knowledge Center", url: "/knowledge", icon: GraduationCap },
  { title: "My Badges", url: "/knowledge?tab=badges", icon: Award },
];

const adminItems: NavItem[] = [
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Project Settings", url: "/project-settings", icon: Settings },
  { title: "Privacy & GDPR", url: "/privacy", icon: Shield },
  { title: "Tracking Code", url: "/snippet", icon: Code2 },
  { title: "Usage & Billing", url: "/usage", icon: Receipt },
  { title: "Admin Panel", url: "/admin", icon: Shield },
  { title: "Settings", url: "/settings", icon: Settings },
];

function CollapsibleNavSection({ section, location }: { section: NavSection; location: string }) {
  const isActive = section.items.some((item) => item.url === location);

  return (
    <Collapsible defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton data-testid={`button-nav-${section.title.toLowerCase()}`}>
            <section.icon className="h-4 w-4" />
            <span>{section.title}</span>
            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {section.items.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton asChild isActive={location === item.url}>
                  <Link href={item.url}>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function NavGroup({ label, items, location }: { label: string; items: NavItem[]; location: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={location === item.url}>
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { currentProject, setCurrentProject } = useProject();
  const { user, logout } = useAuth();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <AnimatedLogo size="md" showText={true} showTagline={true} />
      </SidebarHeader>

      <SidebarContent>
        {projects && projects.length > 0 && (
          <div className="px-3 pb-2">
            <Select
              value={currentProject?.id || ""}
              onValueChange={(val) => {
                const p = projects.find((pr) => pr.id === val);
                if (p) setCurrentProject(p);
              }}
            >
              <SelectTrigger className="w-full" data-testid="select-project-switcher">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} data-testid={`select-project-${p.id}`}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Life cycle</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {topLevelItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <CollapsibleNavSection section={acquisitionSection} location={location} />
              <CollapsibleNavSection section={engagementSection} location={location} />
              <CollapsibleNavSection section={monetisationSection} location={location} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavGroup label="Traffic & Content" items={trafficItems} location={location} />
        <NavGroup label="Explorations" items={explorationItems} location={location} />
        <NavGroup label="Marketing & SEO" items={marketingItems} location={location} />
        <NavGroup label="AI" items={aiItems} location={location} />
        <NavGroup label="Learning" items={learningItems} location={location} />
        <NavGroup label="Admin" items={user?.role === "admin" ? adminItems : adminItems.filter(i => i.url !== "/admin")} location={location} />
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {user && (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" data-testid="text-user-name">{user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { logout(); }}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center">
          v3.0 &middot; Self-Hosted Analytics
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
