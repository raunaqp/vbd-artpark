import { Info, X } from "lucide-react";
import { useState } from "react";

const DISMISS_KEY = "demo-disclaimer-dismissed";

/**
 * Slim, always-visible disclaimer bar pinned above the header.
 * Amber (informational, not a warning). Dismissible for the current
 * session only — a fresh/incognito visitor always sees it again.
 */
export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) !== "1";
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode / quota — hide for this render regardless */
    }
    setVisible(false);
  };

  return (
    <div
      role="status"
      className="relative flex min-h-8 items-center justify-center gap-2 border-b border-[#E9C46A] bg-[#FBF3E0] px-10 py-1.5 text-[#7A5A18]"
    >
      <Info className="h-3.5 w-3.5 flex-shrink-0 text-[#C8912B]" aria-hidden="true" />
      <p className="text-center text-xs font-medium">
        Demonstration environment — data shown is illustrative, not operational. For live
        surveillance, refer to the production dashboard.
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss demonstration notice"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#A9803A] transition-colors hover:bg-[#E9C46A]/30 hover:text-[#7A5A18]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
