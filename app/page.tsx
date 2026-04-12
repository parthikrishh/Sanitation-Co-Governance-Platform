"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"

export default function Home() {
  const router = useRouter()
  const { currentUser } = useStore()

  useEffect(() => {
    if (currentUser) {
      router.replace(currentUser.role === "admin" ? "/admin/dashboard" : "/citizen/dashboard")
    } else {
      router.replace("/login")
    }
  }, [currentUser, router])

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-pulse text-muted-foreground">Redirecting...</div>
    </div>
  )
}
