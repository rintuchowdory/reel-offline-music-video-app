import { Link } from "react-router-dom";
import { ListVideo, Music, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { usePlayer } from "@/hooks/use-player.ts";
import { cn } from "@/lib/utils.ts";

export default function QueuePanel({ currentId }: { currentId: string }) {
  const { queue, removeFromQueue, clearQueue } = usePlayer();

  return (
    <section className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <ListVideo className="size-4 text-primary" /> Up next ({queue.length})
        </h2>
        {queue.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearQueue}>
            Clear
          </Button>
        )}
      </div>
      {queue.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Your queue is empty. Add videos with "Add to queue", or use "Play all" on the home page or a playlist.
        </p>
      ) : (
        <ul className="max-h-80 space-y-1 overflow-y-auto">
          {queue.map((item) => (
            <li
              key={item._id}
              className={cn(
                "flex items-center gap-3 rounded-md p-2",
                item._id === currentId ? "bg-accent" : "hover:bg-muted",
              )}
            >
              <Link to={`/watch/${item._id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <div className="aspect-video w-20 shrink-0 overflow-hidden rounded bg-muted">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Music className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.artist}</p>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove from queue"
                className="size-8"
                onClick={() => removeFromQueue(item._id)}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
