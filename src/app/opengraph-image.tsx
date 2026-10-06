import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site"

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const icon = await readFile(join(process.cwd(), "src/app/icon.png"))
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`

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
          background: "#0d0b09",
          color: "#f0ebe3",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
          <img src={iconSrc} width={120} height={120} alt="" style={{ borderRadius: 28 }} />
          <div style={{ fontSize: 96, fontWeight: 800, color: "#d4a843" }}>{SITE_NAME}</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 60, fontWeight: 700 }}>{`${SITE_TAGLINE}.`}</div>
        <div style={{ marginTop: 24, fontSize: 32, color: "#b5a898" }}>
          Bulk archive, privatize, delete, tag and rename your GitHub repos.
        </div>
      </div>
    ),
    size
  )
}
