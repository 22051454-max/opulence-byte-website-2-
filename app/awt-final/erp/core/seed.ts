'use client'

import { bills } from '../services/billing'
import { diagOrders } from '../services/diagnostics'
import { erCases } from '../services/emergency'
import { audit, notices, seedUsers, users } from '../services/identity'
import { admissions, beds } from '../services/ipd'
import { nurseNotes } from '../services/nursing'
import { otRooms, surgeries } from '../services/ot'
import { visits } from '../services/opd'
import { patients } from '../services/patients'
import { rxOrders, stock } from '../services/pharmacy'
import { complaints } from '../services/security'
import {
  COMPLAINTS_ER, COMPLAINTS_OPD, DOCTORS, DRUGS, FIRST_F, FIRST_M, INSURERS, LAB_TESTS, LAST, OPD_WEIGHT, OT_ROOMS, PLACES, PROCEDURES, RAD_TESTS, TPAS, WARDS,
} from './master'
import { allCollections, clearAll, readKey, writeKey } from './store'
import type { Admission, Bed, Bill, ClaimStatus, Complaint, DiagOrder, ErCase, NurseNote, Patient, PharmacyOrder, RxItem, Surgery, Visit } from './types'
import { dayKey, rng } from './util'

/**
 * Demo data: a realistic day at a 294-bed super speciality hospital with
 * 500 to 1,000 patients a day. Generated once and stored; every record a
 * person enters afterwards is stored alongside it.
 */

const SEED_VERSION = 3
export type DayStat = { day: string; opd: number; er: number; admissions: number; discharges: number; surgeries: number; revenue: number }

const DX: Record<string, string[]> = {
  Cardiology: ['Coronary artery disease', 'Hypertension', 'Heart failure (HFrEF)', 'Atrial fibrillation'],
  Neurosurgery: ['Lumbar disc prolapse', 'Cervical myelopathy', 'Post-op review'],
  'Obstetrics & Gynaecology': ['Normal pregnancy, 28 weeks', 'PCOS', 'Fibroid uterus', 'Anaemia in pregnancy'],
  'Orthopaedics & Joint Replacement': ['Osteoarthritis knee', 'Fracture radius', 'Frozen shoulder', 'Low back pain'],
  'Paediatrics & Neonatology': ['Viral fever', 'Acute bronchiolitis', 'Gastroenteritis', 'Growth monitoring'],
  'Gastroenterology & GI Surgery': ['GERD', 'Cholelithiasis', 'Fatty liver', 'IBS'],
  Nephrology: ['CKD stage 3', 'Nephrotic syndrome', 'Renal calculi'],
  Oncology: ['Ca breast on chemotherapy', 'Ca lung review', 'Lymphoma follow-up'],
  'Cardiothoracic & Vascular Surgery': ['Triple vessel disease', 'Varicose veins'],
  Neurology: ['Migraine', 'Epilepsy', 'Stroke follow-up', 'Peripheral neuropathy'],
  Urology: ['BPH', 'Ureteric calculus', 'UTI'],
  Pulmonology: ['Bronchial asthma', 'COPD', 'Pulmonary TB on ATT', 'Community acquired pneumonia'],
  'General & Laparoscopic Surgery': ['Inguinal hernia', 'Appendicitis', 'Lipoma', 'Haemorrhoids'],
  'Internal Medicine': ['Type 2 diabetes', 'Viral fever', 'Typhoid fever', 'Dengue fever', 'Anaemia'],
  ENT: ['Chronic otitis media', 'Deviated nasal septum', 'Tonsillitis'],
  Ophthalmology: ['Cataract', 'Refractive error', 'Conjunctivitis'],
  Endocrinology: ['Hypothyroidism', 'Type 2 diabetes, uncontrolled', 'Obesity'],
  Dermatology: ['Tinea corporis', 'Psoriasis', 'Acne vulgaris'],
  Psychiatry: ['Depression', 'Anxiety disorder', 'Insomnia'],
  'Critical Care': ['Septic shock', 'ARDS on ventilator', 'Diabetic ketoacidosis', 'Post cardiac arrest care', 'Severe dengue with shock'],
}
const FREQ = ['1-0-1', '1-1-1', '0-0-1', '1-0-0', 'SOS']
const BG = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']

