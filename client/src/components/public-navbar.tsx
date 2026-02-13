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
import { useState, forwardRef } from "react";

const ListItem = forwardRef<
  HTMLAnchorElement,
  { title: string; description?: string; href: string; icon?: typeof Rocket }
>(({ title, description, href, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <a
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
          </a>
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
        <Link href="/landing">
          <a className="flex items-center gap-2" onClick={onClose}>
            <AnimatedLogo size="sm" showText={true} />
          </a>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-mobile-nav-close">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="overflow-auto h-[calc(100vh-56px)] p-6 space-y-6">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Use Cases</p>
          <Link href="/use-cases"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-use-cases">Use Cases</a></Link>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resources</p>
          <Link href="/start-guide"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-start-guide">Start Guide</a></Link>
          <Link href="/docs"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-docs">Docs</a></Link>
          <Link href="/blog"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-blog">Blog</a></Link>
          <Link href="/help-center"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-help-center">Help Center</a></Link>
          <Link href="/capabilities"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-capabilities">Capabilities</a></Link>
          <Link href="/guides"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-guides">Guides</a></Link>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Security</p>
          <Link href="/security"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-security">Security</a></Link>
          <Link href="/trust-center"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-trust-center">Trust Center</a></Link>
          <Link href="/terms"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-terms">Terms & Conditions</a></Link>
          <Link href="/privacy-policy"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-privacy-policy">Privacy Policy</a></Link>
        </div>
        <div>
          <Link href="/connectors"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-connectors">Connectors</a></Link>
          <Link href="/community"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-community">Community</a></Link>
          <Link href="/pricing"><a className="block py-2 text-sm" onClick={onClose} data-testid="mobile-link-pricing">Pricing</a></Link>
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
          <Link href="/landing">
            <a className="flex items-center shrink-0" data-testid="link-logo">
              <AnimatedLogo size="md" showText={true} />
            </a>
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
                            <Link href="/case-studies">
                              <a className="block text-sm font-medium" data-testid="link-case-studies">View All Case Studies</a>
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
              <li><Link href="/use-cases"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-use-cases">Use Cases</a></Link></li>
              <li><Link href="/pricing"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-pricing">Pricing</a></Link></li>
              <li><Link href="/connectors"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-connectors">Connectors</a></Link></li>
              <li><Link href="/capabilities"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-capabilities">Capabilities</a></Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4">Resources</p>
            <ul className="space-y-2">
              <li><Link href="/start-guide"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-start-guide">Start Guide</a></Link></li>
              <li><Link href="/docs"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-docs">Docs</a></Link></li>
              <li><Link href="/blog"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-blog">Blog</a></Link></li>
              <li><Link href="/guides"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-guides">Guides</a></Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4">Community</p>
            <ul className="space-y-2">
              <li><Link href="/community"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-community">Community</a></Link></li>
              <li><Link href="/help-center"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-help">Help Center</a></Link></li>
              <li><Link href="/case-studies"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-case-studies">Case Studies</a></Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-4">Legal</p>
            <ul className="space-y-2">
              <li><Link href="/security"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-security">Security</a></Link></li>
              <li><Link href="/trust-center"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-trust">Trust Center</a></Link></li>
              <li><Link href="/terms"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-terms">Terms & Conditions</a></Link></li>
              <li><Link href="/privacy-policy"><a className="text-sm text-muted-foreground hover:text-foreground" data-testid="footer-privacy">Privacy Policy</a></Link></li>
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

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
