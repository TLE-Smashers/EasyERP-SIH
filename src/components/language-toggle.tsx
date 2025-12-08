"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const LOCALES = [
  { code: "raj", label: "RAJ" },
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
]

function readLocaleCookie() {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(/(?:^|; )locale=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

export default function LanguageToggle() {
  const router = useRouter()
  const [current, setCurrent] = useState<string | undefined>(() => readLocaleCookie() || "raj")

  useEffect(() => {
    const c = readLocaleCookie()
    if (c) setCurrent(c)
  }, [])

  const changeLocale = (locale: string) => {
    try {
      const maxAge = 60 * 60 * 24 * 365
      document.cookie = `locale=${locale}; path=/; max-age=${maxAge}`
    } catch (e) {
      // ignore
    }
    // Use Next.js router refresh to reload server components
    router.refresh()
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Change language">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => changeLocale(l.code)}
            className={current === l.code ? "font-semibold" : undefined}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
