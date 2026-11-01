import { Analogy } from "./analogy";
import { Checkpoint } from "./checkpoint";
import { CodeTabs } from "./code-tabs";
import { Complexity } from "./complexity";
import { InterviewTip } from "./interview-tip";
import { Problems } from "./problems";
import { Quiz } from "./quiz";
import { Recap } from "./recap";
import { Trace } from "./trace";
import { Visualizer } from "./visualizer";

/** Every component an MDX lesson may use. Keep in sync with the template in docs/CURRICULUM.md. */
export const lessonComponents = {
  Analogy,
  Visualizer,
  Trace,
  CodeTabs,
  Complexity,
  Checkpoint,
  Quiz,
  Problems,
  Recap,
  InterviewTip,
};
