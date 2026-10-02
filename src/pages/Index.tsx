import { Authenticated, usePaginatedQuery, useQuery } from "convex/react";
import { Film } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
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
import VideoCard from "./_components/video-card.tsx";

function AdminBar() {
  const me = useQuery(api.users.getCurrentUser, {});
  return me?.role === "admin" ? <UploadVideoDialog /> : null;
}

export default function Index() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.videos.list,
    {},
    { initialNumItems: 12 },
  );

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-balance font-[Syne] text-4xl font-extrabold tracking-tight md:text-6xl">
            Watch loud. <span className="text-primary">Anywhere.</span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Your favorite music videos, ready to play even without internet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PlayAllButton videos={results} />
          <Authenticated>
            <AdminBar />
          </Authenticated>
        </div>
      </section>

      {status === "LoadingFirstPage" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
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
          {results.map((v) => (
            <VideoCard key={v._id} video={v} />
          ))}
        </div>
      )}

      {status === "CanLoadMore" && (
        <div className="text-center">
          <Button variant="secondary" onClick={() => loadMore(12)}>
            Load more
          </Button>
        </div>
      )}
    </main>
  );
}
