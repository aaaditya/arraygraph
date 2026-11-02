"use client";

import { FlagIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChoiceQuestion } from "./choice-question";

export function Checkpoint({
  question,
  options,
  answer,
  explain,
}: {
  question: string;
  options: string[];
  answer: number;
  explain: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  return (
    <section aria-label="Checkpoint" className="bg-card my-6 rounded-xl border p-5">
      <p className="text-primary mb-3 flex items-center gap-2 text-sm font-semibold">
        <FlagIcon className="size-4" aria-hidden="true" /> Checkpoint
      </p>
      <ChoiceQuestion
        prompt={question}
        options={options}
        answer={answer}
        explain={explain}
        selected={selected}
        checked={checked}
        onSelect={setSelected}
      />
      <div className="mt-4 flex gap-2">
        {!checked ? (
          <Button onClick={() => setChecked(true)} disabled={selected === null}>
            Check answer
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setChecked(false);
              setSelected(null);
            }}
          >
            Try again
          </Button>
        )}
      </div>
    </section>
  );
}
