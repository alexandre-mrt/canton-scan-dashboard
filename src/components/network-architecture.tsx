"use client";

const ARCHITECTURE_NODES = [
	{
		name: "Participant Nodes",
		description: "Host Daml parties, maintain contract state, process transactions",
		icon: "🖥️",
		color: "#0052ff",
	},
	{
		name: "Sequencer Nodes",
		description: "Provide ordered message delivery with timestamps, content-agnostic",
		icon: "📡",
		color: "#10b981",
	},
	{
		name: "Mediator Nodes",
		description: "Coordinate 2-phase commit consensus between participants",
		icon: "⚖️",
		color: "#f59e0b",
	},
];

const PRIVACY_FEATURES = [
	{
		title: "Sub-Transaction Privacy",
		description:
			"Each party only sees the parts of a transaction that involve them. A bank sees cash movements, a registrar sees asset transfers.",
	},
	{
		title: "Content-Agnostic Sequencing",
		description:
			"Sequencers order messages without accessing their content. Payloads can be encrypted.",
	},
	{
		title: "Sender Anonymity",
		description:
			"Message recipients don't learn the identity of the sender, preserving transaction confidentiality.",
	},
	{
		title: "Need-to-Know Basis",
		description:
			"Network operators see only limited metadata for ordering and consistency verification.",
	},
];

const SUPER_VALIDATORS = [
	"Goldman Sachs",
	"Broadridge",
	"Cboe Global Markets",
	"EquiLend",
	"S&P Global",
	"Moody's",
	"BNY Mellon",
	"DTCC",
	"Paxos",
	"Circle",
	"Deutsche Börse",
	"SIX Group",
	"Tradeweb",
];

export function NetworkArchitecture() {
	return (
		<div className="space-y-6">
			<div className="card glow">
				<h2 className="text-xl font-bold mb-4">Canton Network Architecture</h2>
				<p className="stat-label mb-6">
					Canton uses a three-node architecture for privacy-preserving consensus
				</p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					{ARCHITECTURE_NODES.map((node) => (
						<div
							key={node.name}
							className="bg-[var(--canton-dark)] rounded-lg p-4 border border-[var(--canton-border)]"
						>
							<div className="text-3xl mb-2">{node.icon}</div>
							<h3
								className="font-bold mb-1"
								style={{ color: node.color }}
							>
								{node.name}
							</h3>
							<p className="text-sm text-[var(--canton-muted)]">
								{node.description}
							</p>
						</div>
					))}
				</div>

				<div className="bg-[var(--canton-dark)] rounded-lg p-4 border border-[var(--canton-border)]">
					<h3 className="font-semibold mb-2">Transaction Flow</h3>
					<div className="flex flex-wrap items-center gap-2 text-sm">
						{[
							"Submit TX",
							"Sequencer Orders",
							"Mediator Coordinates",
							"Participants Confirm",
							"Atomic Commit",
						].map((step, i) => (
							<div key={step} className="flex items-center gap-2">
								<span className="badge badge-blue">{i + 1}. {step}</span>
								{i < 4 && (
									<span className="text-[var(--canton-muted)]">→</span>
								)}
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="card glow">
				<h2 className="text-xl font-bold mb-4">Privacy Model</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{PRIVACY_FEATURES.map((feature) => (
						<div
							key={feature.title}
							className="bg-[var(--canton-dark)] rounded-lg p-4"
						>
							<h3 className="font-semibold text-[var(--canton-green)] mb-1">
								{feature.title}
							</h3>
							<p className="text-sm text-[var(--canton-muted)]">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>

			<div className="card glow">
				<h2 className="text-xl font-bold mb-4">
					Super Validators ({SUPER_VALIDATORS.length})
				</h2>
				<p className="stat-label mb-4">
					Canton&apos;s consensus is validated by an invite-only set of institutional
					Super Validators
				</p>
				<div className="flex flex-wrap gap-2">
					{SUPER_VALIDATORS.map((sv) => (
						<span key={sv} className="badge badge-blue">
							{sv}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}
