import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Authenticated, useMutation, useQuery } from "convex/react";
import { ArrowLeft, ListPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import DownloadButton from "@/components/download-button.tsx";
import AddToPlaylist from "@/components/add-to-playlist.tsx";
import PlayerControls from "@/components/player-controls.tsx";
import QueuePanel from "@/components/queue-panel.tsx";
import { usePlayer } from "@/hooks/use-player.ts";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useOfflineLibrary } from "@/hooks/use-offline-library.ts";

type Playable = {
  _id: string;
  title: string;
  artist: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
};

function DeleteButton({ id }: { id: Id<"videos"> }) {
  const me = useQuery(api.users.getCurrentUser, {});
  const remove = useMutation(api.videos.remove);
  const navigate = useNavigate();
  if (me?.role !== "admin") return null;
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={async () => {
        await remove({ id });
        toast.success("Video removed");
        navigate("/");
      }}
    >
      <Trash2 className="size-4" /> Delete
    </Button>
  );
}

// Builds a playable object from a saved copy; revokes blob URLs on cleanup
function useOfflinePlayable(id: string | undefined): Playable | null {
  const { items } = useOfflineLibrary();
  const saved = items?.find((i) => i.id === id);
  return useMemo(() => {
    if (!saved) return null;
    return {
      _id: saved.id,
      title: saved.title,
      artist: saved.artist,
      videoUrl: URL.createObjectURL(saved.video),
      thumbnailUrl: saved.thumbnail ? URL.createObjectURL(saved.thumbnail) : null,
    };
  }, [saved]);
}

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { repeat, getNext, addToQueue, queue } = usePlayer();
  const local = useOfflinePlayable(id);
  const remote = useQuery(api.videos.get, id && !local ? { id: id as Id<"videos"> } : "skip");
  const video: Playable | null | undefined = local ?? remote;

  const handleEnded = () => {
    if (!video) return;
    const next = getNext(video._id);
    if (next) navigate(`/watch/${next}`);
  };

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back
      </Link>
      {video === undefined ? (
        <Skeleton className="aspect-video w-full" />
      ) : video === null || !video.videoUrl ? (
        <p className="py-20 text-center text-muted-foreground">Video not found.</p>
      ) : (
        <>
          <video
            key={video._id}
            src={video.videoUrl}
            poster={video.thumbnailUrl ?? undefined}
            controls
            autoPlay
            loop={repeat === "one"}
            onEnded={handleEnded}
            playsInline
            className="aspect-video w-full rounded-xl bg-black"
          />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-[Syne] text-3xl font-bold">{video.title}</h1>
              <p className="text-muted-foreground">{video.artist}</p>
            </div>
            <PlayerControls currentId={video._id} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                addToQueue(video);
                toast.success("Added to queue");
              }}
              disabled={queue.some((q) => q._id === video._id)}
            >
              <ListPlus className="size-4" /> Add to queue
            </Button>
            <DownloadButton video={video} />
            {!local && <AddToPlaylist videoId={video._id as Id<"videos">} />}
            {!local && (
              <Authenticated>
                <DeleteButton id={video._id as Id<"videos">} />
              </Authenticated>
            )}
          </div>
          <QueuePanel currentId={video._id} />
        </>
      )}
    </main>
  );
}
