import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: "#222222",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 68,
            fontWeight: 700,
            letterSpacing: -2,
            fontFamily: "sans-serif",
          }}
        >
          nk
        </span>
      </div>
    ),
    { ...size }
  );
}
