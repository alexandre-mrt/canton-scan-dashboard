import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	calculateAppRewards,
	fetchNetworkStats,
	getAcsSnapshotTimestamp,
	getOpenMiningRounds,
	getUpdates,
} from "@/lib/canton-api";

// ---------------------------------------------------------------------------
// Global fetch mock
// ---------------------------------------------------------------------------
const mockFetch = vi.fn() as Mock;

beforeEach(() => {
	vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
	vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function jsonResponse(data: unknown, status = 200) {
	return Promise.resolve({
		ok: status >= 200 && status < 300,
		status,
		statusText: status === 200 ? "OK" : "Internal Server Error",
		json: () => Promise.resolve(data),
	});
}

// ---------------------------------------------------------------------------
// fetchScanApi (tested indirectly through exported functions)
// ---------------------------------------------------------------------------
describe("fetchScanApi behaviour", () => {
	it("adds Content-Type header to every request", async () => {
		mockFetch.mockReturnValueOnce(
			jsonResponse({ open_mining_rounds: [] }),
		);

		await getOpenMiningRounds();

		const [, options] = mockFetch.mock.calls[0];
		expect(options.headers["Content-Type"]).toBe("application/json");
	});

	it("sets next.revalidate to 60 seconds", async () => {
		mockFetch.mockReturnValueOnce(
			jsonResponse({ open_mining_rounds: [] }),
		);

		await getOpenMiningRounds();

		const [, options] = mockFetch.mock.calls[0];
		expect(options.next).toEqual({ revalidate: 60 });
	});

	it("throws on non-ok response", async () => {
		mockFetch.mockReturnValueOnce(jsonResponse(null, 500));

		await expect(getOpenMiningRounds()).rejects.toThrow(
			"Scan API error: 500",
		);
	});
});

// ---------------------------------------------------------------------------
// getUpdates
// ---------------------------------------------------------------------------
describe("getUpdates", () => {
	it("sends POST with default page_size of 20", async () => {
		mockFetch.mockReturnValueOnce(jsonResponse({ transactions: [] }));

		const result = await getUpdates();

		const [url, options] = mockFetch.mock.calls[0];
		expect(url).toContain("/v2/updates");
		expect(options.method).toBe("POST");
		expect(JSON.parse(options.body)).toEqual({ page_size: 20 });
		expect(result).toEqual({ transactions: [] });
	});

	it("sends POST with custom page_size", async () => {
		mockFetch.mockReturnValueOnce(jsonResponse({ transactions: [] }));

		await getUpdates(50);

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.page_size).toBe(50);
	});

	it("includes after cursor when provided", async () => {
		mockFetch.mockReturnValueOnce(jsonResponse({ transactions: [] }));

		const after = { after_migration_id: 1, after_record_time: "2026-01-01T00:00:00Z" };
		await getUpdates(10, after);

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.after).toEqual(after);
	});
});

// ---------------------------------------------------------------------------
// getOpenMiningRounds
// ---------------------------------------------------------------------------
describe("getOpenMiningRounds", () => {
	it("calls the correct endpoint and returns data", async () => {
		const mockData = {
			open_mining_rounds: [
				{ round_number: 42, amulet_price: 0.2, opens_at: "t1", target_closes_at: "t2" },
			],
		};
		mockFetch.mockReturnValueOnce(jsonResponse(mockData));

		const result = await getOpenMiningRounds();

		expect(mockFetch.mock.calls[0][0]).toContain("/v0/state/open-mining-rounds");
		expect(result.open_mining_rounds).toHaveLength(1);
		expect(result.open_mining_rounds[0].round_number).toBe(42);
	});
});

