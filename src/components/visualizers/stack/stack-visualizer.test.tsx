import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePreferences } from "@/stores/preferences";
import { shiftSpeed } from "../player/visualizer-player";
import { parseInitialValues, splitOps } from "./stack-playground";
import { describeStack } from "./stack-view";
import { StackVisualizer } from "./stack-visualizer";

const group = () => screen.getByRole("group", { name: "Stack visualizer" });
const caption = () => group().querySelector("[aria-live='polite']")!;

beforeEach(() => {
  usePreferences.setState({ playbackSpeed: 1 });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("StackVisualizer", () => {
  it("renders the first frame, step counter and pseudocode", () => {
    render(<StackVisualizer initial={[3, 7]} ops={["push 5"]} />);
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(caption()).toHaveTextContent("Start. Bottom to top: 3, 7. 7 is on top.");
    expect(screen.getByText("Pseudocode")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous step" })).toBeDisabled();
  });

  it("steps with buttons and highlights the active pseudocode line", async () => {
    const user = userEvent.setup();
    render(<StackVisualizer initial={[3, 7]} ops={["push 5"]} />);
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(caption()).toHaveTextContent("5 goes on top");
    const active = group().querySelector("[aria-current='step']");
    expect(active).toHaveTextContent("items.append(x)");
    expect(screen.getByRole("button", { name: "Next step" })).toBeDisabled();
  });

  it("supports keyboard shortcuts on the focused visualizer", () => {
    render(<StackVisualizer initial={[1]} ops={["push 2", "pop"]} />);
    const element = group();
    element.focus();
    fireEvent.keyDown(element, { key: "ArrowRight" });
    fireEvent.keyDown(element, { key: "l" });
    expect(screen.getByText("Step 3 of 6")).toBeInTheDocument();
    fireEvent.keyDown(element, { key: "ArrowLeft" });
    expect(screen.getByText("Step 2 of 6")).toBeInTheDocument();
    fireEvent.keyDown(element, { key: "End" });
    expect(screen.getByText("Step 6 of 6")).toBeInTheDocument();
    fireEvent.keyDown(element, { key: "Home" });
    expect(screen.getByText("Step 1 of 6")).toBeInTheDocument();
    fireEvent.keyDown(element, { key: "+" });
    expect(usePreferences.getState().playbackSpeed).toBe(1.5);
    fireEvent.keyDown(element, { key: "-" });
    fireEvent.keyDown(element, { key: "-" });
    expect(usePreferences.getState().playbackSpeed).toBe(0.5);
  });

  it("plays automatically and stops on the last frame", () => {
    vi.useFakeTimers();
    render(<StackVisualizer initial={[]} ops={["push 1"]} />);
    fireEvent.keyDown(group(), { key: " " });
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1200));
    act(() => vi.advanceTimersByTime(1200));
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("shows underflow as an error frame", () => {
    render(<StackVisualizer initial={[]} ops={["pop"]} />);
    fireEvent.keyDown(group(), { key: "End" });
    expect(caption()).toHaveTextContent(/Oops: .*underflow/);
  });

  it("lists invalid operations instead of crashing", () => {
    render(<StackVisualizer ops={["push", "jump"]} />);
    expect(screen.getByRole("alert")).toHaveTextContent('unknown operation "jump"');
  });
});

describe("helpers", () => {
  it("shiftSpeed stays within the options", () => {
    expect(shiftSpeed(3, 1)).toBe(3);
    expect(shiftSpeed(0.5, -1)).toBe(0.5);
    expect(shiftSpeed(1, 1)).toBe(1.5);
  });

  it("parses playground inputs", () => {
    expect(parseInitialValues(" 3, ,7 ")).toEqual(["3", "7"]);
    expect(splitOps("push 1\n pop, peek\n\n")).toEqual(["push 1", "pop", "peek"]);
  });

  it("describes the stack for screen readers", () => {
    expect(
      describeStack({
        items: [],
        line: -1,
        caption: "",
        status: "idle",
        opIndex: -1,
      }),
    ).toBe("The stack is empty.");
  });
});
