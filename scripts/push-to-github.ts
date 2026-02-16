import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";

const REPO_OWNER = "RakshakIT";
const REPO_NAME = "myuserjourney";
const BRANCH = "main";
const ROOT = "/home/runner/workspace";

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) throw new Error("X_REPLIT_TOKEN not found");

  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=github",
    { headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken } }
  ).then(r => r.json()).then(d => d.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken) throw new Error("GitHub not connected");
  return accessToken;
}

async function getOctokit() {
  const token = await getAccessToken();
  return new Octokit({ auth: token });
}

const IGNORE_PATTERNS = [
  "node_modules", ".git", "dist", "server/public", ".env", ".env.local",
  ".env.production", ".env.development", ".DS_Store", "Thumbs.db",
  "uploads", ".replit", ".config", ".cache", ".upm", ".local",
  "generated-icon.png", "attached_assets", "scripts/push-to-github.ts",
  ".breakpoints", "replit.nix", "replit_zip_error_log.txt",
  ".prettierrc", ".eslintrc", "replit.md"
];

function shouldIgnore(filePath: string): boolean {
  const rel = path.relative(ROOT, filePath);
  for (const pattern of IGNORE_PATTERNS) {
    if (rel === pattern || rel.startsWith(pattern + "/") || rel.startsWith(pattern + "\\")) {
      return true;
    }
  }
  if (rel.startsWith(".")) {
    const firstPart = rel.split("/")[0];
    if (firstPart.startsWith(".") && firstPart !== ".gitignore" && firstPart !== ".env.example") {
      return true;
    }
  }
  return false;
}

function getAllFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldIgnore(fullPath)) continue;
    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const binaryExtensions = [".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".svg", ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".mp3", ".pdf", ".zip", ".tar", ".gz"];
  return binaryExtensions.includes(ext);
}

interface FileEntry {
  path: string;
  content: string;
  encoding: "utf-8" | "base64";
}

interface CommitGroup {
  message: string;
  description: string;
  files: string[];
}

