import { describe, expect, it } from "vitest";
import { calculateAppRewards } from "@/lib/canton-api";

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
