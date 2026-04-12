"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  Shield,
  LayoutDashboard,
  BarChart3,
  Download,
  ClipboardList,
  LogOut,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/reports", label: "Reports & Export", icon: Download },
]

const citizenLinks = [
  { href: "/citizen/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/citizen/complaints", label: "My Complaints", icon: ClipboardList },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout } = useStore()

  if (!currentUser) return null

  const isAdmin = currentUser.role === "admin"
  const links = isAdmin ? adminLinks : citizenLinks

  function handleLogout() {
    logout()
    router.push("/login")
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary">
          <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground leading-tight">SCGIP</span>
          <span className="text-xs text-sidebar-foreground/60">
            {isAdmin ? "Administration" : "Citizen Portal"}
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}


      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sidebar-accent">
            <User className="w-4 h-4 text-sidebar-accent-foreground" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">{currentUser.email}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
