import { useState } from "react";
import { Link } from "react-router-dom";
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";

function PlaylistsInner() {
  const playlists = useQuery(api.playlists.list, {});
  const create = useMutation(api.playlists.create);
  const remove = useMutation(api.playlists.remove);
  const [name, setName] = useState("");

  const submit = async () => {
    if (!name.trim()) return;
    await create({ name });
    setName("");
    toast.success("Playlist created");
  };

  return (
    <div className="space-y-6">
      <div className="flex max-w-md gap-2">
        <Input
          placeholder="New playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Button onClick={submit} disabled={!name.trim()}>
          <Plus className="size-4" /> Create
        </Button>
      </div>
      {playlists === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListMusic />
            </EmptyMedia>
            <EmptyTitle>No playlists yet</EmptyTitle>
            <EmptyDescription>Create one above, then add videos from any video page.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((p) => (
            <Card key={p._id} className="flex-row items-center justify-between gap-2 px-4 py-4">
              <Link to={`/playlists/${p._id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <ListMusic className="size-5" />
                </span>
                <span className="truncate font-semibold">{p.name}</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete playlist"
                onClick={() => remove({ id: p._id })}
              >
                <Trash2 className="size-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Playlists() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <h1 className="font-[Syne] text-4xl font-extrabold tracking-tight">Playlists</h1>
      <AuthLoading>
        <Skeleton className="h-20 w-full" />
      </AuthLoading>
      <Unauthenticated>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListMusic />
            </EmptyMedia>
            <EmptyTitle>Sign in to use playlists</EmptyTitle>
            <EmptyDescription>Your playlists sync across all your devices.</EmptyDescription>
          </EmptyHeader>
          <SignInButton />
        </Empty>
      </Unauthenticated>
      <Authenticated>
        <PlaylistsInner />
      </Authenticated>
    </main>
  );
}
