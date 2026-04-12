"use client"

import { useState, useRef, useCallback } from "react"
import { useStore } from "@/lib/store"
import { DashboardShell } from "@/components/dashboard-shell"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { WARDS, COMPLAINT_TYPES } from "@/lib/types"
import { calculateSERI, getRiskBadge } from "@/lib/analytics"
import {
  FileText,
  Clock,
  CheckCircle,
  Star,
  Send,
  Shield,
  MapPin,
  Camera,
  X,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "Resolved"
      ? "bg-success text-success-foreground"
      : status === "Escalated"
        ? "bg-destructive text-destructive-foreground"
        : status === "In Progress"
          ? "bg-warning text-warning-foreground"
          : "bg-destructive/10 text-destructive"
  return <Badge className={className}>{status}</Badge>
}

export default function CitizenDashboard() {
  const { currentUser, complaints, addComplaint } = useStore()
  const [ward, setWard] = useState("")
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const myComplaints = complaints.filter((c) => c.created_by === currentUser?.email)
  const active = myComplaints.filter((c) => c.status !== "Resolved").length
  const resolved = myComplaints.filter((c) => c.status === "Resolved").length
  const rated = myComplaints.filter((c) => c.citizen_satisfaction !== null)
  const avgSat =
    rated.length > 0
      ? (rated.reduce((s, c) => s + (c.citizen_satisfaction ?? 0), 0) / rated.length).toFixed(1)
      : "N/A"

  const captureGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser")
      return
    }
    setGpsLoading(true)
    setGpsError("")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setGpsLoading(false)
        toast.success("GPS location captured!")
      },
      (err) => {
        setGpsError(err.message || "Failed to capture location")
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ward || !type || !description.trim()) {
      toast.error("Please fill in all required fields")
      return
    }
    addComplaint({
      ward,
      type,
      description: description.trim(),
      photo,
      latitude,
      longitude,
    })
    toast.success("Complaint submitted successfully!")
    setWard("")
    setType("")
    setDescription("")
    setPhoto(null)
    setLatitude(null)
    setLongitude(null)
    setGpsError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <DashboardShell requiredRole="citizen">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-muted-foreground">Track your complaints and ward performance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Submitted" value={myComplaints.length} icon={FileText} color="primary" />
          <KPICard title="Active" value={active} icon={Clock} color="warning" />
          <KPICard title="Resolved" value={resolved} icon={CheckCircle} color="accent" />
          <KPICard title="Avg Satisfaction" value={avgSat} icon={Star} color="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Complaint */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Submit New Complaint
              </CardTitle>
              <CardDescription>Report a sanitation issue in your ward</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Ward *</Label>
                  <Select value={ward} onValueChange={setWard}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {WARDS.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Complaint Type *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLAINT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Photo Upload */}
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    Photo (optional)
                  </Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="cursor-pointer"
                  />
                  {photo && (
                    <div className="relative w-full max-w-xs">
                      <img
                        src={photo}
                        alt="Complaint photo preview"
                        className="w-full h-40 object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6"
                        onClick={() => {
                          setPhoto(null)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* GPS Capture */}
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    GPS Location (optional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={captureGPS}
                      disabled={gpsLoading}
                      className="gap-1.5"
                    >
                      {gpsLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5" />
                      )}
                      {gpsLoading ? "Capturing..." : latitude ? "Recapture GPS" : "Capture GPS"}
                    </Button>
                    {latitude && longitude && (
                      <span className="text-xs text-muted-foreground">
                        {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </span>
                    )}
                  </div>
                  {gpsError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {gpsError}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Submit Complaint
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Ward Transparency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Ward Transparency
              </CardTitle>
              <CardDescription>SERI scores and risk levels per ward</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 max-h-[430px] overflow-y-auto pr-1">
                {WARDS.map((w) => {
                  const seri = calculateSERI(complaints, w)
                  const risk = getRiskBadge(seri.score)
                  return (
                    <div key={w} className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{w}</span>
                        <Badge
                          className={
                            risk.color === "destructive"
                              ? "bg-destructive text-destructive-foreground"
                              : risk.color === "warning"
                                ? "bg-warning text-warning-foreground"
                                : "bg-success text-success-foreground"
                          }
                        >
                          {risk.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">SERI: {seri.score}/100</span>
                        <span className="text-xs text-muted-foreground">Res. Efficiency: {seri.avgResTime}d</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            seri.score < 40
                              ? "bg-destructive"
                              : seri.score < 70
                                ? "bg-warning"
                                : "bg-success"
                          }`}
                          style={{ width: `${seri.score}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>Your latest submitted complaints</CardDescription>
          </CardHeader>
          <CardContent>
            {myComplaints.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No complaints submitted yet. Use the form above to submit your first complaint.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Photo</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ward</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">GPS</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...myComplaints].reverse().slice(0, 5).map((c) => (
                      <tr key={c.complaint_id} className="border-b border-border last:border-0">
                        <td className="py-3 px-2 font-mono text-xs">{c.complaint_id.slice(0, 16)}</td>
                        <td className="py-3 px-2">
                          {c.photo ? (
                            <img
                              src={c.photo}
                              alt="Complaint"
                              className="w-10 h-10 object-cover rounded border border-border"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap">{c.ward}</td>
                        <td className="py-3 px-2 whitespace-nowrap">{c.complaint_type}</td>
                        <td className="py-3 px-2 text-muted-foreground">{c.date_reported.split(" ")[0]}</td>
                        <td className="py-3 px-2">
                          {c.latitude && c.longitude ? (
                            <a
                              href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
                            >
                              <MapPin className="w-3 h-3" />
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2"><StatusBadge status={c.status} /></td>
                        <td className="py-3 px-2 text-muted-foreground">{c.date_resolved?.split(" ")[0] || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
