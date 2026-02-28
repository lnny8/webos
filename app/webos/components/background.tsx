type BackgroundProps = {
  mode: "grid" | "matrix" | "radar"
  showGrid: boolean
  glow: number
}

const modeBackground: Record<BackgroundProps["mode"], string> = {
  grid: "radial-gradient(ellipse at top right, rgba(46,130,68,0.22), rgba(2,5,3,1) 46%)",
  matrix: "radial-gradient(ellipse at top, rgba(44,120,66,0.38), rgba(2,5,3,1) 52%), repeating-linear-gradient(180deg, rgba(116,255,154,0.08) 0px, rgba(116,255,154,0.08) 1px, transparent 1px, transparent 14px)",
  radar: "radial-gradient(circle at center, rgba(100,255,145,0.22), rgba(2,5,3,1) 58%), repeating-radial-gradient(circle at center, rgba(100,255,145,0.1) 0px, rgba(100,255,145,0.1) 1px, transparent 1px, transparent 34px)",
}

export default function Background({mode, showGrid, glow}: BackgroundProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 webos-squares" style={{backgroundImage: modeBackground[mode]}} />

      {showGrid && <div className="absolute inset-0 webos-grid" />}

      <div className="absolute inset-0" style={{boxShadow: `inset 0 0 40px rgba(84,255,159,${glow / 100})`}} />

      <style jsx>{`
        .webos-squares {
          animation: webos-squares-shift 18s linear infinite;
          background-size: auto;
          background-position: 0 0;
        }

        .webos-grid {
          background-image:
            linear-gradient(rgba(52, 127, 74, 0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52, 127, 74, 0.14) 1px, transparent 1px);
          background-size: 26px 26px, 26px 26px;
          animation: webos-grid-shift 22s linear infinite;
        }

        @keyframes webos-squares-shift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-14px, 10px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes webos-grid-shift {
          0% {
            background-position: 0 0, 0 0;
          }
          100% {
            background-position: 26px 26px, -26px -26px;
          }
        }
      `}</style>
    </div>
  )
}