export function needsSeed() {
  return readKey<number>('seed-version', 0) !== SEED_VERSION || users.all().length === 0
}

export function seedAll() {
  clearAll()
  const r = rng(Number(dayKey().replace(/-/g, '')))
  const now = new Date()
  const midnight = new Date(now); midnight.setHours(0, 0, 0, 0)
  const opdStart = now.getHours() >= 10 ? new Date(midnight.getTime() + 8 * 3600e3) : midnight
  const span = Math.max(60e3, now.getTime() - opdStart.getTime())
  const minsAgo = (m: number) => new Date(now.getTime() - m * 60e3).toISOString()
  const at = (t: number) => new Date(opdStart.getTime() + t * span).toISOString()
  const pid = (i: number) => `sp${i}`
  let pCount = 0, billCount = 0

  const P: Patient[] = []
  const makePatient = (createdAt: string, opts: Partial<Patient> = {}): Patient => {
    const g = opts.gender ?? (r.chance(0.52) ? 'Male' : 'Female')
    const cat = r.next()
    const category: Patient['category'] = cat < 0.55 ? 'Self' : cat < 0.78 ? 'TPA / Insurance' : cat < 0.9 ? 'PM-JAY' : cat < 0.96 ? 'CGHS' : 'Corporate'
    const d = createdAt.slice(2, 10).replace(/-/g, '')
    const p: Patient = {
      id: pid(++pCount), seed: true,
      uhid: `SMI${d}${String(pCount).padStart(4, '0')}`,
      name: `${r.pick(g === 'Male' ? FIRST_M : FIRST_F)} ${r.pick(LAST)}`,
      age: r.int(1, 84), gender: g,
      phone: `9${r.int(100000000, 999999999)}`,
      abha: r.chance(0.7) ? `${r.int(10, 99)}-${r.int(1000, 9999)}-${r.int(1000, 9999)}-${r.int(1000, 9999)}` : undefined,
      aadhaar4: String(r.int(1000, 9999)),
      address: `${r.pick(PLACES)}, Jharkhand`,
      bloodGroup: r.pick(BG),
      allergies: r.chance(0.12) ? r.pick(['Penicillin', 'Sulpha drugs', 'NSAIDs', 'Iodine contrast']) : undefined,
      category,
      insurer: category === 'TPA / Insurance' ? r.pick(INSURERS) : category === 'PM-JAY' ? 'Ayushman Bharat PM-JAY' : category === 'CGHS' ? 'CGHS' : category === 'Corporate' ? r.pick(['Tata Steel', 'CCL', 'SAIL Bokaro', 'HEC']) : undefined,
      policyNo: category !== 'Self' ? `POL${r.int(1000000, 9999999)}` : undefined,
      createdAt,
      ...opts,
    }
    P.push(p)
    return p
  }

  const B: Bill[] = []
  const billNo = () => `SMB-${now.getFullYear()}-${String(++billCount).padStart(6, '0')}`
  const doctorFee = (id: string) => DOCTORS.find((d) => d.id === id)!.fee

  /* ---- OPD: today's footfall ---- */
  const target = r.int(560, 880)
  const weights = OPD_WEIGHT.reduce<number[]>((acc, w, i) => { for (let k = 0; k < w; k++) acc.push(i); return acc }, [])
  const V: Visit[] = []
  const RX: PharmacyOrder[] = []
  const DO: DiagOrder[] = []
  const times = Array.from({ length: target }, () => r.next()).sort()
  const tokens: Record<string, number> = {}
  for (let i = 0; i < target; i++) {
    const doc = DOCTORS[r.pick(weights)]
    const created = at(times[i])
    const follow = r.chance(0.35)
    const obg = doc.dept === 'Obstetrics & Gynaecology', paed = doc.dept === 'Paediatrics & Neonatology'
    const p = makePatient(follow ? new Date(now.getTime() - r.int(10, 200) * 86400e3).toISOString() : created, obg ? { gender: 'Female', age: r.int(19, 48) } : paed ? { age: r.int(0, 14) } : {})
    const complaint = obg ? r.pick(['Routine antenatal check-up', 'Irregular periods', 'Lower abdominal pain', 'Post-delivery check-up']) : paed ? r.pick(['Child with fever and cold', 'Vaccination visit', 'Loose motions', 'Cough for a week']) : r.pick(COMPLAINTS_OPD.filter((c) => !c.includes('antenatal') && !c.startsWith('Child')))
    const age = (now.getTime() - new Date(created).getTime()) / 60e3
    tokens[doc.id] = (tokens[doc.id] ?? 0) + 1
    const status: Visit['status'] = age > 120 ? (r.chance(0.96) ? 'done' : 'no-show') : age > 30 && r.chance(0.5) ? 'done' : 'waiting'
    const dx = DX[doc.dept] ?? ['Under evaluation']
    const rx: RxItem[] = status === 'done' ? Array.from({ length: r.int(1, 4) }, () => ({ drug: r.pick(DRUGS)[0], dose: '1 tab', freq: r.pick(FREQ), days: r.pick([3, 5, 7, 15, 30]) })) : []
    const orders = status === 'done' && r.chance(0.32) ? [r.chance(0.7) ? r.pick(LAB_TESTS)[0] : r.pick(RAD_TESTS)[0]] : []
    const v: Visit = {
      id: `sv${i}`, seed: true, patientId: p.id, doctorId: doc.id, dept: doc.dept, token: tokens[doc.id], createdAt: created, status,
      visitType: follow ? 'Follow-up' : 'New', complaint,
      vitals: { bp: `${r.int(104, 156)}/${r.int(66, 98)}`, pulse: r.int(64, 108), temp: +(97 + r.next() * 3).toFixed(1), spo2: r.int(94, 100), weight: r.int(12, 92) },
      diagnosis: status === 'done' ? r.pick(dx) : undefined,
      advice: status === 'done' ? 'Plenty of fluids, follow diet chart, review with reports.' : undefined,
      rx, orders, followUp: status === 'done' && r.chance(0.5) ? new Date(now.getTime() + r.int(5, 30) * 86400e3).toISOString().slice(0, 10) : undefined,
      doneAt: status === 'done' ? new Date(new Date(created).getTime() + r.int(10, 70) * 60e3).toISOString() : undefined,
    }
    V.push(v)
    const fee = follow ? Math.round(doctorFee(doc.id) * 0.6) : doctorFee(doc.id)
    B.push({ id: `sb${billCount}`, seed: true, billNo: billNo(), patientId: p.id, source: 'OPD', ref: v.id, createdAt: created, discount: 0, finalised: true,
      items: [{ desc: `${follow ? 'Follow-up consultation' : 'Consultation'}: ${doc.name}`, category: 'Consultation', qty: 1, rate: fee }],
      payments: p.category === 'Self' || r.chance(0.9) ? [{ amount: fee, mode: r.pick(['UPI', 'UPI', 'UPI', 'Card', 'Cash'] as const), at: created, by: r.pick(['Pooja Kumari', 'Rakesh Mahto']) }] : [] })
    if (rx.length) RX.push({ id: `srx${i}`, seed: true, patientId: p.id, doctorId: doc.id, source: 'OPD', items: rx, at: v.doneAt!, status: age > 60 ? 'dispensed' : 'pending', dispensedAt: age > 60 ? v.doneAt : undefined })
    for (const t of orders) {
      const kind = RAD_TESTS.some((x) => x[0] === t) ? 'Radiology' : 'Lab'
      const st: DiagOrder['status'] = age > 180 ? 'reported' : age > 90 ? r.pick(['processing', 'reported'] as const) : r.pick(['ordered', 'collected'] as const)
      DO.push({ id: `so${DO.length}`, seed: true, patientId: p.id, kind, test: t, orderedBy: doc.name, source: 'OPD', priority: r.chance(0.1) ? 'Urgent' : 'Routine', at: v.doneAt!, status: st,
        result: st === 'reported' ? (kind === 'Lab' ? 'Within normal limits except mild deviation; correlate clinically.' : 'No acute abnormality detected.') : undefined, reportedAt: st === 'reported' ? minsAgo(r.int(5, 120)) : undefined })
    }
  }
  // the newest visit per doctor is in consultation right now
  const seenDoc = new Set<string>()
  for (let i = V.length - 1; i >= 0; i--) {
    const v = V[i]
    if (v.status === 'waiting' && !seenDoc.has(v.doctorId)) { seenDoc.add(v.doctorId); v.status = 'in-consult' }
  }
  // put the earliest waiting patient in consultation instead (queue order)
  for (const id of seenDoc) {
    const waiting = V.filter((v) => v.doctorId === id && (v.status === 'waiting' || v.status === 'in-consult'))
    waiting.forEach((v) => (v.status = 'waiting'))
    if (waiting[0]) waiting[0].status = 'in-consult'
  }

  /* ---- Beds & admissions ---- */
  const BEDS: Bed[] = []
  for (const w of WARDS) for (let n = 1; n <= w.beds; n++) BEDS.push({ id: `${w.id}-${n}`, seed: true, ward: w.id, number: `${w.id}-${String(n).padStart(2, '0')}`, status: 'free' })
  const A: Admission[] = []
  const NN: NurseNote[] = []
  const nurses = ['Sr. Mary Tigga', 'Rekha Kumari', 'Sunita Bara', 'Anjali Xaxa']
  const ipdDocs = DOCTORS.filter((d) => !['Anaesthesiology', 'Radiology', 'Emergency Medicine'].includes(d.dept))
  for (const bed of BEDS) {
    const w = WARDS.find((x) => x.id === bed.ward)!
    const occ = w.kind === 'Critical' ? 0.86 : w.kind === 'Day care' ? 0.6 : 0.78
    const roll = r.next()
    if (roll < occ) {
      const daysIn = w.kind === 'Day care' ? 0 : r.int(0, 9)
      const admittedAt = new Date(now.getTime() - daysIn * 86400e3 - r.int(30, 600) * 60e3).toISOString()
      const p = makePatient(new Date(new Date(admittedAt).getTime() - r.int(0, 400) * 86400e3).toISOString(), w.id === 'NNU' ? { age: 0 } : w.id === 'PICU' ? { age: r.int(1, 12) } : w.id === 'MAT' ? { gender: 'Female', age: r.int(21, 36) } : w.id === 'GWM' ? { gender: 'Male' } : w.id === 'GWF' ? { gender: 'Female' } : {})
      const doc = w.id === 'CCU' ? DOCTORS[0] : w.id === 'NICU' ? DOCTORS[r.pick([1, 11])] : w.id === 'MAT' ? DOCTORS[2] : w.id === 'NNU' || w.id === 'PICU' ? DOCTORS[4] : w.id === 'MICU' ? DOCTORS[16] : w.id === 'DIA' ? DOCTORS[6] : w.id === 'DAY' ? DOCTORS[8] : r.pick(ipdDocs)
      const a: Admission = { id: `sa${A.length}`, seed: true, patientId: p.id, doctorId: doc.id, bedId: bed.id, admittedAt, diagnosis: r.pick(DX[doc.dept] ?? ['Under evaluation']), source: r.pick(['OPD', 'Emergency', 'Emergency', 'Direct'] as const), status: 'admitted' }
      A.push(a)
      bed.status = 'occupied'; bed.admissionId = a.id
      const days = Math.max(1, daysIn)
      const items = [
        { desc: 'Admission & registration', category: 'Admission', qty: 1, rate: 1000 },
        { desc: `${w.name} bed charges (per day)`, category: 'Room', qty: days, rate: w.rate },
        { desc: 'Nursing care (per day)', category: 'Nursing', qty: days, rate: w.kind === 'Critical' ? 3000 : 900 },
        { desc: `Doctor visits: ${doc.name}`, category: 'Professional fee', qty: days, rate: 1200 },
        { desc: 'Pharmacy & consumables', category: 'Pharmacy', qty: 1, rate: r.int(2, 30) * 1000 },
        { desc: 'Laboratory investigations', category: 'Laboratory', qty: 1, rate: r.int(2, 12) * 500 },
      ]
      const insured = p.category !== 'Self'
      const statuses: ClaimStatus[] = ['Pre-auth sent', 'Query raised', 'Pre-auth approved', 'Pre-auth approved', 'Claim submitted']
      const total = items.reduce((s, i) => s + i.qty * i.rate, 0)
      const cs = r.pick(statuses)
      B.push({ id: `sb${billCount}`, seed: true, billNo: billNo(), patientId: p.id, source: 'IPD', ref: a.id, createdAt: admittedAt, discount: 0, items,
        payments: [{ amount: insured ? 5000 : Math.round(total * r.pick([0.3, 0.5, 0.8])), mode: r.pick(['UPI', 'Card', 'Net banking'] as const), at: admittedAt, by: 'Seema Agarwal' }],
        claim: insured ? { insurer: p.insurer!, tpa: p.category === 'TPA / Insurance' ? r.pick(TPAS) : 'Direct (no TPA)', policyNo: p.policyNo!, requested: total, approved: cs === 'Pre-auth approved' || cs === 'Claim submitted' ? Math.round(total * 0.9) : undefined, status: cs,
          updates: [{ at: admittedAt, text: 'Pre-auth sent' }, ...(cs !== 'Pre-auth sent' ? [{ at: minsAgo(r.int(60, 1500)), text: cs === 'Query raised' ? 'Query raised: Need previous discharge summary' : cs }] : [])] } : undefined })
      const nNotes = w.kind === 'Critical' ? 3 : 1
      for (let k = 0; k < nNotes; k++) NN.push({ id: `snn${NN.length}`, seed: true, patientId: p.id, context: 'IPD', refId: a.id, kind: k === 0 ? 'Vitals' : r.pick(['Observation', 'Medication given', 'Intake / Output'] as const),
        text: k === 0 ? 'Vitals recorded. Patient comfortable, oriented.' : r.pick(['IV antibiotics given as charted.', 'Urine output adequate, 1.2 L in 12 h.', 'Patient ambulated with support.', 'Complains of mild pain, analgesic given as per order.', 'Dressing changed, wound healthy.']),
        vitals: k === 0 ? { bp: `${r.int(100, 150)}/${r.int(60, 95)}`, pulse: r.int(60, 112), temp: +(97 + r.next() * 3).toFixed(1), spo2: r.int(92, 100), rr: r.int(14, 24) } : undefined,
        by: r.pick(nurses), at: minsAgo(r.int(5, 480)) })
    } else if (roll < occ + 0.04) bed.status = 'cleaning'
    else if (roll < occ + 0.06) bed.status = 'reserved'
  }
  // discharged today
  for (let i = 0; i < r.int(22, 34); i++) {
    const doc = r.pick(ipdDocs)
    const p = makePatient(new Date(now.getTime() - r.int(3, 30) * 86400e3).toISOString())
    const bed = r.pick(BEDS.filter((b) => b.status !== 'occupied'))
    const days = r.int(2, 7)
    const total = days * r.int(6, 18) * 1000 + r.int(5, 40) * 1000
    const insured = p.category !== 'Self'
    const settled = insured && r.chance(0.6)
    const disAt = minsAgo(r.int(10, Math.max(20, span / 60e3)))
    B.push({ id: `sb${billCount}`, seed: true, billNo: billNo(), patientId: p.id, source: 'IPD', ref: `sa${A.length}`, createdAt: new Date(now.getTime() - days * 86400e3).toISOString(), discount: 0, finalised: true,
      items: [{ desc: 'Inpatient package (room, nursing, doctor visits, medicines, investigations)', category: 'Package', qty: 1, rate: total }],
      payments: insured ? [{ amount: Math.round(total * 0.1), mode: 'UPI', at: disAt, by: 'Seema Agarwal' }, ...(settled ? [{ amount: total - Math.round(total * 0.1), mode: 'Insurer' as const, at: disAt, by: 'Rohan Bhagat' }] : [])] : [{ amount: total, mode: r.pick(['UPI', 'Card'] as const), at: disAt, by: 'Seema Agarwal' }],
      claim: insured ? { insurer: p.insurer!, tpa: p.category === 'TPA / Insurance' ? r.pick(TPAS) : 'Direct (no TPA)', policyNo: p.policyNo!, requested: total, approved: settled ? total - Math.round(total * 0.1) : Math.round(total * 0.9), status: settled ? 'Settled' : 'Claim submitted', updates: [{ at: disAt, text: settled ? 'Settled' : 'Claim submitted' }] } : undefined })
    A.push({ id: `sa${A.length}`, seed: true, patientId: p.id, doctorId: doc.id, bedId: bed.id, admittedAt: new Date(now.getTime() - r.int(2, 7) * 86400e3).toISOString(), diagnosis: r.pick(DX[doc.dept] ?? ['Under evaluation']), source: 'OPD', status: 'discharged', dischargedAt: disAt,
      dischargeSummary: { finalDiagnosis: r.pick(DX[doc.dept] ?? ['Recovered']), courseInHospital: 'Managed conservatively with IV medications and monitoring. Improved steadily.', procedures: 'Nil', conditionAtDischarge: 'Stable, afebrile, ambulatory', medications: 'As per prescription attached', followUp: 'Review in OPD after 7 days with reports', writtenBy: doc.name, at: minsAgo(30) } })
  }

  /* ---- Emergency ---- */
  const ER: ErCase[] = []
  const erCount = r.int(38, 62)
  const usedBays = new Set<string>()
  for (let i = 0; i < erCount; i++) {
    const mAgo = Math.round(r.next() * Math.max(30, span / 60e3))
    const open = i >= erCount - 14
    const tri = r.next() < (open ? 0.22 : 0.15) ? 'red' : r.next() < 0.5 ? 'yellow' : 'green'
    const complaint = r.pick(COMPLAINTS_ER)
    const ug = complaint === 'Labour pains' || r.chance(0.4) ? 'Female' : 'Male'
    const ua = complaint === 'Labour pains' ? r.int(20, 34) : r.int(25, 60)
    const p = makePatient(minsAgo(open ? r.int(3, 140) : mAgo), i % 9 === 0 && complaint !== 'Labour pains' ? { name: `Unknown ${ug} (~${ua} yrs)`, gender: ug, age: ua, phone: '', abha: undefined } : complaint === 'Labour pains' ? { gender: 'Female', age: ua } : {})
    const status: ErCase['status'] = open ? (tri === 'red' ? 'treatment' : r.pick(['waiting', 'treatment', 'observation'] as const)) : 'closed'
    const pool = tri === 'red' ? ['Resus 1', 'Resus 2', 'Resus 3'] : status === 'observation' ? ['Obs 1', 'Obs 2', 'Obs 3', 'Obs 4'] : ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4', 'Bay 5', 'Bay 6', 'Bay 7', 'Bay 8', 'Bay 9', 'Bay 10']
    const bay = open ? pool.find((b) => !usedBays.has(b)) : undefined
    if (bay) usedBays.add(bay)
    ER.push({ id: `ser${i}`, seed: true, patientId: p.id, arrivedAt: p.createdAt, triage: tri, mode: r.pick(['Walk-in', 'Walk-in', 'Ambulance (108)', 'Private ambulance', 'Referred'] as const),
      complaint, mlc: r.chance(0.18), bay, doctorId: status !== 'waiting' ? 'd8' : undefined, status,
      disposition: open ? undefined : r.pick(['Discharged', 'Discharged', 'Admitted', 'Admitted', 'Sent to OT', 'Referred out', 'LAMA'] as const), closedAt: open ? undefined : minsAgo(Math.max(1, mAgo - r.int(30, 180))),
      vitals: { bp: `${r.int(80, 170)}/${r.int(50, 100)}`, pulse: r.int(58, 140), spo2: r.int(84, 100), temp: +(97 + r.next() * 4).toFixed(1), rr: r.int(14, 32) } })
    if (open && r.chance(0.6)) NN.push({ id: `snn${NN.length}`, seed: true, patientId: p.id, context: 'Emergency', refId: `ser${i}`, kind: tri === 'red' ? 'Alert' : 'Observation', text: tri === 'red' ? 'Monitor every 15 min. IV line secured, oxygen started.' : 'Triage vitals noted. Awaiting doctor review.', by: 'Sunita Bara', at: minsAgo(r.int(1, 60)) })
  }

  /* ---- Operation theatres ---- */
  const S: Surgery[] = []
  const surgeonFor: Record<number, string[]> = { 1: ['d11', 'd1'], 2: ['d2'], 3: ['d4'], 4: ['d15', 'd3', 'd6', 'd13'] }
  for (const ot of [1, 2, 3, 4]) {
    // each theatre's list started a few hours ago, so the board shows done, live and upcoming cases
    let cursor = Math.max(midnight.getTime() + 7 * 3600e3, now.getTime() - r.int(150, 330) * 60e3)
    const n = ot === 4 ? 5 : ot === 1 ? 2 : 3
    for (let k = 0; k < n; k++) {
      const dur = ot === 1 ? r.int(180, 300) : r.int(60, 150)
      const start = cursor
      cursor += (dur + 30 + r.int(0, 30)) * 60e3
      const end = start + dur * 60e3
      const status: Surgery['status'] = end < now.getTime() ? 'completed' : start < now.getTime() ? 'in-progress' : 'scheduled'
      const admitted = A.filter((a) => a.status === 'admitted')
      const p = r.pick(admitted).patientId
      S.push({ id: `ss${S.length}`, seed: true, patientId: p, ot, procedure: r.pick(PROCEDURES[ot]), surgeonId: r.pick(surgeonFor[ot]), anaesthetistId: r.pick(['d10', 'd21']),
        anaesthesia: ot === 3 || ot === 4 ? r.pick(['Spinal', 'General', 'Regional block'] as const) : 'General', priority: ot === 4 && k === n - 1 ? 'Emergency' : 'Elective',
        start: new Date(start).toISOString(), durationMin: dur, status, consent: true,
        checklist: { signIn: status !== 'scheduled', timeOut: status !== 'scheduled', signOut: status === 'completed' },
        startedAt: status !== 'scheduled' ? new Date(start).toISOString() : undefined, endedAt: status === 'completed' ? new Date(end).toISOString() : undefined })
      if (status === 'in-progress') NN.push({ id: `snn${NN.length}`, seed: true, patientId: p, context: 'OT', refId: S[S.length - 1].id, kind: 'Observation', text: 'Patient shifted to OT table, monitors attached, sponge count verified (20).', by: 'Anjali Xaxa', at: new Date(start + 5 * 60e3).toISOString() })
    }
  }
  const OTR = OT_ROOMS.map((o) => ({ id: `ot${o.number}`, seed: true, ...o, status: S.some((s) => s.ot === o.number && s.status === 'in-progress') ? 'in-use' as const : 'ready' as const }))

  /* ---- Pharmacy stock ---- */
  const STOCK = DRUGS.map(([drug, form, price], i) => ({ id: `sk${i}`, seed: true, drug, form, price, stock: i % 7 === 3 ? r.int(5, 40) : r.int(150, 2400), reorder: 100, batch: `B${r.int(10000, 99999)}`,
    expiry: new Date(now.getTime() + (i % 9 === 4 ? r.int(10, 60) : r.int(120, 720)) * 86400e3).toISOString().slice(0, 10) }))

  /* ---- Security ---- */
  const C: Complaint[] = [
    ['Billing dispute', 'Family disputes ICU bill amount', 'Relatives of MICU patient say pharmacy charges are higher than estimate given at admission.', 'Billing counter, Ground floor', 'High', 'Investigating', 'CAM-03'],
    ['Security incident', 'Unauthorised person in NICU corridor', 'Visitor without pass tried to enter neonatal unit at night shift change.', 'NICU corridor, 3rd floor', 'Critical', 'Investigating', 'CAM-07'],
    ['Complaint', 'Long waiting time in Orthopaedics OPD', 'Patient waited 2 hours beyond appointment time.', 'OPD block, 1st floor', 'Medium', 'Open', undefined],
    ['Lost & found', 'Mobile phone found in lift 2', 'Black Android phone handed over to security desk.', 'Lift 2', 'Low', 'Resolved', 'CAM-05'],
    ['Staff conduct', 'Rude behaviour at pharmacy counter', 'Attendant reports staff was rude while explaining substitution.', 'Pharmacy, Ground floor', 'Medium', 'Open', 'CAM-04'],
    ['Dispute', 'Parking altercation near emergency gate', 'Two attendants argued over ambulance bay parking. Settled by guards.', 'Emergency entrance', 'Medium', 'Closed', 'CAM-01'],
    ['Complaint', 'AC not working in Semi-Private room 12', 'Patient complained room temperature too high.', 'SPV-12, 3rd floor', 'Low', 'Resolved', undefined],
    ['Security incident', 'Fire alarm triggered in pantry', 'Smoke from toaster set off detector; no fire. Drill protocol followed.', 'Staff pantry, 2nd floor', 'High', 'Closed', 'CAM-06'],
  ].map(([kind, title, detail, location, severity, status, camera], i) => ({
    id: `sc${i}`, seed: true, ref: `SEC-${String(i + 1).padStart(4, '0')}`, kind, title, detail, location, severity, status, camera, raisedBy: r.pick(['Patient attendant', 'Nursing staff', 'Guard on duty', 'Patient']),
    raisedByUser: r.pick(['Pooja Kumari', 'Rakesh Mahto', 'Sr. Mary Tigga']), at: minsAgo(r.int(30, 3000)), updates: [{ at: minsAgo(r.int(5, 30)), by: 'Rajesh Thakur', text: status === 'Open' ? 'Acknowledged' : `Marked ${status}` }],
  } as Complaint))

  // history for charts (previous 13 days)
  const history: DayStat[] = Array.from({ length: 13 }, (_, k) => {
    const d = new Date(midnight.getTime() - (13 - k) * 86400e3)
    const opd = r.int(520, 940)
    return { day: dayKey(d), opd, er: r.int(35, 70), admissions: r.int(40, 75), discharges: r.int(38, 72), surgeries: r.int(10, 18), revenue: opd * r.int(1700, 2400) + r.int(30, 60) * 100000 }
  })

  seedUsers()
  patients.replace(P.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  visits.replace(V.reverse())
  beds.replace(BEDS)
  admissions.replace(A)
  erCases.replace(ER)
  surgeries.replace(S)
  otRooms.replace(OTR)
  nurseNotes.replace(NN.sort((a, b) => b.at.localeCompare(a.at)))
  diagOrders.replace(DO.reverse())
  rxOrders.replace(RX.reverse())
  stock.replace(STOCK)
  bills.replace(B.reverse())
  complaints.replace(C.sort((a, b) => b.at.localeCompare(a.at)))
  audit.replace([])
  notices.replace([
    { id: 'sn1', seed: true, at: minsAgo(4), text: 'OT 4 emergency slot kept free for LSCS', level: 'warning', roles: ['ot', 'nurse', 'doctor', 'admin', 'superadmin'], module: 'ot' },
    { id: 'sn2', seed: true, at: minsAgo(12), text: 'Blood bank: O-negative stock low (3 units)', level: 'danger', roles: 'all' },
    { id: 'sn3', seed: true, at: minsAgo(40), text: 'NABH mock audit on Friday. Keep nurse notes up to date.', level: 'info', roles: 'all' },
  ])
  allCollections().forEach((c) => c.flush())
  writeKey('history', history)
  writeKey('seed-version', SEED_VERSION)
  writeKey('seed-day', dayKey())
}

/** Keep seeded demo traffic on "today": shift seeded timestamps forward by whole days. */
export function rollSeedForward() {
  const seedDay = readKey<string | null>('seed-day', null)
  if (!seedDay || seedDay === dayKey()) return
  const delta = Math.round((new Date(dayKey()).getTime() - new Date(seedDay).getTime()) / 86400e3)
  if (delta <= 0) return
  const shift = (v: unknown): unknown => {
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(new Date(v).getTime() + delta * 86400e3).toISOString()
    if (Array.isArray(v)) return v.map(shift)
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shift(x)]))
    return v
  }
  for (const c of allCollections()) {
    const rows = c.all()
    if (rows.some((x) => x.seed)) c.replace(rows.map((x) => (x.seed ? (shift(x) as typeof x) : x)))
  }
  const hist = readKey<DayStat[]>('history', [])
  const r = rng(delta)
  const add: DayStat[] = Array.from({ length: delta }, (_, k) => {
    const d = new Date(new Date(seedDay).getTime() + k * 86400e3)
    return { day: dayKey(d), opd: r.int(520, 940), er: r.int(35, 70), admissions: r.int(40, 75), discharges: r.int(38, 72), surgeries: r.int(10, 18), revenue: r.int(14, 22) * 100000 }
  })
  writeKey('history', [...hist, ...add].slice(-13))
  writeKey('seed-day', dayKey())
}
