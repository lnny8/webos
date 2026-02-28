export const pad = (value: number) => value.toString().padStart(2, "0")

export const formatMs = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((ms % 1000) / 10)
  return `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`
}

export const formatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const secs = safeSeconds % 60
  return `${pad(minutes)}:${pad(secs)}`
}

export const evaluateExpression = (expression: string) => {
  const sanitized = expression.replace(/\s+/g, "")

  if (!sanitized) {
    return "0"
  }

  if (!/^[0-9+\-*/().%]+$/.test(sanitized)) {
    throw new Error("Invalid characters detected")
  }

  const result = Function(`"use strict"; return (${sanitized})`)()
  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("Result is not finite")
  }

  return Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")
}

export const encodeBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value)
  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export const decodeBase64 = (value: string) => {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export const generatePassword = (length: number, upper: boolean, lower: boolean, numbers: boolean, symbols: boolean) => {
  const upperLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowerLetters = "abcdefghijklmnopqrstuvwxyz"
  const numberChars = "0123456789"
  const symbolChars = "!@#$%^&*()_+-={}[]|:;,.?/"

  const pool = [upper ? upperLetters : "", lower ? lowerLetters : "", numbers ? numberChars : "", symbols ? symbolChars : ""].join("")
  if (!pool) {
    return "Please enable at least one character set"
  }

  const random = new Uint32Array(length)
  crypto.getRandomValues(random)
  return Array.from(random, (value) => pool[value % pool.length]).join("")
}

export const randomIp = () => Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join(".")

export const normalizeUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return "https://example.com"
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

export const buildMapSrc = (lat: number, lon: number, zoom: number) => {
  const delta = Math.max(0.01, 60 / 2 ** zoom)
  const left = lon - delta
  const right = lon + delta
  const top = lat + delta
  const bottom = lat - delta
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`
}

export const caesarCipher = (value: string, shift: number, decode = false) => {
  const normalizedShift = (((decode ? -shift : shift) % 26) + 26) % 26
  return value.replace(/[a-z]/gi, (character) => {
    const base = character >= "a" && character <= "z" ? 97 : 65
    const offset = character.charCodeAt(0) - base
    return String.fromCharCode(base + ((offset + normalizedShift) % 26))
  })
}
