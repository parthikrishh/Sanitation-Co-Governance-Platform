"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { User, Complaint, ComplaintStatus, UserRole } from "./types"
import { SLA_THRESHOLD_DAYS, VERIFICATION_THRESHOLD } from "./types"

function generateId(): string {
  return `CMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const h = String(date.getHours()).padStart(2, "0")
  const mi = String(date.getMinutes()).padStart(2, "0")
  const s = String(date.getSeconds()).padStart(2, "0")
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`
}

const ADMIN_USER: User = {
  email: "admin@municipality.com",
  password: "admin123",
  role: "admin",
  name: "System Administrator",
  createdAt: "2025-01-01 00:00:00",
}

function loadUsers(): User[] {
  if (typeof window === "undefined") return [ADMIN_USER]
  try {
    const data = localStorage.getItem("scgip_users")
    if (data) {
      const parsed = JSON.parse(data) as User[]
      if (!parsed.find((u) => u.email === ADMIN_USER.email)) {
        return [ADMIN_USER, ...parsed]
      }
      return parsed.map((u) => (u.email === ADMIN_USER.email ? { ...ADMIN_USER } : u))
    }
  } catch {
    // ignore
  }
  return [ADMIN_USER]
}

function saveUsers(users: User[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("scgip_users", JSON.stringify(users))
}

function loadComplaints(): Complaint[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem("scgip_complaints")
    if (data) return JSON.parse(data) as Complaint[]
  } catch {
    // ignore
  }
  return []
}

function saveComplaints(complaints: Complaint[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("scgip_complaints", JSON.stringify(complaints))
}

function loadSession(): User | null {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem("scgip_session")
    if (data) return JSON.parse(data) as User
  } catch {
    // ignore
  }
  return null
}

function saveSession(user: User | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("scgip_session", JSON.stringify(user))
  } else {
    localStorage.removeItem("scgip_session")
  }
}

/** Auto-escalate complaints older than SLA threshold */
function applyAutoEscalation(complaints: Complaint[]): Complaint[] {
  const now = Date.now()
  const thresholdMs = SLA_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  let changed = false
  const updated = complaints.map((c) => {
    if (c.status === "Pending" || c.status === "In Progress") {
      const reported = new Date(c.date_reported).getTime()
      if (now - reported > thresholdMs) {
        changed = true
        return { ...c, status: "Escalated" as ComplaintStatus }
      }
    }
    return c
  })
  return changed ? updated : complaints
}

interface StoreContextType {
  // Auth
  currentUser: User | null
  login: (email: string, password: string) => { success: boolean; role?: UserRole; error?: string }
  register: (email: string, password: string, name: string) => { success: boolean; error?: string }
  logout: () => void

  // Complaints
  complaints: Complaint[]
  addComplaint: (data: {
    ward: string
    type: string
    description: string
    photo: string | null
    latitude: number | null
    longitude: number | null
  }) => void
  updateStatus: (id: string, status: ComplaintStatus) => void
  rateSatisfaction: (id: string, rating: number) => void
  verifyComplaint: (id: string, score: number) => void

  // Users
  users: User[]
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([ADMIN_USER])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setUsers(loadUsers())
    const loaded = loadComplaints()
    // Apply auto-escalation on load
    setComplaints(applyAutoEscalation(loaded))
    setCurrentUser(loadSession())
    setLoaded(true)
  }, [])

  // Periodically check escalation every 60s
  useEffect(() => {
    if (!loaded) return
    const interval = setInterval(() => {
      setComplaints((prev) => applyAutoEscalation(prev))
    }, 60000)
    return () => clearInterval(interval)
  }, [loaded])

  useEffect(() => {
    if (loaded) saveUsers(users)
  }, [users, loaded])

  useEffect(() => {
    if (loaded) saveComplaints(complaints)
  }, [complaints, loaded])

  useEffect(() => {
    if (loaded) saveSession(currentUser)
  }, [currentUser, loaded])

  const login = useCallback(
    (email: string, password: string) => {
      const user = users.find((u) => u.email === email && u.password === password)
      if (!user) return { success: false, error: "Invalid email or password" }
      setCurrentUser(user)
      return { success: true, role: user.role }
    },
    [users]
  )

  const register = useCallback(
    (email: string, password: string, name: string) => {
      if (users.find((u) => u.email === email)) {
        return { success: false, error: "Email already registered" }
      }
      const newUser: User = {
        email,
        password,
        role: "citizen",
        name,
        createdAt: formatDate(new Date()),
      }
      setUsers((prev) => [...prev, newUser])
      return { success: true }
    },
    [users]
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const addComplaint = useCallback(
    (data: {
      ward: string
      type: string
      description: string
      photo: string | null
      latitude: number | null
      longitude: number | null
    }) => {
      if (!currentUser) return
      const complaint: Complaint = {
        complaint_id: generateId(),
        ward: data.ward,
        complaint_type: data.type,
        description: data.description,
        photo: data.photo,
        latitude: data.latitude,
        longitude: data.longitude,
        date_reported: formatDate(new Date()),
        date_resolved: null,
        citizen_satisfaction: null,
        community_verification_score: null,
        status: "Pending",
        created_by: currentUser.email,
      }
      setComplaints((prev) => [...prev, complaint])
    },
    [currentUser]
  )

  const updateStatus = useCallback((id: string, status: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.complaint_id === id) {
          return {
            ...c,
            status,
            date_resolved: status === "Resolved" ? formatDate(new Date()) : c.date_resolved,
          }
        }
        return c
      })
    )
  }, [])

  const rateSatisfaction = useCallback((id: string, rating: number) => {
    setComplaints((prev) =>
      prev.map((c) => (c.complaint_id === id ? { ...c, citizen_satisfaction: rating } : c))
    )
  }, [])

  const verifyComplaint = useCallback((id: string, score: number) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.complaint_id !== id) return c
        // If verification score is below threshold, reopen the complaint
        if (score < VERIFICATION_THRESHOLD) {
          return {
            ...c,
            community_verification_score: score,
            status: "In Progress" as ComplaintStatus,
            date_resolved: null,
          }
        }
        return { ...c, community_verification_score: score }
      })
    )
  }, [])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        complaints,
        addComplaint,
        updateStatus,
        rateSatisfaction,
        verifyComplaint,
        users,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
