import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { lessonComponents } from "@/components/lesson/mdx-components";

export async function renderLessonBody(body: string) {
  const { content } = await compileMDX({
    source: body,
    components: lessonComponents,
    options: {
      // Lessons pass arrays and template literals as props, so expressions must be allowed.
      // Dangerous globals (eval, process, Function, ...) stay blocked.
      blockJS: false,
      blockDangerousJS: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  });
  return content;
}
