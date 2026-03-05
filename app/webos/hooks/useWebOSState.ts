import {useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject} from "react"
import {TOOL_ORDER} from "../constants"
import type {ToolId} from "../types"
import {buildMapSrc, caesarCipher, decodeBase64, encodeBase64, generatePassword, normalizeUrl, randomIp} from "../utils"

type SnakeDirection = "up" | "down" | "left" | "right"
type SnakeCell = {x: number; y: number}
type BlackjackCard = {rank: string; suit: string; value: number}

const SNAKE_GRID_SIZE = 16

const directionDelta: Record<SnakeDirection, SnakeCell> = {
  up: {x: 0, y: -1},
  down: {x: 0, y: 1},
  left: {x: -1, y: 0},
  right: {x: 1, y: 0},
}

const oppositeDirection: Record<SnakeDirection, SnakeDirection> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
}

const randomSnakeFood = (occupied: SnakeCell[]) => {
  let next = {x: 0, y: 0}
  let safeGuard = 0
  do {
    next = {
      x: Math.floor(Math.random() * SNAKE_GRID_SIZE),
      y: Math.floor(Math.random() * SNAKE_GRID_SIZE),
    }
    safeGuard += 1
  } while (occupied.some((cell) => cell.x === next.x && cell.y === next.y) && safeGuard < 100)

  return next
}

const BLACKJACK_SUITS = ["♠", "♥", "♦", "♣"]
const BLACKJACK_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

const createBlackjackDeck = () =>
  BLACKJACK_SUITS.flatMap((suit) =>
    BLACKJACK_RANKS.map((rank) => {
      if (rank === "A") {
        return {rank, suit, value: 11}
      }
      if (["J", "Q", "K"].includes(rank)) {
        return {rank, suit, value: 10}
      }
      return {rank, suit, value: Number(rank)}
    }),
  )

const shuffleBlackjackDeck = (cards: BlackjackCard[]) => {
  const next = [...cards]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

const calculateBlackjackTotal = (cards: BlackjackCard[]) => {
  let total = cards.reduce((sum, card) => sum + card.value, 0)
  let aces = cards.filter((card) => card.rank === "A").length
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }
  return total
}

type UseWebOSStateArgs = {
  openWindow: (id: ToolId) => void
  uptimeText: string
  paintCanvasRef: RefObject<HTMLCanvasElement | null>
}

