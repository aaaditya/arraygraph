"use client";

import {
  ChevronFirstIcon,
  ChevronLastIcon,
  KeyboardIcon,
  PauseIcon,
  PlayIcon,
  StepBackIcon,
  StepForwardIcon,
} from "lucide-react";
import { type KeyboardEvent, type ReactNode, useId } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { BaseFrame, PseudocodeLine } from "@/lib/visualizers/types";
import { type PlaybackSpeed, SPEED_OPTIONS, usePreferences } from "@/stores/preferences";
import { PseudocodePanel } from "./pseudocode-panel";
import { usePlayer } from "./use-player";

export const KEYBOARD_SHORTCUTS: { keys: string; action: string }[] = [
  { keys: "Space or K", action: "Play or pause" },
  { keys: "→ or L", action: "Next step" },
  { keys: "← or J", action: "Previous step" },
  { keys: "Home", action: "Back to start" },
  { keys: "End", action: "Jump to the last step" },
  { keys: "+ / −", action: "Faster / slower" },
];

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest("input, textarea, select, [role='slider'], [contenteditable='true']"),
  );
}

export function shiftSpeed(current: PlaybackSpeed, direction: 1 | -1): PlaybackSpeed {
  const index = SPEED_OPTIONS.indexOf(current);
  const next = Math.min(Math.max(index + direction, 0), SPEED_OPTIONS.length - 1);
  return SPEED_OPTIONS[next] ?? current;
}

export function VisualizerPlayer<F extends BaseFrame>({
  title,
  frames,
  pseudocode,
  showPseudocode = true,
  renderFrame,
  className,
}: {
  title: string;
  frames: F[];
  pseudocode: PseudocodeLine[];
  showPseudocode?: boolean;
  renderFrame: (frame: F) => ReactNode;
  className?: string;
}) {
  const speed = usePreferences((state) => state.playbackSpeed);
  const setSpeed = usePreferences((state) => state.setPlaybackSpeed);
  const { state, dispatch } = usePlayer(frames.length, speed);
  const titleId = useId();
  const speedId = useId();

  const frame = frames[Math.min(state.index, frames.length - 1)];
  if (!frame) return null;
  const last = frames.length - 1;
  const atStart = state.index === 0;
  const atEnd = state.index >= last;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (isInteractiveTarget(event.target)) return;
    const onButton = event.target instanceof HTMLButtonElement;
    switch (event.key) {
      case " ":
      case "k":
      case "K":
        if (onButton && event.key === " ") return;
        dispatch({ type: "toggle" });
        break;
      case "ArrowRight":
      case "l":
      case "L":
        dispatch({ type: "next" });
        break;
      case "ArrowLeft":
      case "j":
      case "J":
        dispatch({ type: "prev" });
        break;
      case "Home":
        dispatch({ type: "reset" });
        break;
      case "End":
        dispatch({ type: "end" });
        break;
      case "+":
      case "=":
        setSpeed(shiftSpeed(speed, 1));
        break;
      case "-":
      case "_":
        setSpeed(shiftSpeed(speed, -1));
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      aria-roledescription="visualizer"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "bg-card focus-visible:ring-ring/50 rounded-xl border shadow-sm outline-none focus-visible:ring-[3px]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <p id={titleId} className="font-semibold">
          {title}
        </p>
        <p className="text-muted-foreground text-sm tabular-nums">
          Step {state.index + 1} of {frames.length}
        </p>
      </div>

      <div
        className={cn(
          "grid gap-4 p-4",
          showPseudocode && "lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]",
        )}
      >
        <div className="flex min-w-0 flex-col gap-3">
          <div className="bg-background relative flex min-h-72 items-end justify-center overflow-hidden rounded-lg border p-4">
            {renderFrame(frame)}
          </div>
          <p
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              "min-h-12 rounded-lg px-3 py-2 text-sm leading-6",
              frame.status === "error" ? "bg-destructive/10 text-foreground" : "bg-muted",
            )}
          >
            {frame.status === "error" ? <strong>Oops: </strong> : null}
            {frame.caption}
          </p>
        </div>
        {showPseudocode ? (
          <PseudocodePanel lines={pseudocode} activeLine={frame.line} status={frame.status} />
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3">
        <Slider
          thumbLabel="Step"
          min={0}
          max={Math.max(last, 0)}
          step={1}
          value={[state.index]}
          onValueChange={([value]) => dispatch({ type: "seek", index: value ?? 0 })}
          disabled={last <= 0}
          thumbValueText={`Step ${state.index + 1} of ${frames.length}`}
        />
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "reset" })}
            disabled={atStart}
            aria-label="Back to start"
            title="Back to start (Home)"
          >
            <ChevronFirstIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "prev" })}
            disabled={atStart}
            aria-label="Previous step"
            title="Previous step (←)"
          >
            <StepBackIcon />
          </Button>
          <Button
            size="icon"
            onClick={() => dispatch({ type: "toggle" })}
            disabled={last <= 0}
            aria-label={state.playing ? "Pause" : "Play"}
            title={state.playing ? "Pause (Space)" : "Play (Space)"}
          >
            {state.playing ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "next" })}
            disabled={atEnd}
            aria-label="Next step"
            title="Next step (→)"
          >
            <StepForwardIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "end" })}
            disabled={atEnd}
            aria-label="Jump to the last step"
            title="Jump to the last step (End)"
          >
            <ChevronLastIcon />
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <label htmlFor={speedId} className="text-muted-foreground text-sm">
              Speed
            </label>
            <select
              id={speedId}
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value) as PlaybackSpeed)}
              className="border-input bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]"
            >
              {SPEED_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}×
                </option>
              ))}
            </select>
          </div>
        </div>
        <details className="text-muted-foreground text-sm">
          <summary className="hover:text-foreground flex w-fit cursor-pointer items-center gap-2">
            <KeyboardIcon className="size-4" aria-hidden="true" /> Keyboard shortcuts
          </summary>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            {KEYBOARD_SHORTCUTS.map((shortcut) => (
              <div key={shortcut.keys} className="contents">
                <dt>
                  <kbd className="bg-muted rounded border px-1.5 py-0.5 font-mono text-xs">
                    {shortcut.keys}
                  </kbd>
                </dt>
                <dd>{shortcut.action}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2">Click the visualizer or Tab into it first.</p>
        </details>
      </div>
    </div>
  );
}
