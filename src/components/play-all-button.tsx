import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConvex } from "convex/react";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { usePlayer } from "@/hooks/use-player.ts";
import type { QueueItem } from "@/lib/player-context.ts";

// Replaces the queue and starts the first video.
// Without `videos`, it loads the whole catalog on click.
export default function PlayAllButton({ videos }: { videos?: QueueItem[] }) {
  const { setQueue, shuffle } = usePlayer();
  const convex = useConvex();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (videos && videos.length === 0) return null;

  const start = async () => {
    setBusy(true);
    try {
      const source = videos ?? (await convex.query(api.videos.listForQueue, {}));
      if (source.length === 0) {
        toast.error("No videos to play yet");
        return;
      }
      const items = source.map((v) => ({
        _id: v._id,
        title: v.title,
        artist: v.artist,
        thumbnailUrl: v.thumbnailUrl,
      }));
      setQueue(items);
      const first = shuffle ? items[Math.floor(Math.random() * items.length)] : items[0];
      navigate(`/watch/${first._id}`);
    } catch {
      toast.error("Could not load videos. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button onClick={start} disabled={busy}>
      {busy ? <Spinner /> : <Play className="size-4 fill-current" />} Play all
    </Button>
  );
}
