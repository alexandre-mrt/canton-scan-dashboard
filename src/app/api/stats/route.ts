import { fetchNetworkStats } from "@/lib/canton-api";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const stats = await fetchNetworkStats();
		return NextResponse.json(stats);
	} catch (error) {
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Failed to fetch stats",
			},
			{ status: 500 },
		);
	}
}
