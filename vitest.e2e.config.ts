import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
	test: {
		environment: "node",
		testTimeout: 30000,
		hookTimeout: 30000,
		include: ["src/**/*.e2e.test.ts"],
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
});
