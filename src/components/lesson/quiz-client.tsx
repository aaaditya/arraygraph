"use client";

import { TrophyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Quiz } from "@/lib/content/schemas";
import { ChoiceQuestion } from "./choice-question";

export function QuizClient({ quiz }: { quiz: Quiz }) {
  const total = quiz.questions.length;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = quiz.questions[index];

  function restart() {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setFinished(false);
  }

  if (finished || !question) {
    const perfect = score === total;
    return (
      <div className="grid justify-items-start gap-3" aria-live="polite">
        <p className="flex items-center gap-2 text-lg font-semibold">
          <TrophyIcon className="text-warning size-5" aria-hidden="true" />
          You scored {score} out of {total}
        </p>
        <p className="text-muted-foreground">
          {perfect
            ? "Perfect! This lesson will come back for a quick review in 1 day."
            : "Good effort. Re-read the parts you missed, then try again."}
        </p>
        <Button variant="outline" onClick={restart}>
          Retake quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <p className="text-muted-foreground text-sm">
          Question {index + 1} of {total}
        </p>
        <Progress value={(index / total) * 100} aria-label="Quiz progress" />
      </div>
      <ChoiceQuestion
        key={question.id}
        prompt={question.prompt}
        options={question.options}
        answer={question.answer}
        explain={question.explain}
        selected={selected}
        checked={checked}
        onSelect={setSelected}
      />
      <div>
        {!checked ? (
          <Button
            disabled={selected === null}
            onClick={() => {
              setChecked(true);
              if (selected === question.answer) setScore((value) => value + 1);
            }}
          >
            Check answer
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (index + 1 >= total) {
                setFinished(true);
                return;
              }
              setIndex(index + 1);
              setSelected(null);
              setChecked(false);
            }}
          >
            {index + 1 >= total ? "See my score" : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
}