function categorizeFiles(allFiles: string[]): CommitGroup[] {
  const groups: CommitGroup[] = [
    {
      message: "feat: Core platform setup - schema, database, and server infrastructure",
      description: [
        "- PostgreSQL database schema with Drizzle ORM (users, projects, events, sessions, etc.)",
        "- Express.js backend with TypeScript and RESTful API architecture",
        "- Authentication system with email/password (bcrypt) and Google OAuth via Passport.js",
        "- Storage layer with complete CRUD operations for all data models",
        "- Stripe billing integration for pay-as-you-go AI feature pricing",
        "- GDPR/privacy compliance engine with consent management and IP anonymization",
        "- Event collection pipeline with bot detection, traffic classification, and geolocation",
      ].join("\n"),
      files: [] as string[],
    },
    {
      message: "feat: Frontend application - React UI with Shadcn components and analytics dashboard",
      description: [
        "- React 18 + TypeScript + Vite frontend with TanStack Query for data fetching",
        "- Shadcn UI component library with custom theming (light/dark mode support)",
        "- GA4-style navigation sidebar with collapsible sections",
        "- Analytics dashboard with real-time metrics, charts, and period comparison",
        "- Realtime, Acquisition, Engagement, and Traffic analysis pages",
        "- Funnel Explorer, Custom Events, User Journeys, and Visitor tracking",
        "- Geography, Browsers & Systems, and Pages analysis modules",
      ].join("\n"),
      files: [] as string[],
    },
    {
      message: "feat: AI-powered features - Insights, Predictive Analytics, UX Auditor, Marketing Copilot",
      description: [
        "- AI Insights chat interface for natural language analytics queries",
        "- Predictive Analytics with churn risk scoring and conversion probability",
        "- AI UX Auditor for automated detection of slow pages and bad UX flows",
        "- AI Marketing Copilot for SEO fixes, PPC optimization, and UX recommendations",
        "- No-Code Funnel Builder with AI-powered funnel generation",
        "- OpenAI integration (gpt-4o-mini) with per-feature usage tracking and cost logging",
        "- Knowledge Center with interactive learning paths and skill assessments",
      ].join("\n"),
      files: [] as string[],
    },
    {
      message: "feat: CMS Admin Panel - Site settings, content management, user administration",
      description: [
        "- Admin panel with organized sidebar navigation (General, Content, People groups)",
        "- Site Settings: branding, colors, social links configuration",
        "- SMTP Configuration with test email functionality",
        "- CMS Pages: CRUD with slug, HTML content, SEO metadata, publish status",
        "- File Manager: upload/delete with drag-drop support",
        "- User Management: list users, add users manually, role assignment",
        "- Contact Submissions: status tracking and management",
        "- Tracking Codes: Google Analytics, GTM, Facebook Pixel, and 15+ platforms",
        "- Payment Gateways configuration for Stripe",
      ].join("\n"),
      files: [] as string[],
    },
    {
      message: "feat: Blog, Guides, Case Studies - Admin CRUD with rich HTML editor and public pages",
      description: [
        "- Blog Posts: full CRUD in admin panel with rich HTML editor (visual + source modes)",
        "- Guides: full CRUD with category, difficulty level, and sort order management",
        "- Case Studies: full CRUD with company info, metrics (JSON), quotes, and testimonials",
        "- Rich HTML Editor component with formatting toolbar",
        "- Public listing pages at /blog, /guides, /case-studies with DB-driven content",
        "- Detail pages at /blog/:slug, /guides/:slug, /case-studies/:slug",
        "- SEO metadata support for all content types",
      ].join("\n"),
      files: [] as string[],
    },
    {
      message: "feat: Public website - Landing page, pricing, community, help center, and marketing pages",
      description: [
        "- Landing page with hero section, feature highlights, and CTA",
        "- Pricing page with pay-as-you-go model and feature comparison",
        "- Community hub with discussion forum, feature requests, and ideas pages",
        "- Help Center with categorized articles and detail pages",
        "- Use Cases, Capabilities, Connectors, and Documentation pages",
        "- Security page and Trust Center with compliance information",
        "- Contact page with SMTP-powered email notifications",
        "- Dynamic CMS page rendering at /page/:slug",
        "- Public navbar with responsive navigation and mobile menu",
      ].join("\n"),
      files: [] as string[],
    },
    {
      message: "feat: SEO & Marketing tools - Site Audit, Search Console, PPC, Content Gap analysis",
      description: [
        "- Site Audit: HTML crawling with SEO issue detection and scoring",
        "- Search Console integration for keyword tracking",
        "- PPC Campaign management module",
        "- Content Gap analysis tool",
        "- Custom report builder with AI-powered generation",
      ].join("\n"),
      files: [] as string[],
    },
    {
      message: "feat: Privacy & Compliance - GDPR consent management, data subject rights, tracking snippet",
      description: [
        "- Customizable consent banner with 6 categories, 3 layouts, 5 positions",
        "- Two-step consent flow (banner + preferences modal)",
        "- Third-party banner integration (CookieYes, OneTrust, Cookiebot, etc.)",
        "- Right to Erasure and Data Portability",
        "- IP anonymization and DNT header respect",
        "- Cookieless tracking mode support",
        "- GDPR-compliant JavaScript tracking snippet generator",
        "- Support for 55+ global privacy jurisdictions",
      ].join("\n"),
      files: [] as string[],
    },
    {
      message: "docs: Project documentation - README, whitepaper, license, and configuration",
      description: [
        "- Comprehensive README.md with setup instructions and feature overview",
        "- Technical whitepaper detailing platform architecture",
        "- MIT License",
        "- Environment variable template (.env.example)",
        "- TypeScript and build configuration",
        "- Community guidelines (CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md)",
      ].join("\n"),
      files: [] as string[],
    },
  ];

  for (const file of allFiles) {
    const rel = path.relative(ROOT, file);

    if (rel.match(/^(README|whitepaper|LICENSE|CONTRIBUTING|CODE_OF_CONDUCT|SECURITY)\./i) ||
        rel === ".env.example" || rel === ".gitignore" ||
        rel.match(/^(tsconfig|vite\.config|drizzle\.config|tailwind\.config|postcss\.config|components\.json)/)) {
      groups[8].files.push(rel);
    }
    else if (rel.startsWith("shared/")) {
      groups[0].files.push(rel);
    }
    else if (rel === "server/storage.ts" || rel === "server/index.ts" || rel === "server/db.ts" ||
             rel === "server/auth.ts" || rel === "server/vite.ts" ||
             rel === "server/stripeClient.ts" || rel === "server/stripe-billing.ts" || rel === "server/webhookHandlers.ts") {
      groups[0].files.push(rel);
    }
    else if (rel === "server/routes.ts") {
      groups[0].files.push(rel);
    }
    else if (rel.match(/client\/src\/pages\/(ai-insights|predictive-analytics|ux-auditor|marketing-copilot|knowledge)/)) {
      groups[2].files.push(rel);
    }
    else if (rel === "client/src/components/floating-ai-assistant.tsx" || rel === "client/src/components/feature-guide.tsx") {
      groups[2].files.push(rel);
    }
    else if (rel === "client/src/pages/admin.tsx" || rel === "client/src/components/html-editor.tsx") {
      groups[3].files.push(rel);
    }
    else if (rel.match(/client\/src\/pages\/public\/(blog|guide|case-stud)/)) {
      groups[4].files.push(rel);
    }
    else if (rel.match(/client\/src\/pages\/public\//)) {
      groups[5].files.push(rel);
    }
    else if (rel.match(/client\/src\/pages\/(seo|ppc|site-audit|search-console|content-gap|site-research|reports)/)) {
      groups[6].files.push(rel);
    }
    else if (rel.match(/client\/src\/pages\/(privacy|snippet)/) || rel === "client/src/pages/consent-banner-preview.tsx") {
      groups[7].files.push(rel);
    }
    else if (rel.startsWith("client/src/components/") || rel.startsWith("client/src/lib/") || rel.startsWith("client/src/hooks/")) {
      groups[1].files.push(rel);
    }
    else if (rel.startsWith("client/")) {
      groups[1].files.push(rel);
    }
    else if (rel === "package.json" || rel === "package-lock.json") {
      groups[0].files.push(rel);
    }
    else {
      groups[0].files.push(rel);
    }
  }

  return groups.filter(g => g.files.length > 0);
}

async function main() {
  console.log("Connecting to GitHub...");
  const octokit = await getOctokit();

  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);

  console.log("\nCollecting files...");
  const allFiles = getAllFiles(ROOT);
  console.log(`Found ${allFiles.length} files to push`);

  const commitGroups = categorizeFiles(allFiles);
  console.log(`\nOrganized into ${commitGroups.length} feature commits:`);
  commitGroups.forEach((g, i) => console.log(`  ${i + 1}. ${g.message} (${g.files.length} files)`));

  let parentSha: string | null = null;
  try {
    const { data: ref } = await octokit.git.getRef({ owner: REPO_OWNER, repo: REPO_NAME, ref: `heads/${BRANCH}` });
    parentSha = ref.object.sha;
    console.log(`\nExisting branch found. Parent: ${parentSha.slice(0, 7)}`);
  } catch {
    console.log("\nNo existing branch, will create from scratch");
  }

  let cumulativeFiles: FileEntry[] = [];

  for (let i = 0; i < commitGroups.length; i++) {
    const group = commitGroups[i];
    console.log(`\n--- Commit ${i + 1}/${commitGroups.length}: ${group.message} ---`);

    for (const relPath of group.files) {
      const fullPath = path.join(ROOT, relPath);
      try {
        if (isBinaryFile(fullPath)) {
          const content = fs.readFileSync(fullPath).toString("base64");
          cumulativeFiles.push({ path: relPath, content, encoding: "base64" });
        } else {
          const content = fs.readFileSync(fullPath, "utf-8");
          cumulativeFiles.push({ path: relPath, content, encoding: "utf-8" });
        }
      } catch (err: any) {
        console.warn(`  Skipping ${relPath}: ${err.message}`);
      }
    }

    console.log(`  Uploading ${group.files.length} files (${cumulativeFiles.length} total cumulative)...`);

    const batchSize = 50;
    const treeItems: any[] = [];
    for (let j = 0; j < cumulativeFiles.length; j += batchSize) {
      const batch = cumulativeFiles.slice(j, j + batchSize);
      const promises = batch.map(async file => {
        const blob = await octokit.git.createBlob({
          owner: REPO_OWNER, repo: REPO_NAME,
          content: file.content, encoding: file.encoding
        });
        return { path: file.path, mode: "100644" as const, type: "blob" as const, sha: blob.data.sha };
      });
      const results = await Promise.all(promises);
      treeItems.push(...results);
      process.stdout.write(`  Uploaded ${Math.min(j + batchSize, cumulativeFiles.length)}/${cumulativeFiles.length} blobs\r`);
    }
    console.log();

    const baseTree = parentSha ? (await octokit.git.getCommit({ owner: REPO_OWNER, repo: REPO_NAME, commit_sha: parentSha })).data.tree.sha : undefined;

    const tree = await octokit.git.createTree({
      owner: REPO_OWNER, repo: REPO_NAME,
      tree: treeItems,
      base_tree: baseTree
    });

    const commitData: any = {
      owner: REPO_OWNER, repo: REPO_NAME,
      message: `${group.message}\n\n${group.description}`,
      tree: tree.data.sha,
    };
    if (parentSha) commitData.parents = [parentSha];

    const commit = await octokit.git.createCommit(commitData);
    parentSha = commit.data.sha;
    console.log(`  Commit created: ${commit.data.sha.slice(0, 7)}`);
  }

  console.log(`\nUpdating ref heads/${BRANCH} to ${parentSha!.slice(0, 7)}...`);
  try {
    await octokit.git.updateRef({
      owner: REPO_OWNER, repo: REPO_NAME,
      ref: `heads/${BRANCH}`, sha: parentSha!, force: true
    });
  } catch {
    await octokit.git.createRef({
      owner: REPO_OWNER, repo: REPO_NAME,
      ref: `refs/heads/${BRANCH}`, sha: parentSha!
    });
  }

  console.log("\nDone! All commits pushed to GitHub:");
  console.log(`https://github.com/${REPO_OWNER}/${REPO_NAME}`);
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
