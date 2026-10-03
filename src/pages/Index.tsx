import { useState } from "react";
import { Link } from "react-router-dom";
import { Authenticated, usePaginatedQuery, useQuery } from "convex/react";
import { motion } from "motion/react";
import { Download, Film, ListMusic, Music, Play, Search, WifiOff } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { useDebounce } from "@/hooks/use-debounce.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import UploadVideoDialog from "./_components/upload-video-dialog.tsx";
import PlayAllButton from "@/components/play-all-button.tsx";
import VideoCard, { type VideoItem } from "./_components/video-card.tsx";

const PERKS = [
  { icon: WifiOff, label: "Plays offline" },
  { icon: Download, label: "Save to device" },
  { icon: ListMusic, label: "Playlists & queue" },
] as const;

function AdminBar() {
  const me = useQuery(api.users.getCurrentUser, {});
  return me?.role === "admin" ? <UploadVideoDialog /> : null;
}

function FeaturedVideo({ video }: { video: VideoItem }) {
  return (
    <Link
      to={`/watch/${video._id}`}
      className="group relative block aspect-video cursor-pointer overflow-hidden rounded-3xl border bg-muted shadow-2xl shadow-primary/20"
    >
      {video.thumbnailUrl ? (
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/50 to-secondary">
          <Music className="size-16 text-foreground/60" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
        Now featured
      </span>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
        <div className="min-w-0">
          <p className="truncate font-[Syne] text-2xl font-extrabold">{video.title}</p>
          <p className="truncate text-sm text-white/75">{video.artist}</p>
        </div>
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
          <Play className="size-6 fill-current" />
        </span>
      </div>
    </Link>
  );
}

export default function Index() {
  const [sort, setSort] = useState<"newest" | "artist">("newest");
  const [searchText, setSearchText] = useState("");
  const [debounced] = useDebounce(searchText.trim(), 300);
  const { results, status, loadMore } = usePaginatedQuery(
    api.videos.list,
    { sort },
    { initialNumItems: 12 },
  );
  const searching = debounced.length > 0;
  const found = useQuery(api.videos.search, searching ? { text: debounced } : "skip");
  const featured = sort === "newest" ? results[0] : undefined;
  const shown = searching ? found : featured ? results.slice(1) : results;
  const loading = searching ? found === undefined : status === "LoadingFirstPage";
  const startIndex = featured ? 2 : 1;

  return (
    <div className="relative overflow-hidden">
      {/* Ambient glow blobs for atmosphere */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-[28rem] rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-40 size-[30rem] rounded-full bg-chart-4/20 blur-3xl" />

      <main className="relative mx-auto max-w-7xl space-y-14 px-4 py-10">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="min-w-0 space-y-6"
          >
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Music videos, unplugged
            </p>
            <h1 className="text-balance font-[Syne] text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-5xl md:text-7xl">
              Watch loud.
              <br />
              <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                Anywhere.
              </span>
            </h1>
            <p className="max-w-md text-muted-foreground">
              Download your favorite videos and songs once and play them on a plane, in a tunnel
              or in the middle of nowhere.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <PlayAllButton />
              <Button asChild variant="secondary">
                <Link to="/downloads">
                  <Download className="size-4" /> My downloads
                </Link>
              </Button>
              <Authenticated>
                <AdminBar />
              </Authenticated>
            </div>
            <ul className="flex flex-wrap gap-2 pt-2">
              {PERKS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1.5 text-sm backdrop-blur"
                >
                  <Icon className="size-4 text-primary" /> {label}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            {featured ? (
              <FeaturedVideo video={featured} />
            ) : status === "LoadingFirstPage" ? (
              <Skeleton className="aspect-video w-full rounded-3xl" />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-3xl border border-dashed bg-card/50">
                <Film className="size-12 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3">
            <h2 className="font-[Syne] text-3xl font-extrabold tracking-tight">The reel</h2>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search title or artist"
                  className="pl-9"
                  aria-label="Search videos"
                />
              </div>
              <Select value={sort} onValueChange={(s) => setSort(s === "artist" ? "artist" : "newest")}>
                <SelectTrigger className="w-36" aria-label="Sort videos">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="artist">Artist A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading || shown === undefined ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video w-full" />
              ))}
            </div>
          ) : searching && shown.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>No matches</EmptyTitle>
                <EmptyDescription>Nothing found for "{debounced}". Try another word.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : results.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Film />
                </EmptyMedia>
                <EmptyTitle>No videos yet</EmptyTitle>
                <EmptyDescription>
                  The first person to sign in becomes the admin and can add videos.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((v, i) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05, ease: "easeOut" }}
                >
                  <VideoCard video={v} index={searching ? i + 1 : i + startIndex} />
                </motion.div>
              ))}
            </div>
          )}

          {!searching && status === "CanLoadMore" && (
            <div className="text-center">
              <Button variant="secondary" onClick={() => loadMore(12)}>
                Load more
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
