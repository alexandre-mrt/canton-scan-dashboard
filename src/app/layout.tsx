import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Canton Scan Dashboard — Network Analytics",
	description:
		"Real-time analytics dashboard for the Canton Network. Track transactions, mining rounds, tokenomics, and app rewards.",
	keywords: ["Canton", "Canton Network", "blockchain", "analytics", "DeFi", "tokenization"],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
