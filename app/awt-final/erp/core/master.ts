import type { Doctor, Ward } from './types'

/** Hospital master data: configured once, read everywhere. */

export const HOSPITAL = {
  name: 'SM Imperial Hospital',
  fullName: 'Saira Munda Imperial Hospital',
  tagline: 'Advanced Super Speciality Care',
  address: 'Ring Road, Ranchi, Jharkhand 834001',
  phone: '+91 651 400 1000',
  emergency: '1800 120 1000',
  nabh: 'NABH & NABL accredited',
  beds: 0, // filled from WARDS below
}

export const DEPARTMENTS = [
  'Cardiology', 'Cardiothoracic & Vascular Surgery', 'Neurology', 'Neurosurgery', 'Nephrology', 'Urology',
  'Gastroenterology & GI Surgery', 'Oncology', 'Orthopaedics & Joint Replacement', 'Obstetrics & Gynaecology',
  'Paediatrics & Neonatology', 'Pulmonology', 'Endocrinology', 'Internal Medicine', 'General & Laparoscopic Surgery',
  'ENT', 'Ophthalmology', 'Dermatology', 'Psychiatry', 'Critical Care', 'Emergency Medicine', 'Anaesthesiology', 'Radiology',
] as const

export const DOCTORS: Doctor[] = [
  ['Dr. Ananya Mehta', 'Cardiology', 'MD, DM (Cardiology)', 'OPD-101', false, 1200, 'Mon to Sat'],
  ['Dr. Rohit Verma', 'Neurosurgery', 'MS, MCh (Neurosurgery)', 'OPD-204', true, 1500, 'Mon, Wed, Fri'],
  ['Dr. Kavita Tirkey', 'Obstetrics & Gynaecology', 'MS (OBG), FICOG', 'OPD-301', true, 900, 'Mon to Sat'],
  ['Dr. Sameer Khan', 'Orthopaedics & Joint Replacement', 'MS (Ortho), Fellowship Arthroplasty', 'OPD-110', true, 1000, 'Mon to Sat'],
  ['Dr. Priya Lakra', 'Paediatrics & Neonatology', 'MD (Paediatrics), Fellowship Neonatology', 'OPD-305', false, 800, 'Mon to Sat'],
  ['Dr. Arvind Prasad', 'Gastroenterology & GI Surgery', 'MS, MCh (Surgical Gastro)', 'OPD-208', true, 1200, 'Tue, Thu, Sat'],
  ['Dr. Neha Sharma', 'Nephrology', 'MD, DM (Nephrology)', 'OPD-212', false, 1100, 'Mon to Fri'],
  ['Dr. Vikram Oraon', 'Emergency Medicine', 'MD (Emergency Medicine)', 'ER', false, 700, '24 x 7 roster'],
  ['Dr. Farhan Ali', 'Oncology', 'MD, DM (Medical Oncology)', 'OPD-220', false, 1400, 'Mon to Sat'],
  ['Dr. Meera Iyer', 'Anaesthesiology', 'MD (Anaesthesia), FIPM', 'OT Complex', false, 0, 'OT roster'],
  ['Dr. Sanjay Mahto', 'Cardiothoracic & Vascular Surgery', 'MS, MCh (CTVS)', 'OPD-103', true, 1500, 'Mon, Thu'],
  ['Dr. Ritu Ekka', 'Neurology', 'MD, DM (Neurology)', 'OPD-206', false, 1200, 'Mon to Sat'],
  ['Dr. Amit Gupta', 'Urology', 'MS, MCh (Urology)', 'OPD-214', true, 1000, 'Mon to Sat'],
  ['Dr. Pooja Mishra', 'Pulmonology', 'MD (Respiratory Medicine)', 'OPD-118', false, 900, 'Mon to Sat'],
  ['Dr. Rahul Toppo', 'General & Laparoscopic Surgery', 'MS (General Surgery), FMAS', 'OPD-120', true, 800, 'Mon to Sat'],
  ['Dr. Shalini Das', 'Internal Medicine', 'MD (Medicine)', 'OPD-105', false, 700, 'Mon to Sat'],
  ['Dr. Imran Ansari', 'Critical Care', 'MD, IDCCM', 'ICU', false, 0, 'ICU roster'],
  ['Dr. Sunita Kujur', 'ENT', 'MS (ENT)', 'OPD-130', true, 700, 'Mon to Sat'],
  ['Dr. Deepak Sahu', 'Ophthalmology', 'MS (Ophthalmology)', 'OPD-132', true, 700, 'Mon to Sat'],
  ['Dr. Nidhi Pandey', 'Endocrinology', 'MD, DM (Endocrinology)', 'OPD-216', false, 1100, 'Mon to Sat'],
  ['Dr. Karan Minz', 'Anaesthesiology', 'MD (Anaesthesia)', 'OT Complex', false, 0, 'OT roster'],
  ['Dr. Swati Yadav', 'Dermatology', 'MD (Dermatology)', 'OPD-134', false, 700, 'Mon to Sat'],
  ['Dr. Alok Pandey', 'Psychiatry', 'MD (Psychiatry)', 'OPD-136', false, 900, 'Tue, Thu, Sat'],
  ['Dr. Ruchi Singh', 'Radiology', 'MD (Radiodiagnosis)', 'Imaging', false, 0, 'Imaging roster'],
].map(([name, dept, qualification, room, surgeon, fee, opdDays], i) => ({
  id: `d${i + 1}`, name, dept, qualification, room, surgeon, fee, opdDays, seed: true,
} as Doctor))

