import { ImageResponse } from "next/og"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site"

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#14181c",
          color: "#f0ebe3",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Mark />
          <div style={{ fontSize: 96, fontWeight: 800, color: "#f2f0eb" }}>{SITE_NAME}</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 60, fontWeight: 700, color: "#f2f0eb" }}>Your best work is in there. Somewhere.</div>
        <div style={{ marginTop: 24, fontSize: 32, color: "#b5a898" }}>
          Sort, archive and tidy dozens of GitHub repos at once. Free check-up, no sign-in.
        </div>
      </div>
    ),
    size
  )
}

/** The GitFit mark (same as src/app/icon.svg): a 2x2 grid, last piece dropping in. */
function Mark() {
  const square = (left: number, top: number, color: string, transform?: string) => (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 34,
        height: 34,
        borderRadius: 5,
        background: color,
        ...(transform ? { transform } : {}),
      }}
    />
  )
  return (
    <div style={{ position: "relative", display: "flex", width: 120, height: 120, borderRadius: 26, background: "#1a1f24" }}>
      {square(22, 22, "#f2f0eb")}
      {square(64, 22, "#f2f0eb")}
      {square(22, 64, "#f2f0eb")}
      {square(70, 58, "#d4ff3a", "rotate(18deg)")}
    </div>
  )
}
