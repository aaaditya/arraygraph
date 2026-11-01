import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Checkpoint } from "./checkpoint";
import { QuizClient } from "./quiz-client";
import { normalizeTraceAnswer, Trace } from "./trace";

describe("Checkpoint", () => {
  it("disables checking until an option is chosen, then explains the answer", async () => {
    const user = userEvent.setup();
    render(
      <Checkpoint
        question="Which comes out first?"
        options={["A", "B", "C"]}
        answer={2}
        explain="C was pushed last."
      />,
    );
    const check = screen.getByRole("button", { name: "Check answer" });
    expect(check).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "A" }));
    await user.click(check);
    expect(screen.getByText(/Not quite/)).toBeInTheDocument();
    expect(screen.getByText("C was pushed last.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    await user.click(screen.getByRole("radio", { name: "C" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText(/Correct!/)).toBeInTheDocument();
  });
});

describe("Trace", () => {
  it("normalizes answers", () => {
    expect(normalizeTraceAnswer(" [ 1 , 3 ] ")).toBe("1,3");
    expect(normalizeTraceAnswer("1,3")).toBe("1,3");
  });

  it("accepts an equivalent answer and can reveal the expected one", async () => {
    const user = userEvent.setup();
    render(<Trace input="push 1, push 2, pop, push 3" answer="[1, 3]" />);
    const field = screen.getByLabelText(/What does it look like/);
    await user.type(field, "1,2");
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByText(/Not yet/)).toBeInTheDocument();

    await user.clear(field);
    await user.type(field, "1, 3");
    await user.keyboard("{Enter}");
    expect(screen.getByText(/Spot on/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show answer" }));
    expect(screen.getByText("[1, 3]")).toBeInTheDocument();
  });
});

describe("QuizClient", () => {
  it("walks through questions and shows the final score", async () => {
    const user = userEvent.setup();
    render(
      <QuizClient
        quiz={{
          id: "q",
          title: "Quiz",
          questions: [
            { id: "one", prompt: "First?", options: ["yes", "no"], answer: 0, explain: "Yes." },
            { id: "two", prompt: "Second?", options: ["yes", "no"], answer: 1, explain: "No." },
          ],
        }}
      />,
    );
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "yes" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "Next question" }));

    await user.click(screen.getByRole("radio", { name: "yes" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "See my score" }));

    expect(screen.getByText("You scored 1 out of 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retake quiz" }));
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
  });
});
