"use client"

import { useEffect } from "react"
import { checkAndRestoreData } from "@/lib/utils"

export function DataInitializer() {
  useEffect(() => {
    // Check and restore data from CSV storage if needed
    checkAndRestoreData()
  }, [])

  return null
}
