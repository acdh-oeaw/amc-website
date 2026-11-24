import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadEnvFile } from "node:process";

import { defineConfig, devices } from "@playwright/test";
import isInCi from "is-in-ci";

for (const envFilePath of [".env.test.local", ".env.local", ".env.test", ".env"]) {
	const path = join(process.cwd(), envFilePath);
	if (existsSync(path)) loadEnvFile(path);
}

const port = 3000;
const baseUrl = `http://localhost:${String(port)}`;

export default defineConfig({
	testDir: "./e2e",
	snapshotDir: "./e2e/snapshots",
	fullyParallel: true,
	forbidOnly: isInCi,
	retries: isInCi ? 2 : 0,
	maxFailures: 10,
	workers: isInCi ? 1 : undefined,
	reporter: isInCi ? "github" : "html",
	use: {
		baseURL: baseUrl,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "setup",
			testMatch: "global.setup.ts",
		},
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			dependencies: ["setup"],
		},
		// {
		// 	name: "firefox",
		// 	use: { ...devices["Desktop Firefox"] },
		// 	dependencies: ["setup"],
		// },
		// {
		// 	name: "webkit",
		// 	use: { ...devices["Desktop Safari"] },
		// 	dependencies: ["setup"],
		// },
		/** Test against mobile viewports. */
		// {
		// 	name: "Mobile Chrome",
		// 	use: { ...devices["Pixel 5"] },
		// 	dependencies: ["setup"],
		// },
		// {
		// 	name: "Mobile Safari",
		// 	use: { ...devices["iPhone 12"] },
		// 	dependencies: ["setup"],
		// },
		/** Test against branded browsers. */
		// {
		// 	name: "Microsoft Edge",
		// 	use: { ...devices["Desktop Edge"], channel: "msedge" },
		// 	dependencies: ["setup"],
		// },
		// {
		// 	name: "Google Chrome",
		// 	use: { ...devices["Desktop Chrome"], channel: "chrome" },
		// 	dependencies: ["setup"],
		// },
	],
	webServer: {
		command: "pnpm run start --ignore-lock",
		url: baseUrl,
		reuseExistingServer: !isInCi,
	},
});
