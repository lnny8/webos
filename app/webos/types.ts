export type ToolId = "calculator" | "stopwatch" | "timer" | "notes" | "converter" | "password" | "webviewer" | "arcade" | "snake" | "dino" | "settings" | "terminal" | "paint" | "maps" | "breachsim" | "packetsniffer" | "cipherlab" | "sysmonitor" | "hashvault"

export type ToolDefinition = {
  id: ToolId
  name: string
  icon: string
  description: string
}

export type WindowState = {
  x: number
  y: number
  width: number
  height: number
  isOpen: boolean
  minimized: boolean
  z: number
}

export type PointerAction = {
  kind: "drag" | "resize"
  id: ToolId
  startX: number
  startY: number
  startWindow: WindowState
  desktopWidth: number
  desktopHeight: number
}
