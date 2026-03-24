"use client";

import { calculateAppRewards } from "@/lib/canton-api";
import { useState } from "react";

export function RewardCalculator() {
	const [txCount, setTxCount] = useState(100_000);
	const [ccPrice, setCcPrice] = useState(0.15);

	const estimate = calculateAppRewards(txCount, 40_000_000, 516_000_000, ccPrice);

	const formatNumber = (n: number) =>
		new Intl.NumberFormat("en-US").format(n);

	const formatUSD = (n: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(n);

	return (
		<div className="card glow">
			<h2 className="text-xl font-bold mb-4">App Reward Calculator</h2>
			<p className="stat-label mb-6">
				Estimate your monthly earnings as a Featured App on Canton Network.
				Apps earn 62% of all CC emissions based on transaction share.
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				<div>
					<label className="block stat-label mb-2" htmlFor="tx-count">
						Your Monthly Transactions
					</label>
					<input
						id="tx-count"
						type="range"
						min={1000}
						max={5_000_000}
						step={1000}
						value={txCount}
						onChange={(e) => setTxCount(Number(e.target.value))}
						className="w-full accent-[var(--canton-blue)]"
					/>
					<div className="text-lg font-semibold mt-1">
						{formatNumber(txCount)} txs/month
					</div>
				</div>

				<div>
					<label className="block stat-label mb-2" htmlFor="cc-price">
						Canton Coin Price (USD)
					</label>
					<input
						id="cc-price"
						type="range"
						min={0.01}
						max={2.0}
						step={0.01}
						value={ccPrice}
						onChange={(e) => setCcPrice(Number(e.target.value))}
						className="w-full accent-[var(--canton-blue)]"
					/>
					<div className="text-lg font-semibold mt-1">
						${ccPrice.toFixed(2)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-[var(--canton-dark)] rounded-lg p-4">
					<div className="stat-label">Network Share</div>
					<div className="text-2xl font-bold text-[var(--canton-blue)]">
						{((txCount / 40_000_000) * 100).toFixed(4)}%
					</div>
				</div>
				<div className="bg-[var(--canton-dark)] rounded-lg p-4">
					<div className="stat-label">Monthly CC Earned</div>
					<div className="text-2xl font-bold text-[var(--canton-green)]">
						{formatNumber(estimate.estimatedMonthlyCC)} CC
					</div>
				</div>
				<div className="bg-[var(--canton-dark)] rounded-lg p-4">
					<div className="stat-label">Monthly Revenue (USD)</div>
					<div className="text-2xl font-bold gradient-text">
						{formatUSD(estimate.estimatedMonthlyUSD)}
					</div>
				</div>
			</div>

			<p className="stat-label mt-4 text-xs">
				Based on 40M total network transactions/month and 516M CC monthly
				reward pool. Actual rewards depend on Featured App status and real-time
				network conditions.
			</p>
		</div>
	);
}
