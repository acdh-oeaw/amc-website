import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import { loadEnv } from "vite";

// import { defaultLocale } from "./src/config/i18n.config";
// import { createConfig as createMdxConfig } from "./src/config/mdx.config";

const env = loadEnv(import.meta.env.MODE, process.cwd(), "");
if (!env.PUBLIC_APP_BASE_URL) {
	throw new Error("PUBLIC_APP_BASE_URL is required");
}
const appBaseUrl = new URL(env.PUBLIC_APP_BASE_URL);

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
	compressHTML: "jsx",
	integrations: [
		icon({
			/** @see https://www.astroicon.dev/reference/configuration/#include */
			include: {
				lucide: ["chevron-down", "menu", "message-circle", "search", "x"],
			},
			svgoOptions: {
				multipass: true,
				plugins: [
					{
						name: "preset-default",
						params: {
							overrides: {
								removeViewBox: false,
							},
						},
					},
				],
			},
		}),
		keystatic(),
		mdx(),
		react(),
		sitemap(),
	],
	// // @ts-expect-error Astro types are incomplete.
	// markdown: {
	// 	...(await createMdxConfig(defaultLocale)),
	// 	gfm: false,
	// 	smartypants: false,
	// 	syntaxHighlight: false,
	// },
	output: "static",
	prefetch: {
		defaultStrategy: "hover",
		prefetchAll: true,
	},
	redirects: {
		"/admin": {
			destination: "/keystatic",
			status: 307,
		},
	},
	scopedStyleStrategy: "where",
	security: {
		allowedDomains: [
			{
				protocol: appBaseUrl.protocol.slice(0, -1),
				hostname: appBaseUrl.hostname,
				port: appBaseUrl.port,
			},
		],
		checkOrigin: true,
	},
	server: {
		port: 3000,
	},
	site: env.PUBLIC_APP_BASE_URL,
	vite: {
		plugins: [tailwindcss()],
	},
});
