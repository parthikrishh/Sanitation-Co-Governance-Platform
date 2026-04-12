export type UserRole = "admin" | "citizen"

export interface User {
  email: string
  password: string
  role: UserRole
  name: string
  createdAt: string
}

export type ComplaintStatus = "Pending" | "In Progress" | "Resolved" | "Escalated"

export interface Complaint {
  complaint_id: string
  ward: string
  complaint_type: string
  description: string
  photo: string | null // base64 encoded image
  latitude: number | null
  longitude: number | null
  date_reported: string
  date_resolved: string | null
  citizen_satisfaction: number | null
  community_verification_score: number | null
  status: ComplaintStatus
  created_by: string
}

export const WARDS = [
  "Ward 1 - Central",
  "Ward 2 - Northside",
  "Ward 3 - Eastgate",
  "Ward 4 - Southpark",
  "Ward 5 - Westfield",
  "Ward 6 - Hilltop",
  "Ward 7 - Riverside",
  "Ward 8 - Industrial",
]

export const COMPLAINT_TYPES = [
  "Illegal Dumping",
  "Missed Collection",
  "Overflowing Bins",
  "Street Sweeping",
  "Hazardous Waste",
  "Drain Blockage",
  "Public Toilet Maintenance",
  "Pest Control",
]

// SLA threshold in days - complaints exceeding this are auto-escalated
export const SLA_THRESHOLD_DAYS = 30
// Community verification threshold - below this reopens complaint
export const VERIFICATION_THRESHOLD = 2.5
