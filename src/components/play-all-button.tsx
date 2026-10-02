import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { usePlayer } from "@/hooks/use-player.ts";
import type { QueueItem } from "@/lib/player-context.ts";

// Replaces the queue with the given videos and starts the first one
export default function PlayAllButton({ videos }: { videos: QueueItem[] }) {
  const { setQueue, shuffle } = usePlayer();
  const navigate = useNavigate();
  if (videos.length === 0) return null;

  const start = () => {
    const items = videos.map((v) => ({
      _id: v._id,
      title: v.title,
      artist: v.artist,
      thumbnailUrl: v.thumbnailUrl,
    }));
    setQueue(items);
    const first = shuffle ? items[Math.floor(Math.random() * items.length)] : items[0];
    navigate(`/watch/${first._id}`);
  };

  return (
    <Button onClick={start}>
      <Play className="size-4 fill-current" /> Play all
    </Button>
  );
}
