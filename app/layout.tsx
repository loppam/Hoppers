import type { Metadata } from "next";
import "~/app/globals.css";

export const metadata: Metadata = {
  title: "Hoppers - Farcaster Frame Game",
  description: "A fun Flappy Bird-style game for Farcaster Frames",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
