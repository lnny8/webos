"use client"

import {useRef} from "react"
import {DESKTOP_SECTIONS, TOOL_ORDER} from "./constants"
import {useClock} from "./hooks/useClock"
import {useWebOSState} from "./hooks/useWebOSState"
import {useWindowManager} from "./hooks/useWindowManager"
import {ToolContent} from "./components/ToolContent"
import Squares from "../background"

const TOOL_MAP = new Map(TOOL_ORDER.map((tool) => [tool.id, tool]))

export default function WebOSDesktop() {
  const desktopRef = useRef<HTMLDivElement | null>(null)
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const {clock, uptimeText} = useClock()
  const {windows, openCount, focusWindow, openWindow, closeWindow, toggleMinimize, startAction} = useWindowManager(desktopRef)
  const state = useWebOSState({openWindow, uptimeText, paintCanvasRef})

  return (
    <div className="h-screen overflow-hidden bg-[#010202] text-[#b6ffca]">
      <div className="flex h-full flex-col">
        <header className="flex h-12 items-center justify-between border-b border-[#14321d] bg-[#030604]/95 px-4 text-xs backdrop-blur">
          <div className="flex items-center gap-4">
            <p className="tracking-[0.2em] text-[#7df0a1]">WEBOS // DESKTOP SHELL</p>
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
              borderColor="rgba(84, 255, 159, 0.16)"
              hoverFillColor="rgba(180, 255, 210, 0.12)"
              hoverBorderColor="rgba(225, 255, 238, 0.75)"
              squareSize={28}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-[#010202]/35 to-black/80" />
            <div className="pointer-events-none absolute inset-0" style={{boxShadow: `inset 0 0 72px rgba(0,0,0,0.95), inset 0 0 42px rgba(84,255,159,${state.desktopGlow / 180})`}} />
            {!state.showGrid && <div className="pointer-events-none absolute inset-0 bg-black/55" />}
          </div>

          <div className="absolute inset-0">
            {DESKTOP_SECTIONS.map((section) => (
              <div key={section.title} className="absolute" style={{left: section.x, top: section.y}}>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#78c892]/90">{section.title}</p>
                <div className="grid grid-flow-col auto-cols-[106px] grid-rows-4 gap-x-3 gap-y-2">
                  {section.ids.map((toolId) => {
                    const tool = TOOL_MAP.get(toolId)
                    if (!tool) {
                      return null
                    }
                    const Icon = tool.icon
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onDoubleClick={() => openWindow(tool.id)}
                        onClick={() => openWindow(tool.id)}
                        className="flex w-[106px] flex-col items-center rounded-lg border border-transparent bg-black/20 px-2 py-2 text-center text-[11px] text-[#d3ffe0] transition hover:border-[#2f7143] hover:bg-black/50">
                        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[#2f7143] bg-[#08110b]/95 text-[#abf4c0] shadow-[0_5px_12px_rgba(0,0,0,0.45)]">
                          <Icon size={20} strokeWidth={1.8} />
                        </span>
                        <span className="mt-1.5 leading-tight">{tool.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            <div className="pointer-events-none absolute bottom-4 left-5 rounded border border-[#1f3d28] bg-black/55 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-[#7bd295]/90">Double click icon to open</div>
          </div>

          {TOOL_ORDER.map((tool) => {
            const windowState = windows[tool.id]
            if (!windowState.isOpen || windowState.minimized) {
              return null
            }
            const WindowIcon = tool.icon

            return (
              <article
                key={tool.id}
                className="absolute border border-[#2a6e3f] bg-black/95 shadow-[0_18px_44px_rgba(0,0,0,0.7),0_0_0_1px_rgba(84,255,159,0.15)] backdrop-blur-sm"
                style={{
                  left: windowState.x,
                  top: windowState.y,
                  width: windowState.width,
                  height: windowState.height,
                  zIndex: windowState.z,
                }}
                onPointerDown={() => focusWindow(tool.id)}>
                <div onPointerDown={(event) => startAction(event, tool.id, "drag")} className="flex h-10 cursor-move items-center justify-between border-b border-[#2a6e3f] bg-[#030a05]/95 px-3 text-xs">
                  <p>
                    <WindowIcon className="mr-1 inline-block" size={14} strokeWidth={2} />
                    {tool.name} | {tool.description}
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

        <footer className="flex h-14 items-center gap-2 overflow-x-auto border-t border-[#14321d] bg-[#020503]/95 px-3">
          <p className="mr-2 border border-[#1a3d26] bg-[#050d08] px-2 py-1 text-xs">START</p>
          {TOOL_ORDER.filter((tool) => windows[tool.id].isOpen).map((tool) => {
            const win = windows[tool.id]
            const TaskbarIcon = tool.icon
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  toggleMinimize(tool.id)
                }}
                className={`border px-3 py-1.5 text-xs ${win.isOpen && !win.minimized ? "border-[#63ff8d] bg-[#12361d] text-[#ccffd9]" : "border-[#1a6628] bg-[#061009] hover:bg-[#102315]"}`}>
                <TaskbarIcon className="mr-1 inline-block" size={13} strokeWidth={2} />
                {tool.name}
              </button>
            )
          })}
        </footer>
      </div>
    </div>
  )
}