/** Relative OPD load per doctor (index-aligned with DOCTORS). Zero = no OPD. */
export const OPD_WEIGHT = [9, 4, 8, 9, 8, 6, 5, 0, 5, 0, 3, 6, 5, 6, 7, 10, 0, 5, 5, 5, 0, 5, 3, 0]

export const WARDS: Ward[] = [
  { id: 'GWM', name: 'General Ward (Male)', kind: 'General', floor: '2nd floor', rate: 1500, beds: 40 },
  { id: 'GWF', name: 'General Ward (Female)', kind: 'General', floor: '2nd floor', rate: 1500, beds: 40 },
  { id: 'SPV', name: 'Semi-Private', kind: 'Room', floor: '3rd floor', rate: 3500, beds: 30 },
  { id: 'PVT', name: 'Private Rooms', kind: 'Room', floor: '4th floor', rate: 6000, beds: 30 },
  { id: 'STE', name: 'Imperial Suites', kind: 'Room', floor: '5th floor', rate: 12000, beds: 8 },
  { id: 'MICU', name: 'Medical ICU', kind: 'Critical', floor: '1st floor', rate: 15000, beds: 20 },
  { id: 'CCU', name: 'Cardiac Care Unit', kind: 'Critical', floor: '1st floor', rate: 16000, beds: 12 },
  { id: 'NICU', name: 'Neuro ICU', kind: 'Critical', floor: '1st floor', rate: 16000, beds: 10 },
  { id: 'SICU', name: 'Surgical ICU', kind: 'Critical', floor: '1st floor', rate: 15000, beds: 12 },
  { id: 'NNU', name: 'Neonatal ICU', kind: 'Critical', floor: '3rd floor', rate: 12000, beds: 16 },
  { id: 'PICU', name: 'Paediatric ICU', kind: 'Critical', floor: '3rd floor', rate: 12000, beds: 10 },
  { id: 'HDU', name: 'High Dependency Unit', kind: 'Critical', floor: '1st floor', rate: 8000, beds: 12 },
  { id: 'MAT', name: 'Maternity & Labour', kind: 'Speciality', floor: '3rd floor', rate: 4000, beds: 16 },
  { id: 'BRN', name: 'Burns Unit', kind: 'Speciality', floor: '2nd floor', rate: 9000, beds: 6 },
  { id: 'DIA', name: 'Dialysis Unit', kind: 'Day care', floor: 'Ground floor', rate: 2500, beds: 14 },
  { id: 'DAY', name: 'Day Care & Chemo', kind: 'Day care', floor: 'Ground floor', rate: 2000, beds: 12 },
  { id: 'ISO', name: 'Isolation', kind: 'Speciality', floor: '2nd floor', rate: 7000, beds: 6 },
]
HOSPITAL.beds = WARDS.reduce((s, w) => s + w.beds, 0)

