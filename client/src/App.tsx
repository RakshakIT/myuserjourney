import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProjectProvider } from "@/lib/project-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Events from "@/pages/events";
import Snippet from "@/pages/snippet";
import SeoPage from "@/pages/seo";
import PpcPage from "@/pages/ppc";
import AiInsights from "@/pages/ai-insights";
import SettingsPage from "@/pages/settings";
import Journeys from "@/pages/journeys";
import Visitors from "@/pages/visitors";
import Reports from "@/pages/reports";
import PrivacyPage from "@/pages/privacy";
import RealtimePage from "@/pages/realtime";
import AcquisitionPage from "@/pages/acquisition";
import EngagementPage from "@/pages/engagement";
import FunnelsPage from "@/pages/funnels";
import CustomEventsPage from "@/pages/custom-events";
import TrafficSourcesPage from "@/pages/traffic-sources";
import PagesAnalysisPage from "@/pages/pages-analysis";
import GeographyPage from "@/pages/geography";
import BrowsersSystemsPage from "@/pages/browsers-systems";
import SiteAuditPage from "@/pages/site-audit";
import UserAcquisitionPage from "@/pages/user-acquisition";
import TrafficAcquisitionPage from "@/pages/traffic-acquisition";
import LeadAcquisitionPage from "@/pages/lead-acquisition";
import LandingPagesPage from "@/pages/landing-pages";
import MonetisationPage from "@/pages/monetisation";
import EcommercePage from "@/pages/ecommerce";
import PurchaseJourneyPage from "@/pages/purchase-journey";
import TransactionsPage from "@/pages/transactions";
import ProjectSettingsPage from "@/pages/project-settings";
import SearchConsolePage from "@/pages/search-console";
import AdminPage from "@/pages/admin";
import IntegrationsPage from "@/pages/integrations";
import ContentGapPage from "@/pages/content-gap";
import SiteResearchPage from "@/pages/site-research";
import PredictiveAnalyticsPage from "@/pages/predictive-analytics";
import UxAuditorPage from "@/pages/ux-auditor";
import MarketingCopilotPage from "@/pages/marketing-copilot";
import UsagePage from "@/pages/usage";
import KnowledgeCenterPage from "@/pages/knowledge";
import { FloatingAIAssistant } from "@/components/floating-ai-assistant";
import UseCasesPage from "@/pages/public/use-cases";
import PricingPublicPage from "@/pages/public/pricing";
import CommunityPage from "@/pages/public/community";
import ConnectorsPublicPage from "@/pages/public/connectors-page";
import StartGuidePage from "@/pages/public/start-guide";
import DocsPage from "@/pages/public/docs";
import DocArticlePage from "@/pages/public/doc-article";
import BlogPage from "@/pages/public/blog";
import BlogPostPage from "@/pages/public/blog-post";
import HelpCenterPage from "@/pages/public/help-center";
import CapabilitiesPage from "@/pages/public/capabilities";
import GuidesPage from "@/pages/public/guides";
import GuideDetailPage from "@/pages/public/guide-detail";
import CaseStudiesPage from "@/pages/public/case-studies";
import CaseStudyDetailPage from "@/pages/public/case-study-detail";
import SecurityPublicPage from "@/pages/public/security-page";
import TrustCenterPage from "@/pages/public/trust-center";
import TermsPage from "@/pages/public/terms";
import PrivacyPolicyPage from "@/pages/public/privacy-policy";
import CmsPage from "@/pages/cms-page";
import ContactPage from "@/pages/contact";
import ResetPasswordPage from "@/pages/reset-password";
import CommunityForumPage from "@/pages/public/community-forum";
import CommunityIdeasPage from "@/pages/public/community-ideas";
import HelpArticlePage from "@/pages/public/help-article";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/realtime" component={RealtimePage} />
      <Route path="/acquisition" component={AcquisitionPage} />
      <Route path="/user-acquisition" component={UserAcquisitionPage} />
      <Route path="/traffic-acquisition" component={TrafficAcquisitionPage} />
      <Route path="/lead-acquisition" component={LeadAcquisitionPage} />
      <Route path="/engagement" component={EngagementPage} />
      <Route path="/events" component={Events} />
      <Route path="/pages" component={PagesAnalysisPage} />
      <Route path="/landing-pages" component={LandingPagesPage} />
      <Route path="/monetisation" component={MonetisationPage} />
      <Route path="/ecommerce" component={EcommercePage} />
      <Route path="/purchase-journey" component={PurchaseJourneyPage} />
      <Route path="/transactions" component={TransactionsPage} />
      <Route path="/traffic-sources" component={TrafficSourcesPage} />
      <Route path="/geography" component={GeographyPage} />
      <Route path="/browsers" component={BrowsersSystemsPage} />
      <Route path="/funnels" component={FunnelsPage} />
      <Route path="/custom-events" component={CustomEventsPage} />
      <Route path="/reports" component={Reports} />
      <Route path="/journeys" component={Journeys} />
      <Route path="/visitors" component={Visitors} />
      <Route path="/seo" component={SeoPage} />
      <Route path="/site-audit" component={SiteAuditPage} />
      <Route path="/ppc" component={PpcPage} />
      <Route path="/content-gap" component={ContentGapPage} />
      <Route path="/site-research" component={SiteResearchPage} />
      <Route path="/ai" component={AiInsights} />
      <Route path="/predictive-analytics" component={PredictiveAnalyticsPage} />
      <Route path="/ux-auditor" component={UxAuditorPage} />
      <Route path="/marketing-copilot" component={MarketingCopilotPage} />
      <Route path="/projects" component={Projects} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/snippet" component={Snippet} />
      <Route path="/search-console" component={SearchConsolePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/project-settings" component={ProjectSettingsPage} />
      <Route path="/integrations" component={IntegrationsPage} />
      <Route path="/usage" component={UsagePage} />
      <Route path="/knowledge" component={KnowledgeCenterPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse space-y-3 text-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 mx-auto" />
          <div className="h-4 w-24 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/landing" />;
  }

  const style = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ProjectProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex items-center justify-between gap-2 px-4 py-2 border-b sticky top-0 z-50 bg-background">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto">
              <AppRouter />
            </main>
          </div>
        </div>
        <FloatingAIAssistant />
      </SidebarProvider>
    </ProjectProvider>
  );
}

