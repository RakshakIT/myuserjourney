import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { AnimatedLogo } from "@/components/animated-logo";
import {
  BarChart3,
  Rocket,
  BookOpen,
  PenLine,
  HelpCircle,
  Shield,
  ShieldCheck,
  FileText,
  Lock,
  GraduationCap,
  BookMarked,
  PlayCircle,
  Layers,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, forwardRef } from "react";
import { useQuery } from "@tanstack/react-query";

const ListItem = forwardRef<
  HTMLAnchorElement,
  { title: string; description?: string; href: string; icon?: typeof Rocket }
>(({ title, description, href, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover-elevate"
          {...props}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-1.5 rounded-md bg-muted shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium leading-none">{title}</div>
              {description && (
                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background md:hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <Link href="/landing" className="flex items-center gap-2" onClick={onClose}>
          <AnimatedLogo size="sm" showText={true} />
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-mobile-nav-close">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="overflow-auto h-[calc(100vh-56px)] p-6 space-y-6">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Use Cases</p>
          <Link href="/use-cases" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-use-cases">Use Cases</Link>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resources</p>
          <Link href="/start-guide" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-start-guide">Start Guide</Link>
          <Link href="/docs" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-docs">Docs</Link>
          <Link href="/blog" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-blog">Blog</Link>
          <Link href="/help-center" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-help-center">Help Center</Link>
          <Link href="/capabilities" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-capabilities">Capabilities</Link>
          <Link href="/guides" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-guides">Guides</Link>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Security</p>
          <Link href="/security" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-security">Security</Link>
          <Link href="/trust-center" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-trust-center">Trust Center</Link>
          <Link href="/terms" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-terms">Terms & Conditions</Link>
          <Link href="/privacy-policy" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-privacy-policy">Privacy Policy</Link>
        </div>
        <div>
          <Link href="/connectors" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-connectors">Connectors</Link>
          <Link href="/community" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-community">Community</Link>
          <Link href="/pricing" className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-pricing">Pricing</Link>
        </div>
        <div className="pt-4 space-y-3 border-t">
          <Link href="/login"><Button variant="ghost" className="w-full" data-testid="mobile-button-login" onClick={onClose}>Log In</Button></Link>
          <Link href="/login"><Button className="w-full" data-testid="mobile-button-signup" onClick={onClose}>Sign Up</Button></Link>
        </div>
      </nav>
    </div>
  );
}

export function PublicNavbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-2">
          <Link href="/landing" className="flex items-center shrink-0" data-testid="link-logo">
            <AnimatedLogo size="md" showText={true} />
          </Link>

          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm" data-testid="nav-use-cases">Use Cases</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[320px] gap-1 p-3">
                      <ListItem href="/use-cases" title="All Use Cases" description="Explore how My User Journey helps teams" icon={Layers} />
                      <ListItem href="/use-cases#marketing" title="Marketing Teams" description="Campaign tracking and ROI analysis" icon={BarChart3} />
                      <ListItem href="/use-cases#product" title="Product Teams" description="User behaviour and feature analytics" icon={Rocket} />
                      <ListItem href="/use-cases#agencies" title="Agencies" description="Multi-client analytics management" icon={BookMarked} />
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm" data-testid="nav-resources">Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[540px] grid-cols-3 gap-1 p-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground px-3 py-2">Resources</p>
                        <ul className="space-y-0">
                          <ListItem href="/start-guide" title="Start Guide" description="Get started in minutes" icon={Rocket} />
                          <ListItem href="/docs" title="Docs" description="Resources and product guides" icon={BookOpen} />
                          <ListItem href="/blog" title="Blog" description="Latest news and insights" icon={PenLine} />
                          <ListItem href="/help-center" title="Help Center" description="Contact support and get help" icon={HelpCircle} />
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground px-3 py-2">Success Stories</p>
                        <ul className="space-y-0">
                          <li className="p-3 rounded-md hover-elevate">
                            <Link href="/case-studies" className="block" data-testid="link-case-studies">
                              <span className="block text-sm font-medium">View All Case Studies</span>
                              <p className="text-xs text-muted-foreground mt-1">See how teams use My User Journey</p>
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground px-3 py-2">Learn</p>
                        <ul className="space-y-0">
                          <ListItem href="/capabilities" title="Capabilities" />
                          <ListItem href="/guides" title="Guides" />
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm" data-testid="nav-security">Security</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] grid-cols-2 gap-1 p-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground px-3 py-2">Overview</p>
                        <ul className="space-y-0">
                          <ListItem href="/security" title="Security" description="Secure, compliant data handling" icon={Shield} />
                          <ListItem href="/trust-center" title="Trust Center" description="Resources for security and compliance" icon={ShieldCheck} />
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground px-3 py-2">Resources</p>
                        <ul className="space-y-0">
                          <ListItem href="/terms" title="Terms & Conditions" icon={FileText} />
                          <ListItem href="/privacy-policy" title="Privacy Policy" icon={Lock} />
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/connectors">
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover-elevate" data-testid="nav-connectors">
                      Connectors
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/community">
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover-elevate" data-testid="nav-community">
                      Community
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/pricing">
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover-elevate" data-testid="nav-pricing">
                      Pricing
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden md:block">
              <Link href="/login">
                <Button variant="ghost" data-testid="button-login">Log In</Button>
              </Link>
            </div>
            <div className="hidden md:block">
              <Link href="/login">
                <Button data-testid="button-signup">Sign Up</Button>
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              data-testid="button-mobile-nav-open"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-card/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-sm font-semibold mb-4">Product</p>
            <ul className="space-y-2">
              <li><Link href="/use-cases" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-use-cases">Use Cases</Link></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-pricing">Pricing</Link></li>
              <li><Link href="/connectors" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-connectors">Connectors</Link></li>
              <li><Link href="/capabilities" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-capabilities">Capabilities</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4">Resources</p>
            <ul className="space-y-2">
              <li><Link href="/start-guide" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-start-guide">Start Guide</Link></li>
              <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-docs">Docs</Link></li>
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-blog">Blog</Link></li>
              <li><Link href="/guides" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-guides">Guides</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4">Community</p>
            <ul className="space-y-2">
              <li><Link href="/community" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-community">Community</Link></li>
              <li><Link href="/help-center" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-help">Help Center</Link></li>
              <li><Link href="/case-studies" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-case-studies">Case Studies</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4">Legal</p>
            <ul className="space-y-2">
              <li><Link href="/security" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-security">Security</Link></li>
              <li><Link href="/trust-center" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-trust">Trust Center</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-terms">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-10 pt-8 border-t">
          <div className="flex items-center">
            <AnimatedLogo size="sm" showText={true} />
          </div>
          <p className="text-xs text-muted-foreground">
            Privacy-first analytics platform. GDPR & PECR compliant.
          </p>
        </div>
      </div>
    </footer>
  );
}

function TrackingScripts() {
  const { data: settings } = useQuery<any>({
    queryKey: ["/api/public/tracking-codes"],
    queryFn: async () => {
      const res = await fetch("/api/public/tracking-codes");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const headScripts: string[] = [];

  if (settings?.googleTagManagerId) {
    headScripts.push(`<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${settings.googleTagManagerId}');</script>`);
  }

  if (settings?.googleAnalyticsId) {
    headScripts.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.googleAnalyticsId}');</script>`);
  }

  if (settings?.googleAdsId) {
    headScripts.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${settings.googleAdsId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('config','${settings.googleAdsId}');</script>`);
  }

  if (settings?.googleSearchConsoleCode) {
    const code = settings.googleSearchConsoleCode;
    if (code.startsWith("<meta")) {
      headScripts.push(code);
    } else {
      headScripts.push(`<meta name="google-site-verification" content="${code}" />`);
    }
  }

  if (settings?.facebookPixelId) {
    headScripts.push(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${settings.facebookPixelId}');fbq('track','PageView');</script>`);
  }

  if (settings?.microsoftAdsId) {
    headScripts.push(`<script>(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${settings.microsoftAdsId}",enableAutoSpaTracking:true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");</script>`);
  }

  if (settings?.tiktokPixelId) {
    headScripts.push(`<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var i=document.createElement("script");i.type="text/javascript",i.async=!0,i.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(i,a)};ttq.load('${settings.tiktokPixelId}');ttq.page();}(window,document,'ttq');</script>`);
  }

  if (settings?.linkedinInsightTagId) {
    headScripts.push(`<script type="text/javascript">_linkedin_partner_id="${settings.linkedinInsightTagId}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);</script><script type="text/javascript">(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);</script>`);
  }

  if (settings?.pinterestTagId) {
    headScripts.push(`<script>!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${settings.pinterestTagId}');pintrk('page');</script>`);
  }

  if (settings?.snapchatPixelId) {
    headScripts.push(`<script type="text/javascript">(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${settings.snapchatPixelId}',{});snaptr('track','PAGE_VIEW');</script>`);
  }

  if (settings?.twitterPixelId) {
    headScripts.push(`<script>!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');twq('config','${settings.twitterPixelId}');</script>`);
  }

  if (settings?.hotjarSiteId) {
    headScripts.push(`<script>(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${settings.hotjarSiteId},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');</script>`);
  }

  if (settings?.clarityProjectId) {
    headScripts.push(`<script type="text/javascript">(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${settings.clarityProjectId}");</script>`);
  }

  if (settings?.bingVerificationCode) {
    const code = settings.bingVerificationCode;
    if (code.startsWith("<meta")) {
      headScripts.push(code);
    } else {
      headScripts.push(`<meta name="msvalidate.01" content="${code}" />`);
    }
  }

  if (settings?.yandexVerificationCode) {
    const code = settings.yandexVerificationCode;
    if (code.startsWith("<meta")) {
      headScripts.push(code);
    } else {
      headScripts.push(`<meta name="yandex-verification" content="${code}" />`);
    }
  }

  if (settings?.customTrackingHead) {
    headScripts.push(settings.customTrackingHead);
  }

  const bodyScripts: string[] = [];

  if (settings?.googleTagManagerId) {
    bodyScripts.push(`<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${settings.googleTagManagerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`);
  }

  if (settings?.facebookPixelId) {
    bodyScripts.push(`<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${settings.facebookPixelId}&ev=PageView&noscript=1"/></noscript>`);
  }

  if (settings?.linkedinInsightTagId) {
    bodyScripts.push(`<noscript><img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${settings.linkedinInsightTagId}&fmt=gif"/></noscript>`);
  }

  if (settings?.pinterestTagId) {
    bodyScripts.push(`<noscript><img height="1" width="1" style="display:none;" alt="" src="https://ct.pinterest.com/v3/?event=init&tid=${settings.pinterestTagId}&noscript=1"/></noscript>`);
  }

  if (settings?.customTrackingBody) {
    bodyScripts.push(settings.customTrackingBody);
  }

  useEffect(() => {
    const cleanup = () => {
      document.querySelectorAll("[data-muj-tracking]").forEach(el => el.remove());
    };

    cleanup();

    if (headScripts.length === 0 && bodyScripts.length === 0) return cleanup;

    const headContainer = document.createElement("div");
    headContainer.innerHTML = headScripts.join("");

    headContainer.querySelectorAll("meta").forEach(m => {
      const clone = m.cloneNode(true) as HTMLMetaElement;
      clone.setAttribute("data-muj-tracking", "head");
      document.head.appendChild(clone);
    });

    headContainer.querySelectorAll("script").forEach(oldScript => {
      const newScript = document.createElement("script");
      newScript.setAttribute("data-muj-tracking", "head");
      if (oldScript.src) {
        newScript.src = oldScript.src;
        newScript.async = true;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      document.head.appendChild(newScript);
    });

    if (bodyScripts.length > 0) {
      const bodyContainer = document.createElement("div");
      bodyContainer.setAttribute("data-muj-tracking", "body");
      bodyContainer.innerHTML = bodyScripts.join("");
      document.body.appendChild(bodyContainer);
    }

    return cleanup;
  }, [settings]);

  return null;
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TrackingScripts />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