// ---------------------------------------------------------------------------
// getAcsSnapshotTimestamp
// ---------------------------------------------------------------------------
describe("getAcsSnapshotTimestamp", () => {
	it("calls the correct endpoint and returns timestamp", async () => {
		const mockData = { snapshot_timestamp: "2026-03-25T10:00:00Z" };
		mockFetch.mockReturnValueOnce(jsonResponse(mockData));

		const result = await getAcsSnapshotTimestamp();

		expect(mockFetch.mock.calls[0][0]).toContain("/v0/state/acs/snapshot-timestamp");
		expect(result.snapshot_timestamp).toBe("2026-03-25T10:00:00Z");
	});
});

// ---------------------------------------------------------------------------
// fetchNetworkStats
// ---------------------------------------------------------------------------
describe("fetchNetworkStats", () => {
	it("returns correct shape when both API calls succeed", async () => {
		mockFetch
			.mockReturnValueOnce(
				jsonResponse({
					open_mining_rounds: [
						{ round_number: 100, amulet_price: 0.25, opens_at: "t1", target_closes_at: "t2" },
					],
				}),
			)
			.mockReturnValueOnce(
				jsonResponse({
					closed_mining_rounds: [
						{ round_number: 99, effective_at: "t0", total_amulet_minted: 1000, total_amulet_burned: 200 },
						{ round_number: 98, effective_at: "t0", total_amulet_minted: 500, total_amulet_burned: 100 },
					],
				}),
			);

		const stats = await fetchNetworkStats();

		expect(stats.currentRound).toBe(100);
		expect(stats.cantonCoinPrice).toBe(0.25);
		expect(stats.totalMinted).toBe(1500);
		expect(stats.totalBurned).toBe(300);
		expect(stats.netSupplyChange).toBe(1200);
		expect(stats.totalTransactions).toBe(15_000_000);
		expect(stats.activeValidators).toBe(0);
		expect(stats.totalPartiesHosted).toBe(0);
	});

	it("uses fallback values when openRounds fails", async () => {
		mockFetch
			.mockReturnValueOnce(Promise.reject(new Error("network error")))
			.mockReturnValueOnce(
				jsonResponse({
					closed_mining_rounds: [
						{ round_number: 99, effective_at: "t0", total_amulet_minted: 800, total_amulet_burned: 50 },
					],
				}),
			);

		const stats = await fetchNetworkStats();

		expect(stats.currentRound).toBe(0);
		expect(stats.cantonCoinPrice).toBe(0.15);
		expect(stats.totalMinted).toBe(800);
		expect(stats.totalBurned).toBe(50);
	});

	it("uses fallback values when closedRounds fails", async () => {
		mockFetch
			.mockReturnValueOnce(
				jsonResponse({
					open_mining_rounds: [
						{ round_number: 55, amulet_price: 0.3, opens_at: "t1", target_closes_at: "t2" },
					],
				}),
			)
			.mockReturnValueOnce(Promise.reject(new Error("timeout")));

		const stats = await fetchNetworkStats();

		expect(stats.currentRound).toBe(55);
		expect(stats.cantonCoinPrice).toBe(0.3);
		expect(stats.totalMinted).toBe(0);
		expect(stats.totalBurned).toBe(0);
		expect(stats.netSupplyChange).toBe(0);
	});

	it("returns full fallback when both calls fail", async () => {
		mockFetch
			.mockReturnValueOnce(Promise.reject(new Error("fail 1")))
			.mockReturnValueOnce(Promise.reject(new Error("fail 2")));

		const stats = await fetchNetworkStats();

		expect(stats).toEqual({
			totalTransactions: 15_000_000,
			activeValidators: 0,
			totalPartiesHosted: 0,
			currentRound: 0,
			cantonCoinPrice: 0.15,
			totalMinted: 0,
			totalBurned: 0,
			netSupplyChange: 0,
		});
	});

	it("handles empty open_mining_rounds array", async () => {
		mockFetch
			.mockReturnValueOnce(jsonResponse({ open_mining_rounds: [] }))
			.mockReturnValueOnce(jsonResponse({ closed_mining_rounds: [] }));

		const stats = await fetchNetworkStats();

		expect(stats.currentRound).toBe(0);
		expect(stats.cantonCoinPrice).toBe(0.15);
	});
});

