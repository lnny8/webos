"use client"

import {useRef} from "react"
import {TOOL_ORDER} from "./constants"
import {useClock} from "./hooks/useClock"
import {useWebOSState} from "./hooks/useWebOSState"
import {useWindowManager} from "./hooks/useWindowManager"
import {ToolContent} from "./components/ToolContent"
import Squares from "../background"

export default function WebOSDesktop() {
  const desktopRef = useRef<HTMLDivElement | null>(null)
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const {clock, uptimeText} = useClock()
  const {windows, openCount, focusWindow, openWindow, closeWindow, toggleMinimize, startAction} = useWindowManager(desktopRef)
  const state = useWebOSState({openWindow, uptimeText, paintCanvasRef})

  return (
    <div className="h-screen overflow-hidden bg-[#020503] text-[#84ff9f]">
      <div className="flex h-full flex-col">
        <header className="flex h-12 items-center justify-between border-b border-[#1a6628] bg-black/85 px-4 text-xs backdrop-blur">
          <div className="flex items-center gap-4">
            <p className="tracking-[0.2em] text-[#62f588]">WEBOS // DESKTOP SHELL</p>
            <p>Windows: {openCount}</p>
          </div>
          <div className="text-right">
            <p>{clock ? clock.toLocaleTimeString("en-GB", {hour12: !state.clock24h}) : "--:--:--"}</p>
            <p className="text-[10px] opacity-80">UPTIME {uptimeText}</p>
          </div>
        </header>

        <div ref={desktopRef} className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0">
            <Squares
              direction={state.wallpaperMode === "matrix" ? "down" : state.wallpaperMode === "radar" ? "diagonal" : "right"}
              speed={state.wallpaperMode === "matrix" ? 0.7 : state.wallpaperMode === "radar" ? 1.1 : 0.6}
              borderColor="rgba(84, 255, 159, 0.26)"
              hoverFillColor="rgba(180, 255, 210, 0.24)"
              hoverBorderColor="rgba(225, 255, 238, 0.95)"
              squareSize={28}
            />
            <div className="pointer-events-none absolute inset-0" style={{boxShadow: `inset 0 0 42px rgba(84,255,159,${state.desktopGlow / 100})`}} />
            {!state.showGrid && <div className="pointer-events-none absolute inset-0 bg-[#020503]/40" />}
          </div>

          <div className="absolute left-4 top-4 max-h-[calc(100%-1rem)] overflow-auto pr-1">
            <div className="grid grid-cols-2 gap-3 w-56">
              {TOOL_ORDER.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onDoubleClick={() => openWindow(tool.id)}
                  onClick={() => openWindow(tool.id)}
                  className="rounded border border-[#2b8a42] bg-black/90 px-2 py-2 text-left text-xs shadow-[0_6px_16px_rgba(0,0,0,0.45)] backdrop-blur-[1px] hover:bg-[#102315]">
                  <p className="text-sm text-[#b8ffd0]">{tool.icon}</p>
                  <p>{tool.name}</p>
                </button>
              ))}
            </div>
          </div>

          {TOOL_ORDER.map((tool) => {
            const windowState = windows[tool.id]
            if (!windowState.isOpen || windowState.minimized) {
              return null
            }

            return (
              <article
                key={tool.id}
                className="absolute border border-[#3fb65f] bg-black/95 shadow-[0_18px_44px_rgba(0,0,0,0.7),0_0_0_1px_rgba(84,255,159,0.15)] backdrop-blur-sm"
                style={{
                  left: windowState.x,
                  top: windowState.y,
                  width: windowState.width,
                  height: windowState.height,
                  zIndex: windowState.z,
                }}
                onPointerDown={() => focusWindow(tool.id)}>
                <div onPointerDown={(event) => startAction(event, tool.id, "drag")} className="flex h-10 cursor-move items-center justify-between border-b border-[#3fb65f] bg-[#041008]/95 px-3 text-xs">
                  <p>
                    {tool.icon} {tool.name} | {tool.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <button type="button" className="h-6 w-6 border border-[#2b8a42] bg-[#0a1d0f] hover:bg-[#13321a]" onClick={() => toggleMinimize(tool.id)}>
                      _
                    </button>
                    <button type="button" className="h-6 w-6 border border-[#6a2020] bg-[#2b1010] hover:bg-[#4a1717]" onClick={() => closeWindow(tool.id)}>
                      X
                    </button>
                  </div>
                </div>

                <div className="h-[calc(100%-40px)] overflow-auto p-3 bg-[#020503]/92">
                  <ToolContent id={tool.id} state={state} paintCanvasRef={paintCanvasRef} />
                </div>

                <button type="button" aria-label="resize" onPointerDown={(event) => startAction(event, tool.id, "resize")} className="absolute bottom-1 right-1 h-4 w-4 cursor-se-resize border border-[#1a6628] bg-[#0d1e11]" />
              </article>
            )
          })}
        </div>

        <footer className="flex h-14 items-center gap-2 border-t border-[#1a6628] bg-black/90 px-3 overflow-x-auto">
          <p className="mr-2 border border-[#1a6628] bg-[#07140b] px-2 py-1 text-xs">START</p>
          {TOOL_ORDER.filter((tool) => windows[tool.id].isOpen).map((tool) => {
            const win = windows[tool.id]
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  toggleMinimize(tool.id)
                }}
                className={`border px-3 py-1.5 text-xs ${win.isOpen && !win.minimized ? "border-[#63ff8d] bg-[#12361d] text-[#ccffd9]" : "border-[#1a6628] bg-[#061009] hover:bg-[#102315]"}`}>
                {tool.icon} {tool.name}
              </button>
            )
          })}
        </footer>
      </div>
    </div>
  )
}
