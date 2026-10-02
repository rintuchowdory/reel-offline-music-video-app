import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  PlayerContext,
  type PlayerContextValue,
  type QueueItem,
  type RepeatMode,
} from "@/lib/player-context.ts";

const REPEAT_ORDER: RepeatMode[] = ["off", "all", "one"];
const STORAGE_KEY = "reel-player-v1";

type SavedPlayer = { queue: QueueItem[]; shuffle: boolean; repeat: RepeatMode };

// Reads the saved queue; falls back to defaults if missing or corrupted
function loadSaved(): SavedPlayer {
  const fallback: SavedPlayer = { queue: [], shuffle: false, repeat: "off" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data: Partial<SavedPlayer> = JSON.parse(raw);
    return {
      queue: Array.isArray(data.queue) ? data.queue : [],
      shuffle: data.shuffle === true,
      repeat: REPEAT_ORDER.includes(data.repeat as RepeatMode) ? (data.repeat as RepeatMode) : "off",
    };
  } catch {
    return fallback;
  }
}

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const [saved] = useState(loadSaved);
  const [queue, setQueueState] = useState<QueueItem[]>(saved.queue);
  const [shuffle, setShuffle] = useState(saved.shuffle);
  const [repeat, setRepeat] = useState<RepeatMode>(saved.repeat);

  // Keep the queue on this device so it survives reloads and offline launches
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ queue, shuffle, repeat }));
    } catch {
      // Storage full or blocked: the queue still works for this session
    }
  }, [queue, shuffle, repeat]);

  const addToQueue = useCallback((item: QueueItem) => {
    setQueueState((q) => (q.some((x) => x._id === item._id) ? q : [...q, item]));
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueueState((q) => q.filter((x) => x._id !== id));
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => REPEAT_ORDER[(REPEAT_ORDER.indexOf(r) + 1) % REPEAT_ORDER.length]);
  }, []);

  const getNext = useCallback(
    (currentId: string) => {
      const idx = queue.findIndex((x) => x._id === currentId);
      if (idx < 0 || queue.length < 2) return null;
      if (shuffle) {
        const others = queue.filter((x) => x._id !== currentId);
        return others[Math.floor(Math.random() * others.length)]._id;
      }
      if (idx + 1 < queue.length) return queue[idx + 1]._id;
      return repeat === "all" ? queue[0]._id : null;
    },
    [queue, shuffle, repeat],
  );

  const getPrevious = useCallback(
    (currentId: string) => {
      const idx = queue.findIndex((x) => x._id === currentId);
      if (idx < 0 || queue.length < 2) return null;
      if (idx > 0) return queue[idx - 1]._id;
      return repeat === "all" ? queue[queue.length - 1]._id : null;
    },
    [queue, repeat],
  );

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      shuffle,
      repeat,
      setQueue: setQueueState,
      addToQueue,
      removeFromQueue,
      clearQueue: () => setQueueState([]),
      toggleShuffle: () => setShuffle((s) => !s),
      cycleRepeat,
      getNext,
      getPrevious,
    }),
    [queue, shuffle, repeat, addToQueue, removeFromQueue, cycleRepeat, getNext, getPrevious],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
