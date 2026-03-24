"use client";

import type { ScanUpdate } from "@/types/canton";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

interface RecentUpdatesProps {
	initialUpdates?: ScanUpdate[];
}

export function RecentUpdates({ initialUpdates = [] }: RecentUpdatesProps) {
	const [updates, setUpdates] = useState<ScanUpdate[]>(initialUpdates);
	const [loading, setLoading] = useState(initialUpdates.length === 0);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (initialUpdates.length > 0) return;

		async function fetchUpdates() {
			try {
				const res = await fetch("/api/updates");
				if (!res.ok) throw new Error("Failed to fetch updates");
				const data = await res.json();
				setUpdates(data.transactions ?? []);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		}

		fetchUpdates();
	}, [initialUpdates.length]);

	if (loading) {
		return (
			<div className="card glow">
				<h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
				<div className="animate-pulse space-y-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={`skeleton-${i}`}
							className="h-16 bg-[var(--canton-dark)] rounded-lg"
						/>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="card glow">
				<h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
				<div className="bg-[var(--canton-dark)] rounded-lg p-4 text-center">
					<p className="text-[var(--canton-muted)]">
						Unable to fetch live data from Scan API.
					</p>
					<p className="text-sm text-[var(--canton-muted)] mt-1">
						{error}
					</p>
					<p className="text-xs text-[var(--canton-muted)] mt-2">
						Connect to a Scan API endpoint via NEXT_PUBLIC_SCAN_API_URL
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="card glow">
			<h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
			{updates.length === 0 ? (
				<p className="text-[var(--canton-muted)] text-center py-8">
					No transactions found. Configure NEXT_PUBLIC_SCAN_API_URL to
					connect to a Canton Scan node.
				</p>
			) : (
				<div className="space-y-2">
					{updates.slice(0, 20).map((update) => {
						const eventCount = Object.keys(update.events_by_id).length;
						const timeAgo = formatDistanceToNow(
							new Date(update.record_time),
							{ addSuffix: true },
						);

						return (
							<div
								key={update.update_id}
								className="bg-[var(--canton-dark)] rounded-lg p-3 flex items-center justify-between hover:border-[var(--canton-blue)] border border-transparent transition-colors"
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-mono text-xs text-[var(--canton-blue)] truncate">
											{update.update_id.slice(0, 16)}...
										</span>
										<span className="badge badge-green">
											{eventCount} event{eventCount !== 1 ? "s" : ""}
										</span>
									</div>
									<div className="text-xs text-[var(--canton-muted)] mt-1">
										Sync: {update.synchronizer_id.slice(0, 20)}...
									</div>
								</div>
								<div className="text-xs text-[var(--canton-muted)] ml-4">
									{timeAgo}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