export const OT_ROOMS = [
  { number: 1, name: 'OT 1', speciality: 'Cardiac & CTVS (hybrid, laminar flow)' },
  { number: 2, name: 'OT 2', speciality: 'Neuro & Spine' },
  { number: 3, name: 'OT 3', speciality: 'Orthopaedics & Joint Replacement' },
  { number: 4, name: 'OT 4', speciality: 'General, Gynae & Emergency' },
]

export const ER_BAYS = ['Resus 1', 'Resus 2', 'Resus 3', 'Bay 1', 'Bay 2', 'Bay 3', 'Bay 4', 'Bay 5', 'Bay 6', 'Bay 7', 'Bay 8', 'Bay 9', 'Bay 10', 'Obs 1', 'Obs 2', 'Obs 3', 'Obs 4', 'Paeds 1', 'Paeds 2', 'Isolation']

export const INSURERS = ['Star Health', 'ICICI Lombard', 'HDFC ERGO', 'Niva Bupa', 'Care Health', 'New India Assurance', 'Bajaj Allianz', 'Aditya Birla Health']
export const TPAS = ['Medi Assist', 'Paramount Health', 'Vidal Health', 'MDIndia', 'Health India TPA', 'Raksha TPA', 'Direct (no TPA)']

export const LAB_TESTS: [string, number][] = [
  ['Complete Blood Count (CBC)', 350], ['Liver Function Test', 650], ['Kidney Function Test', 600], ['Lipid Profile', 550],
  ['HbA1c', 450], ['Blood Sugar (Fasting / PP)', 120], ['Thyroid Profile (T3, T4, TSH)', 550], ['Troponin I', 1100],
  ['Serum Electrolytes', 450], ['Blood Culture', 900], ['Urine Routine', 150], ['Coagulation Profile (PT/INR)', 500],
  ['Arterial Blood Gas', 800], ['D-Dimer', 1200], ['CRP', 450], ['Dengue NS1 / IgM', 900], ['Blood Group & Cross-match', 300],
]
export const RAD_TESTS: [string, number][] = [
  ['X-Ray Chest PA', 400], ['X-Ray (Limb / Spine)', 500], ['USG Whole Abdomen', 1200], ['USG Obstetric', 1400], ['2D Echo', 1800],
  ['CT Brain (Plain)', 2800], ['CT Chest (HRCT)', 4000], ['CT Abdomen (Contrast)', 6500], ['MRI Brain', 7500], ['MRI Spine', 8000],
  ['MRI Knee', 7000], ['PET-CT', 22000], ['Mammography', 1800], ['Doppler (Venous / Arterial)', 2200], ['Coronary Angiography', 14000],
]

export const DRUGS: [string, string, number][] = [
  ['Paracetamol 650 mg', 'Tablet', 2], ['Pantoprazole 40 mg', 'Tablet', 6], ['Amoxicillin + Clavulanate 625 mg', 'Tablet', 22],
  ['Azithromycin 500 mg', 'Tablet', 25], ['Metformin 500 mg', 'Tablet', 3], ['Amlodipine 5 mg', 'Tablet', 4], ['Telmisartan 40 mg', 'Tablet', 8],
  ['Atorvastatin 20 mg', 'Tablet', 9], ['Aspirin 75 mg', 'Tablet', 2], ['Clopidogrel 75 mg', 'Tablet', 7], ['Ceftriaxone 1 g', 'Injection', 65],
  ['Ondansetron 4 mg', 'Injection', 18], ['Insulin Glargine', 'Pen', 780], ['Normal Saline 500 ml', 'IV fluid', 35], ['Ringer Lactate 500 ml', 'IV fluid', 40],
  ['Enoxaparin 40 mg', 'Injection', 340], ['Levetiracetam 500 mg', 'Tablet', 14], ['Salbutamol Inhaler', 'Inhaler', 160], ['Montelukast 10 mg', 'Tablet', 12],
  ['Iron + Folic acid', 'Tablet', 3], ['Calcium + Vitamin D3', 'Tablet', 6], ['Cetirizine 10 mg', 'Tablet', 2], ['Diclofenac 50 mg', 'Tablet', 3],
  ['Tramadol 50 mg', 'Capsule', 9], ['Meropenem 1 g', 'Injection', 950], ['Pip-Tazo 4.5 g', 'Injection', 520], ['Furosemide 40 mg', 'Tablet', 2],
  ['Dexamethasone 8 mg', 'Injection', 15], ['Adrenaline 1 mg', 'Injection', 30], ['Oxytocin 5 IU', 'Injection', 25],
]

