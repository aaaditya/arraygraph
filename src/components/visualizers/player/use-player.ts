"use client";

import { useEffect, useReducer } from "react";
import { initialPlayerState, playerReducer } from "./player-reducer";

export const BASE_STEP_MS = 1200;

export function usePlayer(frameCount: number, speed: number) {
  const [state, dispatch] = useReducer(playerReducer, frameCount, initialPlayerState);

  useEffect(() => {
    dispatch({ type: "load", frameCount });
  }, [frameCount]);

  useEffect(() => {
    if (!state.playing) return;
    const timer = window.setTimeout(() => dispatch({ type: "tick" }), BASE_STEP_MS / speed);
    return () => window.clearTimeout(timer);
  }, [state.playing, state.index, speed]);

  return { state, dispatch };
}
