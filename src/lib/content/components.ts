/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { MDXComponents } from "mdx/types";

import Download from "@/components/content/download.astro";
import Figure from "@/components/content/figure.astro";
import Img from "@/components/content/img.astro";
import LinkButton from "@/components/content/link-button.astro";
import TableOfContents from "@/components/content/table-of-contents.astro";

export function useMDXComponents(): MDXComponents {
	return {
		Download,
		Figure,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		img: Img as any,
		LinkButton,
		TableOfContents,
	};
}
