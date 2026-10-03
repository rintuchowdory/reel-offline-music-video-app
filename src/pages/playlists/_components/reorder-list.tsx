import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

export type PlaylistVideo = {
  _id: Id<"videos">;
  title: string;
  artist: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
};

/**
 * Sortable track list used in the playlist "Organize" mode.
 * Supports drag-and-drop (desktop) and up/down buttons (touch/keyboard).
 */
export default function ReorderList({
  videos,
  onReorder,
}: {
  videos: PlaylistVideo[];
  onReorder: (next: PlaylistVideo[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= videos.length || from === to) return;
    const next = [...videos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  };

  return (
    <ol className="space-y-2">
      {videos.map((video, index) => (
        <li
          key={video._id}
          draggable
          onDragStart={(e) => {
            setDragIndex(index);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setOverIndex(index);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex !== null) move(dragIndex, index);
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={`flex items-center gap-3 rounded-lg border bg-card px-3 py-2 select-none ${
            dragIndex === index
              ? "opacity-40"
              : overIndex === index && dragIndex !== null
                ? "border-primary"
                : "border-input"
          }`}
        >
          <GripVertical
            className="size-4 shrink-0 cursor-grab text-muted-foreground"
            aria-hidden
          />
          <span className="w-6 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{video.title}</span>
            <span className="block truncate text-sm text-muted-foreground">
              {video.artist}
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Move ${video.title} up`}
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Move ${video.title} down`}
              disabled={index === videos.length - 1}
              onClick={() => move(index, index + 1)}
            >
              <ArrowDown className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ol>
  );
}