function PublicRoutes() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse space-y-3 text-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 mx-auto" />
          <div className="h-4 w-24 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  const authOnlyRoutes = ["/landing", "/login"];
  if (user && authOnlyRoutes.some(r => location === r || location.startsWith(r + "/"))) {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route path="/landing" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/use-cases" component={UseCasesPage} />
      <Route path="/pricing" component={PricingPublicPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/community/forum" component={CommunityForumPage} />
      <Route path="/community/ideas" component={CommunityIdeasPage} />
      <Route path="/connectors" component={ConnectorsPublicPage} />
      <Route path="/start-guide" component={StartGuidePage} />
      <Route path="/docs" component={DocsPage} />
      <Route path="/docs/:slug" component={DocArticlePage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/help-center" component={HelpCenterPage} />
      <Route path="/help-center/:slug" component={HelpArticlePage} />
      <Route path="/capabilities" component={CapabilitiesPage} />
      <Route path="/guides" component={GuidesPage} />
      <Route path="/guides/:slug" component={GuideDetailPage} />
      <Route path="/case-studies" component={CaseStudiesPage} />
      <Route path="/case-studies/:slug" component={CaseStudyDetailPage} />
      <Route path="/security" component={SecurityPublicPage} />
      <Route path="/trust-center" component={TrustCenterPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/page/:slug" component={CmsPage} />
      <Route><Redirect to="/landing" /></Route>
    </Switch>
  );
}

function RootRouter() {
  const [location] = useLocation();
  const publicRoutes = [
    "/landing", "/login", "/use-cases", "/pricing", "/community", "/connectors",
    "/start-guide", "/docs", "/blog", "/help-center", "/capabilities", "/guides",
    "/case-studies", "/security", "/trust-center", "/terms", "/privacy-policy",
    "/contact", "/reset-password", "/page",
  ];
  const isPublicRoute = publicRoutes.some(p => location === p || location.startsWith(p + "/"));

  if (isPublicRoute) {
    return <PublicRoutes />;
  }

  return <ProtectedLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <RootRouter />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
