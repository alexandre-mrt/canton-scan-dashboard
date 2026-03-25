import { afterAll, beforeAll, describe, expect, it } from "vitest";
import puppeteer, { type Browser, type Page } from "puppeteer";
import { type ChildProcess, spawn } from "node:child_process";

const PORT = 3999;
const BASE_URL = `http://localhost:${PORT}`;
const MAX_SERVER_WAIT_MS = 25_000;
const POLL_INTERVAL_MS = 500;

let browser: Browser;
let page: Page;
let server: ChildProcess;

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			// Server not ready yet
		}
		await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
	}
	throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

beforeAll(async () => {
	server = spawn("npx", ["next", "dev", "-p", String(PORT)], {
		cwd: process.cwd(),
		env: { ...process.env, PORT: String(PORT) },
		stdio: "pipe",
	});

	server.stderr?.on("data", (data: Buffer) => {
		const msg = data.toString();
		if (msg.includes("Error") && !msg.includes("Warning")) {
			console.error("[next dev stderr]", msg);
		}
	});

	await waitForServer(BASE_URL, MAX_SERVER_WAIT_MS);

	browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	page = await browser.newPage();
}, 30_000);

afterAll(async () => {
	await browser?.close();
	if (server?.pid) {
		server.kill("SIGTERM");
	}
});

describe("Canton Scan Dashboard E2E", () => {
	it("loads the homepage with correct title and header", async () => {
		await page.goto(BASE_URL, { waitUntil: "networkidle2" });

		const title = await page.title();
		expect(title).toContain("Canton");

		const headerText = await page.$eval("h1", (el) => el.textContent);
		expect(headerText).toContain("Canton Scan Dashboard");

		const mainnetBadge = await page.$eval(
			".badge-green",
			(el) => el.textContent,
		);
		expect(mainnetBadge).toContain("Mainnet");
	});

	it("navigates between tabs and shows different content", async () => {
		await page.goto(BASE_URL, { waitUntil: "networkidle2" });

		const tabChecks: { label: string; expectedText: string }[] = [
			{ label: "Tokenomics", expectedText: "Supply Projection" },
			{ label: "Architecture", expectedText: "Participant Nodes" },
			{ label: "App Rewards", expectedText: "App Reward Calculator" },
			{ label: "Grants", expectedText: "Core R&D" },
			{ label: "Overview", expectedText: "Monthly Transactions" },
		];

		for (const { label, expectedText } of tabChecks) {
			const buttons = await page.$$("nav button");
			for (const btn of buttons) {
				const text = await btn.evaluate((el) => el.textContent);
				if (text?.trim() === label) {
					await btn.click();
					break;
				}
			}

			await page.waitForFunction(
				(text: string) => document.body.innerText.includes(text),
				{ timeout: 5000 },
				expectedText,
			);

			const bodyText = await page.evaluate(() => document.body.innerText);
			expect(bodyText).toContain(expectedText);
		}
	});

	it("updates the reward calculator when slider changes", async () => {
		await page.goto(BASE_URL, { waitUntil: "networkidle2" });

		// Click App Rewards tab
		const buttons = await page.$$("nav button");
		for (const btn of buttons) {
			const text = await btn.evaluate((el) => el.textContent);
			if (text?.trim() === "App Rewards") {
				await btn.click();
				break;
			}
		}

		await page.waitForSelector("#tx-count", { timeout: 5000 });

		// Change the transaction slider value via JS
		await page.$eval("#tx-count", (el) => {
			const input = el as HTMLInputElement;
			const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value",
			)?.set;
			nativeInputValueSetter?.call(input, "2000000");
			input.dispatchEvent(new Event("input", { bubbles: true }));
			input.dispatchEvent(new Event("change", { bubbles: true }));
		});

		// Wait for React to re-render
		await page.waitForFunction(
			() => {
				const body = document.body.innerText;
				return body.includes("2,000,000 txs/month");
			},
			{ timeout: 5000 },
		);

		const bodyText = await page.evaluate(() => document.body.innerText);
		expect(bodyText).toContain("2,000,000 txs/month");

		// Verify reward values are not zero
		const rewardText = await page.evaluate(() => {
			const els = document.querySelectorAll(".text-2xl.font-bold");
			return Array.from(els).map((el) => el.textContent ?? "");
		});

		const ccReward = rewardText.find((t) => t.includes("CC"));
		expect(ccReward).toBeDefined();
		expect(ccReward).not.toBe("0 CC");
	});

	it("displays stat cards with values on overview tab", async () => {
		await page.goto(BASE_URL, { waitUntil: "networkidle2" });

		// Verify stat cards exist
		const statValues = await page.$$eval(".stat-value", (els) =>
			els.map((el) => el.textContent ?? ""),
		);

		// Should have at least 8 stat cards (4 primary + 4 secondary)
		expect(statValues.length).toBeGreaterThanOrEqual(8);

		// Check specific stat cards contain expected values
		const bodyText = await page.evaluate(() => document.body.innerText);
		expect(bodyText).toContain("Monthly Transactions");
		expect(bodyText).toContain("Canton Coin Price");
		expect(bodyText).toContain("Circulating Supply");
		expect(bodyText).toContain("App Reward Pool");

		// Verify values are not empty
		for (const value of statValues) {
			expect(value.trim().length).toBeGreaterThan(0);
		}
	});
});
