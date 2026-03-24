import { getUpdates } from "@/lib/canton-api";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const data = await getUpdates(20);
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{
				transactions: [],
				error: error instanceof Error ? error.message : "Failed to fetch updates",
			},
			{ status: 200 },
		);
	}
}
