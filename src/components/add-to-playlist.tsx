import { useState } from "react";
import { Authenticated, useMutation, useQuery } from "convex/react";
import { Check, ListPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";

function PlaylistPicker({ videoId }: { videoId: Id<"videos"> }) {
  const playlists = useQuery(api.playlists.listForVideo, { videoId });
  const addVideo = useMutation(api.playlists.addVideo);
  const removeVideo = useMutation(api.playlists.removeVideo);
  const create = useMutation(api.playlists.create);
  const [name, setName] = useState("");

  const toggle = async (playlistId: Id<"playlists">, contains: boolean) => {
    if (contains) await removeVideo({ playlistId, videoId });
    else await addVideo({ playlistId, videoId });
  };

  const createAndAdd = async () => {
    if (!name.trim()) return;
    const playlistId = await create({ name });
    await addVideo({ playlistId, videoId });
    setName("");
    toast.success("Added to new playlist");
  };

  return (
    <div className="space-y-4">
      <div className="max-h-60 space-y-1 overflow-y-auto">
        {playlists === undefined ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : playlists.length === 0 ? (
          <p className="text-sm text-muted-foreground">No playlists yet. Create your first below.</p>
        ) : (
          playlists.map((p) => (
            <button
              key={p._id}
              onClick={() => toggle(p._id, p.contains)}
              className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left hover:bg-muted"
            >
              <span className="truncate">{p.name}</span>
              {p.contains && <Check className="size-4 text-primary" />}
            </button>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="New playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
        />
        <Button onClick={createAndAdd} disabled={!name.trim()}>
          <Plus className="size-4" /> Create
        </Button>
      </div>
    </div>
  );
}

export default function AddToPlaylist({ videoId }: { videoId: Id<"videos"> }) {
  return (
    <Authenticated>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm">
            <ListPlus className="size-4" /> Playlist
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to playlist</DialogTitle>
          </DialogHeader>
          <PlaylistPicker videoId={videoId} />
        </DialogContent>
      </Dialog>
    </Authenticated>
  );
}
