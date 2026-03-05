import type {ToolId} from "../types"
import type {WebOSState} from "../hooks/useWebOSState"
import {formatCountdown, formatMs, evaluateExpression} from "../utils"
import {Slider} from "./ui/Slider"
import {Checkbox} from "./ui/Checkbox"

type ToolContentProps = {
  id: ToolId
  state: WebOSState
  paintCanvasRef: React.RefObject<HTMLCanvasElement | null>
}

const sparkline = (values: number[]) => {
  const blocks = "▁▂▃▄▅▆▇█"
  return values.map((value) => blocks[Math.max(0, Math.min(blocks.length - 1, Math.round((value / 100) * (blocks.length - 1))))]).join("")
}

const blackjackTotal = (cards: {rank: string; value: number}[]) => {
  let total = cards.reduce((sum, card) => sum + card.value, 0)
  let aces = cards.filter((card) => card.rank === "A").length
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }
  return total
}

export const ToolContent = ({id, state, paintCanvasRef}: ToolContentProps) => {
  if (id === "calculator") {
    return (
      <section className="space-y-3">
        <div className="border border-[#1a6628] bg-black p-3">
          <p className="text-xs text-[#6fdd8f]">EXPR</p>
          <p className="text-2xl break-all min-h-8">{state.calcInput}</p>
          <p className="text-sm text-red-400 min-h-5">{state.calcError}</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "%", "+"].map((key) => (
            <button key={key} type="button" className="border border-[#1a6628] bg-[#07130a] py-2 hover:bg-[#0f2314]" onClick={() => state.appendCalc(key)}>
              {key}
            </button>
          ))}
          <button
            type="button"
            className="border border-[#1a6628] bg-[#2b1010] py-2 hover:bg-[#401919]"
            onClick={() => {
              state.setCalcInput("0")
              state.setCalcError("")
            }}>
            C
          </button>
          <button type="button" className="border border-[#1a6628] bg-[#07130a] py-2 hover:bg-[#0f2314]" onClick={() => state.setCalcInput((prev) => prev.slice(0, -1) || "0")}>
            ⌫
          </button>
          <button type="button" className="col-span-2 border border-[#1a6628] bg-[#10351a] py-2 hover:bg-[#184f27]" onClick={() => state.handleCalcResult(evaluateExpression)}>
            =
          </button>
        </div>
      </section>
    )
  }

  if (id === "stopwatch") {
    return (
      <section className="space-y-4">
        <p className="text-4xl tracking-wider">{formatMs(state.stopwatchElapsed)}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]" onClick={() => state.setStopwatchRunning((prev) => !prev)}>
            {state.stopwatchRunning ? "Pause" : "Start"}
          </button>
          <button type="button" className="border border-[#1a6628] bg-[#07130a] px-3 py-2 hover:bg-[#0f2314]" onClick={() => state.setLaps((prev) => [state.stopwatchElapsed, ...prev])} disabled={state.stopwatchElapsed === 0}>
            Lap
          </button>
          <button
            type="button"
            className="border border-[#1a6628] bg-[#2b1010] px-3 py-2 hover:bg-[#401919]"
            onClick={() => {
              state.setStopwatchRunning(false)
              state.setStopwatchElapsed(0)
              state.setLaps([])
            }}>
            Reset
          </button>
        </div>
        <div className="border border-[#1a6628] p-2 max-h-40 overflow-auto text-sm">
          {state.laps.length === 0
            ? "No laps yet."
            : state.laps.map((lap, index) => (
                <p key={`${lap}-${index}`}>
                  Lap {state.laps.length - index}: {formatMs(lap)}
                </p>
              ))}
        </div>
      </section>
    )
  }

  if (id === "timer") {
    return (
      <section className="space-y-4">
        <label className="block text-sm">
          Seconds
          <input className="mt-1 w-full border border-[#1a6628] bg-black px-3 py-2 outline-none" value={state.timerInput} onChange={(event) => state.setTimerInput(event.target.value.replace(/[^0-9]/g, ""))} />
        </label>
        <p className="text-4xl tracking-wider">{formatCountdown(state.timerSeconds)}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]"
            onClick={() => {
              const parsed = Number.parseInt(state.timerInput || "0", 10)
              state.setTimerSeconds(parsed)
              state.setTimerDone(false)
              state.setTimerRunning(parsed > 0)
            }}>
            Start
          </button>
          <button type="button" className="border border-[#1a6628] bg-[#07130a] px-3 py-2 hover:bg-[#0f2314]" onClick={() => state.setTimerRunning(false)}>
            Pause
          </button>
          <button
            type="button"
            className="border border-[#1a6628] bg-[#2b1010] px-3 py-2 hover:bg-[#401919]"
            onClick={() => {
              const parsed = Number.parseInt(state.timerInput || "0", 10)
              state.setTimerRunning(false)
              state.setTimerSeconds(parsed)
              state.setTimerDone(false)
            }}>
            Reset
          </button>
        </div>
        {state.timerDone && <p className="text-[#ff8080]">Time is up.</p>}
      </section>
    )
  }

  if (id === "notes") {
    return <textarea value={state.notes} onChange={(event) => state.setNotes(event.target.value)} className="h-full min-h-56 w-full border border-[#1a6628] bg-black p-3 outline-none" placeholder="Write your terminal notes here..." />
  }

  if (id === "converter") {
    return (
      <section className="space-y-4">
        <div className="border border-[#1a6628] p-3 space-y-2">
          <p className="text-sm text-[#6fdd8f]">Text ↔ Base64</p>
          <textarea value={state.plainText} onChange={(event) => state.setPlainText(event.target.value)} className="w-full h-20 border border-[#1a6628] bg-black p-2 outline-none" />
          <div className="flex gap-2">
            <button
              type="button"
              className="border border-[#1a6628] bg-[#10351a] px-3 py-1.5 hover:bg-[#184f27]"
              onClick={() => {
                try {
                  state.setBase64Text(state.encodeBase64(state.plainText))
                } catch {
                  state.setBase64Text("Encoding failed")
                }
              }}>
              Encode
            </button>
            <button
              type="button"
              className="border border-[#1a6628] bg-[#07130a] px-3 py-1.5 hover:bg-[#0f2314]"
              onClick={() => {
                try {
                  state.setPlainText(state.decodeBase64(state.base64Text))
                } catch {
                  state.setPlainText("Decoding failed")
                }
              }}>
              Decode
            </button>
          </div>
          <textarea value={state.base64Text} onChange={(event) => state.setBase64Text(event.target.value)} className="w-full h-20 border border-[#1a6628] bg-black p-2 outline-none" />
        </div>

        <div className="border border-[#1a6628] p-3 text-sm space-y-1">
          <p className="text-[#6fdd8f]">Byte Calculator</p>
          <input value={state.byteInput} onChange={(event) => state.setByteInput(event.target.value.replace(/[^0-9.]/g, ""))} className="w-full border border-[#1a6628] bg-black px-3 py-2 outline-none" />
          <p>KB: {(Number(state.byteInput || 0) / 1024).toFixed(3)}</p>
          <p>MB: {(Number(state.byteInput || 0) / 1024 ** 2).toFixed(3)}</p>
          <p>GB: {(Number(state.byteInput || 0) / 1024 ** 3).toFixed(6)}</p>
        </div>
      </section>
    )
  }

  if (id === "webviewer") {
    return (
      <section className="space-y-3 h-full flex flex-col">
        <div className="flex flex-wrap gap-2">
          <input value={state.webInput} onChange={(event) => state.setWebInput(event.target.value)} className="flex-1 min-w-64 border border-[#1a6628] bg-black px-3 py-2 outline-none" placeholder="https://example.com" />
          <button
            type="button"
            className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]"
            onClick={() => {
              try {
                const target = state.normalizeUrl(state.webInput)
                state.setWebUrl(target)
                state.setWebError("")
              } catch {
                state.setWebError("Invalid URL")
              }
            }}>
            Open
          </button>
          <a href={state.webUrl} target="_blank" rel="noreferrer" className="border border-[#1a6628] bg-[#07130a] px-3 py-2 hover:bg-[#0f2314]">
            Open in tab
          </a>
        </div>
        {state.webError && <p className="text-sm text-red-400">{state.webError}</p>}
        <div className="flex-1 border border-[#1a6628] overflow-hidden">
          <iframe title="WebViewer" src={state.webUrl} className="h-full w-full bg-black" />
        </div>
      </section>
    )
  }

  if (id === "arcade") {
    return (
      <section className="space-y-4">
        <div className="border border-[#1a6628] p-3 space-y-2">
          <p className="text-[#6fdd8f]">Game 1: Number Breach (1-100)</p>
          <div className="flex flex-wrap gap-2">
            <input value={state.guessInput} onChange={(event) => state.setGuessInput(event.target.value.replace(/[^0-9]/g, ""))} className="border border-[#1a6628] bg-black px-3 py-2 outline-none" placeholder="Your guess" />
            <button
              type="button"
              className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]"
              onClick={() => {
                const parsed = Number.parseInt(state.guessInput, 10)
                if (!Number.isFinite(parsed)) {
                  state.setGuessHint("Enter a valid number")
                  return
                }

                state.setGuessAttempts((prev) => prev + 1)
                if (parsed === state.guessTarget) {
                  state.setGuessHint(`Access granted in ${state.guessAttempts + 1} tries. New target generated.`)
                  state.setGuessTarget(Math.floor(Math.random() * 100) + 1)
                  state.setGuessAttempts(0)
                  state.setGuessInput("")
                  return
                }
                state.setGuessHint(parsed < state.guessTarget ? "Too low" : "Too high")
              }}>
              Check
            </button>
            <button
              type="button"
              className="border border-[#1a6628] bg-[#07130a] px-3 py-2 hover:bg-[#0f2314]"
              onClick={() => {
                state.setGuessTarget(Math.floor(Math.random() * 100) + 1)
                state.setGuessInput("")
                state.setGuessAttempts(0)
                state.setGuessHint("Target reset. Guess a number from 1 to 100")
              }}>
              Reset
            </button>
          </div>
          <p className="text-sm">{state.guessHint}</p>
          <p className="text-xs opacity-80">Attempts: {state.guessAttempts}</p>
        </div>

        <div className="border border-[#1a6628] p-3 space-y-2">
          <p className="text-[#6fdd8f]">Game 2: Clickstorm (5 sec)</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]"
              onClick={() => {
                state.setClicks(0)
                state.setClickTimeLeft(5)
                state.setClickGameRunning(true)
              }}>
              Start round
            </button>
            <button type="button" className="border border-[#1a6628] bg-[#07130a] px-3 py-2 hover:bg-[#0f2314]" onClick={() => state.clickGameRunning && state.setClicks((prev) => prev + 1)}>
              Click!
            </button>
            <p className="text-sm">Time: {state.clickTimeLeft}s</p>
            <p className="text-sm">Score: {state.clicks}</p>
          </div>
          {!state.clickGameRunning && state.clickTimeLeft === 0 && <p className="text-sm">Last score: {state.clicks}</p>}
        </div>
      </section>
    )
  }

  if (id === "snake") {
    return (
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]" onClick={state.startSnake}>
            {state.snakeRunning ? "Running" : "Start"}
          </button>
          <button type="button" className="border border-[#1a6628] bg-[#2b1010] px-3 py-2 hover:bg-[#401919]" onClick={state.resetSnake}>
            Reset
          </button>
          <p className="text-sm">Score: {state.snakeScore}</p>
          <p className="text-sm">Best: {state.snakeBest}</p>
          {state.snakeGameOver && <p className="text-red-400 text-sm">Game over</p>}
        </div>

        <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[2px] border border-[#1a6628] bg-black p-2 w-fit">
          {Array.from({length: 16}).map((_, y) =>
            Array.from({length: 16}).map((__, x) => {
              const isFood = state.snakeFood.x === x && state.snakeFood.y === y
              const isSnake = state.snakeCells.some((cell) => cell.x === x && cell.y === y)
              return <div key={`${x}-${y}`} className={`h-4 w-4 ${isFood ? "bg-red-500" : isSnake ? "bg-[#69ff8e]" : "bg-[#07130a]"}`} />
            }),
          )}
        </div>

        <p className="text-xs opacity-80">Controls: W A S D</p>
      </section>
    )
  }

  if (id === "dino") {
    const playerHeight = 24
    const jumpFrame = 10 - state.dinoJumpTicks
    const jumpArc = Math.max(0, 25 - (jumpFrame - 5) ** 2)
    const jumpOffset = jumpArc * 2
    const obstacleLeft = Math.max(0, Math.min(100, state.dinoObstacleX))

    return (
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]" onClick={state.startDino}>
            {state.dinoRunning ? "Restart" : "Start"}
          </button>
          <button type="button" className="border border-[#1a6628] bg-[#07130a] px-3 py-2 hover:bg-[#0f2314]" onClick={state.dinoJump}>
            Jump
          </button>
          <button type="button" className="border border-[#1a6628] bg-[#2b1010] px-3 py-2 hover:bg-[#401919]" onClick={state.resetDino}>
            Reset
          </button>
          <p className="text-sm">Score: {state.dinoScore}</p>
          <p className="text-sm">Best: {state.dinoBest}</p>
          {state.dinoGameOver && <p className="text-red-400 text-sm">Crashed</p>}
        </div>

        <div className="relative h-44 border border-[#1a6628] bg-black overflow-hidden">
          <div className="absolute bottom-6 left-0 right-0 border-t border-dashed border-[#1a6628]" />

          <div className="absolute left-8 w-6 bg-[#69ff8e]" style={{height: `${playerHeight}px`, bottom: `${24 + jumpOffset}px`}} />

          <div className="absolute w-4 bg-red-500" style={{height: "24px", bottom: "24px", left: `${obstacleLeft}%`}} />
        </div>

        <p className="text-xs opacity-80">Press Space / ArrowUp / Jump button to jump.</p>
      </section>
    )
  }

  if (id === "blackjack") {
    const playerTotal = blackjackTotal(state.blackjackPlayerCards)
    const visibleDealerCards = state.blackjackRunning && state.blackjackDealerCards.length > 1 ? [state.blackjackDealerCards[0]] : state.blackjackDealerCards
    const dealerTotal = blackjackTotal(visibleDealerCards)

    return (
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]" onClick={state.startBlackjack}>
            Deal
          </button>
          <button type="button" className="border border-[#1a6628] bg-[#07130a] px-3 py-2 hover:bg-[#0f2314]" onClick={state.hitBlackjack} disabled={!state.blackjackRunning}>
            Hit
          </button>
          <button type="button" className="border border-[#1a6628] bg-[#07130a] px-3 py-2 hover:bg-[#0f2314]" onClick={state.standBlackjack} disabled={!state.blackjackRunning}>
            Stand
          </button>
          <button type="button" className="border border-[#1a6628] bg-[#2b1010] px-3 py-2 hover:bg-[#401919]" onClick={state.resetBlackjack}>
            Reset
          </button>
        </div>

        <p className="text-sm text-[#8be8a9]">{state.blackjackStatus}</p>

        <div className="space-y-3">
          <div className="border border-[#1a6628] bg-black/70 p-3">
            <p className="mb-2 text-xs text-[#6fdd8f]">Dealer ({dealerTotal})</p>
            <div className="flex flex-wrap gap-2">
              {visibleDealerCards.map((card, index) => (
                <span key={`${card.rank}-${card.suit}-${index}`} className="min-w-14 border border-[#2a6e3f] bg-[#08110b] px-2 py-1 text-center">
                  {card.rank}
                  {card.suit}
                </span>
              ))}
              {state.blackjackRunning && state.blackjackDealerCards.length > 1 && <span className="min-w-14 border border-[#2a6e3f] bg-[#08110b] px-2 py-1 text-center">??</span>}
            </div>
          </div>

          <div className="border border-[#1a6628] bg-black/70 p-3">
            <p className="mb-2 text-xs text-[#6fdd8f]">Player ({playerTotal})</p>
            <div className="flex flex-wrap gap-2">
              {state.blackjackPlayerCards.map((card, index) => (
                <span key={`${card.rank}-${card.suit}-${index}`} className="min-w-14 border border-[#2a6e3f] bg-[#08110b] px-2 py-1 text-center">
                  {card.rank}
                  {card.suit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (id === "settings") {
    return (
      <section className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={state.showGrid} onChange={state.setShowGrid} ariaLabel="Show desktop grid" />
            Show desktop grid
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={state.clock24h} onChange={state.setClock24h} ariaLabel="24-hour clock" />
            24-hour clock
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm">Wallpaper mode</p>
          <div className="flex flex-wrap gap-2">
            {(["grid", "matrix", "radar"] as const).map((mode) => (
              <button key={mode} type="button" className={`border px-3 py-2 text-sm ${state.wallpaperMode === mode ? "border-[#63ff8d] bg-[#12361d]" : "border-[#1a6628] bg-[#07130a] hover:bg-[#0f2314]"}`} onClick={() => state.setWallpaperMode(mode)}>
                {mode}
              </button>
            ))}
          </div>
        </div>

        <label className="block text-sm">
          Glow intensity: {state.desktopGlow}%
          <div className="mt-1">
            <Slider value={state.desktopGlow} min={0} max={45} onChange={state.setDesktopGlow} />
          </div>
        </label>

        <div className="border border-[#1a6628] p-3 text-sm">
          <p>Theme profile: HACKER_GREEN</p>
          <p>Grid: {state.showGrid ? "ENABLED" : "DISABLED"}</p>
          <p>Wallpaper: {state.wallpaperMode.toUpperCase()}</p>
          <p>Clock mode: {state.clock24h ? "24H" : "12H"}</p>
        </div>
      </section>
    )
  }

  if (id === "terminal") {
    return (
      <section className="h-full flex flex-col gap-3">
        <div className="flex-1 border border-[#1a6628] bg-black p-3 overflow-auto text-sm space-y-1">{state.terminalLines.length === 0 ? <p className="opacity-70">Terminal cleared.</p> : state.terminalLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div>

        <div className="flex gap-2">
          <span className="border border-[#1a6628] bg-[#07130a] px-3 py-2">root@webos:$</span>
          <input
            value={state.terminalInput}
            onChange={(event) => state.setTerminalInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                state.runTerminalCommand()
              }
            }}
            className="flex-1 border border-[#1a6628] bg-black px-3 py-2 outline-none"
            placeholder="Type a command..."
          />
          <button type="button" className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]" onClick={state.runTerminalCommand}>
            Run
          </button>
        </div>
      </section>
    )
  }

  if (id === "paint") {
    return (
      <section className="h-full flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input type="color" value={state.paintColor} onChange={(event) => state.setPaintColor(event.target.value)} className="h-10 w-14 border border-[#1a6628] bg-black" />
          <label className="text-sm">
            Brush: {state.paintSize}px
            <div className="mt-1">
              <Slider value={state.paintSize} min={1} max={20} onChange={state.setPaintSize} />
            </div>
          </label>
          <button type="button" className="border border-[#1a6628] bg-[#2b1010] px-3 py-2 hover:bg-[#401919]" onClick={state.clearCanvas}>
            Clear
          </button>
        </div>

        <div className="flex-1 border border-[#1a6628] overflow-hidden">
          <canvas ref={paintCanvasRef} width={1400} height={900} className="h-full w-full bg-black touch-none" onPointerDown={state.paintStart} onPointerMove={state.paintMove} onPointerUp={state.paintStop} onPointerLeave={state.paintStop} />
        </div>
      </section>
    )
  }

  if (id === "maps") {
    return (
      <section className="h-full flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-end">
          <label className="text-sm">
            Lat
            <input value={state.mapLat} onChange={(event) => state.setMapLat(Number(event.target.value))} className="ml-1 w-28 border border-[#1a6628] bg-black px-2 py-1 outline-none" />
          </label>
          <label className="text-sm">
            Lon
            <input value={state.mapLon} onChange={(event) => state.setMapLon(Number(event.target.value))} className="ml-1 w-28 border border-[#1a6628] bg-black px-2 py-1 outline-none" />
          </label>
          <label className="text-sm">
            Zoom {state.mapZoom}
            <div className="mt-1">
              <Slider value={state.mapZoom} min={2} max={16} onChange={state.setMapZoom} />
            </div>
          </label>
          <button
            type="button"
            className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  state.setMapLat(Number(position.coords.latitude.toFixed(6)))
                  state.setMapLon(Number(position.coords.longitude.toFixed(6)))
                },
                () => undefined,
              )
            }}>
            Use my location
          </button>
        </div>

        <div className="flex-1 border border-[#1a6628] overflow-hidden">
          <iframe title="maps" src={state.mapSrc} className="h-full w-full" />
        </div>

        <div className="text-xs opacity-80">
          <p>
            GEO RADAR LOCK: {state.mapLat.toFixed(4)}, {state.mapLon.toFixed(4)}
          </p>
        </div>
      </section>
    )
  }

  if (id === "breachsim") {
    return (
      <section className="h-full flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]"
            onClick={() => {
              state.setBreachRunning(true)
              if (state.breachProgress >= 100) {
                state.setBreachProgress(0)
                state.setBreachLogs(["Restarting simulation..."])
              }
            }}>
            {state.breachRunning ? "Running..." : "Start simulation"}
          </button>
          <button
            type="button"
            className="border border-[#1a6628] bg-[#2b1010] px-3 py-2 hover:bg-[#401919]"
            onClick={() => {
              state.setBreachRunning(false)
              state.setBreachProgress(0)
              state.setBreachLogs(["Idle: awaiting command..."])
            }}>
            Reset
          </button>
          <p className="text-sm">Progress: {state.breachProgress}%</p>
        </div>

        <div className="h-3 border border-[#1a6628] bg-black">
          <div className="h-full bg-[#1f8e3f]" style={{width: `${state.breachProgress}%`}} />
        </div>

        <div className="flex-1 border border-[#1a6628] bg-black p-3 overflow-auto text-sm space-y-1">
          {state.breachLogs.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
      </section>
    )
  }

  if (id === "packetsniffer") {
    return (
      <section className="h-full flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="border border-[#1a6628] bg-[#10351a] px-3 py-2 hover:bg-[#184f27]" onClick={() => state.setSnifferRunning((prev) => !prev)}>
            {state.snifferRunning ? "Stop sniffer" : "Start sniffer"}
          </button>
          <button
            type="button"
            className="border border-[#1a6628] bg-[#2b1010] px-3 py-2 hover:bg-[#401919]"
            onClick={() => {
              state.setSnifferRunning(false)
              state.setPacketLogs(["PacketSniffer standing by."])
            }}>
            Clear
          </button>
          <p className="text-sm">Frames: {Math.max(0, state.packetLogs.length - 1)}</p>
        </div>

        <div className="flex-1 border border-[#1a6628] bg-black p-3 overflow-auto text-sm space-y-1">
          {state.packetLogs.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
      </section>
    )
  }

  if (id === "cipherlab") {
    return (
      <section className="h-full flex flex-col gap-3">
        <label className="text-sm">
          Input text
          <textarea value={state.cipherInput} onChange={(event) => state.setCipherInput(event.target.value)} className="mt-1 h-24 w-full border border-[#1a6628] bg-black p-2 outline-none" />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <label className="text-sm">
            Shift: {state.cipherShift}
            <div className="mt-1">
              <Slider value={state.cipherShift} min={1} max={25} onChange={state.setCipherShift} />
            </div>
          </label>

          <button type="button" className={`border px-3 py-2 text-sm ${state.cipherDecodeMode ? "border-[#63ff8d] bg-[#12361d]" : "border-[#1a6628] bg-[#07130a] hover:bg-[#0f2314]"}`} onClick={() => state.setCipherDecodeMode((prev) => !prev)}>
            Mode: {state.cipherDecodeMode ? "Decode" : "Encode"}
          </button>
        </div>

        <div className="flex-1 border border-[#1a6628] bg-black p-3 break-words text-sm">{state.cipherOutput || "(empty)"}</div>

        <div className="flex gap-2">
          <button type="button" className="border border-[#1a6628] bg-[#07130a] px-3 py-2 hover:bg-[#0f2314]" onClick={() => navigator.clipboard.writeText(state.cipherOutput)}>
            Copy output
          </button>
          <p className="text-xs opacity-80 self-center">A-Z letter rotation only; numbers and symbols stay unchanged.</p>
        </div>
      </section>
    )
  }

  if (id === "sysmonitor") {
    return (
      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-[#1a6628] p-2">
            <p>CPU</p>
            <p className="text-lg">{state.cpuLoad}%</p>
            <div className="mt-1 h-2 border border-[#1a6628] bg-black">
              <div className="h-full bg-[#1f8e3f]" style={{width: `${state.cpuLoad}%`}} />
            </div>
          </div>
          <div className="border border-[#1a6628] p-2">
            <p>RAM</p>
            <p className="text-lg">{state.ramLoad}%</p>
            <div className="mt-1 h-2 border border-[#1a6628] bg-black">
              <div className="h-full bg-[#1f8e3f]" style={{width: `${state.ramLoad}%`}} />
            </div>
          </div>
          <div className="border border-[#1a6628] p-2">
            <p>NET</p>
            <p className="text-lg">{state.netLoad}%</p>
            <div className="mt-1 h-2 border border-[#1a6628] bg-black">
              <div className="h-full bg-[#1f8e3f]" style={{width: `${state.netLoad}%`}} />
            </div>
          </div>
          <div className="border border-[#1a6628] p-2">
            <p>TEMP</p>
            <p className="text-lg">{state.coreTemp}°C</p>
            <p className="text-xs opacity-80">Thermal core estimate</p>
          </div>
        </div>

        <div className="border border-[#1a6628] bg-black p-3 text-sm space-y-1">
          <p className="text-[#6fdd8f]">CPU history</p>
          <p className="font-mono tracking-[0.2em] break-all">{sparkline(state.cpuHistory)}</p>
          <p className="text-[#6fdd8f] pt-2">NET history</p>
          <p className="font-mono tracking-[0.2em] break-all">{sparkline(state.netHistory)}</p>
        </div>
      </section>
    )
  }

  if (id === "hashvault") {
    return (
      <section className="h-full flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-end">
          <label className="text-sm">
            Input
            <textarea value={state.hashInput} onChange={(event) => state.setHashInput(event.target.value)} className="mt-1 h-24 w-full border border-[#1a6628] bg-black p-2 outline-none" />
          </label>
          <label className="text-sm">
            Algorithm
            <select value={state.hashAlgorithm} onChange={(event) => state.setHashAlgorithm(event.target.value as "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512")} className="mt-1 w-full border border-[#1a6628] bg-black px-3 py-2 outline-none">
              <option value="SHA-1">SHA-1</option>
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </label>
        </div>

        <div className="flex-1 border border-[#1a6628] bg-black p-3 break-all text-xs leading-relaxed">{state.hashOutput || "..."}</div>

        <div className="flex gap-2">
          <button type="button" className="border border-[#1a6628] bg-[#07130a] px-3 py-2 hover:bg-[#0f2314]" onClick={() => navigator.clipboard.writeText(state.hashOutput)}>
            Copy hash
          </button>
          <p className="self-center text-xs opacity-80">Computed with Web Crypto API in your browser.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <label className="block text-sm">
        Length: {state.pwLength}
        <div className="mt-1">
          <Slider
            value={state.pwLength}
            min={8}
            max={64}
            onChange={(nextLength) => {
              state.setPwLength(nextLength)
              state.setPassword(state.generatePassword(nextLength, state.pwUpper, state.pwLower, state.pwNumbers, state.pwSymbols))
            }}
          />
        </div>
      </label>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={state.pwUpper}
            onChange={(next) => {
              state.setPwUpper(next)
              state.setPassword(state.generatePassword(state.pwLength, next, state.pwLower, state.pwNumbers, state.pwSymbols))
            }}
            ariaLabel="Uppercase"
          />
          Uppercase
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={state.pwLower}
            onChange={(next) => {
              state.setPwLower(next)
              state.setPassword(state.generatePassword(state.pwLength, state.pwUpper, next, state.pwNumbers, state.pwSymbols))
            }}
            ariaLabel="Lowercase"
          />
          Lowercase
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={state.pwNumbers}
            onChange={(next) => {
              state.setPwNumbers(next)
              state.setPassword(state.generatePassword(state.pwLength, state.pwUpper, state.pwLower, next, state.pwSymbols))
            }}
            ariaLabel="Numbers"
          />
          Numbers
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={state.pwSymbols}
            onChange={(next) => {
              state.setPwSymbols(next)
              state.setPassword(state.generatePassword(state.pwLength, state.pwUpper, state.pwLower, state.pwNumbers, next))
            }}
            ariaLabel="Symbols"
          />
          Symbols
        </label>
      </div>
      <div className="border border-[#1a6628] bg-black p-3 break-all">{state.password}</div>
      <div className="flex gap-2">
        <button type="button" className="border border-[#1a6628] bg-[#10351a] px-4 py-2 hover:bg-[#184f27]" onClick={() => state.setPassword(state.generatePassword(state.pwLength, state.pwUpper, state.pwLower, state.pwNumbers, state.pwSymbols))}>
          Regenerate
        </button>
        <button type="button" className="border border-[#1a6628] bg-[#07130a] px-4 py-2 hover:bg-[#0f2314]" onClick={() => navigator.clipboard.writeText(state.password)}>
          Copy
        </button>
      </div>
    </section>
  )
}
