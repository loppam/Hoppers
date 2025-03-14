import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Hoppers - A Farcaster Frame Game";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #3b82f6, #1d4ed8)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          padding: "48px",
        }}
      >
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Hoppers
        </h1>
        <p style={{ fontSize: "32px", textAlign: "center" }}>
          A fun Flappy Bird-style game for Farcaster Frames
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
