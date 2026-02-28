import {useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject} from "react"
import {MIN_HEIGHT, MIN_WIDTH, TOOL_ORDER, WINDOW_LAYOUT} from "../constants"
import type {PointerAction, ToolId, WindowState} from "../types"

export const useWindowManager = (desktopRef: RefObject<HTMLDivElement | null>) => {
  const zRef = useRef(20)

  const [windows, setWindows] = useState<Record<ToolId, WindowState>>(() => {
    const initial = {} as Record<ToolId, WindowState>
    TOOL_ORDER.forEach((tool, index) => {
      const base = WINDOW_LAYOUT[tool.id]
      initial[tool.id] = {
        ...base,
        isOpen: index === 0,
        minimized: false,
        z: index + 1,
      }
    })
    return initial
  })

  const [pointerAction, setPointerAction] = useState<PointerAction | null>(null)

  const nextZ = () => {
    zRef.current += 1
    return zRef.current
  }

  const focusWindow = (id: ToolId) => {
    const z = nextZ()
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        z,
      },
    }))
  }

  const openWindow = (id: ToolId) => {
    const z = nextZ()
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        minimized: false,
        z,
      },
    }))
  }

  const closeWindow = (id: ToolId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false,
        minimized: false,
      },
    }))
  }

  const toggleMinimize = (id: ToolId) => {
    const z = nextZ()
    setWindows((prev) => {
      const current = prev[id]
      const willRestore = current.minimized || !current.isOpen
      return {
        ...prev,
        [id]: {
          ...current,
          isOpen: true,
          minimized: !willRestore,
          z: willRestore ? z : current.z,
        },
      }
    })
  }

  const startAction = (event: ReactPointerEvent, id: ToolId, kind: "drag" | "resize") => {
    const desktop = desktopRef.current
    if (!desktop) {
      return
    }

    focusWindow(id)
    const rect = desktop.getBoundingClientRect()
    const activeWindow = windows[id]
    setPointerAction({
      kind,
      id,
      startX: event.clientX,
      startY: event.clientY,
      startWindow: activeWindow,
      desktopWidth: rect.width,
      desktopHeight: rect.height,
    })
  }

  useEffect(() => {
    if (!pointerAction) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      const deltaX = event.clientX - pointerAction.startX
      const deltaY = event.clientY - pointerAction.startY

      setWindows((prev) => {
        const current = prev[pointerAction.id]
        if (!current.isOpen || current.minimized) {
          return prev
        }

        if (pointerAction.kind === "drag") {
          const maxX = Math.max(0, pointerAction.desktopWidth - current.width)
          const maxY = Math.max(0, pointerAction.desktopHeight - current.height)
          const nextX = Math.min(maxX, Math.max(0, pointerAction.startWindow.x + deltaX))
          const nextY = Math.min(maxY, Math.max(0, pointerAction.startWindow.y + deltaY))

          return {
            ...prev,
            [pointerAction.id]: {
              ...current,
              x: nextX,
              y: nextY,
            },
          }
        }

        const nextWidth = Math.max(MIN_WIDTH, Math.min(pointerAction.desktopWidth - pointerAction.startWindow.x, pointerAction.startWindow.width + deltaX))
        const nextHeight = Math.max(MIN_HEIGHT, Math.min(pointerAction.desktopHeight - pointerAction.startWindow.y, pointerAction.startWindow.height + deltaY))
        return {
          ...prev,
          [pointerAction.id]: {
            ...current,
            width: nextWidth,
            height: nextHeight,
          },
        }
      })
    }

    const handleUp = () => {
      setPointerAction(null)
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [pointerAction])

  const openCount = useMemo(() => TOOL_ORDER.filter((tool) => windows[tool.id].isOpen && !windows[tool.id].minimized).length, [windows])

  return {
    windows,
    openCount,
    focusWindow,
    openWindow,
    closeWindow,
    toggleMinimize,
    startAction,
  }
}