// ---------------------------------------------------------------------------
// calculateAppRewards
// ---------------------------------------------------------------------------
describe("calculateAppRewards", () => {
	it("calculates rewards with default parameters", () => {
		const result = calculateAppRewards(1_000_000);

		expect(result.monthlyTransactions).toBe(1_000_000);
		expect(result.networkTotalTransactions).toBe(40_000_000);
		expect(result.monthlyRewardPoolCC).toBe(516_000_000);
		expect(result.ccPrice).toBe(0.15);

		const expectedShare = 1_000_000 / 40_000_000;
		const expectedCC = Math.round(expectedShare * 516_000_000);
		expect(result.estimatedMonthlyCC).toBe(expectedCC);
		expect(result.estimatedMonthlyUSD).toBe(
			Math.round(expectedCC * 0.15 * 100) / 100,
		);
	});

	it("returns zeros when networkTotalTransactions is zero", () => {
		const result = calculateAppRewards(500_000, 0);

		expect(result.estimatedMonthlyCC).toBe(0);
		expect(result.estimatedMonthlyUSD).toBe(0);
		expect(result.monthlyTransactions).toBe(500_000);
		expect(result.networkTotalTransactions).toBe(0);
	});

	it("calculates correctly with custom parameters", () => {
		const result = calculateAppRewards(
			2_000_000,
			100_000_000,
			1_000_000_000,
			0.25,
		);

		const expectedShare = 2_000_000 / 100_000_000;
		const expectedCC = Math.round(expectedShare * 1_000_000_000);
		const expectedUSD = Math.round(expectedCC * 0.25 * 100) / 100;

		expect(result.estimatedMonthlyCC).toBe(expectedCC);
		expect(result.estimatedMonthlyUSD).toBe(expectedUSD);
	});

	it("handles zero monthly transactions", () => {
		const result = calculateAppRewards(0);

		expect(result.estimatedMonthlyCC).toBe(0);
		expect(result.estimatedMonthlyUSD).toBe(0);
	});

	it("handles very large transaction counts", () => {
		const result = calculateAppRewards(
			1_000_000_000,
			1_000_000_000,
			516_000_000,
			0.15,
		);

		expect(result.estimatedMonthlyCC).toBe(516_000_000);
		expect(result.estimatedMonthlyUSD).toBe(77_400_000);
	});

	it("handles very small transaction counts", () => {
		const result = calculateAppRewards(1, 40_000_000, 516_000_000, 0.15);

		const expectedShare = 1 / 40_000_000;
		const expectedCC = Math.round(expectedShare * 516_000_000);
		expect(result.estimatedMonthlyCC).toBe(expectedCC);
	});

	it("preserves all input values in the returned object", () => {
		const result = calculateAppRewards(123, 456, 789, 1.5);

		expect(result.monthlyTransactions).toBe(123);
		expect(result.networkTotalTransactions).toBe(456);
		expect(result.monthlyRewardPoolCC).toBe(789);
		expect(result.ccPrice).toBe(1.5);
	});

	it("rounds estimatedMonthlyUSD to two decimal places", () => {
		const result = calculateAppRewards(1, 3, 100, 0.33);

		// USD is computed from unrounded CC: (1/3)*100*0.33 = 11.0
		const share = 1 / 3;
		const rawCC = share * 100;
		const rawUSD = rawCC * 0.33;
		expect(result.estimatedMonthlyUSD).toBe(
			Math.round(rawUSD * 100) / 100,
		);
	});

	it("rounds estimatedMonthlyCC to nearest integer", () => {
		const result = calculateAppRewards(1, 3, 100, 1);

		expect(Number.isInteger(result.estimatedMonthlyCC)).toBe(true);
	});
});
