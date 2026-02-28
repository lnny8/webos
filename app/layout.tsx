import type {Metadata} from "next"
import {Geist_Mono} from "next/font/google"
import "./globals.css"

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "WebOS ASCII Hacker Suite",
  description: "ASCII hacker-style WebOS with calculator, stopwatch, and utility tools",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${geistMono.variable}`}>{children}</body>
    </html>
  )
}
