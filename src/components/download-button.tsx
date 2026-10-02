import { Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
  downloadVideo,
  removeDownload,
  useOfflineLibrary,
  type DownloadableVideo,
} from "@/hooks/use-offline-library.ts";

export default function DownloadButton({ video }: { video: DownloadableVideo }) {
  const { isSaved, progressOf } = useOfflineLibrary();
  const p = progressOf(video._id);

  if (p !== undefined) {
    return (
      <Button variant="secondary" size="sm" disabled>
        <Spinner /> {p > 0 ? `${Math.round(p * 100)}%` : "Saving..."}
      </Button>
    );
  }
  if (isSaved(video._id)) {
    return (
      <Button variant="secondary" size="sm" onClick={() => removeDownload(video._id)}>
        <Check className="size-4" /> Saved offline
      </Button>
    );
  }
  return (
    <Button size="sm" onClick={() => downloadVideo(video)} disabled={!video.videoUrl}>
      <Download className="size-4" /> Download
    </Button>
  );
}