export const useWebOSState = ({openWindow, uptimeText, paintCanvasRef}: UseWebOSStateArgs) => {
  const paintDrawingRef = useRef(false)
  const paintLastPointRef = useRef<{x: number; y: number} | null>(null)

  const [wallpaperMode, setWallpaperMode] = useState<"grid" | "matrix" | "radar">("grid")
  const [showGrid, setShowGrid] = useState(true)
  const [desktopGlow, setDesktopGlow] = useState(18)
  const [clock24h, setClock24h] = useState(true)

  const [calcInput, setCalcInput] = useState("0")
  const [calcError, setCalcError] = useState("")

  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0)
  const [laps, setLaps] = useState<number[]>([])

  const [timerInput, setTimerInput] = useState("300")
  const [timerSeconds, setTimerSeconds] = useState(300)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerDone, setTimerDone] = useState(false)

  const [notes, setNotes] = useState(() => {
    if (typeof window === "undefined") {
      return ""
    }
    return localStorage.getItem("webos-notes") ?? ""
  })

  const [plainText, setPlainText] = useState("Hello, terminal.")
  const [base64Text, setBase64Text] = useState("SGVsbG8sIHRlcm1pbmFsLg==")
  const [byteInput, setByteInput] = useState("1024")

  const [pwLength, setPwLength] = useState(18)
  const [pwUpper, setPwUpper] = useState(true)
  const [pwLower, setPwLower] = useState(true)
  const [pwNumbers, setPwNumbers] = useState(true)
  const [pwSymbols, setPwSymbols] = useState(true)
  const [password, setPassword] = useState(() => generatePassword(18, true, true, true, true))

  const [webInput, setWebInput] = useState("https://example.com")
  const [webUrl, setWebUrl] = useState("https://example.com")
  const [webError, setWebError] = useState("")

  const [guessTarget, setGuessTarget] = useState(() => Math.floor(Math.random() * 100) + 1)
  const [guessInput, setGuessInput] = useState("")
  const [guessHint, setGuessHint] = useState("Guess a number from 1 to 100")
  const [guessAttempts, setGuessAttempts] = useState(0)

  const [clickGameRunning, setClickGameRunning] = useState(false)
  const [clicks, setClicks] = useState(0)
  const [clickTimeLeft, setClickTimeLeft] = useState(0)

  const [snakeRunning, setSnakeRunning] = useState(false)
  const [snakeCells, setSnakeCells] = useState<SnakeCell[]>([
    {x: 4, y: 8},
    {x: 3, y: 8},
    {x: 2, y: 8},
  ])
  const [snakeDirection, setSnakeDirection] = useState<SnakeDirection>("right")
  const [snakeFood, setSnakeFood] = useState<SnakeCell>({x: 10, y: 8})
  const [snakeScore, setSnakeScore] = useState(0)
  const [snakeBest, setSnakeBest] = useState(0)
  const [snakeGameOver, setSnakeGameOver] = useState(false)

  const [dinoRunning, setDinoRunning] = useState(false)
  const [dinoJumpTicks, setDinoJumpTicks] = useState(0)
  const [dinoObstacleX, setDinoObstacleX] = useState(100)
  const [dinoScore, setDinoScore] = useState(0)
  const [dinoBest, setDinoBest] = useState(0)
  const [dinoGameOver, setDinoGameOver] = useState(false)
  const dinoJumpRef = useRef(0)

  const [blackjackDeck, setBlackjackDeck] = useState<BlackjackCard[]>([])
  const [blackjackPlayerCards, setBlackjackPlayerCards] = useState<BlackjackCard[]>([])
  const [blackjackDealerCards, setBlackjackDealerCards] = useState<BlackjackCard[]>([])
  const [blackjackRunning, setBlackjackRunning] = useState(false)
  const [blackjackStatus, setBlackjackStatus] = useState("Click Deal to start a round.")

  const [terminalInput, setTerminalInput] = useState("")
  const [terminalLines, setTerminalLines] = useState<string[]>(["WebOS Terminal initialized.", "Type 'help' to list commands."])

  const [paintColor, setPaintColor] = useState("#84ff9f")
  const [paintSize, setPaintSize] = useState(3)

  const [mapLat, setMapLat] = useState(52.52)
  const [mapLon, setMapLon] = useState(13.405)
  const [mapZoom, setMapZoom] = useState(10)

  const [breachRunning, setBreachRunning] = useState(false)
  const [breachProgress, setBreachProgress] = useState(0)
  const [breachLogs, setBreachLogs] = useState<string[]>(["Idle: awaiting command..."])

  const [snifferRunning, setSnifferRunning] = useState(false)
  const [packetLogs, setPacketLogs] = useState<string[]>(["PacketSniffer standing by."])

  const [cipherInput, setCipherInput] = useState("THE EAGLE LANDS AT MIDNIGHT")
  const [cipherShift, setCipherShift] = useState(13)
  const [cipherDecodeMode, setCipherDecodeMode] = useState(false)

  const [cpuLoad, setCpuLoad] = useState(24)
  const [ramLoad, setRamLoad] = useState(39)
  const [netLoad, setNetLoad] = useState(12)
  const [coreTemp, setCoreTemp] = useState(51)
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array.from({length: 20}, () => 24))
  const [netHistory, setNetHistory] = useState<number[]>(Array.from({length: 20}, () => 12))

  const [hashInput, setHashInput] = useState("zero trust, verify always")
  const [hashAlgorithm, setHashAlgorithm] = useState<"SHA-1" | "SHA-256" | "SHA-384" | "SHA-512">("SHA-256")
  const [hashOutput, setHashOutput] = useState("")

  const mapSrc = useMemo(() => buildMapSrc(mapLat, mapLon, mapZoom), [mapLat, mapLon, mapZoom])
  const cipherOutput = useMemo(() => caesarCipher(cipherInput, cipherShift, cipherDecodeMode), [cipherInput, cipherShift, cipherDecodeMode])

  const desktopBackground = useMemo(() => {
    if (wallpaperMode === "matrix") {
      const matrixCore = "radial-gradient(ellipse at top, rgba(44,120,66,0.35), rgba(2,5,3,1) 50%), repeating-linear-gradient(180deg, rgba(116,255,154,0.08) 0px, rgba(116,255,154,0.08) 1px, transparent 1px, transparent 12px)"
      if (!showGrid) {
        return matrixCore
      }
      return `linear-gradient(rgba(52,127,74,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(52,127,74,0.12) 1px, transparent 1px), ${matrixCore}`
    }

    if (wallpaperMode === "radar") {
      const radarCore = "radial-gradient(circle at center, rgba(100,255,145,0.18), rgba(2,5,3,1) 56%), repeating-radial-gradient(circle at center, rgba(100,255,145,0.1) 0px, rgba(100,255,145,0.1) 1px, transparent 1px, transparent 30px)"
      if (!showGrid) {
        return radarCore
      }
      return `linear-gradient(rgba(52,127,74,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(52,127,74,0.1) 1px, transparent 1px), ${radarCore}`
    }

    const gridCore = "radial-gradient(ellipse at top right, rgba(46,130,68,0.18), rgba(2,5,3,1) 45%)"
    if (!showGrid) {
      return gridCore
    }
    return `linear-gradient(rgba(52,127,74,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(52,127,74,0.16) 1px, transparent 1px), ${gridCore}`
  }, [wallpaperMode, showGrid])

  useEffect(() => {
    if (!stopwatchRunning) {
      return
    }

    const startedAt = Date.now() - stopwatchElapsed
    const interval = setInterval(() => {
      setStopwatchElapsed(Date.now() - startedAt)
    }, 10)

    return () => clearInterval(interval)
  }, [stopwatchRunning, stopwatchElapsed])

  useEffect(() => {
    if (!timerRunning) {
      return
    }

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false)
          setTimerDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerRunning])

  useEffect(() => {
    localStorage.setItem("webos-notes", notes)
  }, [notes])

  useEffect(() => {
    if (!clickGameRunning) {
      return
    }

    const interval = setInterval(() => {
      setClickTimeLeft((prev) => {
        if (prev <= 1) {
          setClickGameRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [clickGameRunning])

  useEffect(() => {
    if (!snakeRunning) {
      return
    }

    const interval = setInterval(() => {
      setSnakeCells((prev) => {
        const delta = directionDelta[snakeDirection]
        const head = prev[0]
        const nextHead = {x: head.x + delta.x, y: head.y + delta.y}

        const wallCollision = nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= SNAKE_GRID_SIZE || nextHead.y >= SNAKE_GRID_SIZE
        const selfCollision = prev.some((cell) => cell.x === nextHead.x && cell.y === nextHead.y)

        if (wallCollision || selfCollision) {
          setSnakeRunning(false)
          setSnakeGameOver(true)
          setSnakeBest((best) => Math.max(best, snakeScore))
          return prev
        }

        const ateFood = nextHead.x === snakeFood.x && nextHead.y === snakeFood.y
        if (ateFood) {
          const grown = [nextHead, ...prev]
          setSnakeScore((score) => score + 1)
          setSnakeFood(randomSnakeFood(grown))
          return grown
        }

        return [nextHead, ...prev.slice(0, -1)]
      })
    }, 130)

    return () => clearInterval(interval)
  }, [snakeRunning, snakeDirection, snakeFood.x, snakeFood.y, snakeScore])

  useEffect(() => {
    dinoJumpRef.current = dinoJumpTicks
  }, [dinoJumpTicks])

  useEffect(() => {
    if (!dinoRunning) {
      return
    }

    const interval = setInterval(() => {
      setDinoJumpTicks((prev) => (prev > 0 ? prev - 1 : 0))
      setDinoObstacleX((prev) => {
        const speed = 4 + Math.min(5, Math.floor(dinoScore / 8))
        const next = prev - speed

        if (next <= 0 && next >= -8 && dinoJumpRef.current <= 1) {
          setDinoRunning(false)
          setDinoGameOver(true)
          setDinoBest((best) => Math.max(best, dinoScore))
          return prev
        }

        if (next < -10) {
          setDinoScore((score) => score + 1)
          return 100
        }

        return next
      })
    }, 55)

    return () => clearInterval(interval)
  }, [dinoRunning, dinoScore])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.code === "Space" || event.code === "ArrowUp") && dinoRunning) {
        event.preventDefault()
        setDinoJumpTicks((prev) => (prev === 0 ? 10 : prev))
      }

      if (!snakeRunning) {
        return
      }

      if (event.code === "KeyW" || event.code === "ArrowUp") {
        event.preventDefault()
        setSnakeDirection((prev) => (oppositeDirection[prev] === "up" ? prev : "up"))
      } else if (event.code === "KeyA" || event.code === "ArrowLeft") {
        event.preventDefault()
        setSnakeDirection((prev) => (oppositeDirection[prev] === "left" ? prev : "left"))
      } else if (event.code === "KeyS" || event.code === "ArrowDown") {
        event.preventDefault()
        setSnakeDirection((prev) => (oppositeDirection[prev] === "down" ? prev : "down"))
      } else if (event.code === "KeyD" || event.code === "ArrowRight") {
        event.preventDefault()
        setSnakeDirection((prev) => (oppositeDirection[prev] === "right" ? prev : "right"))
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dinoRunning, snakeRunning])

  useEffect(() => {
    const canvas = paintCanvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    context.fillStyle = "#020503"
    context.fillRect(0, 0, canvas.width, canvas.height)
  }, [paintCanvasRef])

  useEffect(() => {
    if (!breachRunning) {
      return
    }

    const steps = ["Injecting polymorphic payload...", "Escalating root token...", "Bypassing IDS signatures...", "Bruteforcing session hash...", "Mirroring encrypted blocks...", "Spoofing audit trail...", "Extracting synthetic dataset..."]

    const interval = setInterval(() => {
      setBreachProgress((prev) => {
        const next = Math.min(100, prev + Math.ceil(Math.random() * 11))
        setBreachLogs((logs) => {
          const step = steps[Math.floor(Math.random() * steps.length)]
          const line = `[${new Date().toLocaleTimeString("en-GB", {hour12: false})}] ${step}`
          return [...logs.slice(-24), line]
        })

        if (next >= 100) {
          setBreachRunning(false)
          setBreachLogs((logs) => [...logs.slice(-24), "[SYSTEM] Simulation completed."])
        }
        return next
      })
    }, 900)

    return () => clearInterval(interval)
  }, [breachRunning])

  useEffect(() => {
    if (!snifferRunning) {
      return
    }

    const protocols = ["TCP", "UDP", "ICMP", "TLS", "DNS"]
    const interval = setInterval(() => {
      const proto = protocols[Math.floor(Math.random() * protocols.length)]
      const line = `${new Date().toLocaleTimeString("en-GB", {hour12: false})} ${proto} ${randomIp()}:${Math.floor(1000 + Math.random() * 50000)} -> ${randomIp()}:${Math.floor(1000 + Math.random() * 50000)} len=${Math.floor(64 + Math.random() * 1300)}`
      setPacketLogs((prev) => [...prev.slice(-60), line])
    }, 450)

    return () => clearInterval(interval)
  }, [snifferRunning])

  useEffect(() => {
    const interval = setInterval(() => {
      const nextCpu = Math.floor(8 + Math.random() * 85)
      const nextRam = Math.floor(20 + Math.random() * 72)
      const nextNet = Math.floor(Math.random() * 100)
      const nextTemp = Math.floor(38 + Math.random() * 45)

      setCpuLoad(nextCpu)
      setRamLoad(nextRam)
      setNetLoad(nextNet)
      setCoreTemp(nextTemp)
      setCpuHistory((prev) => [...prev.slice(-19), nextCpu])
      setNetHistory((prev) => [...prev.slice(-19), nextNet])
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let cancelled = false

    const digest = async () => {
      const data = new TextEncoder().encode(hashInput)
      const result = await crypto.subtle.digest(hashAlgorithm, data)
      if (cancelled) {
        return
      }
      const hex = Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, "0")).join("")
      setHashOutput(hex)
    }

    digest().catch(() => {
      if (!cancelled) {
        setHashOutput("hash-error")
      }
    })

    return () => {
      cancelled = true
    }
  }, [hashAlgorithm, hashInput])

  const appendCalc = (value: string) => {
    setCalcError("")
    setCalcInput((prev) => (prev === "0" ? value : prev + value))
  }

  const handleCalcResult = (evaluateExpression: (expression: string) => string) => {
    try {
      const result = evaluateExpression(calcInput)
      setCalcInput(result)
      setCalcError("")
    } catch {
      setCalcError("Syntax error")
    }
  }

  const getCanvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }

  const paintStart = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = paintCanvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    const point = getCanvasPoint(event)
    paintDrawingRef.current = true
    paintLastPointRef.current = point

    context.beginPath()
    context.arc(point.x, point.y, Math.max(1, paintSize / 2), 0, Math.PI * 2)
    context.fillStyle = paintColor
    context.fill()
  }

  const paintMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!paintDrawingRef.current) {
      return
    }

    const canvas = paintCanvasRef.current
    const context = canvas?.getContext("2d")
    const last = paintLastPointRef.current
    if (!canvas || !context || !last) {
      return
    }

    const point = getCanvasPoint(event)
    context.beginPath()
    context.moveTo(last.x, last.y)
    context.lineTo(point.x, point.y)
    context.strokeStyle = paintColor
    context.lineWidth = paintSize
    context.lineCap = "round"
    context.lineJoin = "round"
    context.stroke()

    paintLastPointRef.current = point
  }

  const paintStop = () => {
    paintDrawingRef.current = false
    paintLastPointRef.current = null
  }

  const clearCanvas = () => {
    const canvas = paintCanvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) {
      return
    }
    context.fillStyle = "#020503"
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const runTerminalCommand = () => {
    const raw = terminalInput.trim()
    const cmd = raw.toLowerCase()
    if (!raw) {
      return
    }

    const append = (line: string) => setTerminalLines((prev) => [...prev.slice(-120), line])
    append(`> ${raw}`)

    if (cmd === "help") {
      append("Commands: help, clear, apps, date, uptime, whoami, open <app>, scan")
    } else if (cmd === "apps") {
      append(`Installed apps: ${TOOL_ORDER.map((tool) => tool.name).join(", ")}`)
    } else if (cmd === "clear") {
      setTerminalLines([])
    } else if (cmd === "date") {
      append(new Date().toString())
    } else if (cmd === "uptime") {
      append(`Uptime ${uptimeText}`)
    } else if (cmd === "whoami") {
      append("root@webos")
    } else if (cmd === "scan") {
      append("Launching fake scan modules...")
      openWindow("breachsim")
      openWindow("packetsniffer")
      setBreachRunning(true)
      setSnifferRunning(true)
    } else if (cmd.startsWith("open ")) {
      const appName = cmd.replace("open ", "").trim().replace(/\s+/g, "")
      const byName = TOOL_ORDER.find((tool) => tool.name.toLowerCase().replace(/\s+/g, "") === appName)
      const byId = TOOL_ORDER.find((tool) => tool.id === appName)
      const selected = byName ?? byId

      if (selected) {
        openWindow(selected.id)
        append(`Opened ${selected.name}`)
      } else {
        append("Unknown app. Use 'apps' to list available apps.")
      }
    } else {
      append("Unknown command. Type 'help'.")
    }

    setTerminalInput("")
  }

  const queueSnakeDirection = (next: SnakeDirection) => {
    setSnakeDirection((prev) => (oppositeDirection[prev] === next ? prev : next))
  }

  const resetSnake = () => {
    const initial = [
      {x: 4, y: 8},
      {x: 3, y: 8},
      {x: 2, y: 8},
    ]
    setSnakeCells(initial)
    setSnakeDirection("right")
    setSnakeFood(randomSnakeFood(initial))
    setSnakeScore(0)
    setSnakeGameOver(false)
    setSnakeRunning(false)
  }

  const startSnake = () => {
    if (snakeGameOver) {
      resetSnake()
      setTimeout(() => setSnakeRunning(true), 0)
      return
    }
    setSnakeRunning(true)
  }

  const dinoJump = () => {
    if (!dinoRunning) {
      return
    }
    setDinoJumpTicks((prev) => (prev === 0 ? 10 : prev))
  }

  const resetDino = () => {
    setDinoRunning(false)
    setDinoGameOver(false)
    setDinoScore(0)
    setDinoJumpTicks(0)
    setDinoObstacleX(100)
  }

  const startDino = () => {
    resetDino()
    setDinoRunning(true)
  }

  const resetBlackjack = () => {
    setBlackjackDeck([])
    setBlackjackPlayerCards([])
    setBlackjackDealerCards([])
    setBlackjackRunning(false)
    setBlackjackStatus("Click Deal to start a round.")
  }

  const startBlackjack = () => {
    const deck = shuffleBlackjackDeck(createBlackjackDeck())
    const player = [deck[0], deck[2]]
    const dealer = [deck[1], deck[3]]
    const restDeck = deck.slice(4)

    const playerTotal = calculateBlackjackTotal(player)
    const dealerTotal = calculateBlackjackTotal(dealer)

    let nextStatus = "Round in progress."
    let nextRunning = true
    if (playerTotal === 21 && dealerTotal === 21) {
      nextStatus = "Push. Both hit Blackjack."
      nextRunning = false
    } else if (playerTotal === 21) {
      nextStatus = "Blackjack! You win."
      nextRunning = false
    } else if (dealerTotal === 21) {
      nextStatus = "Dealer has Blackjack."
      nextRunning = false
    }

    setBlackjackDeck(restDeck)
    setBlackjackPlayerCards(player)
    setBlackjackDealerCards(dealer)
    setBlackjackRunning(nextRunning)
    setBlackjackStatus(nextStatus)
  }

  const hitBlackjack = () => {
    if (!blackjackRunning || blackjackDeck.length === 0) {
      return
    }

    const [nextCard, ...restDeck] = blackjackDeck
    const nextPlayer = [...blackjackPlayerCards, nextCard]
    const nextTotal = calculateBlackjackTotal(nextPlayer)

    setBlackjackDeck(restDeck)
    setBlackjackPlayerCards(nextPlayer)

    if (nextTotal > 21) {
      setBlackjackRunning(false)
      setBlackjackStatus("Bust. Dealer wins.")
    }
  }

  const standBlackjack = () => {
    if (!blackjackRunning) {
      return
    }

    let dealer = [...blackjackDealerCards]
    let restDeck = [...blackjackDeck]
    while (calculateBlackjackTotal(dealer) < 17 && restDeck.length > 0) {
      dealer = [...dealer, restDeck[0]]
      restDeck = restDeck.slice(1)
    }

    const playerTotal = calculateBlackjackTotal(blackjackPlayerCards)
    const dealerTotal = calculateBlackjackTotal(dealer)

    let nextStatus = "Push."
    if (dealerTotal > 21) {
      nextStatus = "Dealer busts. You win."
    } else if (playerTotal > dealerTotal) {
      nextStatus = "You win."
    } else if (playerTotal < dealerTotal) {
      nextStatus = "Dealer wins."
    }

    setBlackjackDealerCards(dealer)
    setBlackjackDeck(restDeck)
    setBlackjackRunning(false)
    setBlackjackStatus(nextStatus)
  }

  return {
    wallpaperMode,
    setWallpaperMode,
    showGrid,
    setShowGrid,
    desktopGlow,
    setDesktopGlow,
    clock24h,
    setClock24h,
    desktopBackground,

    calcInput,
    setCalcInput,
    calcError,
    setCalcError,
    appendCalc,
    handleCalcResult,

    stopwatchRunning,
    setStopwatchRunning,
    stopwatchElapsed,
    setStopwatchElapsed,
    laps,
    setLaps,

    timerInput,
    setTimerInput,
    timerSeconds,
    setTimerSeconds,
    timerRunning,
    setTimerRunning,
    timerDone,
    setTimerDone,

    notes,
    setNotes,

    plainText,
    setPlainText,
    base64Text,
    setBase64Text,
    byteInput,
    setByteInput,

    pwLength,
    setPwLength,
    pwUpper,
    setPwUpper,
    pwLower,
    setPwLower,
    pwNumbers,
    setPwNumbers,
    pwSymbols,
    setPwSymbols,
    password,
    setPassword,

    webInput,
    setWebInput,
    webUrl,
    setWebUrl,
    webError,
    setWebError,

    guessTarget,
    setGuessTarget,
    guessInput,
    setGuessInput,
    guessHint,
    setGuessHint,
    guessAttempts,
    setGuessAttempts,

    clickGameRunning,
    setClickGameRunning,
    clicks,
    setClicks,
    clickTimeLeft,
    setClickTimeLeft,

    snakeRunning,
    setSnakeRunning,
    snakeCells,
    snakeDirection,
    snakeFood,
    snakeScore,
    snakeBest,
    snakeGameOver,
    queueSnakeDirection,
    startSnake,
    resetSnake,

    dinoRunning,
    dinoJumpTicks,
    dinoObstacleX,
    dinoScore,
    dinoBest,
    dinoGameOver,
    dinoJump,
    startDino,
    resetDino,

    blackjackDeck,
    blackjackPlayerCards,
    blackjackDealerCards,
    blackjackRunning,
    blackjackStatus,
    startBlackjack,
    hitBlackjack,
    standBlackjack,
    resetBlackjack,

    terminalInput,
    setTerminalInput,
    terminalLines,
    setTerminalLines,
    runTerminalCommand,

    paintColor,
    setPaintColor,
    paintSize,
    setPaintSize,
    paintStart,
    paintMove,
    paintStop,
    clearCanvas,

    mapLat,
    setMapLat,
    mapLon,
    setMapLon,
    mapZoom,
    setMapZoom,
    mapSrc,

    breachRunning,
    setBreachRunning,
    breachProgress,
    setBreachProgress,
    breachLogs,
    setBreachLogs,

    snifferRunning,
    setSnifferRunning,
    packetLogs,
    setPacketLogs,

    cipherInput,
    setCipherInput,
    cipherShift,
    setCipherShift,
    cipherDecodeMode,
    setCipherDecodeMode,
    cipherOutput,

    cpuLoad,
    ramLoad,
    netLoad,
    coreTemp,
    cpuHistory,
    netHistory,

    hashInput,
    setHashInput,
    hashAlgorithm,
    setHashAlgorithm,
    hashOutput,

    normalizeUrl,
    encodeBase64,
    decodeBase64,
    generatePassword,
  }
}

export type WebOSState = ReturnType<typeof useWebOSState>
