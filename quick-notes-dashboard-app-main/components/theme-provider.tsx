"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  console.log("[v0] ThemeProvider rendering, mounted:", mounted, "theme:", theme)

  useEffect(() => {
    console.log("[v0] ThemeProvider mounting")
    setMounted(true)

    const savedTheme = localStorage.getItem("quicknotes-theme") as Theme
    console.log("[v0] Saved theme from localStorage:", savedTheme)

    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      console.log("[v0] Applying theme:", theme)
      localStorage.setItem("quicknotes-theme", theme)
      document.documentElement.classList.toggle("dark", theme === "dark")
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    console.log("[v0] Toggling theme from:", theme)
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const contextValue = { theme, toggleTheme }
  console.log("[v0] ThemeProvider context value:", contextValue)

  if (!mounted) {
    console.log("[v0] ThemeProvider not mounted yet, showing fallback")
    return <div className="min-h-screen bg-white">{children}</div>
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  console.log("[v0] useTheme called")
  const context = useContext(ThemeContext)
  console.log("[v0] useTheme context:", context)

  if (context === undefined) {
    console.error("[v0] useTheme called outside of ThemeProvider!")
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
