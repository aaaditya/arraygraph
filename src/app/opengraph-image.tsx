import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)",
        color: "white",
      }}
    >
      <div style={{ fontSize: 88, fontWeight: 800 }}>{siteConfig.name}</div>
      <div style={{ fontSize: 40, marginTop: 24, opacity: 0.9 }}>{siteConfig.tagline}</div>
      <div style={{ fontSize: 28, marginTop: 40, opacity: 0.75 }}>
        DSA, system design and interview prep, taught visually.
      </div>
    </div>,
    size,
  );
}
