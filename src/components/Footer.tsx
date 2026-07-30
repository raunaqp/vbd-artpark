// Build stamp now comes from src/lib/build_info.ts, shared with the
// "How to use" page so the two cannot disagree.
import { APP_VERSION, BUILD_SHA, BUILD_TIME, BUILT_BY } from "@/lib/build_info";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card px-6 py-2">
      <p className="text-[11px] text-muted-foreground text-center">
        VBD dashboard · v{APP_VERSION} · Built by {BUILT_BY} · Build {BUILD_SHA} · {BUILD_TIME}
      </p>
    </footer>
  );
}
