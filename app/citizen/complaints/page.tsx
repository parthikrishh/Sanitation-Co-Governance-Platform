"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, Filter, MapPin, ExternalLink, Image as ImageIcon, ShieldCheck } from "lucide-react"
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

function RatingDialog({
  complaintId,
  currentRating,
}: {
  complaintId: string
  currentRating: number | null
}) {
  const { rateSatisfaction } = useStore()
  const [rating, setRating] = useState(currentRating || 0)
  const [open, setOpen] = useState(false)

  function handleRate() {
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5")
      return
    }
    rateSatisfaction(complaintId, rating)
    toast.success("Thank you for your feedback!")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Star className="w-3 h-3" />
          {currentRating ? `${currentRating}/5` : "Rate"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Your Satisfaction</DialogTitle>
          <DialogDescription>
            How satisfied are you with the resolution of this complaint?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-colors"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= rating ? "fill-warning text-warning" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {rating === 0
              ? "Select a rating"
              : rating <= 2
                ? "We will work to improve"
                : rating <= 3
                  ? "Average experience"
                  : "Great to hear!"}
          </p>
          <Button onClick={handleRate} disabled={rating === 0}>
            Submit Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function VerificationDialog({
  complaintId,
  currentScore,
}: {
  complaintId: string
  currentScore: number | null
}) {
  const { verifyComplaint } = useStore()
  const [score, setScore] = useState(currentScore || 0)
  const [open, setOpen] = useState(false)

  function handleVerify() {
    if (score < 1 || score > 5) {
      toast.error("Please select a verification score between 1 and 5")
      return
    }
    verifyComplaint(complaintId, score)
    if (score < 2.5) {
      toast.warning("Work quality concern flagged - complaint reopened for review")
    } else {
      toast.success("Community verification submitted!")
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <ShieldCheck className="w-3 h-3" />
          {currentScore ? `${currentScore}/5` : "Verify"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Community Verification</DialogTitle>
          <DialogDescription>
            Verify if the resolved work was properly completed. Low scores will reopen the complaint for review.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setScore(star)}
                className="p-1 transition-colors"
                aria-label={`Score ${star}`}
              >
                <ShieldCheck
                  className={`w-8 h-8 transition-colors ${
                    star <= score ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {score === 0
              ? "Select a quality score"
              : score <= 2
                ? "Poor quality - complaint will be flagged"
                : score <= 3
                  ? "Acceptable quality"
                  : "Excellent work quality"}
          </p>
          <Button onClick={handleVerify} disabled={score === 0}>
            Submit Verification
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PhotoDialog({ photo }: { photo: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="relative group cursor-pointer">
          <img
            src={photo}
            alt="Complaint"
            className="w-10 h-10 object-cover rounded border border-border"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 rounded transition-colors flex items-center justify-center">
            <ImageIcon className="w-3 h-3 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Complaint Photo</DialogTitle>
        </DialogHeader>
        <img
          src={photo}
          alt="Complaint full size"
          className="w-full rounded-lg border border-border"
        />
      </DialogContent>
    </Dialog>
  )
}

export default function CitizenComplaints() {
  const { currentUser, complaints } = useStore()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [wardFilter, setWardFilter] = useState<string>("all")

  const allMyComplaints = complaints.filter((c) => c.created_by === currentUser?.email)
  const myComplaints = allMyComplaints
    .filter((c) => statusFilter === "all" || c.status === statusFilter)
    .filter((c) => wardFilter === "all" || c.ward === wardFilter)

  const uniqueWards = [...new Set(allMyComplaints.map((c) => c.ward))]

  return (
    <DashboardShell requiredRole="citizen">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Complaints</h1>
          <p className="text-muted-foreground">View and manage your submitted complaints</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {uniqueWards.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complaints ({myComplaints.length})</CardTitle>
            <CardDescription>All complaints you have submitted</CardDescription>
          </CardHeader>
          <CardContent>
            {myComplaints.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No complaints match your filters.
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
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Description</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">GPS</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Resolved</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Feedback</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Verify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...myComplaints].reverse().map((c) => (
                      <tr key={c.complaint_id} className="border-b border-border last:border-0">
                        <td className="py-3 px-2 font-mono text-xs">{c.complaint_id.slice(0, 16)}</td>
                        <td className="py-3 px-2">
                          {c.photo ? (
                            <PhotoDialog photo={c.photo} />
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap">{c.ward}</td>
                        <td className="py-3 px-2 whitespace-nowrap">{c.complaint_type}</td>
                        <td className="py-3 px-2 max-w-48 truncate">{c.description}</td>
                        <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">
                          {c.date_reported.split(" ")[0]}
                        </td>
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
                        <td className="py-3 px-2">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">
                          {c.date_resolved?.split(" ")[0] || "-"}
                        </td>
                        <td className="py-3 px-2">
                          {c.status === "Resolved" ? (
                            <RatingDialog complaintId={c.complaint_id} currentRating={c.citizen_satisfaction} />
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {c.status === "Resolved" ? (
                            <VerificationDialog
                              complaintId={c.complaint_id}
                              currentScore={c.community_verification_score}
                            />
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>
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
