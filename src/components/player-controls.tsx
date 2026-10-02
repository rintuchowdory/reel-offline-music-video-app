import { useNavigate } from "react-router-dom";
import { Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { usePlayer } from "@/hooks/use-player.ts";
import { cn } from "@/lib/utils.ts";

export default function PlayerControls({ currentId }: { currentId: string }) {
  const { shuffle, repeat, toggleShuffle, cycleRepeat, getNext, getPrevious } = usePlayer();
  const navigate = useNavigate();
  const next = getNext(currentId);
  const prev = getPrevious(currentId);
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={shuffle ? "default" : "secondary"}
        size="icon"
        aria-label="Shuffle"
        aria-pressed={shuffle}
        onClick={toggleShuffle}
      >
        <Shuffle className="size-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Previous"
        disabled={!prev}
        onClick={() => prev && navigate(`/watch/${prev}`)}
      >
        <SkipBack className="size-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Next"
        disabled={!next}
        onClick={() => next && navigate(`/watch/${next}`)}
      >
        <SkipForward className="size-4" />
      </Button>
      <Button
        variant={repeat === "off" ? "secondary" : "default"}
        size="icon"
        aria-label={`Repeat ${repeat}`}
        onClick={cycleRepeat}
        className={cn(repeat !== "off" && "ring-2 ring-ring/40")}
      >
        <RepeatIcon className="size-4" />
      </Button>
    </div>
  );
}
