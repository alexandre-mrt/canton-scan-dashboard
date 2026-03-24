import type {
	AcsSnapshotTimestamp,
	ClosedMiningRound,
	DsoInfo,
	NetworkStats,
	OpenMiningRound,
	UpdatesResponse,
	ValidatorInfo,
} from "@/types/canton";

const SCAN_API_BASE =
	process.env.NEXT_PUBLIC_SCAN_API_URL ?? "https://scan.sv-2.canton.network/api/scan";

const CANTON_NODES_API =
	process.env.NEXT_PUBLIC_CANTON_NODES_API ?? "https://api.cantonnodes.com";

async function fetchScanApi<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const url = `${SCAN_API_BASE}${endpoint}`;
	const response = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		next: { revalidate: 60 },
	});

	if (!response.ok) {
		throw new Error(`Scan API error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

export async function getUpdates(
	pageSize = 20,
	after?: { after_migration_id: number; after_record_time: string },
): Promise<UpdatesResponse> {
	return fetchScanApi<UpdatesResponse>("/v2/updates", {
		method: "POST",
		body: JSON.stringify({ page_size: pageSize, after }),
	});
}

export async function getUpdateById(
	updateId: string,
): Promise<{ transaction: UpdatesResponse["transactions"][0] }> {
	return fetchScanApi(`/v2/updates/${encodeURIComponent(updateId)}`);
}

export async function getAcsSnapshotTimestamp(): Promise<AcsSnapshotTimestamp> {
	return fetchScanApi<AcsSnapshotTimestamp>("/v0/state/acs/snapshot-timestamp");
}

export async function getOpenMiningRounds(): Promise<{
	open_mining_rounds: OpenMiningRound[];
}> {
	return fetchScanApi("/v0/state/open-mining-rounds");
}

export async function getClosedMiningRounds(
	pageSize = 10,
): Promise<{ closed_mining_rounds: ClosedMiningRound[] }> {
	return fetchScanApi("/v0/state/closed-mining-rounds", {
		method: "POST",
		body: JSON.stringify({ page_size: pageSize }),
	});
}

export async function getDsoInfo(): Promise<DsoInfo[]> {
	return fetchScanApi<DsoInfo[]>("/v0/dso/info");
}

export async function getValidators(): Promise<ValidatorInfo[]> {
	return fetchScanApi<ValidatorInfo[]>("/v0/state/validators");
}

export function calculateAppRewards(
	monthlyTransactions: number,
	networkTotalTransactions = 40_000_000,
	monthlyRewardPoolCC = 516_000_000,
	ccPrice = 0.15,
) {
	if (networkTotalTransactions === 0) {
		return {
			monthlyTransactions,
			networkTotalTransactions,
			monthlyRewardPoolCC,
			ccPrice,
			estimatedMonthlyCC: 0,
			estimatedMonthlyUSD: 0,
		};
	}

	const share = monthlyTransactions / networkTotalTransactions;
	const estimatedMonthlyCC = share * monthlyRewardPoolCC;
	const estimatedMonthlyUSD = estimatedMonthlyCC * ccPrice;

	return {
		monthlyTransactions,
		networkTotalTransactions,
		monthlyRewardPoolCC,
		ccPrice,
		estimatedMonthlyCC: Math.round(estimatedMonthlyCC),
		estimatedMonthlyUSD: Math.round(estimatedMonthlyUSD * 100) / 100,
	};
}

export async function fetchNetworkStats(): Promise<NetworkStats> {
	try {
		const [openRounds, closedRounds] = await Promise.allSettled([
			getOpenMiningRounds(),
			getClosedMiningRounds(50),
		]);

		const currentRound =
			openRounds.status === "fulfilled"
				? (openRounds.value.open_mining_rounds[0]?.round_number ?? 0)
				: 0;

		const cantonCoinPrice =
			openRounds.status === "fulfilled"
				? (openRounds.value.open_mining_rounds[0]?.amulet_price ?? 0.15)
				: 0.15;

		let totalMinted = 0;
		let totalBurned = 0;
		if (closedRounds.status === "fulfilled") {
			for (const round of closedRounds.value.closed_mining_rounds) {
				totalMinted += round.total_amulet_minted;
				totalBurned += round.total_amulet_burned;
			}
		}

		return {
			totalTransactions: 15_000_000,
			activeValidators: 0,
			totalPartiesHosted: 0,
			currentRound,
			cantonCoinPrice,
			totalMinted,
			totalBurned,
			netSupplyChange: totalMinted - totalBurned,
		};
	} catch {
		return {
			totalTransactions: 15_000_000,
			activeValidators: 0,
			totalPartiesHosted: 0,
			currentRound: 0,
			cantonCoinPrice: 0.15,
			totalMinted: 0,
			totalBurned: 0,
			netSupplyChange: 0,
		};
	}
}
