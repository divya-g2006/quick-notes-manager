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

  useEffect(() => {
    setMounted(true)

    const savedTheme = localStorage.getItem("quicknotes-theme") as Theme

    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("quicknotes-theme", theme)
      document.documentElement.classList.toggle("dark", theme === "dark")
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const contextValue = { theme, toggleTheme }

  if (!mounted) {
    return <div className="min-h-screen bg-white">{children}</div>
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    console.error("useTheme called outside of ThemeProvider!")
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
