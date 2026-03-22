import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Laptiming Results — Kakucs Ring";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#08080c",
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: "0.1em",
            background: "linear-gradient(135deg, #ffffff 0%, #00e5ff 100%)",
            backgroundClip: "text",
            color: "transparent",
            display: "flex",
          }}
        >
          LAPTIMING
        </div>
        <div
          style={{
            fontSize: 24,
            letterSpacing: "0.3em",
            color: "#888",
            marginTop: 8,
            display: "flex",
          }}
        >
          KAKUCS RING
        </div>
        <div
          style={{
            display: "flex",
            gap: 60,
            marginTop: 50,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 20, color: "#00e5ff", display: "flex" }}>
              JANI
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#00e5ff",
                display: "flex",
              }}
            >
              0:42.200
            </div>
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 900,
              color: "#333",
              display: "flex",
            }}
          >
            VS
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 20, color: "#ff3547", display: "flex" }}>
              CSABI
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#ff3547",
                display: "flex",
              }}
            >
              0:43.182
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#555",
            marginTop: 40,
            display: "flex",
          }}
        >
          342 autó tesztelve
        </div>
      </div>
    ),
    { ...size }
  );
}
