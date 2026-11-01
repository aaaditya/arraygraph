import { ListChecksIcon } from "lucide-react";
import { getQuiz } from "@/lib/content/loader";
import { QuizClient } from "./quiz-client";

export async function Quiz({ id }: { id: string }) {
  const quiz = await getQuiz(id);
  return (
    <section aria-label="Quiz" className="bg-card my-6 rounded-xl border p-5 sm:p-6">
      <p className="text-primary mb-4 flex items-center gap-2 text-sm font-semibold">
        <ListChecksIcon className="size-4" aria-hidden="true" />
        {quiz ? quiz.title : "Quiz"}
      </p>
      {quiz ? (
        <QuizClient quiz={quiz} />
      ) : (
        <p className="text-muted-foreground">This quiz is coming soon.</p>
      )}
    </section>
  );
}
