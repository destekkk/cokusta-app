import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 28,
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "0.02em",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1d4d3c",
            fontSize: 42,
          }}
        >
          cok
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#00a86b",
            fontSize: 40,
          }}
        >
          usta
        </div>
      </div>
    ),
    { ...size },
  );
}
