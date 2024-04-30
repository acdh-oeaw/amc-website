import metadata from "~/content/metadata.json";

export function GET() {
	const manifest = {
		name: metadata.title,
		short_name: metadata.shortTitle,
		description: metadata.description,
		icons: [
			{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
			{ src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
			{ src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
			{ src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
		],
		theme_color: "#28d8d8",
		background_color: "#28d8d8",
		display: "standalone",
		start_url: "/",
	};

	return Response.json(manifest);
}
