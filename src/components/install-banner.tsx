import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

type InstallEvent = Event & { prompt: () => Promise<void> };

// Chromium-only install prompt; hidden inside the builder preview iframe
export default function InstallBanner() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!evt || dismissed || window.self !== window.top) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border bg-card p-3 shadow-lg">
      <Download className="size-5 shrink-0 text-primary" />
      <p className="flex-1 text-sm">Install Reel to watch your downloads anytime.</p>
      <Button size="sm" onClick={() => evt.prompt().then(() => setEvt(null))}>
        Install
      </Button>
      <button aria-label="Dismiss" className="cursor-pointer" onClick={() => setDismissed(true)}>
        <X className="size-4" />
      </button>
    </div>
  );
}
