import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import { loadEnv } from "vite";

// import { createMdxConfig } from "./src/config/mdx.config";

const env = loadEnv(import.meta.env.MODE, process.cwd(), "");

export default defineConfig({
	/**
	 * When switching to static site generation, place an empty `index.astro` file in
	 * the `src/pages` folder, so `astro` will generate a redirect to the default locale
	 * via `<meta http-equiv="refresh" content="0;url=/en/">`.
	 */
	adapter: node({
		mode: "standalone",
	}),
	base: env.PUBLIC_APP_BASE_PATH,
	integrations: [
		icon({
			/** @see https://www.astroicon.dev/reference/configuration/#include */
			include: {
				lucide: ["chevron-down", "menu", "message-circle", "search", "x"],
				simpleIcons: [],
			},
		}),
		/** Only needed to make the astro jsx runtime work correctly. */
		mdx(),
		/**
		 * @see https://docs.astro.build/en/guides/integrations-guide/solid-js/#combining-multiple-jsx-frameworks
		 * @see https://github.com/Thinkmill/keystatic/discussions/951
		 */
		react({
			include: ["**/content/**", "**/keystatic/**"],
		}),
		sitemap(),
		solidJs({
			exclude: ["**/content/**", "**/keystatic/**"],
		}),
	],
	/** Use `@/lib/keystatic/compile-mdx.ts` instead of astro's built-in markdown processor. */
	// // @ts-expect-error Astro types are incomplete.
	// markdown: {
	// 	...(await createMdxConfig()),
	// 	gfm: false,
	// 	smartypants: false,
	// 	syntaxHighlight: false,
	// },
	prefetch: {
		defaultStrategy: "hover",
		prefetchAll: true,
	},
	redirects: {
		"/admin": {
			destination: env.PUBLIC_APP_BASE_PATH
				? `${env.PUBLIC_APP_BASE_PATH.replace(/\/$/, "")}/keystatic`
				: "/keystatic",
			status: 307,
		},
	},
	scopedStyleStrategy: "where",
	security: {
		checkOrigin: true,
	},
	server: {
		/** Required by keystatic. */
		host: "127.0.0.1",
		port: 3000,
	},
	site: env.PUBLIC_APP_BASE_URL,
});
