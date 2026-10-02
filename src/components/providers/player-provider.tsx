import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  PlayerContext,
  type PlayerContextValue,
  type QueueItem,
  type RepeatMode,
} from "@/lib/player-context.ts";

const REPEAT_ORDER: RepeatMode[] = ["off", "all", "one"];

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueueState] = useState<QueueItem[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");

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
