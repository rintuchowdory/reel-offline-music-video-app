import { createContext } from "react";

export type QueueItem = {
  _id: string;
  title: string;
  artist: string;
  thumbnailUrl: string | null;
};

export type RepeatMode = "off" | "all" | "one";

export type PlayerContextValue = {
  queue: QueueItem[];
  shuffle: boolean;
  repeat: RepeatMode;
  setQueue: (items: QueueItem[]) => void;
  addToQueue: (item: QueueItem) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  getNext: (currentId: string) => string | null;
  getPrevious: (currentId: string) => string | null;
};

export const PlayerContext = createContext<PlayerContextValue | null>(null);
