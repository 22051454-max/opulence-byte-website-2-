import { DOCTORS } from './master'
import type { Role, User } from './types'

/** Role-based access: what each role can open (modules) and do (permissions). */

export type ModuleId =
  | 'dashboard' | 'reception' | 'opd' | 'emergency' | 'ipd' | 'ot' | 'nursing' | 'lab' | 'radiology'
  | 'pharmacy' | 'billing' | 'patients' | 'doctors' | 'summaries' | 'security' | 'admin'

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  doctor: 'Doctor',
  nurse: 'Nurse',
  reception: 'Reception',
  emergency: 'Emergency Desk',
  ot: 'OT Coordinator',
  lab: 'Laboratory',
  radiology: 'Radiology',
  pharmacy: 'Pharmacy',
  billing: 'Billing & TPA',
  security: 'Security Head',
}

export const MODULE_ACCESS: Record<ModuleId, Role[]> = {
  dashboard: ['superadmin', 'admin', 'doctor', 'nurse', 'reception', 'emergency', 'ot', 'lab', 'radiology', 'pharmacy', 'billing', 'security'],
  reception: ['superadmin', 'admin', 'reception'],
  opd: ['superadmin', 'admin', 'doctor'],
  emergency: ['superadmin', 'admin', 'emergency', 'doctor', 'nurse', 'reception'],
  ipd: ['superadmin', 'admin', 'doctor', 'nurse', 'reception', 'billing', 'emergency'],
  ot: ['superadmin', 'admin', 'ot', 'doctor', 'nurse'],
  nursing: ['superadmin', 'admin', 'nurse'],
  lab: ['superadmin', 'admin', 'lab'],
  radiology: ['superadmin', 'admin', 'radiology'],
  pharmacy: ['superadmin', 'admin', 'pharmacy'],
  billing: ['superadmin', 'admin', 'billing'],
  patients: ['superadmin', 'admin', 'doctor', 'nurse', 'reception', 'billing', 'emergency', 'ot'],
  doctors: ['superadmin', 'admin', 'doctor', 'nurse', 'reception', 'emergency', 'ot', 'billing'],
  summaries: ['superadmin', 'admin', 'doctor', 'nurse', 'billing', 'ot', 'emergency'],
  security: ['superadmin', 'security'],
  admin: ['superadmin', 'admin'],
}

export type Permission =
  | 'patient.register' | 'patient.clinical' | 'opd.consult' | 'er.register' | 'er.manage' | 'ipd.admit' | 'ipd.discharge'
  | 'ipd.beds' | 'ot.schedule' | 'ot.run' | 'nurse.note' | 'diag.order' | 'lab.process' | 'rad.process' | 'pharmacy.dispense'
  | 'billing.manage' | 'security.manage' | 'users.manage' | 'audit.view' | 'reports.all' | 'demo.reset'

const PERMS: Record<Role, Permission[]> = {
  superadmin: ['patient.register', 'patient.clinical', 'er.register', 'er.manage', 'ipd.admit', 'ipd.discharge', 'ipd.beds', 'ot.schedule', 'ot.run', 'nurse.note', 'diag.order', 'lab.process', 'rad.process', 'pharmacy.dispense', 'billing.manage', 'security.manage', 'users.manage', 'audit.view', 'reports.all', 'demo.reset'],
  admin: ['patient.register', 'patient.clinical', 'er.register', 'er.manage', 'ipd.admit', 'ipd.discharge', 'ipd.beds', 'ot.schedule', 'billing.manage', 'users.manage', 'audit.view', 'reports.all'],
  doctor: ['patient.clinical', 'opd.consult', 'er.manage', 'ipd.admit', 'ipd.discharge', 'ot.schedule', 'ot.run', 'diag.order', 'nurse.note'],
  nurse: ['patient.clinical', 'nurse.note', 'er.manage', 'ipd.beds', 'ot.run'],
  reception: ['patient.register', 'er.register', 'ipd.admit'],
  emergency: ['patient.register', 'er.register', 'er.manage', 'ipd.admit', 'diag.order'],
  ot: ['ot.schedule', 'ot.run', 'patient.clinical'],
  lab: ['lab.process'],
  radiology: ['rad.process'],
  pharmacy: ['pharmacy.dispense'],
  billing: ['billing.manage', 'ipd.beds'],
  security: ['security.manage'],
}

export const canOpen = (role: Role, m: ModuleId) => MODULE_ACCESS[m].includes(role)
export const can = (role: Role, p: Permission) => PERMS[role].includes(p)
export const permissionsOf = (role: Role) => PERMS[role]

export const DEMO_PASSWORD = 'sm@123'

const staff: [string, string, Role, string, string?][] = [
  ['superadmin', 'Abhishek Singh Munda', 'superadmin', 'Super Admin · Chairman'],
  ['admin', 'Niraj Kumar', 'admin', 'Hospital Administrator'],
  ['reception1', 'Pooja Kumari', 'reception', 'Front Office Executive'],
  ['reception2', 'Rakesh Mahto', 'reception', 'Front Office Executive'],
  ['emergency1', 'Manoj Kumar Bara', 'emergency', 'Emergency Triage Officer', 'Emergency Medicine'],
  ['nurse1', 'Sr. Mary Tigga', 'nurse', 'ICU Charge Nurse', 'Critical Care'],
  ['nurse2', 'Rekha Kumari', 'nurse', 'Ward Staff Nurse', 'Internal Medicine'],
  ['nurse3', 'Anjali Xaxa', 'nurse', 'OT Scrub Nurse', 'Anaesthesiology'],
  ['nurse4', 'Sunita Bara', 'nurse', 'Emergency Staff Nurse', 'Emergency Medicine'],
  ['ot1', 'Suresh Hembrom', 'ot', 'OT Coordinator'],
  ['lab1', 'Ajay Lal', 'lab', 'Lab Technologist (NABL)'],
  ['radiology1', 'Rina Soren', 'radiology', 'Radiology Technologist'],
  ['pharmacy1', 'Vivek Jha', 'pharmacy', 'Chief Pharmacist'],
  ['billing1', 'Seema Agarwal', 'billing', 'Billing & TPA Executive'],
  ['billing2', 'Rohan Bhagat', 'billing', 'TPA Desk Officer'],
  ['security1', 'Rajesh Thakur', 'security', 'Security Head'],
]

export const DEMO_USERS: User[] = [
  ...staff.map(([username, name, role, title, dept]) => ({ id: `u-${username}`, username, password: DEMO_PASSWORD, name, role, title, dept, active: true, seed: true })),
  ...DOCTORS.map((d, i) => ({
    id: `u-doctor${i + 1}`, username: `doctor${i + 1}`, password: DEMO_PASSWORD, name: d.name, role: 'doctor' as Role,
    title: `${d.dept}`, dept: d.dept, doctorId: d.id, active: true, seed: true,
  })),
]
