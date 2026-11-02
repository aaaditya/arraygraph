export type PlayerState = { index: number; playing: boolean; frameCount: number };

export type PlayerAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "toggle" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "reset" }
  | { type: "end" }
  | { type: "seek"; index: number }
  | { type: "tick" }
  | { type: "load"; frameCount: number };

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), Math.max(max, 0));

export function initialPlayerState(frameCount: number): PlayerState {
  return { index: 0, playing: false, frameCount };
}

/** Pure playback logic shared by every visualizer. */
export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  const last = state.frameCount - 1;
  switch (action.type) {
    case "play":
      if (last <= 0) return state;
      return { ...state, playing: true, index: state.index >= last ? 0 : state.index };
    case "pause":
      return state.playing ? { ...state, playing: false } : state;
    case "toggle":
      return playerReducer(state, { type: state.playing ? "pause" : "play" });
    case "next":
      return { ...state, playing: false, index: clamp(state.index + 1, last) };
    case "prev":
      return { ...state, playing: false, index: clamp(state.index - 1, last) };
    case "reset":
      return { ...state, playing: false, index: 0 };
    case "end":
      return { ...state, playing: false, index: clamp(last, last) };
    case "seek":
      return { ...state, playing: false, index: clamp(Math.round(action.index), last) };
    case "tick": {
      if (!state.playing) return state;
      const index = clamp(state.index + 1, last);
      return { ...state, index, playing: index < last };
    }
    case "load":
      return initialPlayerState(action.frameCount);
  }
}
