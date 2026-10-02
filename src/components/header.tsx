import { Link } from "react-router-dom";
import { Authenticated, Unauthenticated } from "convex/react";
import { Clapperboard, Download, ListMusic } from "lucide-react";
import { SignInButton } from "@/components/ui/signin.tsx";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clapperboard className="size-5" />
          </span>
          <span className="font-[Syne] text-2xl font-extrabold tracking-tight">
            REEL
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/playlists"
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ListMusic className="size-4" /> <span className="hidden sm:inline">Playlists</span>
          </Link>
          <Link
            to="/downloads"
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Download className="size-4" /> <span className="hidden sm:inline">Downloads</span>
          </Link>
          <Authenticated>
            <SignInButton variant="secondary" size="sm" />
          </Authenticated>
          <Unauthenticated>
            <SignInButton size="sm" />
          </Unauthenticated>
        </div>
      </div>
    </header>
  );
}
