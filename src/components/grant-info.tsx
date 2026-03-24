"use client";

const GRANT_FOCUS_AREAS = [
	{
		area: "Core R&D",
		description: "Advancing the Canton protocol and network capabilities",
		icon: "🔬",
	},
	{
		area: "Developer Tools",
		description: "Building, testing, and operating on Canton",
		icon: "🛠️",
	},
	{
		area: "Security",
		description: "Audits, remediation, and hardening",
		icon: "🛡️",
	},
	{
		area: "Reference Implementations",
		description: "Reusable patterns for other builders",
		icon: "📦",
	},
	{
		area: "DeFi Liquidity",
		description: "Seeding liquidity to support early utility",
		icon: "💧",
	},
	{
		area: "Infrastructure",
		description: "Critical ecosystem infrastructure",
		icon: "🏗️",
	},
];

export function GrantInfo() {
	return (
		<div className="card glow">
			<h2 className="text-xl font-bold mb-2">Canton Foundation Grants</h2>
			<p className="stat-label mb-6">
				5% of all CC emissions fund the Protocol Development Fund (CIP-0100).
				Milestone-based grants paid in Canton Coin.
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
				{GRANT_FOCUS_AREAS.map((item) => (
					<div
						key={item.area}
						className="bg-[var(--canton-dark)] rounded-lg p-4 border border-[var(--canton-border)]"
					>
						<div className="text-2xl mb-2">{item.icon}</div>
						<h3 className="font-semibold text-sm">{item.area}</h3>
						<p className="text-xs text-[var(--canton-muted)] mt-1">
							{item.description}
						</p>
					</div>
				))}
			</div>

			<div className="bg-[var(--canton-dark)] rounded-lg p-4">
				<h3 className="font-semibold mb-3">How to Apply</h3>
				<ol className="space-y-2 text-sm text-[var(--canton-muted)]">
					<li className="flex gap-2">
						<span className="badge badge-blue shrink-0">1</span>
						Find a champion in the Tech & Ops Committee (or get Canton
						Foundation member endorsement)
					</li>
					<li className="flex gap-2">
						<span className="badge badge-blue shrink-0">2</span>
						Submit a PR to{" "}
						<a
							href="https://github.com/canton-foundation/canton-dev-fund"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[var(--canton-blue)] underline"
						>
							canton-foundation/canton-dev-fund
						</a>
					</li>
					<li className="flex gap-2">
						<span className="badge badge-blue shrink-0">3</span>
						Tech & Ops Committee evaluates: impact, feasibility, security,
						cost effectiveness
					</li>
					<li className="flex gap-2">
						<span className="badge badge-blue shrink-0">4</span>
						Milestone-based funding released upon demonstrated completion
					</li>
				</ol>
			</div>
		</div>
	);
}
