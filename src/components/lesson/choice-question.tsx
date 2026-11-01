"use client";

import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export type ChoiceQuestionProps = {
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
  selected: number | null;
  checked: boolean;
  onSelect: (index: number) => void;
};

/** Accessible single-choice question: a radio group inside a fieldset with live feedback. */
export function ChoiceQuestion({
  prompt,
  options,
  answer,
  explain,
  selected,
  checked,
  onSelect,
}: ChoiceQuestionProps) {
  const groupId = useId();
  const correct = checked && selected === answer;

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 font-medium">{prompt}</legend>
      {options.map((option, index) => {
        const id = `${groupId}-${index}`;
        const isSelected = selected === index;
        const showCorrect = checked && index === answer;
        const showWrong = checked && isSelected && index !== answer;
        return (
          <label
            key={id}
            htmlFor={id}
            className={cn(
              "has-[:focus-visible]:ring-ring/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors has-[:focus-visible]:ring-[3px]",
              isSelected && !checked && "border-primary bg-primary/5",
              showCorrect && "border-success bg-success/10",
              showWrong && "border-destructive bg-destructive/10",
              checked && "cursor-default",
            )}
          >
            <input
              id={id}
              type="radio"
              name={groupId}
              value={index}
              checked={isSelected}
              disabled={checked}
              onChange={() => onSelect(index)}
              className="accent-primary size-4"
            />
            <span className="flex-1">{option}</span>
            {showCorrect ? (
              <CheckCircle2Icon className="text-success size-5" aria-label="Correct answer" />
            ) : null}
            {showWrong ? (
              <XCircleIcon
                className="text-destructive size-5"
                aria-label="Your answer, incorrect"
              />
            ) : null}
          </label>
        );
      })}
      <div aria-live="polite">
        {checked ? (
          <p
            className={cn(
              "mt-2 rounded-lg p-3 text-sm",
              correct ? "bg-success/10" : "bg-destructive/10",
            )}
          >
            <strong>{correct ? "Correct! " : "Not quite. "}</strong>
            {explain}
          </p>
        ) : null}
      </div>
    </fieldset>
  );
}
