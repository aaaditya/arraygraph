import { describe, expect, it } from "vitest";
import { initialPlayerState, type PlayerAction, playerReducer } from "./player-reducer";

const run = (frameCount: number, ...actions: PlayerAction[]) =>
  actions.reduce(playerReducer, initialPlayerState(frameCount));

describe("playerReducer", () => {
  it("steps forward and back within bounds", () => {
    expect(run(3, { type: "next" }, { type: "next" }, { type: "next" }).index).toBe(2);
    expect(run(3, { type: "prev" }).index).toBe(0);
    expect(run(3, { type: "next" }, { type: "prev" }).index).toBe(0);
  });

  it("stepping pauses playback", () => {
    expect(run(5, { type: "play" }, { type: "next" }).playing).toBe(false);
    expect(run(5, { type: "play" }, { type: "prev" }).playing).toBe(false);
  });

  it("ticks advance only while playing and stop at the last frame", () => {
    expect(run(3, { type: "tick" }).index).toBe(0);
    const state = run(3, { type: "play" }, { type: "tick" }, { type: "tick" });
    expect(state).toMatchObject({ index: 2, playing: false });
    expect(playerReducer(state, { type: "tick" }).index).toBe(2);
  });

  it("play from the last frame restarts from the beginning", () => {
    expect(run(3, { type: "end" }, { type: "play" })).toMatchObject({ index: 0, playing: true });
  });

  it("toggle switches between play and pause", () => {
    expect(run(3, { type: "toggle" }).playing).toBe(true);
    expect(run(3, { type: "toggle" }, { type: "toggle" }).playing).toBe(false);
  });

  it("cannot play a single frame", () => {
    expect(run(1, { type: "play" }).playing).toBe(false);
  });

  it("seek clamps and rounds; reset and end jump", () => {
    expect(run(5, { type: "seek", index: 9 }).index).toBe(4);
    expect(run(5, { type: "seek", index: -2 }).index).toBe(0);
    expect(run(5, { type: "seek", index: 1.6 }).index).toBe(2);
    expect(run(5, { type: "end" }, { type: "reset" }).index).toBe(0);
  });

  it("load starts over with a new frame count", () => {
    expect(run(5, { type: "end" }, { type: "load", frameCount: 2 })).toEqual({
      index: 0,
      playing: false,
      frameCount: 2,
    });
  });
});
