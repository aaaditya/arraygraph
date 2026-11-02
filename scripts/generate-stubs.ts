/**
 * Writes draft MDX stubs for every chapter in curriculum-chapters.ts.
 * Skips files that already exist unless --force. Never overwrites status: ready files.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CHAPTERS, type ChapterSpec } from "./curriculum-chapters";

const root = path.join(process.cwd(), "content");
const force = process.argv.includes("--force");

function yamlList(values: string[]) {
  if (values.length === 0) return "[]";
  return `[${values.join(", ")}]`;
}

function stubBody(spec: ChapterSpec) {
  const bullets = spec.learn.map((line) => `- ${line}`).join("\n");
  return `## What you will learn
${bullets}

## The story
<Analogy title='${spec.analogy.replace(/'/g, "\\'")}'>
This chapter is being written. The everyday picture is **${spec.analogy}**.
When the full lesson lands, you will meet the idea with a story first, then a visual, then code.
</Analogy>

## See it move
Coming soon${spec.visualizerHint ? ` — planned visualizer: ${spec.visualizerHint}` : ""}.

## Do it by hand
A hand-trace exercise will live here.

## Now the code
Code tabs in five languages will land with the full chapter.

## How fast is it?
Complexity notes are coming soon.

## Common mistakes
- Skipping the analogy and jumping straight to code
- Memorising steps without tracing a tiny example

## Interview angle
<InterviewTip>
Interviewers want to hear how you map ${spec.analogy} to the real structure. Practice saying it out loud.
</InterviewTip>

## Checkpoint
A quick check question will appear here.

## Practice
Practice problems will be linked when this chapter is ready.

## Quiz
A short quiz will unlock with the full chapter.

## Recap
<Recap>
**${spec.title}** starts from ${spec.analogy}.
This draft keeps your place in the roadmap.
Come back when the status flips to ready.
</Recap>
`;
}

function q(value: string) {
  return JSON.stringify(value);
}

function render(spec: ChapterSpec) {
  const tags = spec.tags.length ? spec.tags : [spec.slug.split("-")[0]!];
  return `---
slug: ${spec.slug}
track: ${spec.track}
module: ${spec.module}
chapter: ${q(spec.chapter)}
title: ${q(spec.title)}
summary: ${q(`Draft stub for ${spec.title}. Analogy: ${spec.analogy}.`)}
level: ${spec.level}
minutes: ${spec.minutes}
status: draft
prerequisites: ${yamlList(spec.prerequisites)}
patterns: ${yamlList(spec.patterns)}
xp: ${spec.xp}
analogy: ${q(spec.analogy)}
tags: ${yamlList(tags)}
---

${stubBody(spec)}`;
}

let written = 0;
let skipped = 0;
let keptReady = 0;

for (const spec of CHAPTERS) {
  const dir = path.join(root, spec.track, spec.module);
  const file = path.join(dir, `${spec.slug}.mdx`);
  mkdirSync(dir, { recursive: true });

  if (existsSync(file)) {
    const existing = readFileSync(file, "utf8");
    if (/status:\s*ready/.test(existing)) {
      keptReady += 1;
      continue;
    }
    if (!force) {
      skipped += 1;
      continue;
    }
  }

  // Generator always writes drafts; ready chapters are authored separately.
  const toWrite = { ...spec, status: "draft" as const };
  writeFileSync(file, render(toWrite));
  written += 1;
}

console.log(
  `Stubs written=${written}, skipped-existing=${skipped}, kept-ready=${keptReady}, total-spec=${CHAPTERS.length}`,
);
