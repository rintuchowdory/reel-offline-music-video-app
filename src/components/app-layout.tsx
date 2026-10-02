import { Link, Outlet } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { useOnline } from "@/hooks/use-offline-library.ts";
import Header from "./header.tsx";
import InstallBanner from "./install-banner.tsx";

export default function AppLayout() {
  const online = useOnline();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {!online && (
        <div className="flex items-center justify-center gap-2 bg-accent px-4 py-2 text-sm text-accent-foreground">
          <WifiOff className="size-4" />
          You're offline.
          <Link to="/downloads" className="font-semibold underline">
            Watch your downloads
          </Link>
        </div>
      )}
      <Outlet />
      <InstallBanner />
    </div>
  );
}
