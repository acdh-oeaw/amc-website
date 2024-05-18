/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { MDXComponents } from "mdx/types";

import Download from "@/components/content/download.astro";
import Figure from "@/components/content/figure.astro";
import LinkButton from "@/components/content/link-button.astro";
import TableOfContents from "@/components/content/table-of-contents.astro";

export function useMDXComponents(): MDXComponents {
	return {
		Download,
		Figure,
		LinkButton,
		TableOfContents,
	};
}
