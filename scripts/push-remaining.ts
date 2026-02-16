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

const IGNORE_PATTERNS = [
  "node_modules", ".git", "dist", "server/public", ".env", ".env.local",
  ".env.production", ".env.development", ".DS_Store", "Thumbs.db",
  "uploads", ".replit", ".config", ".cache", ".upm", ".local",
  "generated-icon.png", "attached_assets", "scripts/",
  ".breakpoints", "replit.nix", "replit_zip_error_log.txt",
  ".prettierrc", ".eslintrc", "replit.md"
];

function shouldIgnore(filePath: string): boolean {
  const rel = path.relative(ROOT, filePath);
  for (const pattern of IGNORE_PATTERNS) {
    if (rel === pattern || rel.startsWith(pattern + "/") || rel.startsWith(pattern + "\\")) return true;
  }
  if (rel.startsWith(".")) {
    const firstPart = rel.split("/")[0];
    if (firstPart.startsWith(".") && firstPart !== ".gitignore" && firstPart !== ".env.example") return true;
  }
  return false;
}

function getAllFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldIgnore(fullPath)) continue;
    if (entry.isDirectory()) results.push(...getAllFiles(fullPath));
    else if (entry.isFile()) results.push(fullPath);
  }
  return results;
}

function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return [".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".svg", ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".mp3", ".pdf", ".zip", ".tar", ".gz"].includes(ext);
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log("Connecting to GitHub...");
  const token = await getAccessToken();
  const octokit = new Octokit({ auth: token });
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);

  console.log("\nCollecting ALL files...");
  const allFiles = getAllFiles(ROOT);
  console.log(`Found ${allFiles.length} files total`);

  let parentSha: string | null = null;
  try {
    const { data: ref } = await octokit.git.getRef({ owner: REPO_OWNER, repo: REPO_NAME, ref: `heads/${BRANCH}` });
    parentSha = ref.object.sha;
    console.log(`Existing branch parent: ${parentSha.slice(0, 7)}`);
  } catch {
    console.log("No existing branch");
  }

  console.log("\nUploading blobs (with rate limit handling)...");
  const treeItems: any[] = [];
  const batchSize = 20;

  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    let retries = 0;
    while (retries < 5) {
      try {
        const promises = batch.map(async fullPath => {
          const rel = path.relative(ROOT, fullPath);
          const isBin = isBinaryFile(fullPath);
          const content = isBin
            ? fs.readFileSync(fullPath).toString("base64")
            : fs.readFileSync(fullPath, "utf-8");
          const blob = await octokit.git.createBlob({
            owner: REPO_OWNER, repo: REPO_NAME,
            content, encoding: isBin ? "base64" : "utf-8"
          });
          return { path: rel, mode: "100644" as const, type: "blob" as const, sha: blob.data.sha };
        });
        const results = await Promise.all(promises);
        treeItems.push(...results);
        console.log(`  Uploaded ${Math.min(i + batchSize, allFiles.length)}/${allFiles.length}`);
        break;
      } catch (err: any) {
        if (err.status === 403 || err.message?.includes("rate limit")) {
          retries++;
          const waitTime = 30 * retries;
          console.log(`  Rate limited, waiting ${waitTime}s (attempt ${retries}/5)...`);
          await sleep(waitTime * 1000);
        } else {
          throw err;
        }
      }
    }
  }

  console.log(`\nCreating tree with ${treeItems.length} items...`);
  const baseTree = parentSha
    ? (await octokit.git.getCommit({ owner: REPO_OWNER, repo: REPO_NAME, commit_sha: parentSha })).data.tree.sha
    : undefined;

  const tree = await octokit.git.createTree({
    owner: REPO_OWNER, repo: REPO_NAME,
    tree: treeItems,
    base_tree: baseTree
  });

  const commitMessage = `feat: AI Digital Analyst Platform - Full CMS SaaS with analytics, AI features, and GDPR compliance

Complete platform including:
- PostgreSQL database with Drizzle ORM (30+ tables)
- Express.js backend with TypeScript REST API
- React 18 + Vite + Tailwind CSS + Shadcn UI frontend
- Custom auth (email/password + Google OAuth)
- GA4-style analytics dashboard with real-time metrics
- AI features: Insights, Predictive Analytics, UX Auditor, Marketing Copilot
- CMS Admin Panel with Blog, Guides, Case Studies management
- Rich HTML editor with visual and source modes
- GDPR/Privacy compliance with consent management (55+ jurisdictions)
- SEO tools: Site Audit, Search Console, Content Gap analysis
- PPC Campaign management
- Stripe pay-as-you-go billing for AI features
- Knowledge Center with learning paths
- Public website with landing page, pricing, community, help center
- SMTP email integration for contact forms
- File Manager with drag-drop uploads
- Tracking code injection for 15+ platforms`;

  console.log("Creating commit...");
  const commitData: any = {
    owner: REPO_OWNER, repo: REPO_NAME,
    message: commitMessage,
    tree: tree.data.sha,
  };
  if (parentSha) commitData.parents = [parentSha];

  const commit = await octokit.git.createCommit(commitData);
  console.log(`Commit created: ${commit.data.sha.slice(0, 7)}`);

  console.log(`Updating ref heads/${BRANCH}...`);
  try {
    await octokit.git.updateRef({
      owner: REPO_OWNER, repo: REPO_NAME,
      ref: `heads/${BRANCH}`, sha: commit.data.sha, force: true
    });
  } catch {
    await octokit.git.createRef({
      owner: REPO_OWNER, repo: REPO_NAME,
      ref: `refs/heads/${BRANCH}`, sha: commit.data.sha
    });
  }

  console.log(`\nSuccessfully pushed to https://github.com/${REPO_OWNER}/${REPO_NAME}`);
}

main().catch(err => {
  console.error("Error:", err.message);
  if (err.response?.data) console.error("Details:", JSON.stringify(err.response.data, null, 2));
  process.exit(1);
});
