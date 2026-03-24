export interface ScanUpdate {
	update_id: string;
	migration_id: number;
	synchronizer_id: string;
	record_time: string;
	workflow_id: string;
	effective_at: string;
	root_event_ids: string[];
	events_by_id: Record<string, ScanEvent>;
}

export interface ScanEvent {
	event_type: "created_event" | "exercised_event";
	contract_id: string;
	template_id: string;
	package_name: string;
}

export interface CreatedEvent extends ScanEvent {
	event_type: "created_event";
	create_arguments: Record<string, unknown>;
	signatories: string[];
	observers: string[];
}

export interface ExercisedEvent extends ScanEvent {
	event_type: "exercised_event";
	choice: string;
	choice_argument: Record<string, unknown>;
	exercise_result: unknown;
	child_event_ids: string[];
	consuming: boolean;
	acting_parties: string[];
}

export interface UpdatesResponse {
	transactions: ScanUpdate[];
}

export interface AcsSnapshotTimestamp {
	snapshot_timestamp: string;
}

export interface ValidatorInfo {
	validator: string;
	participant_id: string;
}

export interface DsoInfo {
	sv_name: string;
	sv_party_id: string;
	public_url: string;
}

export interface OpenMiningRound {
	round_number: number;
	amulet_price: number;
	opens_at: string;
	target_closes_at: string;
}

export interface ClosedMiningRound {
	round_number: number;
	effective_at: string;
	total_amulet_minted: number;
	total_amulet_burned: number;
}

export interface NetworkStats {
	totalTransactions: number;
	activeValidators: number;
	totalPartiesHosted: number;
	currentRound: number;
	cantonCoinPrice: number;
	totalMinted: number;
	totalBurned: number;
	netSupplyChange: number;
}

export interface TimeSeriesPoint {
	timestamp: string;
	value: number;
	label: string;
}

export interface AppRewardEstimate {
	monthlyTransactions: number;
	networkTotalTransactions: number;
	monthlyRewardPoolCC: number;
	ccPrice: number;
	estimatedMonthlyCC: number;
	estimatedMonthlyUSD: number;
}
