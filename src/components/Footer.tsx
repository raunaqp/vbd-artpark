// Build stamp values are injected at build time by Vite (see vite.config.ts).
const buildSha = __BUILD_SHA__;
// ISO (always UTC) -> "YYYY-MM-DD HH:MM UTC"
const buildTime = `${__BUILD_TIME__.slice(0, 16).replace("T", " ")} UTC`;

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card px-6 py-2">
      <p className="text-[11px] text-muted-foreground text-center">
        VBD dashboard · v0.3 · Built by Dr. Raunaq Pradhan (Artpark) · Build {buildSha} · {buildTime}
      </p>
    </footer>
  );
}
