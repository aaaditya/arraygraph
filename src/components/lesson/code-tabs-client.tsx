"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CodeLanguage } from "@/lib/content/schemas";
import { usePreferences } from "@/stores/preferences";

export type HighlightedSnippet = {
  language: CodeLanguage;
  label: string;
  code: string;
  html: string;
};

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
      <span className="sr-only sm:not-sr-only">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

export function CodeTabsClient({
  snippets,
  title,
}: {
  snippets: HighlightedSnippet[];
  title?: string;
}) {
  const preferred = usePreferences((state) => state.codeLanguage);
  const setPreferred = usePreferences((state) => state.setCodeLanguage);
  const active = snippets.some((snippet) => snippet.language === preferred)
    ? preferred
    : snippets[0]!.language;

  return (
    <section
      aria-label={title ?? "Code"}
      className="bg-card my-6 overflow-hidden rounded-xl border"
    >
      <Tabs value={active} onValueChange={(value) => setPreferred(value as CodeLanguage)}>
        <div className="flex items-center justify-between gap-2 border-b p-2">
          <TabsList aria-label="Programming language">
            {snippets.map((snippet) => (
              <TabsTrigger key={snippet.language} value={snippet.language}>
                {snippet.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {snippets.map((snippet) => (
          <TabsContent key={snippet.language} value={snippet.language} className="relative">
            <div className="absolute top-2 right-2">
              <CopyButton code={snippet.code} />
            </div>
            <div
              className="overflow-x-auto p-4 font-mono text-sm leading-6 [&_pre]:outline-none"
              // Shiki output is generated at build time from trusted lesson content.
              dangerouslySetInnerHTML={{ __html: snippet.html }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
