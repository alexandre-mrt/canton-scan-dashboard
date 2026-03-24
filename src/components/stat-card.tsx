"use client";

import type { ReactNode } from "react";

interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: ReactNode;
	trend?: { direction: "up" | "down"; value: string };
	className?: string;
}

export function StatCard({
	title,
	value,
	subtitle,
	icon,
	trend,
	className = "",
}: StatCardProps) {
	return (
		<div className={`card glow ${className}`}>
			<div className="flex items-start justify-between mb-3">
				<span className="stat-label">{title}</span>
				<span className="text-[var(--canton-blue)]">{icon}</span>
			</div>
			<div className="stat-value">{value}</div>
			{subtitle && <p className="stat-label mt-1">{subtitle}</p>}
			{trend && (
				<div className="mt-2">
					<span
						className={`badge ${trend.direction === "up" ? "badge-green" : "badge-red"}`}
					>
						{trend.direction === "up" ? "↑" : "↓"} {trend.value}
					</span>
				</div>
			)}
		</div>
	);
}
