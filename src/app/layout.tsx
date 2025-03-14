import type { Metadata } from "next";
import "~/app/globals.css";

export const metadata: Metadata = {
  title: "Hoppers - Farcaster Frame Game",
  description: "A fun Flappy Bird-style game built for Farcaster Frames",
  openGraph: {
    title: "Hoppers - Farcaster Frame Game",
    description: "A fun Flappy Bird-style game built for Farcaster Frames",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Hoppers - A Farcaster Frame Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoppers - Farcaster Frame Game",
    description: "A fun Flappy Bird-style game built for Farcaster Frames",
    images: ["/twitter-image"],
    creator: "@Lopam_",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
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
