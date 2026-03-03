import { ScreenshotMockup, MockMetricCard, MockChart, MockTable, MockFunnel, MockSidebar, MockNav, MockBadge } from "./screenshot-mockup";

const tipClass = "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 my-4";

export const analyticsGuideBook = {
  title: "The Complete Guide to User Journey Analytics",
  subtitle: "From Tracking Setup to Predictive Insights",
  author: "MyUserJourney Team",
  coverGradient: "from-emerald-600 to-teal-600",
  chapters: [
    {
      id: "introduction",
      title: "Introduction to User Journey Analytics",
      content: (
        <div>
          <p className="mb-4">
            User journey analytics is the practice of tracking, visualising, and analysing every interaction a user has with your website or application. Unlike traditional web analytics that focus on isolated page views and sessions, journey analytics connects the dots between touchpoints to reveal the complete story of how users discover, engage with, and ultimately convert on your platform.
          </p>
          <p className="mb-4">
            The evolution from simple hit counters to sophisticated journey analytics reflects a fundamental shift in how businesses understand their digital presence. Modern analytics platforms capture not just what happened, but why it happened and what is likely to happen next. This predictive capability transforms analytics from a retrospective reporting tool into a forward-looking strategic asset.
          </p>
          <p className="mb-4">
            At its core, user journey analytics answers three critical questions: Where do users come from? What do they do on your site? And why do they leave — or stay? By understanding these patterns across thousands of user sessions, you can identify the paths that lead to conversion, the friction points that cause abandonment, and the content that drives the most engagement.
          </p>

          <ScreenshotMockup title="MyUserJourney — Dashboard Overview">
            <MockNav />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MockMetricCard label="Total Visitors" value="24,381" trend="+12.4% vs last month" />
              <MockMetricCard label="Active Sessions" value="1,204" trend="+8.1% vs last month" />
              <MockMetricCard label="Conversion Rate" value="3.7%" trend="+0.5% vs last month" />
              <MockMetricCard label="Avg. Session Duration" value="4m 32s" trend="+15s vs last month" />
            </div>
          </ScreenshotMockup>

          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Concept</h4>
            <p>User journey analytics differs from traditional analytics in that it focuses on the sequence and context of interactions rather than isolated metrics. A single page view tells you very little — but understanding that a user arrived from a Google search, read three blog posts, visited the pricing page twice, and then signed up tells you everything about what drives conversions.</p>
          </div>
          <p className="mb-4">
            This guide will take you from the fundamentals of web tracking through to advanced predictive analytics, giving you the knowledge to implement comprehensive user journey tracking and extract actionable insights from your data. Whether you are a marketer looking to optimise campaigns, a product manager seeking to improve user experience, or a developer implementing tracking infrastructure, this guide provides the depth and breadth you need.
          </p>
        </div>
      ),
    },
    {
      id: "how-tracking-works",
      title: "How Web Tracking Works — Events, Sessions, and Users",
      content: (
        <div>
          <p className="mb-4">
            Web tracking operates on a hierarchical data model built around three core concepts: events, sessions, and users. Understanding how these relate to each other is fundamental to interpreting your analytics data correctly and designing effective tracking strategies.
          </p>
          <h4 className="text-lg font-semibold mb-3">Events: The Building Blocks</h4>
          <p className="mb-4">
            An event is the smallest unit of tracking data. Every measurable interaction — a page view, a button click, a form submission, a scroll action — is captured as an event. Each event carries metadata including a timestamp, the page URL, the element interacted with, and any custom properties you define. Events are the raw material from which all analytics insights are derived.
          </p>
          <h4 className="text-lg font-semibold mb-3">Sessions: Grouping Activity</h4>
          <p className="mb-4">
            A session represents a continuous period of user activity on your site. Sessions are typically defined by a timeout — if a user is inactive for 30 minutes, their next interaction begins a new session. Sessions bundle related events together, allowing you to analyse user behaviour in context. Key session metrics include duration, page depth (number of pages viewed), bounce rate, and conversion rate.
          </p>

          <ScreenshotMockup title="MyUserJourney — Event Stream">
            <MockTable
              headers={["Event Type", "Page URL", "Timestamp", "Properties"]}
              rows={[
                ["page_view", "/products/widget-pro", "2024-03-15 10:23:01", "title: Widget Pro"],
                ["click", "/products/widget-pro", "2024-03-15 10:23:18", "element: #add-to-cart"],
                ["scroll", "/blog/analytics-tips", "2024-03-15 10:24:05", "depth: 75%"],
                ["form_submit", "/contact", "2024-03-15 10:25:32", "form: newsletter-signup"],
                ["page_view", "/checkout", "2024-03-15 10:25:45", "title: Checkout"],
              ]}
            />
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">Users: The Complete Picture</h4>
          <p className="mb-4">
            A user represents an individual visitor across multiple sessions and devices. User identification can be anonymous (using cookies or fingerprinting) or authenticated (using login credentials). Connecting sessions to users enables you to track the full customer journey from first visit through to conversion and beyond, even if that journey spans days, weeks, or months.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Important Note</h4>
            <p>The accuracy of your analytics depends heavily on how well you can identify and connect user sessions. With increasing privacy regulations and the decline of third-party cookies, first-party data strategies and privacy-respecting identification methods have become essential for maintaining data quality.</p>
          </div>
        </div>
      ),
    },
    {
      id: "event-tracking-setup",
      title: "Setting Up Event Tracking",
      content: (
        <div>
          <p className="mb-4">
            Effective event tracking begins with a well-designed tracking plan. Before writing a single line of code, you should document every event you want to capture, the properties each event should carry, and the business questions each event helps answer. A tracking plan prevents data gaps and ensures consistency across your analytics implementation.
          </p>
          <h4 className="text-lg font-semibold mb-3">The Tracking Snippet</h4>
          <p className="mb-4">
            MyUserJourney uses a lightweight JavaScript snippet that you add to your website. This snippet automatically captures core events — page views, clicks, form submissions, and scroll depth — without any additional configuration. The snippet loads asynchronously to avoid impacting your page performance and compresses event data before transmission to minimise bandwidth usage.
          </p>

          <ScreenshotMockup title="MyUserJourney — Tracking Code Setup">
            <div className="rounded-md bg-muted/40 border border-border/30 p-3 font-mono text-xs leading-relaxed">
              <div className="text-muted-foreground mb-2">{"<!-- Add to your <head> tag -->"}</div>
              <div>{"<script"}</div>
              <div className="pl-4">{"src=\"https://cdn.myuserjourney.co.uk/tracker.js\""}</div>
              <div className="pl-4">{"data-site-id=\"YOUR_SITE_ID\""}</div>
              <div className="pl-4">{"data-auto-track=\"true\""}</div>
              <div className="pl-4">{"async defer"}</div>
              <div>{"></script>"}</div>
            </div>
            <div className="mt-3">
              <MockTable
                headers={["Event", "Auto-Tracked", "Category", "Data Captured"]}
                rows={[
                  ["page_view", "Yes", "Navigation", "URL, title, referrer"],
                  ["click", "Yes", "Interaction", "Element, selector, text"],
                  ["scroll", "Yes", "Engagement", "Depth %, time at depth"],
                  ["form_submit", "Yes", "Conversion", "Form ID, field count"],
                  ["custom_event", "Manual", "Custom", "User-defined properties"],
                ]}
              />
            </div>
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">Custom Event Implementation</h4>
          <p className="mb-4">
            For business-specific interactions, you can fire custom events using the JavaScript API. Custom events allow you to track actions that are unique to your application — adding items to a cart, completing a tutorial step, or toggling a feature. Each custom event can carry up to 50 custom properties, giving you the flexibility to capture rich contextual data.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Best Practice</h4>
            <p>Follow a consistent naming convention for your custom events. Use a verb-noun format such as "product_viewed", "cart_updated", or "checkout_completed". This makes your event stream readable and your reports easier to build. Avoid generic names like "click" or "action" — be specific about what the event represents.</p>
          </div>
          <p className="mb-4">
            Test every event in a staging environment before deploying to production. Use consistent property names across related events (e.g., always use "product_id" rather than mixing formats). Only capture properties that serve a defined analytical purpose to stay compliant with privacy regulations, and ensure your tracking code fails silently so that errors never break your application.
          </p>
        </div>
      ),
    },
    {
      id: "traffic-source-classification",
      title: "Traffic Source Classification & UTM Parameters",
      content: (
        <div>
          <p className="mb-4">
            Understanding where your users come from is the foundation of effective marketing analytics. Traffic source classification categorises every session by its origin — whether that is a search engine, a social media platform, an email campaign, a paid advertisement, or a direct visit. Accurate attribution enables you to measure the effectiveness of each marketing channel and allocate budget accordingly.
          </p>
          <h4 className="text-lg font-semibold mb-3">Automatic Source Detection</h4>
          <p className="mb-4">
            MyUserJourney automatically classifies traffic sources by analysing the HTTP referrer header and matching it against a comprehensive database of known domains. Search engines, social networks, email providers, and advertising platforms are all identified automatically. When a referrer cannot be matched to a known source, the session is classified based on any UTM parameters present in the landing page URL.
          </p>

          <ScreenshotMockup title="MyUserJourney — Traffic Source Report">
            <MockTable
              headers={["Source", "Medium", "Campaign", "Sessions", "Conv. Rate"]}
              rows={[
                ["google", "organic", "(none)", "8,412", "3.2%"],
                ["facebook", "cpc", "spring_sale_2024", "3,205", "2.8%"],
                ["newsletter", "email", "weekly_digest_mar", "1,847", "5.1%"],
                ["linkedin", "social", "thought_leadership", "982", "4.3%"],
                ["partner-blog.com", "referral", "(none)", "756", "3.9%"],
                ["(direct)", "(none)", "(none)", "4,321", "2.1%"],
              ]}
            />
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">UTM Parameters Explained</h4>
          <p className="mb-4">
            UTM (Urchin Tracking Module) parameters are tags appended to URLs that provide granular campaign tracking. The five standard parameters — utm_source, utm_medium, utm_campaign, utm_term, and utm_content — give you complete visibility into which specific campaigns, channels, and creative variations are driving traffic. Consistent UTM tagging is essential for accurate multi-channel attribution.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Pro Tip</h4>
            <p>Create a UTM naming convention document and share it with your entire marketing team. Inconsistent UTM usage — such as using "Facebook" in one campaign and "facebook" in another — fragments your data and makes channel analysis unreliable. Use lowercase, underscores instead of spaces, and standardised campaign naming formats.</p>
          </div>
          <p className="mb-4">
            Beyond individual source tracking, MyUserJourney groups traffic into high-level channels: Organic Search, Paid Search, Social, Email, Referral, Direct, and Display. These channel groups provide a strategic view of your marketing mix and make it easy to compare performance across fundamentally different acquisition strategies. You can customise channel definitions to match your specific business taxonomy.
          </p>
        </div>
      ),
    },
    {
      id: "user-behaviour",
      title: "Understanding User Behaviour — Scroll Depth, Clicks, and Engagement",
      content: (
        <div>
          <p className="mb-4">
            While traffic acquisition tells you who arrives at your site, behavioural analytics tells you what they do once they get there. Engagement metrics reveal whether your content resonates with visitors, whether your navigation is intuitive, and whether your calls-to-action are compelling enough to drive the actions you want.
          </p>
          <h4 className="text-lg font-semibold mb-3">Scroll Depth Analysis</h4>
          <p className="mb-4">
            Scroll depth measures how far down a page users scroll before leaving. This metric is particularly valuable for content-heavy pages like blog posts, landing pages, and product descriptions. If users consistently scroll to only 30% of your content, the bottom 70% is effectively invisible. MyUserJourney tracks scroll depth in quartiles (25%, 50%, 75%, 100%) and provides heatmap-style visualisations showing where attention drops off.
          </p>

          <ScreenshotMockup title="MyUserJourney — Engagement Analytics">
            <MockChart height="h-28" label="Scroll Depth Distribution" />
            <div className="mt-3">
              <MockTable
                headers={["Metric", "Value", "Benchmark", "Status"]}
                rows={[
                  ["Avg. Scroll Depth", "62%", "55%", "Above Average"],
                  ["Avg. Engagement Time", "3m 47s", "2m 30s", "Excellent"],
                  ["Interaction Rate", "71%", "60%", "Above Average"],
                  ["Content Consumption", "58%", "45%", "Strong"],
                  ["Bounce Rate", "34%", "40%", "Below Avg (Good)"],
                ]}
              />
            </div>
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">Engagement Scoring</h4>
          <p className="mb-4">
            MyUserJourney calculates an engagement score for each session based on a weighted combination of time on site, pages viewed, scroll depth, and interaction events. This composite metric provides a single number that indicates the quality of a visit, making it easy to compare engagement across traffic sources, landing pages, and user segments. High engagement scores correlate strongly with conversion likelihood.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>Engagement metrics are most powerful when analysed in context. A high bounce rate on a contact page might be perfectly acceptable — the user found the phone number and called. But a high bounce rate on a product listing page is a problem. Always interpret engagement data relative to the intent and purpose of each page.</p>
          </div>
          <p className="mb-4">
            Average engagement time is more accurate than traditional "time on page" because it only counts active time when the tab is in focus. Combined with interaction rate and content consumption metrics, you get a comprehensive picture of how users truly engage with your content rather than just passively having it open in a background tab.
          </p>
        </div>
      ),
    },
    {
      id: "funnel-analysis",
      title: "Funnel Analysis — Finding and Fixing Drop-Off Points",
      content: (
        <div>
          <p className="mb-4">
            Funnel analysis is one of the most actionable forms of analytics because it directly connects user behaviour to business outcomes. A funnel represents a defined sequence of steps that users should complete to achieve a goal — whether that is making a purchase, signing up for a trial, or submitting a lead form. By measuring the conversion rate between each step, you can identify exactly where users abandon the process.
          </p>
          <h4 className="text-lg font-semibold mb-3">Designing Effective Funnels</h4>
          <p className="mb-4">
            A well-designed funnel reflects the actual user journey, not just your ideal path. Start by identifying the key milestones that users pass through on their way to conversion. For an e-commerce site, this might be: Product View, Add to Cart, Begin Checkout, Enter Payment, Complete Purchase. Each step should represent a distinct and measurable action.
          </p>

          <ScreenshotMockup title="MyUserJourney — Funnel Analysis">
            <MockFunnel
              stages={[
                { name: "Homepage", value: "10,000", color: "bg-emerald-500" },
                { name: "Product Page", value: "6,500", color: "bg-emerald-500/80" },
                { name: "Add to Cart", value: "2,800", color: "bg-teal-500" },
                { name: "Checkout", value: "1,900", color: "bg-teal-500/80" },
                { name: "Purchase", value: "950", color: "bg-cyan-500" },
              ]}
            />
            <div className="mt-3">
              <MockTable
                headers={["Step Transition", "Drop-off Rate", "Lost Users", "Opportunity"]}
                rows={[
                  ["Homepage > Product", "35%", "3,500", "Improve product discovery"],
                  ["Product > Cart", "56.9%", "3,700", "Strengthen product pages"],
                  ["Cart > Checkout", "32.1%", "900", "Reduce cart abandonment"],
                  ["Checkout > Purchase", "50%", "950", "Simplify checkout flow"],
                ]}
              />
            </div>
          </ScreenshotMockup>

          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Optimisation Framework</h4>
            <p>For each funnel drop-off, ask three questions: (1) Is the step necessary? Remove unnecessary friction. (2) Is the step clear? Improve UI and copy if users seem confused. (3) Is the step trustworthy? Address security concerns, add social proof, or display guarantees. The most impactful improvements often come from simplifying or removing steps rather than optimising existing ones.</p>
          </div>
          <h4 className="text-lg font-semibold mb-3">Advanced Funnel Techniques</h4>
          <p className="mb-4">
            MyUserJourney supports segmented funnels to compare performance across user segments, time-based funnels to measure hesitation between steps, branching funnels to track alternative paths, and retroactive funnels to define analysis on historical data without needing to set up tracking in advance. The most effective teams review their funnels weekly, correlating changes in conversion rates with product updates and marketing campaigns.
          </p>
        </div>
      ),
    },
    {
      id: "segmentation-cohort",
      title: "Visitor Segmentation & Cohort Analysis",
      content: (
        <div>
          <p className="mb-4">
            Segmentation is the practice of dividing your user base into meaningful groups based on shared characteristics or behaviours. While aggregate metrics give you an overview, segmented analysis reveals the stories hidden within your data. A 3% overall conversion rate might mask the fact that returning visitors convert at 8% while new visitors convert at only 1% — a critical insight that should shape your marketing strategy.
          </p>
          <h4 className="text-lg font-semibold mb-3">Types of Segments</h4>
          <p className="mb-4">
            Effective segmentation operates across multiple dimensions. Demographic segments group users by location, language, or device type. Behavioural segments group users by actions — pages visited, features used, or engagement level. Acquisition segments group users by how they found your site. Lifecycle segments group users by their stage in the customer journey — first-time visitor, returning visitor, active user, or churned user.
          </p>

          <ScreenshotMockup title="MyUserJourney — Visitor Segments">
            <MockTable
              headers={["Segment", "Visitors", "Avg. Sessions", "Conv. Rate", "Revenue Share"]}
              rows={[
                ["New Visitors", "14,205", "1.2", "1.4%", "18%"],
                ["Returning Visitors", "7,832", "4.6", "5.8%", "42%"],
                ["High-Value Users", "2,344", "12.3", "14.2%", "40%"],
                ["At-Risk (Declining)", "1,890", "2.1", "0.9%", "6%"],
                ["Re-engaged", "1,102", "3.4", "4.1%", "12%"],
              ]}
            />
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">Cohort Analysis</h4>
          <p className="mb-4">
            Cohort analysis groups users by a shared starting event — typically their first visit or sign-up date — and tracks their behaviour over time. This technique is essential for understanding retention, engagement trends, and the long-term impact of product changes. By comparing cohorts from different time periods, you can determine whether your platform is improving at retaining and engaging users.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Practical Application</h4>
            <p>Use segmentation to personalise your marketing efforts. If you discover that users from organic search who visit three or more blog posts before signing up have 2x higher retention, create content strategies that encourage deeper engagement before pushing for conversion. Analytics-driven personalisation consistently outperforms one-size-fits-all approaches.</p>
          </div>
          <p className="mb-4">
            MyUserJourney allows you to create custom segments using any combination of user properties, event data, and session attributes. Segments are applied retroactively to all historical data, so you can analyse past behaviour through the lens of newly defined segments without waiting to collect new data.
          </p>
        </div>
      ),
    },
    {
      id: "geographic-device",
      title: "Geographic & Device Analytics",
      content: (
        <div>
          <p className="mb-4">
            Geographic and device analytics provide essential context for understanding how your audience interacts with your platform across different physical locations and technological environments. These dimensions often reveal significant variations in user behaviour that should influence your design, content, and marketing decisions.
          </p>
          <h4 className="text-lg font-semibold mb-3">Geographic Intelligence</h4>
          <p className="mb-4">
            MyUserJourney determines user location using IP-based geolocation, providing country, region, and city-level data. Geographic analytics reveal where your most engaged and highest-converting users are located, enabling you to target marketing spend more effectively and prioritise content localisation efforts. Time zone data helps you schedule communications and promotions for maximum impact.
          </p>

          <ScreenshotMockup title="MyUserJourney — Geographic & Device Breakdown">
            <MockTable
              headers={["Country", "Visitors", "Sessions", "Conv. Rate", "Avg. Duration"]}
              rows={[
                ["United Kingdom", "9,842", "14,230", "4.1%", "4m 52s"],
                ["United States", "6,218", "8,912", "3.5%", "3m 44s"],
                ["Germany", "2,105", "3,067", "3.9%", "4m 11s"],
                ["France", "1,432", "1,980", "2.7%", "3m 08s"],
                ["Australia", "1,205", "1,644", "4.5%", "5m 02s"],
              ]}
            />
            <div className="grid grid-cols-3 gap-3 mt-3">
              <MockMetricCard label="Desktop" value="62%" trend="Avg. conv: 4.2%" />
              <MockMetricCard label="Mobile" value="31%" trend="Avg. conv: 2.1%" />
              <MockMetricCard label="Tablet" value="7%" trend="Avg. conv: 3.0%" />
            </div>
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">Device & Browser Analytics</h4>
          <p className="mb-4">
            Understanding the devices, browsers, and operating systems your audience uses is crucial for delivering an optimal experience. If 65% of your traffic comes from mobile devices but your conversion rate is 3x higher on desktop, there is likely a mobile usability issue that needs attention. Browser-specific rendering issues, viewport constraints, and interaction patterns all vary significantly across devices.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Strategic Consideration</h4>
            <p>Use device analytics to prioritise your development and testing efforts. If mobile traffic is growing but mobile conversions are lagging, invest in mobile UX improvements. Consider implementing device-specific experiences — such as simplified forms or touch-optimised navigation — rather than forcing all devices through the same interface.</p>
          </div>
          <p className="mb-4">
            Screen resolution data ensures your responsive design breakpoints align with actual user viewport sizes. Browser version tracking identifies compatibility issues, and connection speed correlations help you understand how page load performance impacts engagement and conversion metrics across different network conditions.
          </p>
        </div>
      ),
    },
    {
      id: "ecommerce-tracking",
      title: "E-commerce Tracking & Transaction Analysis",
      content: (
        <div>
          <p className="mb-4">
            E-commerce tracking connects your analytics data directly to revenue, transforming behavioural insights into financial metrics. By tracking product views, cart additions, checkout steps, and completed transactions, you can calculate the monetary value of every marketing channel, landing page, and user segment. This revenue attribution is essential for making data-driven budget allocation decisions.
          </p>
          <h4 className="text-lg font-semibold mb-3">Transaction Data Model</h4>
          <p className="mb-4">
            MyUserJourney captures comprehensive transaction data including order ID, total revenue, tax, shipping cost, and individual line items with product name, SKU, category, quantity, and price. This granular data enables analysis at both the transaction level and the product level, revealing which products drive the most revenue, which have the highest margins, and which are most frequently purchased together.
          </p>

          <ScreenshotMockup title="MyUserJourney — E-commerce Overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MockMetricCard label="Revenue" value="£147,230" trend="+18.3% vs last month" />
              <MockMetricCard label="Orders" value="1,847" trend="+12.1% vs last month" />
              <MockMetricCard label="AOV" value="£79.71" trend="+5.5% vs last month" />
              <MockMetricCard label="Conversion Rate" value="3.7%" trend="+0.4% vs last month" />
            </div>
            <div className="mt-3">
              <MockTable
                headers={["Product", "Category", "Units Sold", "Revenue", "Conv. Rate"]}
                rows={[
                  ["Widget Pro Max", "Electronics", "342", "£27,018", "4.8%"],
                  ["Analytics Starter Kit", "Software", "518", "£25,382", "6.2%"],
                  ["Dashboard Template", "Templates", "891", "£17,820", "8.1%"],
                  ["Tracking Sensor v2", "Hardware", "204", "£16,320", "3.2%"],
                  ["Data Export Tool", "Software", "623", "£12,460", "5.7%"],
                ]}
              />
            </div>
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">Revenue Attribution</h4>
          <p className="mb-4">
            With e-commerce tracking enabled, every marketing channel and campaign can be evaluated by its direct revenue contribution. This goes beyond simple conversion counting — you can see not just which channels bring buyers, but which channels bring the highest-value buyers. A channel with a lower conversion rate but higher average order value might actually be your most profitable acquisition source.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Revenue Insight</h4>
            <p>Track both first-touch and last-touch revenue attribution to understand the full impact of each channel. Email campaigns often appear low-value in last-touch models because they frequently assist conversions that are completed through direct visits. Multi-touch attribution reveals the true role each channel plays in the customer journey.</p>
          </div>
          <p className="mb-4">
            Product affinity analysis identifies items commonly purchased together, informing cross-sell and upsell strategies. Cart abandonment tracking captures lost revenue opportunities and enables targeted recovery campaigns. Combined with funnel analysis, e-commerce tracking gives you a complete picture from first impression to final transaction.
          </p>
        </div>
      ),
    },
    {
      id: "cookieless-privacy",
      title: "Cookieless Tracking & Privacy-First Analytics",
      content: (
        <div>
          <p className="mb-4">
            The digital analytics landscape is undergoing a fundamental transformation driven by privacy regulations (GDPR, CCPA, ePrivacy), browser restrictions on third-party cookies, and growing user awareness of data collection practices. Modern analytics platforms must deliver accurate insights while respecting user privacy — and MyUserJourney is designed from the ground up with this balance in mind.
          </p>
          <h4 className="text-lg font-semibold mb-3">Privacy-First Architecture</h4>
          <p className="mb-4">
            MyUserJourney offers a cookieless tracking mode that uses privacy-preserving techniques to identify sessions without storing any personal data on the user's device. This approach uses a combination of request attributes — such as IP address hash, user agent, and screen resolution — to create a daily rotating identifier that cannot be used to track users across days or across sites.
          </p>

          <ScreenshotMockup title="MyUserJourney — Privacy Configuration">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-md border border-border/40 p-3 bg-background">
                <div className="text-xs font-medium mb-2">Tracking Mode</div>
                <div className="flex items-center gap-2">
                  <MockBadge text="Cookieless" variant="success" />
                  <span className="text-xs text-muted-foreground">No cookies required</span>
                </div>
              </div>
              <div className="rounded-md border border-border/40 p-3 bg-background">
                <div className="text-xs font-medium mb-2">Data Residency</div>
                <div className="flex items-center gap-2">
                  <MockBadge text="EU" variant="default" />
                  <span className="text-xs text-muted-foreground">Frankfurt, DE</span>
                </div>
              </div>
            </div>
            <MockTable
              headers={["Consent Category", "Opt-in Rate", "Impact on Data", "Status"]}
              rows={[
                ["Essential Analytics", "100%", "Core metrics only", "Always Active"],
                ["Performance Tracking", "78%", "Full event stream", "Consent Required"],
                ["Marketing Attribution", "62%", "UTM & campaign data", "Consent Required"],
                ["Cross-device Tracking", "45%", "User identification", "Consent Required"],
              ]}
            />
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">Consent Management</h4>
          <p className="mb-4">
            MyUserJourney integrates with major consent management platforms (CMPs) to automatically adjust tracking behaviour based on user consent preferences. When a user declines tracking cookies, the platform seamlessly falls back to cookieless mode, ensuring you still collect aggregate analytics data while fully respecting the user's choice.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Compliance Note</h4>
            <p>Privacy-first analytics is not just a legal requirement — it is a competitive advantage. Users increasingly prefer brands that respect their privacy. By implementing transparent data practices and giving users genuine control over their data, you build trust that translates into higher engagement and loyalty.</p>
          </div>
          <p className="mb-4">
            Server-side tracking provides an additional privacy-compliant data collection method. By processing events on your server before forwarding them to MyUserJourney, you can strip personally identifiable information, aggregate data before transmission, and maintain complete control over what data leaves your infrastructure.
          </p>
        </div>
      ),
    },
    {
      id: "custom-event-rules",
      title: "Advanced: Custom Event Definitions & Rule-Based Matching",
      content: (
        <div>
          <p className="mb-4">
            While automatic event tracking covers the majority of use cases, advanced analytics implementations often require custom event definitions that go beyond simple click and page view tracking. Rule-based matching allows you to define complex event conditions that automatically categorise and enrich your event stream, turning raw interaction data into meaningful business events.
          </p>
          <h4 className="text-lg font-semibold mb-3">Defining Custom Events</h4>
          <p className="mb-4">
            Custom event definitions in MyUserJourney use a rule-based system where you specify conditions that must be met for an event to be triggered. Conditions can match on URL patterns, CSS selectors, element attributes, form values, or combinations thereof. This declarative approach means you can define complex tracking requirements without modifying your website's source code.
          </p>

          <ScreenshotMockup title="MyUserJourney — Custom Event Rules">
            <MockTable
              headers={["Event Name", "Trigger Rule", "Conditions", "Status"]}
              rows={[
                ["pricing_viewed", "page_view", "URL contains /pricing", "Active"],
                ["demo_requested", "form_submit", "Form ID = demo-request", "Active"],
                ["video_started", "click", "Element matches .video-play-btn", "Active"],
                ["feature_compared", "click", "URL contains /compare AND element = .compare-btn", "Active"],
                ["high_intent_scroll", "scroll", "Depth >= 80% AND page = /pricing", "Active"],
                ["cart_abandonment", "session_end", "Cart items > 0 AND no purchase", "Active"],
                ["signup_intent", "click", "Element matches [data-action='signup']", "Draft"],
              ]}
            />
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">Event Enrichment</h4>
          <p className="mb-4">
            Beyond triggering events, rules can enrich event data by extracting values from the page context. For example, a product view event can automatically capture the product name from an H1 tag, the price from a designated element, and the category from the URL structure. This automatic enrichment ensures consistent data capture without requiring developers to manually instrument every page.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Advanced Tip</h4>
            <p>Use compound rules to create high-signal events from multiple conditions. A "high_intent_visitor" event triggered when a user views the pricing page, scrolls past 80%, and spends more than 2 minutes is far more valuable than tracking each of these actions individually. These compound events become powerful signals for sales teams and automated workflows.</p>
          </div>
          <p className="mb-4">
            Rule-based matching also supports negative conditions — events that fire when something does not happen. Session-end rules can detect when a user leaves without completing a key action, enabling you to track abandonment at any point in the journey. Combined with time-based conditions, you can identify hesitation patterns that suggest confusion or uncertainty.
          </p>
        </div>
      ),
    },
    {
      id: "ga4-integration",
      title: "Integrating Google Analytics 4 Data",
      content: (
        <div>
          <p className="mb-4">
            Many organisations already collect data through Google Analytics 4 (GA4) and want to combine it with the deeper journey analytics provided by MyUserJourney. The GA4 integration allows you to import your existing GA4 data, giving you a unified view across both platforms without duplicating your tracking infrastructure.
          </p>
          <h4 className="text-lg font-semibold mb-3">Setting Up the Integration</h4>
          <p className="mb-4">
            The GA4 integration connects via the Google Analytics Data API using a service account with read-only access to your GA4 property. Once connected, MyUserJourney periodically imports your GA4 event data, user metrics, and conversion data. The integration respects GA4's data sampling thresholds and automatically handles pagination for large datasets.
          </p>

          <ScreenshotMockup title="MyUserJourney — GA4 Integration Setup">
            <div className="flex gap-3 mb-3">
              <div className="flex-1 rounded-md border-2 border-primary/40 bg-primary/5 p-3 text-center">
                <div className="text-xs font-medium text-primary">MyUserJourney</div>
                <div className="text-[10px] text-muted-foreground mt-1">Primary Source</div>
              </div>
              <div className="flex-1 rounded-md border border-border/40 p-3 text-center">
                <div className="text-xs font-medium">Google Analytics 4</div>
                <div className="text-[10px] text-muted-foreground mt-1">Connected</div>
              </div>
              <div className="flex-1 rounded-md border border-border/40 p-3 text-center">
                <div className="text-xs font-medium">Search Console</div>
                <div className="text-[10px] text-muted-foreground mt-1">Available</div>
              </div>
            </div>
            <div className="rounded-md border border-border/40 p-3 bg-background space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Property ID</span>
                <span className="font-mono">GA4-389201547</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Data Stream</span>
                <span className="font-mono">Web — mysite.com</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Last Sync</span>
                <span>2 hours ago</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status</span>
                <MockBadge text="Connected" variant="success" />
              </div>
            </div>
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">Data Harmonisation</h4>
          <p className="mb-4">
            MyUserJourney maps GA4 event names and parameters to its own data model, creating a unified event stream. Standard GA4 events like "page_view", "purchase", and "sign_up" are automatically mapped, while custom GA4 events can be manually mapped to MyUserJourney event types. This harmonisation enables you to run reports and build funnels that combine data from both sources seamlessly.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Integration Tip</h4>
            <p>Use MyUserJourney as your primary analytics platform and GA4 as a complementary data source. GA4 excels at Google Ads attribution and audience building for remarketing, while MyUserJourney provides deeper journey analysis, real-time event tracking, and privacy-first cookieless options. Together, they offer comprehensive coverage without vendor lock-in.</p>
          </div>
          <p className="mb-4">
            The integration also supports exporting MyUserJourney audiences back to GA4 for use in Google Ads remarketing campaigns. This bidirectional data flow ensures that your journey-based segments can be actioned across the entire Google marketing ecosystem, bridging the gap between analytics insight and marketing execution.
          </p>
        </div>
      ),
    },
    {
      id: "custom-reports",
      title: "Building Custom Reports & Dashboards",
      content: (
        <div>
          <p className="mb-4">
            While pre-built reports cover common analytics needs, custom reports and dashboards allow you to tailor your analytics view to your specific business requirements. MyUserJourney's report builder provides a flexible, drag-and-drop interface for creating reports that combine any metrics, dimensions, and visualisations into a single, shareable view.
          </p>
          <h4 className="text-lg font-semibold mb-3">Report Components</h4>
          <p className="mb-4">
            Custom reports in MyUserJourney are built from composable widgets: metric cards for KPIs, line and bar charts for trends, tables for detailed breakdowns, funnels for conversion analysis, and maps for geographic data. Each widget can be independently configured with its own date range, filters, and comparison period, allowing a single dashboard to present multiple analytical perspectives.
          </p>

          <ScreenshotMockup title="MyUserJourney — Custom Report Builder">
            <div className="flex gap-3">
              <MockSidebar
                items={["Metric Card", "Line Chart", "Bar Chart", "Table", "Funnel", "Map", "Pie Chart", "Heatmap"]}
                active="Bar Chart"
              />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <MockMetricCard label="Sessions" value="18,432" trend="+8.2%" />
                  <MockMetricCard label="Goal Completions" value="684" trend="+14.5%" />
                  <MockMetricCard label="Revenue" value="£54,230" trend="+11.3%" />
                </div>
                <MockChart height="h-24" label="Weekly Performance Trend" />
              </div>
            </div>
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">Scheduling & Sharing</h4>
          <p className="mb-4">
            Completed dashboards can be scheduled for automatic email delivery — daily, weekly, or monthly — to ensure stakeholders receive regular updates without needing to log into the platform. Reports can be exported as PDF for presentations or as CSV for further analysis in spreadsheet tools. Role-based access controls ensure that sensitive data is only visible to authorised team members.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Dashboard Design Tip</h4>
            <p>The best dashboards answer a specific question or serve a defined audience. A marketing dashboard should focus on acquisition and campaign performance. A product dashboard should highlight engagement and feature adoption. Resist the temptation to create an "everything dashboard" — focused dashboards drive better decisions because they present relevant information without noise.</p>
          </div>
          <p className="mb-4">
            MyUserJourney supports dashboard templates that can be cloned and customised for different projects or clients. This is particularly valuable for agencies managing multiple accounts, as it ensures consistency in reporting methodology while allowing per-client customisation of metrics and branding.
          </p>
        </div>
      ),
    },
    {
      id: "predictive-analytics",
      title: "Predictive Analytics & AI Insights",
      content: (
        <div>
          <p className="mb-4">
            Predictive analytics represents the frontier of user journey analysis — moving beyond understanding what happened to forecasting what will happen next. MyUserJourney's AI engine analyses historical patterns across your entire user base to generate predictions about conversion likelihood, churn risk, revenue forecasts, and optimal engagement strategies.
          </p>
          <h4 className="text-lg font-semibold mb-3">Prediction Models</h4>
          <p className="mb-4">
            The platform trains machine learning models on your historical data to identify the behavioural patterns that precede key outcomes. Conversion prediction scores each active session on its likelihood of converting, enabling real-time personalisation. Churn prediction identifies users who are showing disengagement patterns, allowing proactive retention campaigns. Revenue forecasting uses trend analysis and seasonality detection to project future performance.
          </p>

          <ScreenshotMockup title="MyUserJourney — AI Predictive Insights">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-md border border-border/40 p-3 bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <MockBadge text="AI Prediction" variant="default" />
                </div>
                <div className="text-xs font-medium mb-1">Conversion Likelihood</div>
                <div className="text-lg font-bold">73%</div>
                <div className="text-[10px] text-muted-foreground">of current active users likely to convert within 7 days</div>
              </div>
              <div className="rounded-md border border-border/40 p-3 bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <MockBadge text="AI Alert" variant="warning" />
                </div>
                <div className="text-xs font-medium mb-1">Churn Risk</div>
                <div className="text-lg font-bold">1,204</div>
                <div className="text-[10px] text-muted-foreground">users showing declining engagement patterns</div>
              </div>
            </div>
            <MockChart height="h-28" label="30-Day Revenue Forecast" />
          </ScreenshotMockup>

          <h4 className="text-lg font-semibold mb-3">AI-Powered Anomaly Detection</h4>
          <p className="mb-4">
            Beyond predictions, the AI engine continuously monitors your metrics for anomalies — unexpected spikes or drops that deviate from established patterns. When an anomaly is detected, the system automatically investigates potential causes by examining correlated changes in traffic sources, page performance, and user segments. This automated root cause analysis dramatically reduces the time from issue detection to resolution.
          </p>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">AI Best Practice</h4>
            <p>Predictive models improve with data volume and history. Allow at least 90 days of data collection before relying heavily on prediction scores. Regularly validate predictions against actual outcomes to calibrate your confidence in the models. Use prediction scores as one input into decision-making, not as the sole determinant — human judgement and contextual knowledge remain essential.</p>
          </div>
          <p className="mb-4">
            Natural language insights translate complex statistical findings into plain English recommendations. Instead of presenting a correlation coefficient, MyUserJourney tells you "Users who view the case studies page are 3.2x more likely to request a demo — consider promoting case studies earlier in the user journey." This makes AI insights accessible to non-technical stakeholders and directly actionable.
          </p>
        </div>
      ),
    },
    {
      id: "glossary",
      title: "Glossary of Analytics Terms",
      content: (
        <div>
          <p className="mb-4">
            This glossary defines the key terms and concepts used throughout this guide and within the MyUserJourney platform. Understanding this terminology will help you communicate more effectively with your team and make the most of your analytics implementation.
          </p>

          <dl className="space-y-4">
            <div>
              <dt className="font-semibold">Bounce Rate</dt>
              <dd className="text-muted-foreground ml-4">The percentage of sessions in which the user viewed only a single page and triggered no additional events before leaving the site.</dd>
            </div>
            <div>
              <dt className="font-semibold">Cohort</dt>
              <dd className="text-muted-foreground ml-4">A group of users who share a common characteristic or experience within a defined time period, such as all users who signed up in the same week.</dd>
            </div>
            <div>
              <dt className="font-semibold">Conversion Rate</dt>
              <dd className="text-muted-foreground ml-4">The percentage of sessions (or users) that complete a desired goal, such as a purchase, sign-up, or form submission.</dd>
            </div>
            <div>
              <dt className="font-semibold">Cookieless Tracking</dt>
              <dd className="text-muted-foreground ml-4">A method of collecting analytics data without storing cookies on the user's device, using privacy-preserving techniques such as hashed request attributes.</dd>
            </div>
            <div>
              <dt className="font-semibold">Custom Event</dt>
              <dd className="text-muted-foreground ml-4">A user-defined tracking event that captures a specific business interaction not covered by automatic tracking, such as "video_completed" or "plan_upgraded".</dd>
            </div>
            <div>
              <dt className="font-semibold">Drop-off Rate</dt>
              <dd className="text-muted-foreground ml-4">The percentage of users who exit a funnel at a specific step without progressing to the next step.</dd>
            </div>
            <div>
              <dt className="font-semibold">Engagement Score</dt>
              <dd className="text-muted-foreground ml-4">A composite metric that combines time on site, pages viewed, scroll depth, and interaction events to quantify the quality of a user session.</dd>
            </div>
            <div>
              <dt className="font-semibold">Event</dt>
              <dd className="text-muted-foreground ml-4">The fundamental unit of tracking data representing a single user interaction, such as a page view, click, scroll, or form submission.</dd>
            </div>
            <div>
              <dt className="font-semibold">First-party Cookie</dt>
              <dd className="text-muted-foreground ml-4">A cookie set by the domain the user is visiting, used for session persistence and user identification within that specific website.</dd>
            </div>
            <div>
              <dt className="font-semibold">Funnel</dt>
              <dd className="text-muted-foreground ml-4">A defined sequence of steps representing the expected user path towards a conversion goal, used to measure and optimise step-by-step progression.</dd>
            </div>
            <div>
              <dt className="font-semibold">Geolocation</dt>
              <dd className="text-muted-foreground ml-4">The process of determining a user's physical location (country, region, city) based on their IP address or other network attributes.</dd>
            </div>
            <div>
              <dt className="font-semibold">Multi-touch Attribution</dt>
              <dd className="text-muted-foreground ml-4">An attribution model that distributes conversion credit across multiple touchpoints in the user journey, rather than assigning all credit to the first or last interaction.</dd>
            </div>
            <div>
              <dt className="font-semibold">Page Depth</dt>
              <dd className="text-muted-foreground ml-4">The number of pages a user views during a single session, indicating the breadth of their exploration.</dd>
            </div>
            <div>
              <dt className="font-semibold">Referrer</dt>
              <dd className="text-muted-foreground ml-4">The URL of the page that linked the user to your site, transmitted via the HTTP referrer header and used for traffic source classification.</dd>
            </div>
            <div>
              <dt className="font-semibold">Retention Rate</dt>
              <dd className="text-muted-foreground ml-4">The percentage of users who return to your site within a defined period after their first visit or a specific action.</dd>
            </div>
            <div>
              <dt className="font-semibold">Scroll Depth</dt>
              <dd className="text-muted-foreground ml-4">The percentage of a page's total height that a user scrolls to, measured in quartiles (25%, 50%, 75%, 100%).</dd>
            </div>
            <div>
              <dt className="font-semibold">Segment</dt>
              <dd className="text-muted-foreground ml-4">A subset of users or sessions filtered by shared characteristics such as traffic source, device type, geography, or behaviour patterns.</dd>
            </div>
            <div>
              <dt className="font-semibold">Session</dt>
              <dd className="text-muted-foreground ml-4">A group of user interactions recorded during a continuous period of activity, typically ending after 30 minutes of inactivity.</dd>
            </div>
            <div>
              <dt className="font-semibold">UTM Parameters</dt>
              <dd className="text-muted-foreground ml-4">URL query parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content) used to track the effectiveness of marketing campaigns and traffic sources.</dd>
            </div>
            <div>
              <dt className="font-semibold">Average Order Value (AOV)</dt>
              <dd className="text-muted-foreground ml-4">The average monetary value of completed transactions, calculated by dividing total revenue by the number of orders.</dd>
            </div>
            <div>
              <dt className="font-semibold">Customer Lifetime Value (CLV)</dt>
              <dd className="text-muted-foreground ml-4">The predicted total revenue a customer will generate over their entire relationship with your business, used for acquisition budget planning.</dd>
            </div>
            <div>
              <dt className="font-semibold">Anomaly Detection</dt>
              <dd className="text-muted-foreground ml-4">An AI-driven process that identifies unexpected deviations from established metric patterns, alerting teams to potential issues or opportunities.</dd>
            </div>
            <div>
              <dt className="font-semibold">Data Residency</dt>
              <dd className="text-muted-foreground ml-4">The geographic location where analytics data is stored and processed, relevant for compliance with regional data protection regulations such as GDPR.</dd>
            </div>
            <div>
              <dt className="font-semibold">Server-side Tracking</dt>
              <dd className="text-muted-foreground ml-4">A data collection method where events are captured and processed on the server rather than in the user's browser, providing greater control over data quality and privacy compliance.</dd>
            </div>
          </dl>

          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Terminology Note</h4>
            <p>Analytics terminology can vary between platforms. The definitions above reflect usage within MyUserJourney and follow widely accepted industry conventions. When comparing metrics across platforms, always verify that the underlying definitions match — a "session" in one platform may not be calculated identically to a "session" in another.</p>
          </div>
        </div>
      ),
    },
  ],
};
