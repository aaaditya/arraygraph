import { codeToHtml } from "shiki";
import { CODE_LANGUAGES, CODE_LANGUAGE_LABELS, type CodeLanguage } from "@/lib/content/schemas";
import { CodeTabsClient, type HighlightedSnippet } from "./code-tabs-client";

const SHIKI_LANG: Record<CodeLanguage, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "cpp",
  csharp: "csharp",
};

export async function highlight(code: string, language: CodeLanguage) {
  return codeToHtml(code.trim(), {
    lang: SHIKI_LANG[language],
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
  });
}

export async function CodeTabs(props: Partial<Record<CodeLanguage, string>> & { title?: string }) {
  const snippets: HighlightedSnippet[] = await Promise.all(
    CODE_LANGUAGES.filter((language) => props[language]).map(async (language) => ({
      language,
      label: CODE_LANGUAGE_LABELS[language],
      code: props[language]!.trim(),
      html: await highlight(props[language]!, language),
    })),
  );
  if (snippets.length === 0) return null;
  return <CodeTabsClient snippets={snippets} title={props.title} />;
}
