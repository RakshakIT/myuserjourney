import { ScreenshotMockup, MockMetricCard, MockChart, MockTable, MockFunnel, MockSidebar, MockNav, MockBadge } from "./screenshot-mockup";

const tipClass = "bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 my-4";

export const marketingEbook = {
  title: "The Data-Driven Growth Playbook",
  subtitle: "Turning Analytics Into Revenue",
  author: "MyUserJourney Team",
  coverGradient: "from-purple-600 to-pink-600",
  chapters: [
    {
      id: "why-analytics",
      title: "Why Analytics Is Your Most Powerful Marketing Tool",
      content: (
        <div>
          <p className="mb-4">
            In an era where every click, scroll, and interaction can be measured, analytics has become the single most important asset in a marketer's toolkit. Businesses that leverage data-driven decision-making are 23 times more likely to acquire customers and six times more likely to retain them. Yet many organisations still rely on gut instinct and anecdotal evidence to guide their marketing strategies, leaving enormous value on the table.
          </p>
          <p className="mb-4">
            The shift from intuition-based marketing to analytics-driven marketing represents a fundamental change in how businesses operate. Rather than spending budget broadly and hoping for results, data-driven marketers can identify precisely which channels, messages, and audiences deliver the highest return. This precision reduces waste and amplifies the impact of every pound spent on acquisition and retention.
          </p>
          <ScreenshotMockup title="MyUserJourney — Marketing Performance Overview">
            <MockNav />
            <div className="grid grid-cols-3 gap-3">
              <MockMetricCard label="Revenue Impact" value="+34.2%" trend="+12% vs last quarter" />
              <MockMetricCard label="Conversion Lift" value="2.8x" trend="+0.6x improvement" />
              <MockMetricCard label="Cost Savings" value="$24,500" trend="18% reduction in CPA" />
            </div>
            <MockChart height="h-28" label="Monthly Revenue Growth" />
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>Companies using analytics to drive marketing decisions see an average of 15-20% increase in marketing ROI within the first year. The key is not just collecting data, but building a culture where data informs every decision from campaign planning to budget allocation.</p>
          </div>
          <p className="mb-4">
            MyUserJourney was built to bridge the gap between raw data and actionable insight. By combining real-time tracking, journey mapping, and AI-powered analysis, it gives marketing teams the clarity they need to make confident, evidence-based decisions. Throughout this ebook, we will explore practical strategies for turning your analytics data into measurable revenue growth.
          </p>
          <p className="mb-4">
            Whether you are a startup founder wearing multiple hats or a seasoned marketing director managing a large team, the principles in this guide will help you extract more value from your existing traffic, identify untapped opportunities, and build a sustainable growth engine powered by data.
          </p>
        </div>
      ),
    },
    {
      id: "customer-journey",
      title: "Understanding Your Customer Journey",
      content: (
        <div>
          <p className="mb-4">
            Every customer follows a path from first discovering your brand to making a purchase and beyond. Understanding this journey is critical because it reveals where prospects drop off, what motivates them to convert, and how you can optimise each touchpoint. The modern customer journey is rarely linear — users may visit your site multiple times across different devices before taking action.
          </p>
          <p className="mb-4">
            The typical customer journey consists of four core stages: awareness, consideration, decision, and advocacy. At each stage, different content, messaging, and channels play a role. Analytics allows you to map real user behaviour against these theoretical stages, revealing patterns that would otherwise remain invisible.
          </p>
          <ScreenshotMockup title="MyUserJourney — Customer Journey Map">
            <MockNav />
            <MockFunnel stages={[
              { name: "Awareness", value: "28,400", color: "bg-blue-500" },
              { name: "Consideration", value: "12,800", color: "bg-indigo-500" },
              { name: "Decision", value: "4,200", color: "bg-purple-500" },
              { name: "Advocacy", value: "1,850", color: "bg-pink-500" },
            ]} />
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>MyUserJourney's journey mapping feature automatically visualises the paths users take through your site, highlighting the most common routes to conversion and the points where users abandon their journey. Use this data to prioritise which touchpoints need the most attention.</p>
          </div>
          <p className="mb-4">
            By overlaying journey data with demographic and behavioural segments, you can create tailored experiences for different audience types. A first-time visitor from organic search may need educational content, while a returning visitor from an email campaign may be ready for a direct call to action. Understanding these nuances is what separates good marketing from great marketing.
          </p>
          <p className="mb-4">
            Mapping your customer journey also reveals hidden opportunities. You may discover that users who visit your case studies page convert at three times the average rate, or that mobile users consistently drop off at a particular step. These insights enable you to make targeted improvements that have an outsized impact on your bottom line.
          </p>
        </div>
      ),
    },
    {
      id: "lead-journey-framework",
      title: "The Lead Journey Framework — From Discovery to Conversion",
      content: (
        <div>
          <p className="mb-4">
            The Lead Journey Framework is a structured approach to understanding how anonymous visitors become qualified leads and eventually paying customers. Unlike traditional funnel models that assume a simple top-to-bottom flow, this framework acknowledges the complexity of modern buying behaviour, where users may circle back, compare, and re-engage multiple times before converting.
          </p>
          <p className="mb-4">
            At its core, the framework tracks three key metrics across the journey: engagement depth, intent signals, and conversion readiness. Engagement depth measures how thoroughly a user interacts with your content. Intent signals identify actions that suggest purchase interest, such as visiting pricing pages, downloading resources, or starting a trial. Conversion readiness combines these signals into a score that helps prioritise follow-up efforts.
          </p>
          <ScreenshotMockup title="MyUserJourney — Lead Journey Funnel">
            <MockNav />
            <MockFunnel stages={[
              { name: "Discovery", value: "15,000", color: "bg-blue-500" },
              { name: "Engagement", value: "9,000", color: "bg-indigo-500" },
              { name: "Intent", value: "3,500", color: "bg-purple-500" },
              { name: "Conversion", value: "1,200", color: "bg-pink-500" },
            ]} />
            <div className="mt-3">
              <MockTable
                headers={["Stage", "Volume", "Drop-off", "Avg. Days"]}
                rows={[
                  ["Discovery to Engagement", "15K to 9K", "40%", "3.2"],
                  ["Engagement to Intent", "9K to 3.5K", "61%", "7.8"],
                  ["Intent to Conversion", "3.5K to 1.2K", "66%", "4.1"],
                ]}
              />
            </div>
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>Research shows that leads who interact with five or more pieces of content before contacting sales convert at three times the rate of those who engage with fewer. Use your analytics to identify content gaps in the journey and fill them with targeted resources.</p>
          </div>
          <p className="mb-4">
            MyUserJourney's Lead Journey feature automatically tracks these patterns, giving you a visual timeline of how each lead progresses through your site. By understanding the typical journey length and the content that accelerates conversion, you can design marketing programmes that guide prospects more efficiently from discovery to purchase.
          </p>
          <p className="mb-4">
            The most effective lead journeys are not forced — they feel natural to the user while being carefully orchestrated behind the scenes. Use data to remove friction, surface the right content at the right time, and create a seamless experience that builds trust and drives action.
          </p>
        </div>
      ),
    },
    {
      id: "high-value-traffic",
      title: "Identifying High-Value Traffic Sources",
      content: (
        <div>
          <p className="mb-4">
            Not all traffic is created equal. A thousand visitors from a poorly targeted social media campaign may generate fewer conversions than fifty visitors from a well-optimised long-tail search query. Understanding which traffic sources deliver the highest value — measured by conversion rate, average order value, and customer lifetime value — is essential for effective budget allocation.
          </p>
          <p className="mb-4">
            Traffic source analysis goes beyond simply counting visits from each channel. It requires attributing revenue and conversions back to the original source, accounting for multi-touch journeys where a user may discover you through organic search, return via a retargeting ad, and finally convert through a direct visit. MyUserJourney supports multi-touch attribution models that give credit to each touchpoint in the journey.
          </p>
          <ScreenshotMockup title="MyUserJourney — Traffic Source Performance">
            <MockNav />
            <MockTable
              headers={["Source", "Visitors", "Conv. Rate", "Revenue", "CPA"]}
              rows={[
                ["Organic Search", "14,200", "3.2%", "$45,800", "$12.40"],
                ["Paid Search", "8,600", "2.8%", "$28,300", "$18.60"],
                ["Email Marketing", "4,100", "5.1%", "$32,500", "$6.20"],
                ["Social Media", "6,800", "1.4%", "$9,100", "$22.80"],
                ["Direct Traffic", "5,300", "2.1%", "$14,700", "$8.90"],
              ]}
            />
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>Use UTM parameters consistently across all campaigns to ensure accurate source tracking. MyUserJourney automatically classifies traffic into channels (organic, paid, social, referral, direct, email) and allows you to drill down into specific campaigns and keywords for granular performance analysis.</p>
          </div>
          <p className="mb-4">
            Once you have identified your highest-value traffic sources, double down on them. Increase investment in channels that deliver quality leads, optimise underperforming channels or reallocate their budget, and continuously test new sources. The goal is to build a diversified portfolio of traffic sources that collectively drive sustainable, profitable growth.
          </p>
          <p className="mb-4">
            Pay particular attention to email marketing, which consistently delivers the highest conversion rates across industries. Building and nurturing your email list is one of the most valuable long-term investments you can make. Unlike paid channels, your email list is an owned asset that continues to deliver value without incremental spend.
          </p>
        </div>
      ),
    },
    {
      id: "content-converts",
      title: "Content That Converts — Using Page Analytics",
      content: (
        <div>
          <p className="mb-4">
            Your website content is your most powerful sales tool, working around the clock to educate, persuade, and convert visitors. But not all content performs equally. Page-level analytics reveal which content resonates with your audience, which pages drive conversions, and where users lose interest and leave. Armed with this data, you can transform underperforming pages and amplify your best content.
          </p>
          <p className="mb-4">
            Start by categorising your pages into content types: landing pages, blog posts, product pages, comparison pages, and resource pages. Analyse each category's performance metrics — page views, average time on page, scroll depth, exit rate, and conversion contribution. This categorisation helps you understand which types of content your audience values most and where to invest your content creation efforts.
          </p>
          <ScreenshotMockup title="MyUserJourney — Page Performance Analytics">
            <MockNav />
            <MockTable
              headers={["Page", "Views", "Avg. Time", "Scroll Depth", "Conv. Rate"]}
              rows={[
                ["/pricing", "8,420", "3m 12s", "82%", "6.4%"],
                ["/blog/analytics-guide", "12,100", "4m 45s", "71%", "3.8%"],
                ["/features", "6,800", "2m 38s", "68%", "4.2%"],
                ["/case-studies", "3,200", "5m 10s", "88%", "7.1%"],
                ["/demo", "2,900", "1m 55s", "92%", "12.3%"],
              ]}
            />
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>Pages with scroll depths below 30% often indicate a disconnect between the page title or meta description and the actual content. Use MyUserJourney's page analytics to identify these pages and rewrite their introductions to better match user expectations and keep visitors engaged.</p>
          </div>
          <p className="mb-4">
            The most successful content strategies are iterative. Publish content, measure its performance, optimise based on data, and repeat. Use MyUserJourney's pages analysis to create a content scorecard that tracks the performance of every page on your site, making it easy to prioritise optimisation efforts and demonstrate the ROI of your content marketing investment.
          </p>
          <p className="mb-4">
            Focus especially on pages that receive high traffic but have low conversion rates. These represent your biggest opportunities — the audience is already there, you just need to refine the messaging, layout, or calls to action to turn browsers into buyers.
          </p>
        </div>
      ),
    },
    {
      id: "conversion-funnels",
      title: "Building Effective Conversion Funnels",
      content: (
        <div>
          <p className="mb-4">
            A conversion funnel is a defined sequence of steps that a user must complete to achieve a desired outcome — whether that is making a purchase, signing up for a trial, or requesting a demo. By mapping these steps and measuring completion rates at each stage, you can identify exactly where prospects drop off and take targeted action to improve conversion rates.
          </p>
          <p className="mb-4">
            Effective funnel design starts with understanding your users' goals and removing unnecessary steps. Every additional step in a funnel introduces friction, and even small amounts of friction compound to significantly reduce overall conversion rates. Research suggests that reducing a checkout process from five steps to three can increase conversion rates by 10-30%.
          </p>
          <ScreenshotMockup title="MyUserJourney — Conversion Funnel Analysis">
            <MockNav />
            <MockFunnel stages={[
              { name: "Landing Page", value: "10,000", color: "bg-blue-500" },
              { name: "Product View", value: "6,200", color: "bg-indigo-500" },
              { name: "Add to Cart", value: "2,800", color: "bg-purple-500" },
              { name: "Checkout", value: "1,600", color: "bg-violet-500" },
              { name: "Purchase", value: "1,100", color: "bg-pink-500" },
            ]} />
            <div className="mt-3 grid grid-cols-4 gap-2">
              <div className="text-center rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-2">
                <div className="text-[10px] text-muted-foreground">Step 1-2</div>
                <div className="text-xs font-bold text-red-600 dark:text-red-400">-38% drop</div>
              </div>
              <div className="text-center rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-2">
                <div className="text-[10px] text-muted-foreground">Step 2-3</div>
                <div className="text-xs font-bold text-red-600 dark:text-red-400">-55% drop</div>
              </div>
              <div className="text-center rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-2">
                <div className="text-[10px] text-muted-foreground">Step 3-4</div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400">-43% drop</div>
              </div>
              <div className="text-center rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-2">
                <div className="text-[10px] text-muted-foreground">Step 4-5</div>
                <div className="text-xs font-bold text-green-600 dark:text-green-400">-31% drop</div>
              </div>
            </div>
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>MyUserJourney's funnel builder allows you to create custom funnels based on any sequence of page views or events. Compare funnel performance across different user segments to discover whether certain audiences need different pathways to conversion.</p>
          </div>
          <p className="mb-4">
            Funnel analysis should be an ongoing process, not a one-time exercise. Set up regular reviews of your key funnels, track changes over time, and A/B test modifications to individual steps. Small improvements at each stage of the funnel compound into significant gains in overall conversion rate. A 10% improvement at each of four funnel stages results in a 46% increase in total conversions.
          </p>
          <p className="mb-4">
            Consider building multiple funnels for different audience segments and entry points. A user arriving from a Google search for a specific product term may need a shorter, more direct funnel than someone discovering your brand through a blog post. Tailoring the funnel to the user's context and intent dramatically improves conversion rates.
          </p>
        </div>
      ),
    },
    {
      id: "seo-strategies",
      title: "SEO Strategies Backed by Data",
      content: (
        <div>
          <p className="mb-4">
            Search engine optimisation remains one of the highest-ROI marketing channels available. Unlike paid advertising, which stops delivering traffic the moment you pause spending, organic search traffic compounds over time as your content library grows and your domain authority strengthens. The key to successful SEO is letting data guide your strategy rather than chasing algorithm updates.
          </p>
          <p className="mb-4">
            Modern SEO success depends on understanding user intent, creating comprehensive content that satisfies that intent, and ensuring your site provides an excellent technical experience. Analytics data from MyUserJourney can inform all three of these pillars by revealing how users interact with your content, which pages perform well organically, and where technical issues may be hurting your rankings.
          </p>
          <ScreenshotMockup title="MyUserJourney — SEO Performance Dashboard">
            <MockNav />
            <div className="grid grid-cols-3 gap-3">
              <MockMetricCard label="Organic Traffic" value="42,800" trend="+18% vs last month" />
              <MockMetricCard label="Avg. Ranking" value="#8.4" trend="Improved by 3 positions" />
              <MockMetricCard label="Click-Through Rate" value="4.2%" trend="+0.8% vs benchmark" />
            </div>
            <MockChart height="h-28" label="Organic Traffic Trend (12 months)" />
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>MyUserJourney's SEO analysis tools combine your Search Console data with on-site behaviour metrics. This unique combination lets you see not just which keywords drive traffic, but which keywords drive engaged, converting traffic — the metric that truly matters for growth.</p>
          </div>
          <p className="mb-4">
            Build your SEO strategy around topic clusters rather than individual keywords. Create comprehensive pillar pages for your core topics, supported by detailed cluster content that addresses specific questions and long-tail queries. Use analytics to continuously measure which clusters drive the most value and expand your coverage in those areas.
          </p>
          <p className="mb-4">
            Technical SEO auditing should be a regular habit, not a one-off task. Use MyUserJourney's site audit tools to monitor for crawl errors, slow page load times, mobile usability issues, and broken links. Fixing these technical foundations ensures that your content investments are not undermined by poor site health.
          </p>
        </div>
      ),
    },
    {
      id: "ppc-optimisation",
      title: "PPC Campaign Optimisation with Analytics",
      content: (
        <div>
          <p className="mb-4">
            Pay-per-click advertising is one of the fastest ways to drive targeted traffic, but without proper analytics, it can also be one of the fastest ways to burn through your marketing budget. Effective PPC management requires continuous monitoring, testing, and optimisation based on real performance data rather than assumptions about what should work.
          </p>
          <p className="mb-4">
            The most common mistake in PPC management is optimising for clicks rather than conversions. A campaign with a low cost-per-click but poor conversion rate will ultimately cost more per customer acquired than a campaign with higher click costs but better targeting. MyUserJourney helps you look beyond click metrics to understand what happens after users arrive on your site from paid campaigns.
          </p>
          <ScreenshotMockup title="MyUserJourney — PPC Campaign Performance">
            <MockNav />
            <MockTable
              headers={["Campaign", "CPC", "CTR", "Conversions", "ROAS"]}
              rows={[
                ["Brand Terms", "$0.85", "8.2%", "342", "8.4x"],
                ["Product Categories", "$2.40", "3.6%", "186", "4.2x"],
                ["Competitor Terms", "$4.10", "2.1%", "64", "2.8x"],
                ["Long-Tail Keywords", "$1.20", "4.8%", "228", "6.1x"],
                ["Remarketing", "$0.60", "5.4%", "412", "9.2x"],
              ]}
            />
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>Connect your PPC campaign data with MyUserJourney's user journey tracking to see the full picture. Many PPC conversions happen on subsequent visits — understanding the multi-touch path from first click to final conversion helps you accurately value your campaigns and optimise for true ROI.</p>
          </div>
          <p className="mb-4">
            Establish a regular optimisation cadence: review performance daily, make bid adjustments weekly, test new ad creative fortnightly, and conduct comprehensive campaign restructuring monthly. This disciplined approach ensures you catch performance issues quickly while giving changes enough time to generate statistically significant data.
          </p>
          <p className="mb-4">
            Remarketing deserves special attention in your PPC strategy. Users who have already visited your site are significantly more likely to convert, and remarketing campaigns typically deliver the highest ROAS. Use MyUserJourney's audience segments to create highly targeted remarketing lists based on specific behaviours and engagement levels.
          </p>
        </div>
      ),
    },
    {
      id: "ai-marketing",
      title: "AI-Powered Marketing Decisions",
      content: (
        <div>
          <p className="mb-4">
            Artificial intelligence is transforming marketing from a discipline driven by experience and intuition into one powered by pattern recognition and predictive modelling. AI can process millions of data points in seconds, identifying trends, anomalies, and opportunities that would take a human analyst days or weeks to uncover. For marketers, this means faster, more accurate decision-making and the ability to personalise at scale.
          </p>
          <p className="mb-4">
            The most impactful applications of AI in marketing are not the flashy ones — they are the practical, everyday tools that help you work smarter. Anomaly detection alerts you when traffic or conversion patterns deviate from the norm. Predictive analytics forecast future performance based on historical trends. Natural language processing summarises complex data sets into actionable recommendations you can act on immediately.
          </p>
          <ScreenshotMockup title="MyUserJourney — AI Insights & Recommendations">
            <MockNav />
            <div className="space-y-3">
              <div className="rounded-md border border-border/40 p-3 bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <MockBadge text="High Priority" variant="warning" />
                  <span className="text-xs font-semibold">Conversion Drop Detected</span>
                </div>
                <p className="text-xs text-muted-foreground">Your checkout conversion rate dropped 12% this week. Analysis suggests the new form layout is causing friction on mobile devices. Consider reverting to the previous layout or simplifying the mobile experience.</p>
              </div>
              <div className="rounded-md border border-border/40 p-3 bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <MockBadge text="Opportunity" variant="success" />
                  <span className="text-xs font-semibold">High-Value Segment Identified</span>
                </div>
                <p className="text-xs text-muted-foreground">Users who visit your comparison page and then read two or more case studies convert at 4.2x the average rate. Consider creating a dedicated nurture sequence targeting this behaviour pattern.</p>
              </div>
              <div className="rounded-md border border-border/40 p-3 bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <MockBadge text="Prediction" variant="default" />
                  <span className="text-xs font-semibold">Traffic Forecast</span>
                </div>
                <p className="text-xs text-muted-foreground">Based on current trends and seasonal patterns, organic traffic is projected to increase 22% over the next 30 days. Prepare landing pages and conversion paths for the anticipated volume increase.</p>
              </div>
            </div>
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>MyUserJourney's AI assistant analyses your data continuously, surfacing insights and recommendations without requiring you to formulate complex queries. Ask questions in plain English and receive data-backed answers instantly, making advanced analytics accessible to your entire team.</p>
          </div>
          <p className="mb-4">
            The most effective approach to AI-powered marketing is to treat it as an intelligent assistant that augments your expertise, not as a replacement for strategic thinking and creativity. Use AI to handle the heavy lifting of data analysis while you focus on strategy, storytelling, and building genuine connections with your audience.
          </p>
          <p className="mb-4">
            Start small with AI adoption. Begin by implementing automated anomaly detection and weekly performance summaries. As your team becomes comfortable with AI-driven insights, expand into predictive lead scoring, automated content recommendations, and dynamic budget allocation. This gradual approach ensures adoption without overwhelming your team.
          </p>
        </div>
      ),
    },
    {
      id: "privacy-first",
      title: "Privacy-First Marketing — GDPR as a Competitive Advantage",
      content: (
        <div>
          <p className="mb-4">
            Privacy regulations like GDPR are often viewed as obstacles to effective marketing, but forward-thinking organisations are discovering that privacy-first practices can actually be a competitive advantage. When users trust that their data is handled responsibly, they are more willing to share information, engage with personalised content, and become loyal customers. Trust drives conversion.
          </p>
          <p className="mb-4">
            The key is to build analytics systems that respect user privacy while still delivering the insights you need to make informed decisions. This means implementing proper consent management, anonymising data where possible, minimising data collection to what is truly necessary, and being transparent about how data is used. MyUserJourney is designed from the ground up with privacy compliance at its core.
          </p>
          <ScreenshotMockup title="MyUserJourney — Privacy & Consent Dashboard">
            <MockNav />
            <div className="grid grid-cols-3 gap-3">
              <MockMetricCard label="Consent Rate" value="87.4%" trend="+4.2% after banner redesign" />
              <MockMetricCard label="Data Requests" value="12" trend="All resolved within 48hrs" />
              <MockMetricCard label="Compliance Score" value="98/100" trend="Fully GDPR compliant" />
            </div>
            <div className="mt-3">
              <MockTable
                headers={["Privacy Feature", "Status", "Last Audit"]}
                rows={[
                  ["Cookie Consent Banner", "Active", "2 days ago"],
                  ["Data Anonymisation", "Enabled", "Real-time"],
                  ["Right to Erasure", "Automated", "On request"],
                  ["Data Retention Policy", "90 days", "Reviewed monthly"],
                  ["IP Anonymisation", "Enabled", "Always active"],
                ]}
              />
            </div>
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>Organisations that achieve high consent rates (above 80%) collect significantly more usable data than those with poor consent experiences. Invest in clear, well-designed consent banners that explain the value exchange — users are more likely to opt in when they understand how their data improves their experience.</p>
          </div>
          <p className="mb-4">
            Privacy-first marketing also means rethinking your measurement strategy. Move away from individual-level tracking towards aggregate, cohort-based analysis where possible. This approach not only reduces privacy risk but often provides more reliable insights, as it smooths out individual outliers and focuses on statistically significant patterns.
          </p>
          <p className="mb-4">
            Make privacy a visible part of your brand promise. Highlight your data practices on your website, include privacy information in your marketing materials, and train your team to discuss data handling confidently. In a world where data breaches regularly make headlines, being known as a trustworthy steward of customer data is a genuine differentiator.
          </p>
        </div>
      ),
    },
    {
      id: "measuring-roi",
      title: "Measuring ROI Across Channels",
      content: (
        <div>
          <p className="mb-4">
            The ability to accurately measure return on investment across all marketing channels is the foundation of effective budget allocation. Yet many organisations still struggle with attribution, often defaulting to last-click models that dramatically overvalue bottom-of-funnel channels and undervalue the awareness and consideration activities that fill the pipeline.
          </p>
          <p className="mb-4">
            Effective ROI measurement requires a multi-touch attribution model that assigns appropriate credit to each interaction in the customer journey. Whether you use linear attribution, time-decay, position-based, or data-driven models, the goal is the same: understand the true contribution of each channel so you can invest with confidence and justify your marketing spend to stakeholders.
          </p>
          <ScreenshotMockup title="MyUserJourney — Channel ROI Analysis">
            <MockNav />
            <MockChart height="h-32" label="Revenue by Channel (Quarterly)" />
            <div className="mt-3">
              <MockTable
                headers={["Channel", "Spend", "Revenue", "ROI", "Trend"]}
                rows={[
                  ["Organic Search", "$8,200", "$148,000", "18.0x", "+22%"],
                  ["Email Marketing", "$3,400", "$86,500", "25.4x", "+15%"],
                  ["Paid Search", "$24,600", "$92,400", "3.8x", "+8%"],
                  ["Social Media", "$12,800", "$38,200", "3.0x", "-4%"],
                  ["Content Marketing", "$6,100", "$64,300", "10.5x", "+31%"],
                ]}
              />
            </div>
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>Do not make the mistake of cutting investment in high-ROI organic channels simply because they are harder to attribute. Use MyUserJourney's multi-touch attribution to see the full picture, and remember that channels like content marketing and SEO often have compounding returns that grow over time.</p>
          </div>
          <p className="mb-4">
            Build a monthly or quarterly ROI dashboard that tracks spend, revenue, and return for every channel. Include both direct-response metrics and leading indicators like engaged sessions, qualified leads, and pipeline value. This comprehensive view helps you make proactive investment decisions rather than reactive cuts when budgets tighten.
          </p>
          <p className="mb-4">
            When presenting ROI data to stakeholders, always contextualise the numbers. A channel with a 3x ROI may seem underwhelming compared to one with 25x, but if the higher-ROI channel cannot scale further, the lower-ROI channel may represent a better growth investment. Effective ROI analysis considers both efficiency and scalability.
          </p>
        </div>
      ),
    },
    {
      id: "case-studies",
      title: "Case Studies — Real Results with MyUserJourney",
      content: (
        <div>
          <p className="mb-4">
            Theory and frameworks are valuable, but nothing demonstrates the power of data-driven marketing like real results. The following case studies showcase how organisations across different industries have used MyUserJourney to transform their marketing performance, reduce costs, and accelerate growth through analytics-driven decision making.
          </p>
          <p className="mb-4">
            These results are not outliers — they represent the typical outcomes achieved by teams that commit to a data-driven approach and use the right tools to execute it. The common thread across all successful implementations is a willingness to let data challenge assumptions and guide strategy, even when the insights contradict conventional wisdom.
          </p>
          <ScreenshotMockup title="MyUserJourney — Results Dashboard">
            <MockNav />
            <div className="text-xs font-semibold text-muted-foreground mb-2">E-Commerce Brand — 6 Month Transformation</div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <MockMetricCard label="Conversion Rate (Before)" value="1.8%" />
              <MockMetricCard label="Conversion Rate (After)" value="4.2%" trend="+133% improvement" />
              <MockMetricCard label="Revenue Growth" value="+$240K" trend="In 6 months" />
            </div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">SaaS Company — Lead Generation</div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <MockMetricCard label="Lead Volume (Before)" value="320/mo" />
              <MockMetricCard label="Lead Volume (After)" value="890/mo" trend="+178% increase" />
              <MockMetricCard label="Cost Per Lead" value="-42%" trend="From $48 to $28" />
            </div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">B2B Services — Pipeline Acceleration</div>
            <div className="grid grid-cols-3 gap-3">
              <MockMetricCard label="Sales Cycle (Before)" value="94 days" />
              <MockMetricCard label="Sales Cycle (After)" value="52 days" trend="-45% reduction" />
              <MockMetricCard label="Win Rate" value="+28%" trend="From 18% to 23%" />
            </div>
          </ScreenshotMockup>
          <div className={tipClass}>
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p>The most successful MyUserJourney implementations share three common traits: executive buy-in for data-driven decision making, a dedicated analytics champion within the marketing team, and a commitment to acting on insights within 48 hours of discovery. Speed of execution is what separates data-informed teams from data-rich but action-poor organisations.</p>
          </div>
          <p className="mb-4">
            Each of these organisations started with a clear objective, implemented MyUserJourney's tracking across their digital properties, and systematically worked through the framework outlined in this ebook. The results were not instantaneous — meaningful improvement takes consistent effort — but the trajectory was clear within the first 30 days as data revealed previously hidden opportunities.
          </p>
          <p className="mb-4">
            Your results will depend on your starting point, your industry, and your commitment to acting on data. But the methodology is proven: measure everything, identify your biggest opportunities, test improvements systematically, and scale what works. With MyUserJourney as your analytics partner, you have the tools to turn data into revenue and build a marketing engine that grows stronger every month.
          </p>
        </div>
      ),
    },
  ],
};
