import { useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { Upload } from "lucide-react";
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
import { Label } from "@/components/ui/label.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

export default function UploadVideoDialog() {
  const generateUploadUrl = useMutation(api.videos.generateUploadUrl);
  const createVideo = useMutation(api.videos.create);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File): Promise<Id<"_storage">> => {
    const url = await generateUploadUrl();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("Upload failed");
    const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
    return storageId;
  };

  const submit = async () => {
    if (!video || !title.trim() || !artist.trim()) {
      toast.error("Add a title, artist and video file");
      return;
    }
    setBusy(true);
    try {
      const videoStorageId = await upload(video);
      const thumbnailStorageId = thumb ? await upload(thumb) : undefined;
      await createVideo({
        title: title.trim(),
        artist: artist.trim(),
        videoStorageId,
        thumbnailStorageId,
      });
      toast.success("Video added");
      setOpen(false);
      setTitle("");
      setArtist("");
      setVideo(null);
      setThumb(null);
    } catch (e) {
      toast.error(
        e instanceof ConvexError
          ? (e.data as { message: string }).message
          : "Could not add video",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="size-4" /> Add video
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a music video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Midnight City" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist">Artist</Label>
            <Input id="artist" placeholder="M83" value={artist} onChange={(e) => setArtist(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video">Video file</Label>
            <Input id="video" type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumb">Thumbnail (optional)</Label>
            <Input id="thumb" type="file" accept="image/*" onChange={(e) => setThumb(e.target.files?.[0] ?? null)} />
          </div>
          <Button className="w-full" onClick={submit} disabled={busy}>
            {busy ? <Spinner /> : null} {busy ? "Uploading..." : "Publish"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
