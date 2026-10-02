import { Link } from "react-router-dom";
import { Music, Play } from "lucide-react";

export type VideoItem = {
  _id: string;
  title: string;
  artist: string;
  thumbnailUrl: string | null;
};

export default function VideoCard({ video }: { video: VideoItem }) {
  return (
    <Link to={`/watch/${video._id}`} className="group block cursor-pointer">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/40 to-secondary">
            <Music className="size-10 text-foreground/60" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="size-5 fill-current" />
          </span>
        </div>
      </div>
      <div className="pt-3">
        <p className="truncate font-semibold">{video.title}</p>
        <p className="truncate text-sm text-muted-foreground">{video.artist}</p>
      </div>
    </Link>
  );
}
