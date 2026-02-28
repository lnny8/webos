import {useEffect, useMemo, useState} from "react"
import {pad} from "../utils"

export const useClock = () => {
  const [clock, setClock] = useState<Date | null>(null)
  const [uptimeSeconds, setUptimeSeconds] = useState(0)

  useEffect(() => {
    const bootstrapTimer = setTimeout(() => {
      setClock(new Date())
    }, 0)

    const interval = setInterval(() => {
      setClock(new Date())
      setUptimeSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      clearTimeout(bootstrapTimer)
      clearInterval(interval)
    }
  }, [])

  const uptimeText = useMemo(() => {
    const hours = Math.floor(uptimeSeconds / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    const seconds = uptimeSeconds % 60
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }, [uptimeSeconds])

  return {
    clock,
    uptimeSeconds,
    uptimeText,
  }
}
