import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { offlineDb, type OfflineVideo } from "@/lib/offline-db.ts";

export type DownloadableVideo = {
  _id: string;
  title: string;
  artist: string;
  kind?: "video" | "audio";
  videoUrl: string | null;
  thumbnailUrl: string | null;
};

// Module-level state so every component sees the same downloads and progress
const changeTarget = new EventTarget();
const progress = new Map<string, number>();
const notify = () => changeTarget.dispatchEvent(new Event("change"));

async function fetchBlob(url: string, onProgress?: (p: number) => void): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error("Download failed");
  const total = Number(res.headers.get("content-length") ?? 0);
  const reader = res.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value as Uint8Array<ArrayBuffer>);
    received += value.length;
    if (total && onProgress) onProgress(received / total);
  }
  return new Blob(chunks, { type: res.headers.get("content-type") ?? "video/mp4" });
}

export async function downloadVideo(video: DownloadableVideo) {
  if (!video.videoUrl || progress.has(video._id)) return;
  progress.set(video._id, 0);
  notify();
  try {
    const blob = await fetchBlob(video.videoUrl, (p) => {
      progress.set(video._id, p);
      notify();
    });
    const thumbnail = video.thumbnailUrl ? await fetchBlob(video.thumbnailUrl) : null;
    await offlineDb.put({
      id: video._id,
      title: video.title,
      artist: video.artist,
      kind: video.kind ?? "video",
      video: blob,
      thumbnail,
      size: blob.size,
      savedAt: new Date().toISOString(),
    });
    toast.success(`Saved "${video.title}" for offline`);
  } catch {
    toast.error("Download failed. Check your connection and try again.");
  } finally {
    progress.delete(video._id);
    notify();
  }
}

export async function removeDownload(id: string) {
  await offlineDb.remove(id);
  notify();
}

export function useOfflineLibrary() {
  // undefined while loading
  const [items, setItems] = useState<OfflineVideo[] | undefined>(undefined);
  const [, setTick] = useState(0);

  const refresh = useCallback(async () => {
    setItems(await offlineDb.list());
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const handler = () => void refresh();
    changeTarget.addEventListener("change", handler);
    handler();
    return () => changeTarget.removeEventListener("change", handler);
  }, [refresh]);

  return {
    items,
    isSaved: (id: string) => items?.some((i) => i.id === id) ?? false,
    progressOf: (id: string) => progress.get(id),
  };
}

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
