import { ImageResponse } from "next/og";

export const alt = "Hawker Guessr — one photo, one pin, every day";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 78px",
        background: "#eee5d3",
        color: "#29251f",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 }}>
        <span style={{ fontFamily: "monospace", letterSpacing: 5, textTransform: "uppercase" }}>
          Hawker Guessr
        </span>
        <span>🇸🇬</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: 900, fontSize: 92, fontStyle: "italic", lineHeight: 1.02 }}>
          One photo. One pin. How well do you know Singapore?
        </div>
        <div style={{ marginTop: 38, color: "#8d3f34", fontFamily: "monospace", fontSize: 25 }}>
          🟩 🟨 🟧 ⬜ · New puzzle every day
        </div>
      </div>
    </div>,
    size,
  );
}
