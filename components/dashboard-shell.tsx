"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { AppSidebar } from "@/components/app-sidebar"
import type { UserRole } from "@/lib/types"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardShell({
  children,
  requiredRole,
}: {
  children: React.ReactNode
  requiredRole: UserRole
}) {
  const router = useRouter()
  const { currentUser } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login")
    } else if (currentUser.role !== requiredRole) {
      router.replace(currentUser.role === "admin" ? "/admin/dashboard" : "/citizen/dashboard")
    }
  }, [currentUser, requiredRole, router])

  if (!currentUser || currentUser.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-foreground/20"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64">
            <AppSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <span className="text-sm font-semibold text-foreground">SCGIP</span>
        </div>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
