import { ScreenshotMockup, MockMetricCard, MockChart, MockTable, MockFunnel, MockSidebar, MockNav, MockBadge } from "./screenshot-mockup";

const tipClass = "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4";

export const userGuideBook = {
  title: "MyUserJourney User Guide",
  subtitle: "Everything You Need to Master Your Analytics Platform",
  author: "MyUserJourney Team",
  coverGradient: "from-blue-600 to-indigo-700",
  chapters: [
    {
      id: "welcome",
      title: "Welcome to MyUserJourney",
      content: (
        <div>
          <p className="mb-3">MyUserJourney is a comprehensive web analytics and user journey tracking platform designed to give you deep, actionable insights into how visitors interact with your website. Whether you are a solo entrepreneur, a growing startup, or an established enterprise, MyUserJourney provides the tools you need to understand your audience and optimise your digital presence.</p>
          <p className="mb-3">Unlike traditional analytics platforms that overwhelm you with raw data, MyUserJourney focuses on telling the story behind your numbers. Every report, chart, and metric is designed to answer a specific question about your users — where they come from, what they do on your site, where they drop off, and what drives them to convert.</p>
          <p className="mb-3">The platform combines real-time analytics, AI-powered insights, SEO auditing, conversion funnel analysis, and privacy-first tracking into a single, unified dashboard. You no longer need to juggle multiple tools or stitch together data from different sources.</p>
          <ScreenshotMockup title="MyUserJourney — Platform Overview">
            <MockNav />
            <MockSidebar
              items={["Dashboard", "Real-time", "Acquisition", "Engagement", "Funnels", "SEO Audit", "AI Insights", "Reports", "Settings"]}
              active="Dashboard"
            />
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Getting the Most from This Guide</h4>
            <p>This guide walks you through every feature of the platform, from initial setup to advanced analytics. Each chapter builds on the previous one, but feel free to jump directly to the sections most relevant to your needs using the table of contents.</p>
          </div>
          <p className="mb-3">By the end of this guide, you will be confident in setting up tracking, interpreting your data, building custom reports, and leveraging AI to make smarter marketing decisions. Let us get started.</p>
        </div>
      ),
    },
    {
      id: "getting-started",
      title: "Getting Started — Creating Your Account & First Project",
      content: (
        <div>
          <p className="mb-3">Getting started with MyUserJourney takes just a few minutes. Visit the platform and create your account using your email address or sign in with your existing credentials. Once your account is active, you will be taken to the Projects page where you can set up your first website for tracking.</p>
          <h4 className="font-semibold mt-4 mb-2">Creating Your First Project</h4>
          <p className="mb-3">A project in MyUserJourney represents a single website or web application you want to track. To create a project, click the "New Project" button and provide the required information. The platform will generate a unique tracking ID for your project automatically.</p>
          <ScreenshotMockup title="New Project Setup">
            <MockTable
              headers={["Field", "Example Value", "Required"]}
              rows={[
                ["Project Name", "Company Blog", "Yes"],
                ["Website URL", "https://example.com", "Yes"],
                ["Industry", "SaaS / Technology", "Yes"],
                ["Timezone", "Europe/London (GMT)", "Yes"],
                ["Data Retention", "12 months", "Optional"],
              ]}
            />
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Organise with Multiple Projects</h4>
            <p>If you manage multiple websites, create a separate project for each one. This keeps your data clean and allows you to switch between projects effortlessly from the sidebar.</p>
          </div>
          <p className="mb-3">Once created, your project dashboard will be ready. The next step is installing the tracking snippet on your website, which we cover in the following chapter.</p>
          <p className="mb-3">You can always update your project settings later, including adding team members, configuring data retention policies, and setting up integrations with tools like Google Analytics 4.</p>
        </div>
      ),
    },
    {
      id: "tracking-snippet",
      title: "Installing the Tracking Snippet",
      content: (
        <div>
          <p className="mb-3">The tracking snippet is a small piece of JavaScript code that you place on your website. It collects visitor data — page views, clicks, scroll depth, form interactions, and more — and sends it securely to MyUserJourney for analysis.</p>
          <h4 className="font-semibold mt-4 mb-2">Where to Find Your Snippet</h4>
          <p className="mb-3">Navigate to your project settings and select the "Tracking Code" tab. You will see a pre-generated script tag unique to your project. Copy the entire snippet and paste it into the head section of every page on your website, just before the closing head tag.</p>
          <ScreenshotMockup title="Tracking Code — Installation Snippet">
            <div className="rounded-md bg-muted/40 border border-border/40 p-3 font-mono text-xs leading-relaxed">
              <div className="text-muted-foreground mb-1">{'<!-- Add to your <head> tag -->'}</div>
              <div>{'<script'}</div>
              <div className="pl-4">{'src="https://cdn.myuserjourney.co.uk/tracker.js"'}</div>
              <div className="pl-4">{'data-project="proj_abc123xyz"'}</div>
              <div className="pl-4">{'data-domain="yoursite.com"'}</div>
              <div className="pl-4">{'async defer'}</div>
              <div>{'></script>'}</div>
            </div>
          </ScreenshotMockup>
          <h4 className="font-semibold mt-4 mb-2">Installation Methods</h4>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li>Direct HTML — paste the snippet directly into your HTML template</li>
            <li>Tag Manager — add the snippet via Google Tag Manager or similar tools</li>
            <li>CMS Plugin — if you use WordPress, Shopify, or another CMS, follow our platform-specific guides</li>
            <li>Single Page Applications — for React, Vue, or Angular apps, initialise the tracker in your app entry point</li>
          </ul>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Verify Your Installation</h4>
            <p>After installing the snippet, visit your website and then check the Real-time dashboard in MyUserJourney. You should see your own visit appear within seconds. If nothing shows up, check your browser console for errors and ensure the snippet is loading correctly.</p>
          </div>
          <p className="mb-3">The snippet is lightweight — under 5KB gzipped — and loads asynchronously, so it will not slow down your website. It is also designed to respect user privacy settings and can be configured to operate without cookies for full GDPR compliance.</p>
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Understanding the Dashboard",
      content: (
        <div>
          <p className="mb-3">The main dashboard is your command centre. It provides a high-level overview of your website's performance with key metrics displayed prominently at the top, followed by trend charts and summary tables that help you quickly assess how your site is performing.</p>
          <ScreenshotMockup title="MyUserJourney — Dashboard Overview">
            <MockNav />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <MockMetricCard label="Users" value="12,482" trend="+14.2%" />
              <MockMetricCard label="Sessions" value="28,319" trend="+8.7%" />
              <MockMetricCard label="Bounce Rate" value="34.1%" trend="-2.3%" />
              <MockMetricCard label="Avg Duration" value="3m 42s" trend="+11.5%" />
            </div>
            <MockChart height="h-28" label="Visitors over time" />
          </ScreenshotMockup>
          <h4 className="font-semibold mt-4 mb-2">Key Metrics</h4>
          <p className="mb-3">At the top of the dashboard, you will find your most important numbers: Total Users, Sessions, Bounce Rate, and Average Session Duration. Each metric card shows the current value alongside a percentage change compared to the previous period, so you can instantly see whether things are improving or need attention.</p>
          <h4 className="font-semibold mt-4 mb-2">Date Range Selection</h4>
          <p className="mb-3">Use the date range picker in the top-right corner to adjust the reporting period. You can select preset ranges like "Last 7 Days", "Last 30 Days", or "This Month", or choose a custom date range. All charts and metrics update instantly to reflect your selection.</p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Compare Periods</h4>
            <p>Enable the comparison toggle to see how your current metrics stack up against the previous period. This is invaluable for spotting trends and measuring the impact of recent changes to your website or marketing campaigns.</p>
          </div>
          <p className="mb-3">Below the key metrics, you will find trend charts showing visitor and page view patterns over time, top pages by traffic, top referral sources, and geographic distribution of your audience. Each widget is interactive — click on any data point to drill deeper into the underlying data.</p>
        </div>
      ),
    },
    {
      id: "realtime",
      title: "Real-time Analytics",
      content: (
        <div>
          <p className="mb-3">The Real-time dashboard shows you exactly what is happening on your website right now. You can see active visitors, the pages they are viewing, their geographic locations, and the devices they are using — all updating in real time without requiring a page refresh.</p>
          <ScreenshotMockup title="Real-time Analytics">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <MockMetricCard label="Active Users" value="47" trend="live" />
              <MockMetricCard label="Events / min" value="124" trend="streaming" />
            </div>
            <MockTable
              headers={["Time", "Event", "Page", "Source"]}
              rows={[
                ["Just now", "page_view", "/pricing", "Google"],
                ["2s ago", "click", "/features", "Direct"],
                ["5s ago", "scroll_depth", "/blog/seo-tips", "Twitter"],
                ["8s ago", "page_view", "/case-studies", "LinkedIn"],
                ["12s ago", "form_start", "/contact", "Referral"],
              ]}
            />
          </ScreenshotMockup>
          <h4 className="font-semibold mt-4 mb-2">What You Can Monitor</h4>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li>Active Users — the number of people currently on your site</li>
            <li>Active Pages — which pages are being viewed right now</li>
            <li>Live Event Stream — a chronological feed of events as they occur</li>
            <li>Traffic Sources — where current visitors are coming from</li>
            <li>Geographic Map — a live map showing visitor locations</li>
          </ul>
          <p className="mb-3">Real-time data is particularly useful during product launches, marketing campaigns, or when you have just published new content. It lets you immediately see the impact of your actions and respond quickly if something is not working as expected.</p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Monitor Campaign Launches</h4>
            <p>When launching a new campaign or sending out a newsletter, keep the Real-time dashboard open. You will be able to see traffic spikes as they happen, identify which links are driving the most clicks, and catch any issues with landing pages before they affect too many visitors.</p>
          </div>
          <p className="mb-3">The real-time view automatically refreshes every few seconds. Data shown here transitions into your standard analytics reports after being processed, typically within a few minutes.</p>
        </div>
      ),
    },
    {
      id: "acquisition",
      title: "Acquisition Reports",
      content: (
        <div>
          <p className="mb-3">Acquisition reports answer one of the most fundamental questions in web analytics: where are your visitors coming from? Understanding your traffic sources helps you allocate your marketing budget effectively, double down on channels that work, and identify new opportunities for growth.</p>
          <ScreenshotMockup title="Acquisition — Traffic Sources">
            <MockChart height="h-24" label="Traffic by source" />
            <div className="mt-3">
              <MockTable
                headers={["Source", "Visitors", "Conversion Rate", "Bounce Rate"]}
                rows={[
                  ["Organic Search", "5,240", "4.2%", "32%"],
                  ["Direct", "3,180", "3.1%", "28%"],
                  ["Referral", "2,410", "5.8%", "41%"],
                  ["Social", "1,890", "2.4%", "52%"],
                  ["Paid Search", "1,120", "6.1%", "24%"],
                ]}
              />
            </div>
          </ScreenshotMockup>
          <h4 className="font-semibold mt-4 mb-2">UTM Parameter Tracking</h4>
          <p className="mb-3">For campaigns you control, use UTM parameters in your URLs to get granular tracking. MyUserJourney automatically parses utm_source, utm_medium, utm_campaign, utm_term, and utm_content parameters and displays them in your acquisition reports.</p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Tag All Your Campaigns</h4>
            <p>Always use UTM parameters on links in your email newsletters, social media posts, and advertising campaigns. Without UTM tags, traffic from these sources may be misclassified, making it harder to measure the true ROI of each channel.</p>
          </div>
          <p className="mb-3">The acquisition report also shows conversion rates by source, so you can see not just which channels drive the most traffic, but which ones drive the most valuable traffic. A channel with fewer visitors but higher conversion rates may deserve more investment.</p>
          <p className="mb-3">You can further break down each source by medium, campaign name, or landing page to understand exactly which campaigns and content pieces are performing best within each channel.</p>
        </div>
      ),
    },
    {
      id: "engagement",
      title: "Engagement Analytics",
      content: (
        <div>
          <p className="mb-3">Engagement analytics go beyond simple page views to reveal how visitors actually interact with your content. These metrics help you understand whether your content is resonating with your audience and where you might be losing their attention.</p>
          <ScreenshotMockup title="Engagement — Scroll Depth & Top Pages">
            <MockChart height="h-24" label="Average scroll depth by page" />
            <div className="mt-3">
              <MockTable
                headers={["Page", "Avg Time", "Scroll Depth", "Exit Rate"]}
                rows={[
                  ["/blog/analytics-guide", "4m 12s", "78%", "18%"],
                  ["/features", "2m 45s", "65%", "32%"],
                  ["/pricing", "1m 58s", "82%", "41%"],
                  ["/case-studies/acme", "3m 30s", "71%", "22%"],
                  ["/docs/getting-started", "5m 02s", "88%", "15%"],
                ]}
              />
            </div>
          </ScreenshotMockup>
          <h4 className="font-semibold mt-4 mb-2">Key Engagement Metrics</h4>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li>Average Time on Page — how long visitors spend reading each page</li>
            <li>Scroll Depth — how far down the page visitors scroll before leaving</li>
            <li>Click Patterns — which elements visitors click on most frequently</li>
            <li>Pages per Session — how many pages visitors view in a single visit</li>
            <li>Return Visit Rate — how often visitors come back to your site</li>
          </ul>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Use Scroll Depth to Optimise Content</h4>
            <p>If most visitors only scroll 30% of the way down a page, consider moving your most important content and calls to action higher up. You can also experiment with breaking long content into multiple shorter pages to improve completion rates.</p>
          </div>
          <p className="mb-3">Engagement data is also segmentable by traffic source, device type, and geography. This means you can understand, for example, whether mobile visitors from social media engage differently than desktop visitors from organic search — and tailor your content accordingly.</p>
        </div>
      ),
    },
    {
      id: "lead-journey",
      title: "Lead Journey & Conversion Funnels",
      content: (
        <div>
          <p className="mb-3">The Lead Journey feature is one of MyUserJourney's most powerful capabilities. It allows you to visualise the complete path your visitors take from their first interaction with your site through to conversion, helping you identify exactly where potential customers are dropping off.</p>
          <h4 className="font-semibold mt-4 mb-2">Conversion Funnel Visualisation</h4>
          <p className="mb-3">A typical user journey might look like this: a visitor arrives from a Google search, lands on a blog post, clicks through to a product page, visits the pricing page, starts a free trial signup, and eventually becomes a paying customer. The funnel visualisation shows you how many visitors progress from one stage to the next.</p>
          <ScreenshotMockup title="Conversion Funnel — Lead Journey">
            <MockFunnel
              stages={[
                { name: "Discovery", value: "12,400", color: "bg-blue-500" },
                { name: "Engagement", value: "8,200", color: "bg-indigo-500" },
                { name: "Intent", value: "3,100", color: "bg-violet-500" },
                { name: "Conversion", value: "890", color: "bg-green-500" },
              ]}
            />
          </ScreenshotMockup>
          <h4 className="font-semibold mt-4 mb-2">Building Your Funnels</h4>
          <p className="mb-3">The funnel builder lets you define specific sequences of pages or events that represent your ideal conversion path. Once configured, you can see drop-off rates between each step, the overall conversion rate from start to finish, and how long the average conversion journey takes.</p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Start with Your Most Important Funnel</h4>
            <p>Begin by mapping your primary conversion flow — whether that is a purchase, signup, or contact form submission. Once you have baseline data, make targeted improvements to the highest drop-off points. Even small improvements at the top of the funnel can have a dramatic impact on your bottom line.</p>
          </div>
          <p className="mb-3">You can create multiple funnels for different conversion goals and compare their performance side by side. This is especially useful for A/B testing different user flows or comparing the effectiveness of different landing pages.</p>
        </div>
      ),
    },
    {
      id: "custom-events",
      title: "Custom Events & Custom Reports",
      content: (
        <div>
          <p className="mb-3">While MyUserJourney automatically tracks standard events like page views, clicks, and scroll depth, custom events let you track the specific interactions that matter most to your business. Whether it is a video play, a form field interaction, a file download, or a product added to cart, custom events give you the flexibility to measure exactly what you need.</p>
          <ScreenshotMockup title="Custom Events — Event Overview">
            <MockTable
              headers={["Event Name", "Category", "Count (30d)", "Trend"]}
              rows={[
                ["video_play", "Media", "3,420", "+12%"],
                ["pdf_download", "Content", "1,890", "+5%"],
                ["add_to_cart", "E-commerce", "6,210", "+22%"],
                ["form_submit", "Lead Gen", "942", "+8%"],
                ["share_click", "Social", "1,340", "-3%"],
              ]}
            />
          </ScreenshotMockup>
          <h4 className="font-semibold mt-4 mb-2">Setting Up Custom Events</h4>
          <p className="mb-3">Custom events can be configured in two ways: code-based, where you add JavaScript calls to fire events when specific actions occur, or rule-based, where you define event rules in the MyUserJourney dashboard that automatically detect and categorise interactions based on CSS selectors, URLs, or other criteria.</p>
          <h4 className="font-semibold mt-4 mb-2">Building Custom Reports</h4>
          <p className="mb-3">The Reports Builder lets you create tailored reports that combine the metrics and dimensions most relevant to your needs. You can choose from various chart types, add filters, set up automatic scheduling, and share reports with team members or stakeholders.</p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Create a Weekly Executive Report</h4>
            <p>Set up a custom report with your top-level KPIs — visitors, conversions, revenue, and top-performing pages — and schedule it to be generated weekly. This saves you time and ensures stakeholders always have access to the latest data without needing to log into the platform.</p>
          </div>
          <p className="mb-3">Custom events and reports work together: once you define a custom event, it becomes available as a metric in the report builder, allowing you to create highly specific analyses tailored to your business objectives.</p>
        </div>
      ),
    },
    {
      id: "seo",
      title: "SEO Analysis & Site Audit",
      content: (
        <div>
          <p className="mb-3">MyUserJourney includes built-in SEO tools that help you understand how search engines see your website and identify opportunities to improve your organic rankings. The SEO module combines data from your site's tracking with Search Console integration to provide a complete picture of your search performance.</p>
          <ScreenshotMockup title="SEO Site Audit — Overview">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <MockMetricCard label="SEO Score" value="78/100" trend="+4 pts" />
              <MockMetricCard label="Issues Found" value="23" trend="-8 fixed" />
              <MockMetricCard label="Pages Crawled" value="342" />
            </div>
            <MockTable
              headers={["Issue", "Severity", "Pages Affected", "Status"]}
              rows={[
                ["Missing meta descriptions", "High", "12", "Open"],
                ["Broken internal links", "Critical", "4", "Open"],
                ["Missing alt text", "Medium", "28", "In Progress"],
                ["Slow page load (>3s)", "High", "7", "Open"],
                ["Duplicate title tags", "Medium", "3", "Fixed"],
              ]}
            />
          </ScreenshotMockup>
          <h4 className="font-semibold mt-4 mb-2">Site Audit</h4>
          <p className="mb-3">The site audit feature crawls your website and checks for common SEO issues including missing or duplicate title tags, broken links, missing alt text on images, page speed issues, mobile responsiveness problems, structured data validation, and HTTPS configuration.</p>
          <h4 className="font-semibold mt-4 mb-2">Search Performance</h4>
          <p className="mb-3">When connected to Google Search Console, you can view your search queries, click-through rates, average positions, and impressions directly within MyUserJourney. This data is correlated with your on-site analytics so you can see the full picture — from search query to on-site behaviour to conversion.</p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Fix High-Impact Issues First</h4>
            <p>The site audit prioritises issues by potential impact. Focus on fixing critical errors first — such as broken pages returning 404 errors or pages missing title tags — as these have the biggest effect on your search rankings.</p>
          </div>
          <p className="mb-3">The content gap analysis tool compares your content coverage against competitors, helping you identify topics and keywords you should be targeting but are currently missing.</p>
        </div>
      ),
    },
    {
      id: "ai-features",
      title: "AI-Powered Features",
      content: (
        <div>
          <p className="mb-3">MyUserJourney leverages artificial intelligence to transform raw analytics data into actionable recommendations. Rather than just showing you what happened, the AI features help you understand why it happened and what you should do next.</p>
          <ScreenshotMockup title="AI Insights — Recommendations">
            <div className="space-y-3">
              <div className="rounded-md border border-border/40 p-3 bg-background">
                <div className="flex items-center gap-2 mb-1">
                  <MockBadge text="Traffic Insight" variant="default" />
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="text-sm font-medium mb-1">Organic traffic increased 23% this week</div>
                <div className="text-xs text-muted-foreground">Your blog post "10 SEO Tips for 2025" is driving significant search traffic. Consider creating related content to capture more of this audience.</div>
              </div>
              <div className="rounded-md border border-border/40 p-3 bg-background">
                <div className="flex items-center gap-2 mb-1">
                  <MockBadge text="UX Alert" variant="warning" />
                  <span className="text-xs text-muted-foreground">5 hours ago</span>
                </div>
                <div className="text-sm font-medium mb-1">High exit rate detected on /checkout page</div>
                <div className="text-xs text-muted-foreground">42% of users abandon the checkout flow at step 2. The AI UX Auditor suggests simplifying the form fields to reduce friction.</div>
              </div>
              <div className="rounded-md border border-border/40 p-3 bg-background">
                <div className="flex items-center gap-2 mb-1">
                  <MockBadge text="Prediction" variant="success" />
                  <span className="text-xs text-muted-foreground">Daily forecast</span>
                </div>
                <div className="text-sm font-medium mb-1">Projected 18% conversion uplift next month</div>
                <div className="text-xs text-muted-foreground">Based on current trends and seasonal patterns, your conversion rate is forecast to improve. Maintain your current content strategy for best results.</div>
              </div>
            </div>
          </ScreenshotMockup>
          <h4 className="font-semibold mt-4 mb-2">Marketing Copilot</h4>
          <p className="mb-3">The AI Marketing Copilot is your personal analytics assistant. Ask it questions in plain English — like "What drove the traffic spike last Tuesday?" or "Which landing pages have the highest bounce rate from paid campaigns?" — and it will analyse your data and provide clear, actionable answers with supporting charts and recommendations.</p>
          <h4 className="font-semibold mt-4 mb-2">Predictive Analytics & UX Auditor</h4>
          <p className="mb-3">The predictive analytics engine uses machine learning to forecast future trends based on your historical data, including expected traffic volumes, likely conversion rates, and seasonal patterns. The AI UX Auditor analyses user behaviour patterns across your site to identify usability issues and friction points.</p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Review AI Insights Weekly</h4>
            <p>Make it a habit to check the AI Insights page at least once a week. The system continuously analyses your data and surfaces new recommendations as your traffic patterns evolve. Acting on these insights regularly creates a compounding effect on your site's performance.</p>
          </div>
        </div>
      ),
    },
    {
      id: "privacy",
      title: "Privacy & GDPR Compliance",
      content: (
        <div>
          <p className="mb-3">MyUserJourney is designed from the ground up with privacy in mind. In an era of increasing data protection regulations and growing consumer awareness about privacy, our platform helps you collect the insights you need while respecting your visitors' rights.</p>
          <h4 className="font-semibold mt-4 mb-2">Privacy-First Tracking</h4>
          <p className="mb-3">MyUserJourney offers a cookieless tracking mode that does not require cookie consent banners. In this mode, visitors are identified using privacy-safe techniques that do not store any personal data on the user's device. This means you can track all your visitors — not just those who accept cookies — giving you more complete and accurate data.</p>
          <ScreenshotMockup title="Privacy Settings">
            <div className="space-y-3">
              <div className="rounded-md border border-border/40 p-3 bg-background flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">Cookieless Tracking</div>
                  <div className="text-xs text-muted-foreground">Track visitors without storing cookies</div>
                </div>
                <MockBadge text="Enabled" variant="success" />
              </div>
              <div className="rounded-md border border-border/40 p-3 bg-background flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">IP Anonymisation</div>
                  <div className="text-xs text-muted-foreground">Remove last octet before storage</div>
                </div>
                <MockBadge text="Enabled" variant="success" />
              </div>
              <div className="rounded-md border border-border/40 p-3 bg-background flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">Data Retention</div>
                  <div className="text-xs text-muted-foreground">Auto-delete data after set period</div>
                </div>
                <MockBadge text="12 months" variant="default" />
              </div>
              <div className="rounded-md border border-border/40 p-3 bg-background flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">GDPR Data Export</div>
                  <div className="text-xs text-muted-foreground">Export visitor data for SARs</div>
                </div>
                <MockBadge text="Available" variant="default" />
              </div>
            </div>
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Enable Cookieless Tracking</h4>
            <p>If you are concerned about GDPR compliance or want to avoid displaying cookie consent banners, enable the cookieless tracking mode in your project settings. You will still get accurate analytics — including unique visitor counts and session tracking — without storing any cookies on your visitors' devices.</p>
          </div>
          <p className="mb-3">All data is processed and stored on servers within the EU, ensuring compliance with data residency requirements. MyUserJourney never sells or shares your analytics data with third parties.</p>
        </div>
      ),
    },
    {
      id: "ga4-integration",
      title: "Google Analytics 4 Integration",
      content: (
        <div>
          <p className="mb-3">If you are already using Google Analytics 4, MyUserJourney integrates seamlessly to pull in your existing data and combine it with the enhanced insights only MyUserJourney can provide. This means you do not have to choose between the two platforms — you get the best of both worlds.</p>
          <h4 className="font-semibold mt-4 mb-2">Setting Up the Integration</h4>
          <p className="mb-3">Connect your GA4 property from the Integrations page by authenticating with your Google account and selecting the property you want to link. Once connected, MyUserJourney will begin importing your GA4 data and displaying it alongside its own tracking data for a unified view.</p>
          <ScreenshotMockup title="Integrations — Data Sources">
            <div className="flex gap-2 mb-3">
              <div className="rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">MyUserJourney Tracker</div>
              <div className="rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground">Google Analytics 4</div>
              <div className="rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground">Search Console</div>
            </div>
            <MockTable
              headers={["Property", "Status", "Last Sync", "Records"]}
              rows={[
                ["MyUserJourney Tracker", "Active", "Real-time", "128,400"],
                ["GA4 — Main Property", "Connected", "2 min ago", "94,200"],
                ["Search Console", "Connected", "1 hour ago", "12,800"],
              ]}
            />
          </ScreenshotMockup>
          <p className="mb-3">The integration imports key GA4 dimensions and metrics including sessions, users, events, conversions, and traffic sources. MyUserJourney enriches this data with its own advanced journey mapping, AI insights, and funnel analysis that are not available in GA4 alone.</p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Use Both Trackers Together</h4>
            <p>Running both MyUserJourney's tracker and GA4 simultaneously gives you the most comprehensive view of your analytics. MyUserJourney's privacy-first approach means you capture data from visitors who decline GA4 cookies, filling the gaps in your GA4 reports.</p>
          </div>
          <p className="mb-3">You can toggle between data sources in any report to compare metrics from each platform. This is particularly useful during the transition period when you are getting familiar with MyUserJourney's additional capabilities.</p>
        </div>
      ),
    },
    {
      id: "multiple-projects",
      title: "Managing Multiple Projects",
      content: (
        <div>
          <p className="mb-3">If you manage multiple websites, apps, or brands, MyUserJourney makes it easy to track and compare them all from a single account. Each project operates independently with its own tracking code, data, and settings, but you can switch between them instantly from the project selector in the sidebar.</p>
          <h4 className="font-semibold mt-4 mb-2">Project Organisation</h4>
          <p className="mb-3">Organise your projects by brand, team, or client. Each project has its own set of team members with role-based access controls, so you can grant view-only access to clients while retaining full control over configuration and settings yourself.</p>
          <ScreenshotMockup title="Projects — Multi-site Management">
            <div className="rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-xs font-medium text-primary mb-3">
              Current Project: Company Blog
            </div>
            <MockTable
              headers={["Project", "Domain", "Status", "Monthly Visitors"]}
              rows={[
                ["Company Blog", "blog.example.com", "Active", "45,200"],
                ["E-commerce Store", "shop.example.com", "Active", "128,400"],
                ["Landing Pages", "promo.example.com", "Active", "12,800"],
                ["Developer Docs", "docs.example.com", "Active", "8,300"],
                ["Staging Site", "staging.example.com", "Paused", "—"],
              ]}
            />
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Use Cross-Project Reports</h4>
            <p>If your projects share a common audience — for example, a blog and an e-commerce store — use cross-project reports to understand how visitors move between your properties and which content drives the most downstream conversions.</p>
          </div>
          <p className="mb-3">Each project can be configured independently, with its own privacy settings, data retention policies, and integrations. This makes MyUserJourney ideal for agencies managing multiple client accounts or companies with a portfolio of digital properties.</p>
          <p className="mb-3">You can archive inactive projects to keep your workspace clean without losing any historical data. Archived projects can be restored at any time with all their data intact.</p>
        </div>
      ),
    },
    {
      id: "billing",
      title: "Billing & Usage",
      content: (
        <div>
          <p className="mb-3">MyUserJourney offers flexible plans designed to grow with your business. Whether you are just getting started with a single website or managing analytics across dozens of properties, there is a plan that fits your needs and budget.</p>
          <h4 className="font-semibold mt-4 mb-2">Understanding Your Usage</h4>
          <p className="mb-3">Your usage is measured primarily by the number of tracked events per month across all your projects. The Billing & Usage page shows you exactly where you stand in your current billing cycle, with clear visualisations of your consumption trends and projected usage.</p>
          <ScreenshotMockup title="Billing & Usage — Current Period">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <MockMetricCard label="Current Plan" value="Growth" />
              <MockMetricCard label="Events Used" value="842K" trend="of 1M" />
              <MockMetricCard label="Projects" value="4" trend="of 10" />
              <MockMetricCard label="Next Invoice" value="$49/mo" />
            </div>
            <div className="rounded-md border border-border/40 p-3 bg-background">
              <div className="text-xs text-muted-foreground mb-2">Usage this billing period</div>
              <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                <div className="bg-primary/70 h-full rounded-full" style={{ width: "84%" }} />
              </div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-xs text-muted-foreground">842,000 events</span>
                <span className="text-xs text-muted-foreground">1,000,000 limit</span>
              </div>
            </div>
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Tip: Monitor Your Usage</h4>
            <p>Set up usage alerts to be notified when you reach 80% and 90% of your monthly event limit. This gives you time to either optimise your tracking to reduce unnecessary events or upgrade your plan before hitting the cap. MyUserJourney will never stop collecting data — you will simply be notified if you exceed your plan limits.</p>
          </div>
          <p className="mb-3">All plans include unlimited team members, full API access, and email support. Higher-tier plans unlock additional features like priority support, custom data retention, advanced AI insights, and dedicated account management.</p>
          <p className="mb-3">You can upgrade, downgrade, or cancel your plan at any time from the Billing page. Changes take effect at the start of your next billing cycle, and you will receive a prorated credit if you downgrade mid-cycle.</p>
        </div>
      ),
    },
  ],
};
