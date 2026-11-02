import { ClockIcon, StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { humanize } from "@/lib/content/catalog";
import type { LessonMeta } from "@/lib/content/parse";

export function LessonMetaBadges({ lesson }: { lesson: LessonMeta }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {lesson.status === "draft" ? <Badge variant="warning">Coming soon</Badge> : null}
      <Badge variant="secondary">{humanize(lesson.level)}</Badge>
      <Badge variant="outline">
        <ClockIcon aria-hidden="true" /> {lesson.minutes} min
      </Badge>
      <Badge variant="outline">
        <StarIcon aria-hidden="true" /> {lesson.xp} XP
      </Badge>
    </div>
  );
}
