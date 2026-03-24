"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const EMISSION_DATA = generateEmissionData();

function generateEmissionData() {
	const data = [];
	const startYear = 2025;
	const totalMinable = 100_000_000_000;
	let cumulative = 0;

	for (let year = 0; year <= 10; year++) {
		const yearlyEmission = (totalMinable / 10) * (1 - year * 0.05);
		cumulative += yearlyEmission;
		const burned = cumulative * 0.15 * (1 + year * 0.05);

		data.push({
			year: `${startYear + year}`,
			emitted: Math.round(cumulative / 1_000_000_000),
			burned: Math.round(burned / 1_000_000_000),
			circulating: Math.round((cumulative - burned) / 1_000_000_000),
		});
	}

	return data;
}

const REWARD_SPLIT = [
	{ name: "App Builders", share: 50, future: 62, color: "#0052ff" },
	{ name: "Super Validators", share: 35, future: 20, color: "#10b981" },
	{ name: "Validators (Users)", share: 15, future: 15, color: "#f59e0b" },
	{ name: "Dev Fund (CIP-0100)", share: 0, future: 5, color: "#8b5cf6" },
];

export function TokenomicsChart() {
	return (
		<div className="space-y-6">
			<div className="card glow">
				<h2 className="text-xl font-bold mb-2">
					Canton Coin Supply Projection (10 Years)
				</h2>
				<p className="stat-label mb-4">
					Projected emission, burn, and circulating supply in billions of CC
				</p>
				<ResponsiveContainer width="100%" height={350}>
					<AreaChart data={EMISSION_DATA}>
						<CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
						<XAxis dataKey="year" stroke="#9ca3af" />
						<YAxis stroke="#9ca3af" unit="B" />
						<Tooltip
							contentStyle={{
								background: "#111827",
								border: "1px solid #1f2937",
								borderRadius: "8px",
							}}
							labelStyle={{ color: "#e5e7eb" }}
						/>
						<Legend />
						<Area
							type="monotone"
							dataKey="emitted"
							name="Total Emitted"
							stroke="#0052ff"
							fill="rgba(0,82,255,0.2)"
						/>
						<Area
							type="monotone"
							dataKey="burned"
							name="Total Burned"
							stroke="#ef4444"
							fill="rgba(239,68,68,0.1)"
						/>
						<Area
							type="monotone"
							dataKey="circulating"
							name="Circulating"
							stroke="#10b981"
							fill="rgba(16,185,129,0.2)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			<div className="card glow">
				<h2 className="text-xl font-bold mb-4">Reward Distribution</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h3 className="font-semibold mb-3 text-[var(--canton-muted)]">
							Current Split
						</h3>
						{REWARD_SPLIT.map((item) => (
							<div key={item.name} className="mb-3">
								<div className="flex justify-between text-sm mb-1">
									<span>{item.name}</span>
									<span className="font-semibold">{item.share}%</span>
								</div>
								<div className="h-2 bg-[var(--canton-dark)] rounded-full overflow-hidden">
									<div
										className="h-full rounded-full transition-all"
										style={{
											width: `${item.share}%`,
											background: item.color,
										}}
									/>
								</div>
							</div>
						))}
					</div>
					<div>
						<h3 className="font-semibold mb-3 text-[var(--canton-muted)]">
							From Jan 2026 (Current)
						</h3>
						{REWARD_SPLIT.map((item) => (
							<div key={item.name} className="mb-3">
								<div className="flex justify-between text-sm mb-1">
									<span>{item.name}</span>
									<span className="font-semibold">{item.future}%</span>
								</div>
								<div className="h-2 bg-[var(--canton-dark)] rounded-full overflow-hidden">
									<div
										className="h-full rounded-full transition-all"
										style={{
											width: `${item.future}%`,
											background: item.color,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
