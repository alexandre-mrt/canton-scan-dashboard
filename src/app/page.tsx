"use client";

import { GrantInfo } from "@/components/grant-info";
import { NetworkArchitecture } from "@/components/network-architecture";
import { RecentUpdates } from "@/components/recent-updates";
import { RewardCalculator } from "@/components/reward-calculator";
import { StatCard } from "@/components/stat-card";
import { TokenomicsChart } from "@/components/tokenomics-chart";
import type { NetworkStats } from "@/types/canton";
import {
	Activity,
	Coins,
	Database,
	Flame,
	Globe,
	RefreshCw,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Tab = "overview" | "tokenomics" | "architecture" | "rewards" | "grants";

const DEFAULT_STATS: NetworkStats = {
	totalTransactions: 15_000_000,
	activeValidators: 100,
	totalPartiesHosted: 0,
	currentRound: 0,
	cantonCoinPrice: 0.15,
	totalMinted: 22_000_000_000,
	totalBurned: 3_000_000_000,
	netSupplyChange: 19_000_000_000,
};

const TABS: { id: Tab; label: string }[] = [
	{ id: "overview", label: "Overview" },
	{ id: "tokenomics", label: "Tokenomics" },
	{ id: "architecture", label: "Architecture" },
	{ id: "rewards", label: "App Rewards" },
	{ id: "grants", label: "Grants" },
];

const POLL_INTERVAL_MS = 30_000;

function formatLargeNumber(n: number): string {
	if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toString();
}

function formatTimestamp(date: Date): string {
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

export default function Dashboard() {
	const [activeTab, setActiveTab] = useState<Tab>("overview");
	const [stats, setStats] = useState<NetworkStats>(DEFAULT_STATS);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchStats = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/stats");
			if (!res.ok) throw new Error(`API returned ${res.status}`);
			const data = await res.json();
			if (!data.error) {
				setStats((prev) => ({ ...prev, ...data }));
			}
			setLastUpdated(new Date());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch stats");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStats();

		intervalRef.current = setInterval(fetchStats, POLL_INTERVAL_MS);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [fetchStats]);

	return (
		<div className="min-h-screen">
			{/* Header */}
			<header className="border-b border-[var(--canton-border)] bg-[var(--canton-card)]">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold gradient-text">
								Canton Scan Dashboard
							</h1>
							<p className="text-sm text-[var(--canton-muted)]">
								Real-time analytics for the Canton Network
							</p>
						</div>
						<div className="flex items-center gap-3">
							{lastUpdated && (
								<span className="text-xs text-[var(--canton-muted)]">
									Last updated: {formatTimestamp(lastUpdated)}
								</span>
							)}
							<button
								type="button"
								onClick={fetchStats}
								disabled={loading}
								className="text-[var(--canton-muted)] hover:text-white transition-colors disabled:opacity-50"
								title="Refresh stats"
							>
								<RefreshCw size={16} className={loading ? "animate-spin" : ""} />
							</button>
							<span className="badge badge-green">
								<span className="w-2 h-2 bg-[var(--canton-green)] rounded-full" />
								Mainnet
							</span>
							<a
								href="https://github.com/canton-foundation/canton-dev-fund"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-[var(--canton-blue)] hover:underline"
							>
								Apply for Grant
							</a>
						</div>
					</div>

					{/* Tabs */}
					<nav className="flex gap-1 mt-4 -mb-[1px]">
						{TABS.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
									activeTab === tab.id
										? "bg-[var(--canton-dark)] text-white border border-[var(--canton-border)] border-b-transparent"
										: "text-[var(--canton-muted)] hover:text-white"
								}`}
							>
								{tab.label}
							</button>
						))}
					</nav>
				</div>
			</header>

			{/* Error banner */}
			{error && (
				<div className="max-w-7xl mx-auto px-4 mt-4">
					<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center justify-between">
						<span className="text-sm text-red-400">
							Failed to load stats: {error}
						</span>
						<button
							type="button"
							onClick={fetchStats}
							className="text-sm text-red-400 hover:text-red-300 underline"
						>
							Retry
						</button>
					</div>
				</div>
			)}

			{/* Content */}
			<main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
				{activeTab === "overview" && (
					<>
						{/* Stats Grid */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
							<StatCard
								title="Monthly Transactions"
								value={`${formatLargeNumber(stats.totalTransactions)}+`}
								subtitle="~5 TPS average"
								icon={<Activity size={20} />}
								trend={{ direction: "up", value: "40% MoM" }}
							/>
							<StatCard
								title="Canton Coin Price"
								value={`$${stats.cantonCoinPrice.toFixed(2)}`}
								subtitle="CC/USD"
								icon={<Coins size={20} />}
							/>
							<StatCard
								title="Circulating Supply"
								value={`${formatLargeNumber(stats.totalMinted)}`}
								subtitle="~22B CC in circulation"
								icon={<Database size={20} />}
							/>
							<StatCard
								title="App Reward Pool"
								value="516M CC"
								subtitle="62% of emissions, monthly"
								icon={<Zap size={20} />}
								trend={{ direction: "up", value: "62% share" }}
							/>
						</div>

						{/* Secondary Stats */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
							<StatCard
								title="Super Validators"
								value="13"
								subtitle="Goldman, Broadridge, DTCC..."
								icon={<Users size={20} />}
							/>
							<StatCard
								title="Daily Ledger Events"
								value="3M+"
								subtitle="Growing 20x YoY"
								icon={<Globe size={20} />}
							/>
							<StatCard
								title="Tokenized Assets"
								value="$6T+"
								subtitle="Represented on Canton"
								icon={<TrendingUp size={20} />}
							/>
							<StatCard
								title="Burn Rate"
								value={formatLargeNumber(stats.totalBurned)}
								subtitle="Usage fees burned"
								icon={<Flame size={20} />}
							/>
						</div>

						<RecentUpdates />
					</>
				)}

				{activeTab === "tokenomics" && <TokenomicsChart />}
				{activeTab === "architecture" && <NetworkArchitecture />}
				{activeTab === "rewards" && <RewardCalculator />}
				{activeTab === "grants" && <GrantInfo />}
			</main>

			{/* Footer */}
			<footer className="border-t border-[var(--canton-border)] mt-12">
				<div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-[var(--canton-muted)]">
					<p>
						Canton Scan Dashboard — Open source analytics for the Canton
						Network
					</p>
					<p className="mt-1">
						Data sourced from Canton Scan API. Not affiliated with Digital
						Asset.
					</p>
					<div className="flex justify-center gap-4 mt-3">
						<a
							href="https://www.canton.network/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--canton-blue)] hover:underline"
						>
							Canton Network
						</a>
						<a
							href="https://docs.digitalasset.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--canton-blue)] hover:underline"
						>
							Documentation
						</a>
						<a
							href="https://canton.foundation/grants-program/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--canton-blue)] hover:underline"
						>
							Grants Program
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
