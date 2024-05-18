import { evaluate } from "@mdx-js/mdx";
import * as runtime from "astro/jsx-runtime";
import type { MDXModule } from "mdx/types";

import type { Locale } from "@/config/i18n.config";
import { createConfig as createMdxConfig } from "@/config/mdx.config";
import { useMDXComponents } from "@/lib/content/components";
import type { Toc } from "@/lib/content/table-of-contents";

interface MdxContent<T extends Record<string, unknown>> extends MDXModule {
	/** Added by `remark-mdx-frontmatter`. */
	frontmatter: T;
	/** Added by `@/lib/content/table-of-contents.ts`. */
	tableOfContents?: Toc;
}

export async function processMdx<T extends Record<string, unknown>>(
	code: string,
	locale: Locale,
): Promise<MdxContent<T>> {
	const config = await createMdxConfig(locale);

	// @ts-expect-error Upstream type error.
	return evaluate(code, {
		...runtime,
		...config,
		elementAttributeNameCase: "html",
		useMDXComponents,
	});
}
