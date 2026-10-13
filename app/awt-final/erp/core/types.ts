/** Shared domain types. Every service owns one or more of these collections. */

export type Role =
  | 'superadmin'
  | 'admin'
  | 'doctor'
  | 'nurse'
  | 'reception'
  | 'emergency'
  | 'ot'
  | 'lab'
  | 'radiology'
  | 'pharmacy'
  | 'billing'
  | 'security'

export type Base = { id: string; seed?: boolean }

export type User = Base & {
  username: string
  password: string
  name: string
  role: Role
  title: string
  dept?: string
  doctorId?: string
  active: boolean
}

export type Doctor = Base & {
  name: string
  dept: string
  qualification: string
  room: string
  surgeon: boolean
  fee: number
  opdDays: string
}

export type PayerCategory = 'Self' | 'TPA / Insurance' | 'PM-JAY' | 'CGHS' | 'Corporate'

export type Patient = Base & {
  uhid: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  phone: string
  abha?: string
  aadhaar4?: string
  address: string
  bloodGroup?: string
  allergies?: string
  category: PayerCategory
  insurer?: string
  policyNo?: string
  createdAt: string
}

export type Vitals = { bp?: string; pulse?: number; temp?: number; spo2?: number; rr?: number; sugar?: number; weight?: number; pain?: number }

export type RxItem = { drug: string; dose: string; freq: string; days: number }

export type Visit = Base & {
  patientId: string
  doctorId: string
  dept: string
  token: number
  createdAt: string
  status: 'waiting' | 'in-consult' | 'done' | 'no-show'
  visitType: 'New' | 'Follow-up'
  complaint?: string
  vitals?: Vitals
  diagnosis?: string
  advice?: string
  rx: RxItem[]
  orders: string[]
  followUp?: string
  admitAdvised?: boolean
  doneAt?: string
}

export type ErCase = Base & {
  patientId: string
  arrivedAt: string
  triage: 'red' | 'yellow' | 'green'
  mode: 'Walk-in' | 'Ambulance (108)' | 'Private ambulance' | 'Referred'
  complaint: string
  mlc: boolean
  bay?: string
  doctorId?: string
  status: 'waiting' | 'treatment' | 'observation' | 'closed'
  disposition?: 'Admitted' | 'Sent to OT' | 'Discharged' | 'Referred out' | 'LAMA' | 'Expired'
  closedAt?: string
  vitals?: Vitals
}

export type Ward = { id: string; name: string; kind: string; floor: string; rate: number; beds: number }

export type Bed = Base & {
  ward: string
  number: string
  status: 'free' | 'occupied' | 'cleaning' | 'reserved'
  admissionId?: string
}

export type Admission = Base & {
  patientId: string
  doctorId: string
  bedId: string
  admittedAt: string
  diagnosis: string
  source: 'OPD' | 'Emergency' | 'Direct' | 'OT'
  status: 'admitted' | 'discharged'
  dischargedAt?: string
  dischargeSummary?: DischargeSummary
}

export type DischargeSummary = {
  finalDiagnosis: string
  courseInHospital: string
  procedures: string
  conditionAtDischarge: string
  medications: string
  followUp: string
  writtenBy: string
  at: string
}

export type OtRoom = Base & {
  number: number
  name: string
  speciality: string
  status: 'ready' | 'in-use' | 'cleaning' | 'maintenance'
}

export type Surgery = Base & {
  patientId: string
  ot: number
  procedure: string
  surgeonId: string
  anaesthetistId: string
  anaesthesia: 'General' | 'Spinal' | 'Regional block' | 'Local' | 'Sedation'
  priority: 'Elective' | 'Emergency'
  start: string
  durationMin: number
  status: 'scheduled' | 'pre-op' | 'in-progress' | 'recovery' | 'completed' | 'cancelled'
  checklist: { signIn: boolean; timeOut: boolean; signOut: boolean }
  consent: boolean
  startedAt?: string
  endedAt?: string
  notes?: string
}

export type NoteContext = 'OPD' | 'IPD' | 'Emergency' | 'OT' | 'General'

export type NurseNote = Base & {
  patientId: string
  context: NoteContext
  refId?: string
  kind: 'Observation' | 'Vitals' | 'Medication given' | 'Intake / Output' | 'Handover' | 'Alert'
  text: string
  vitals?: Vitals
  by: string
  at: string
}

export type DiagOrder = Base & {
  patientId: string
  kind: 'Lab' | 'Radiology'
  test: string
  orderedBy: string
  source: 'OPD' | 'IPD' | 'Emergency' | 'OT'
  priority: 'Routine' | 'Urgent' | 'STAT'
  at: string
  status: 'ordered' | 'collected' | 'processing' | 'reported'
  result?: string
  critical?: boolean
  reportedAt?: string
}

export type DrugStock = Base & { drug: string; form: string; stock: number; reorder: number; price: number; expiry: string; batch: string }

export type PharmacyOrder = Base & {
  patientId: string
  doctorId: string
  source: 'OPD' | 'IPD' | 'Emergency' | 'OT'
  items: RxItem[]
  at: string
  status: 'pending' | 'dispensed'
  dispensedAt?: string
  amount?: number
}

export type BillItem = { desc: string; category: string; qty: number; rate: number }

export type ClaimStatus = 'Not needed' | 'Pre-auth sent' | 'Query raised' | 'Pre-auth approved' | 'Claim submitted' | 'Settled' | 'Rejected'

export type Bill = Base & {
  billNo: string
  patientId: string
  source: 'OPD' | 'IPD' | 'Emergency' | 'Pharmacy' | 'Diagnostics' | 'OT'
  /** Episode this bill belongs to (visit, admission or emergency case id). */
  ref?: string
  /** Final bill raised; no more charges are added to it. */
  finalised?: boolean
  items: BillItem[]
  createdAt: string
  discount: number
  payments: { amount: number; mode: 'UPI' | 'Card' | 'Cash' | 'Net banking' | 'Insurer'; at: string; by: string }[]
  claim?: { insurer: string; tpa: string; policyNo: string; requested: number; approved?: number; status: ClaimStatus; updates: { at: string; text: string }[] }
}

export type Complaint = Base & {
  ref: string
  kind: 'Complaint' | 'Dispute' | 'Security incident' | 'Billing dispute' | 'Lost & found' | 'Staff conduct'
  title: string
  detail: string
  raisedBy: string
  raisedByUser?: string
  location: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'Investigating' | 'Resolved' | 'Closed'
  camera?: string
  at: string
  updates: { at: string; by: string; text: string }[]
}

export type AuditEntry = Base & { at: string; user: string; role: Role; action: string; detail: string }

export type Notice = Base & { at: string; text: string; level: 'info' | 'success' | 'warning' | 'danger'; roles: Role[] | 'all'; module?: string }
