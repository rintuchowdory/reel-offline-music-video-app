import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Authenticated, useMutation, useQuery } from "convex/react";
import { ArrowLeft, ListMusic, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import VideoCard from "@/pages/_components/video-card.tsx";
import PlayAllButton from "@/components/play-all-button.tsx";
import ReorderList, {
  type PlaylistVideo,
} from "@/pages/playlists/_components/reorder-list.tsx";

function PlaylistInner({ id }: { id: Id<"playlists"> }) {
  const playlist = useQuery(api.playlists.get, { id });
  const removeVideo = useMutation(api.playlists.removeVideo);
  const removePlaylist = useMutation(api.playlists.remove);
  const reorder = useMutation(api.playlists.reorder);
  const navigate = useNavigate();

  // "Organize" mode: track the working order locally until the user is done
  const [organizing, setOrganizing] = useState(false);
  const [order, setOrder] = useState<PlaylistVideo[] | null>(null);

  if (playlist === undefined) return <Skeleton className="h-40 w-full" />;

  const videos = order ?? playlist.videos;

  const persistOrder = async (next: PlaylistVideo[]) => {
    setOrder(next);
    try {
      await reorder({ playlistId: id, videoIds: next.map((v) => v._id) });
    } catch {
      toast.error("Could not save the new order");
      setOrder(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-[Syne] text-4xl font-extrabold tracking-tight">
          {playlist.name}
        </h1>
        <div className="flex items-center gap-2">
          <PlayAllButton videos={videos} />
          {playlist.videos.length > 1 && (
            <Button
              variant={organizing ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                if (organizing) setOrder(null);
                setOrganizing(!organizing);
              }}
            >
              {organizing ? "Done" : "Organize"}
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              await removePlaylist({ id });
              navigate("/playlists");
            }}
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>
      {playlist.videos.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListMusic />
            </EmptyMedia>
            <EmptyTitle>This playlist is empty</EmptyTitle>
            <EmptyDescription>
              Open any video and tap Playlist to add it here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : organizing ? (
        <ReorderList videos={videos} onReorder={persistOrder} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v) => (
            <div key={v._id} className="relative">
              <VideoCard video={v} />
              <Button
                variant="secondary"
                size="icon"
                aria-label="Remove from playlist"
                className="absolute right-2 top-2 size-8"
                onClick={() => removeVideo({ playlistId: id, videoId: v._id })}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <Link
        to="/playlists"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All playlists
      </Link>
      <Authenticated>
        {id && <PlaylistInner id={id as Id<"playlists">} />}
      </Authenticated>
    </main>
  );
}
