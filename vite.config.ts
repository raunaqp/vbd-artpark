import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { componentTagger } from "lovable-tagger";

// Resolve the commit SHA straight from the `.git` directory, no `git` binary
// needed. Lovable's build container has neither the CI env vars below nor `git`
// in PATH, but a GitHub-connected checkout still ships `.git`, so this recovers
// the real SHA there. Returns null if `.git` isn't present (e.g. tarball build).
function shaFromGitDir(): string | null {
  try {
    const gitDir = path.join(__dirname, ".git");
    if (!existsSync(gitDir)) return null;
    const head = readFileSync(path.join(gitDir, "HEAD"), "utf8").trim();
    if (!head.startsWith("ref:")) return head; // detached HEAD → raw sha
    const ref = head.slice(4).trim(); // e.g. "refs/heads/main"
    const looseRef = path.join(gitDir, ref);
    if (existsSync(looseRef)) return readFileSync(looseRef, "utf8").trim();
    // packed-refs fallback (refs get packed away by `git gc`)
    const packed = path.join(gitDir, "packed-refs");
    if (existsSync(packed)) {
      const line = readFileSync(packed, "utf8").split("\n").find((l) => l.endsWith(` ${ref}`));
      if (line) return line.split(" ")[0];
    }
    return null;
  } catch {
    return null;
  }
}

// Build stamp injected at build time (see Footer.tsx). Resolution order:
// CI commit-SHA env (Vercel / GitHub / Netlify) → `git` binary → `.git` files → "dev".
const buildSha = (() => {
  const ciSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.COMMIT_REF;
  if (ciSha) return ciSha.slice(0, 7);
  try {
    const s = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    if (s) return s;
  } catch {
    // git binary unavailable — fall through to reading .git directly
  }
  const fileSha = shaFromGitDir();
  return fileSha ? fileSha.slice(0, 7) : "dev";
})();
const buildTime = new Date().toISOString();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __BUILD_SHA__: JSON.stringify(buildSha),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
