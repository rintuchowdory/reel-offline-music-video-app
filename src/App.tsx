import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AppLayout from "./components/app-layout.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Watch from "./pages/watch/page.tsx";
import PlayerProvider from "./components/providers/player-provider.tsx";
import Downloads from "./pages/downloads/page.tsx";
import Playlists from "./pages/playlists/page.tsx";
import PlaylistDetail from "./pages/playlists/detail/page.tsx";
import { useServiceWorker } from "./hooks/use-service-worker.ts";

export default function App() {
  useServiceWorker();
  return (
    <DefaultProviders>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <PlayerProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </PlayerProvider>
      </BrowserRouter>
    </DefaultProviders>
  );
}
