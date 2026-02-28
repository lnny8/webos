import type {ToolDefinition, ToolId} from "./types"

export const TOOL_ORDER: ToolDefinition[] = [
  {id: "calculator", name: "Calculator", icon: "[+]", description: "Quick Math"},
  {id: "stopwatch", name: "Stopwatch", icon: "[O]", description: "Lap Times"},
  {id: "timer", name: "Timer", icon: "[T]", description: "Countdown"},
  {id: "notes", name: "Notes", icon: "[#]", description: "Scratchpad"},
  {id: "converter", name: "Converter", icon: "[<>]", description: "Base64 + Bytes"},
  {id: "password", name: "Password", icon: "[*]", description: "Password Generator"},
  {id: "webviewer", name: "WebViewer", icon: "[W]", description: "In-window browser"},
  {id: "arcade", name: "Arcade", icon: "[G]", description: "Mini games"},
  {id: "snake", name: "Snake", icon: "[~]", description: "Grid survival"},
  {id: "dino", name: "DinoRun", icon: "[D]", description: "Jump runner"},
  {id: "settings", name: "Settings", icon: "[S]", description: "Desktop controls"},
  {id: "terminal", name: "Terminal", icon: "[>]", description: "Command shell"},
  {id: "paint", name: "Paint", icon: "[P]", description: "Sketch pad"},
  {id: "maps", name: "Maps", icon: "[M]", description: "Geo radar"},
  {id: "breachsim", name: "BreachSim", icon: "[B]", description: "Fake exploit pipeline"},
  {id: "packetsniffer", name: "PacketSniffer", icon: "[N]", description: "Fake packet stream"},
  {id: "cipherlab", name: "CipherLab", icon: "[C]", description: "Encode/decode text ciphers"},
  {id: "sysmonitor", name: "SysMonitor", icon: "[H]", description: "Live system telemetry"},
  {id: "hashvault", name: "HashVault", icon: "[V]", description: "Cryptographic digest lab"},
]

export const WINDOW_LAYOUT: Record<ToolId, {x: number; y: number; width: number; height: number}> = {
  calculator: {x: 140, y: 90, width: 380, height: 500},
  stopwatch: {x: 240, y: 120, width: 450, height: 420},
  timer: {x: 300, y: 150, width: 420, height: 360},
  notes: {x: 360, y: 90, width: 560, height: 470},
  converter: {x: 260, y: 110, width: 620, height: 500},
  password: {x: 320, y: 140, width: 520, height: 430},
  webviewer: {x: 180, y: 70, width: 900, height: 620},
  arcade: {x: 320, y: 130, width: 580, height: 500},
  snake: {x: 420, y: 140, width: 520, height: 560},
  dino: {x: 440, y: 150, width: 560, height: 480},
  settings: {x: 380, y: 100, width: 520, height: 420},
  terminal: {x: 110, y: 100, width: 760, height: 520},
  paint: {x: 240, y: 90, width: 900, height: 620},
  maps: {x: 220, y: 80, width: 920, height: 620},
  breachsim: {x: 340, y: 140, width: 580, height: 470},
  packetsniffer: {x: 280, y: 120, width: 700, height: 500},
  cipherlab: {x: 300, y: 120, width: 640, height: 500},
  sysmonitor: {x: 360, y: 120, width: 620, height: 480},
  hashvault: {x: 330, y: 110, width: 700, height: 520},
}

export const MIN_WIDTH = 320
export const MIN_HEIGHT = 260