export const COMPLAINTS_OPD = [
  'Chest pain on exertion', 'Fever for 3 days', 'Headache and giddiness', 'Knee pain while walking', 'Cough and breathlessness',
  'Abdominal pain', 'Routine antenatal check-up', 'Follow-up after surgery', 'High blood sugar', 'Back pain radiating to leg',
  'Burning urination', 'Skin rash and itching', 'Blurred vision', 'Ear discharge', 'Swelling of feet', 'Palpitations',
  'Child with fever and cold', 'Weakness and fatigue', 'Thyroid follow-up', 'Chemotherapy cycle review',
]
export const COMPLAINTS_ER = [
  'Road traffic accident, head injury', 'Severe chest pain, sweating', 'Breathlessness, SpO2 low', 'Fall from height', 'Seizure episode',
  'Snake bite', 'Acute abdominal pain', 'High fever with rigors', 'Burns (hot water)', 'Labour pains', 'Stroke symptoms, slurred speech',
  'Poisoning (OP compound)', 'Cut injury on hand', 'Vomiting and dehydration', 'Dog bite', 'Fainting episode', 'Asthma attack', 'Fracture forearm',
]
export const PROCEDURES: Record<number, string[]> = {
  1: ['CABG (Coronary Artery Bypass)', 'Mitral Valve Replacement', 'PTCA with Stenting', 'Pacemaker Implantation', 'Aortic Valve Replacement'],
  2: ['Craniotomy & Tumour Excision', 'Lumbar Discectomy', 'VP Shunt', 'Spinal Fusion (L4-L5)', 'Burr Hole Evacuation'],
  3: ['Total Knee Replacement', 'Total Hip Replacement', 'ACL Reconstruction', 'ORIF Femur', 'Arthroscopic Meniscus Repair'],
  4: ['Laparoscopic Cholecystectomy', 'LSCS (Caesarean)', 'Appendicectomy', 'Hernia Repair (Mesh)', 'Total Laparoscopic Hysterectomy', 'TURP'],
}

export const FIRST_M = ['Ramesh', 'Suresh', 'Anil', 'Sunil', 'Rajesh', 'Manoj', 'Vijay', 'Santosh', 'Ajay', 'Prakash', 'Birsa', 'Sohan', 'Mohan', 'Rakesh', 'Deepak', 'Amit', 'Ravi', 'Sanjay', 'Imran', 'Arjun', 'Karan', 'Lakhan', 'Dinesh', 'Mukesh', 'Ashok', 'Pawan', 'Nitesh', 'Abhay', 'Rahul', 'Gopal']
export const FIRST_F = ['Sunita', 'Anita', 'Rekha', 'Puja', 'Priya', 'Kiran', 'Meena', 'Sarita', 'Geeta', 'Savitri', 'Sushma', 'Neha', 'Anjali', 'Shabnam', 'Lalita', 'Mamta', 'Rani', 'Kavita', 'Asha', 'Seema', 'Nisha', 'Jyoti', 'Pinki', 'Rinki', 'Sangeeta', 'Babita', 'Usha', 'Kalpana', 'Ritu', 'Sneha']
export const LAST = ['Munda', 'Oraon', 'Kumar', 'Singh', 'Sharma', 'Mahto', 'Tirkey', 'Ekka', 'Toppo', 'Kujur', 'Lakra', 'Minz', 'Prasad', 'Gupta', 'Verma', 'Das', 'Mishra', 'Pandey', 'Sahu', 'Yadav', 'Khan', 'Ansari', 'Soren', 'Hembrom', 'Murmu', 'Tudu', 'Bhagat', 'Jha', 'Thakur', 'Kachhap']
export const PLACES = ['Ranchi', 'Hatia', 'Kanke', 'Namkum', 'Ormanjhi', 'Bundu', 'Khunti', 'Gumla', 'Lohardaga', 'Ramgarh', 'Hazaribagh', 'Bokaro', 'Jamshedpur', 'Simdega', 'Dhanbad']
