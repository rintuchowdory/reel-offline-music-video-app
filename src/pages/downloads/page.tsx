import { useMemo } from "react";
import { Link } from "react-router-dom";
import { DownloadCloud, Music, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { removeDownload, useOfflineLibrary } from "@/hooks/use-offline-library.ts";
import type { OfflineVideo } from "@/lib/offline-db.ts";

function useThumbUrl(blob: Blob | null) {
  // Object URLs are tiny handles; memoized so they're created once per blob
  return useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
}

function DownloadCard({ item }: { item: OfflineVideo }) {
  const thumb = useThumbUrl(item.thumbnail);
  return (
    <div className="group">
      <Link to={`/watch/${item.id}`} className="block cursor-pointer">
        <div className="aspect-video overflow-hidden rounded-xl bg-muted">
          {thumb ? (
            <img src={thumb} alt={item.title} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/40 to-secondary">
              <Music className="size-10 text-foreground/60" />
            </div>
          )}
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2 pt-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{item.title}</p>
          <p className="truncate text-sm text-muted-foreground">
            {item.artist} · {(item.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Remove download"
          onClick={() => removeDownload(item.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Downloads() {
  const { items } = useOfflineLibrary();

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <div>
        <h1 className="font-[Syne] text-4xl font-extrabold tracking-tight">Downloads</h1>
        <p className="text-muted-foreground">Saved on this device. Plays without internet.</p>
      </div>
      {items === undefined ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <DownloadCloud />
            </EmptyMedia>
            <EmptyTitle>Nothing saved yet</EmptyTitle>
            <EmptyDescription>Download a video while online to watch it anywhere.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="sm">
              <Link to="/">Browse videos</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((i) => (
            <DownloadCard key={i.id} item={i} />
          ))}
        </div>
      )}
    </main>
  );
}
