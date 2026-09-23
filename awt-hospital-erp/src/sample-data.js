/* AWT sample data generator — used for the initial seed and for offline mode */
function awtGenerate(todayStr) {
  let seed = 20240326;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pad = (n, w) => String(n).padStart(w, '0');
  const day = off => { const d = new Date(todayStr + 'T12:00:00'); d.setDate(d.getDate() + off); return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2); };
  const at = (off, h, m) => day(off) + 'T' + pad(h, 2) + ':' + pad(m, 2);

  const first = { M: ['Akarsh','Rajesh','Vikram','Ramesh','Suresh','Deepak','Rohit','Manish','Amit','Sunil','Arjun','Karan','Nitin','Prakash','Sanjay','Abhishek','Ravi','Anil','Gaurav','Mohit','Birsa','Sagar','Tarun','Harsh'], F: ['Shreya','Meena','Priya','Neha','Anjali','Sunita','Pooja','Kavita','Ritu','Asha','Swati','Nisha','Rekha','Divya','Sneha','Pallavi','Jyoti','Komal','Salma','Aarti'] };
  const last = ['Kumar','Pandey','Gupta','Tiwari','Singh','Sharma','Tandon','Lal','Bansal','Verma','Devi','Yadav','Munda','Oraon','Mahto','Sinha','Prasad','Mishra','Das','Kujur','Ekka','Sahu','Choudhary','Agarwal'];
  const areas = ['Ranchi','Hatia','Doranda','Kanke','Bariatu','Lalpur','Morabadi','Namkum','Harmu','Ormanjhi','Ratu','Khunti'];

  const departments = [
    { id: 'MED', name: 'Medicine', fee: 500 }, { id: 'ORTH', name: 'Orthopedics', fee: 600 },
    { id: 'PED', name: 'Pediatrics', fee: 500 }, { id: 'GYNA', name: 'Gynecology', fee: 600 },
    { id: 'ENT', name: 'ENT', fee: 500 }, { id: 'DERM', name: 'Dermatology', fee: 500 },
    { id: 'SURG', name: 'General Surgery', fee: 700 }, { id: 'CARD', name: 'Cardiology', fee: 900 }
  ];
  const tests = [
    ['CBC', 'Complete Blood Count', 350], ['LFT', 'Liver Function Test', 750], ['KFT', 'Kidney Function Test', 700],
    ['LIPID', 'Lipid Profile', 650], ['HBA1C', 'HbA1c', 550], ['TSH', 'Thyroid Profile', 600],
    ['URINE', 'Urine Routine', 200], ['XRAY', 'X-Ray Chest PA', 450], ['USG', 'USG Abdomen', 1200],
    ['ECG', 'ECG', 300], ['CT', 'CT Head (Plain)', 3200], ['MRI', 'MRI Knee', 6500], ['DENGUE', 'Dengue NS1', 800]
  ].map(([code, name, price]) => ({ code, name, price }));
  const wards = [
    { id: 'GEN', name: 'General', prefix: 'B1', count: 30, rate: 1200 },
    { id: 'SEMI', name: 'Semi Deluxe', prefix: 'A2', count: 12, rate: 2500 },
    { id: 'DLX', name: 'Deluxe', prefix: 'C1', count: 10, rate: 4000 },
    { id: 'ICU', name: 'ICU', prefix: 'ICU-', count: 8, rate: 8000 }
  ];
  const bedIds = [];
  wards.forEach(w => { for (let i = 1; i <= w.count; i++) bedIds.push({ id: w.prefix + pad(i, w.id === 'ICU' ? 1 : 2), ward: w.id }); });

  const out = {};
  const put = (col, doc) => { (out[col] = out[col] || []).push(doc); return doc; };

  put('masters', { id: 'departments', items: departments });
  put('masters', { id: 'tests', items: tests });
  put('masters', { id: 'wards', items: wards });
  put('masters', { id: 'tpa', items: [
    { id: 'STAR', name: 'Star Health Insurance', type: 'Insurance', contact: '1800-425-2255', discount: 0 },
    { id: 'MDI', name: 'MD India TPA', type: 'TPA', contact: '1800-233-1166', discount: 5 },
    { id: 'CGHS', name: 'CGHS', type: 'Government', contact: '1800-208-8900', discount: 15 },
    { id: 'CCL', name: 'Central Coalfields Ltd.', type: 'Corporate', contact: '0651-2360202', discount: 10 },
    { id: 'AYU', name: 'Ayushman Bharat PM-JAY', type: 'Government', contact: '14555', discount: 20 }
  ] });
  put('masters', { id: 'notices', items: [
    { id: 'n1', title: 'Fire drill on Friday, 11:00 AM', body: 'All wards to follow the evacuation plan posted at nursing stations.', date: day(-1) },
    { id: 'n2', title: 'New MRI slots from next week', body: 'Radiology extends MRI hours to 10 PM on weekdays.', date: day(-3) }
  ] });
  put('masters', { id: 'staff', items: [
    { id: 'u1', name: 'Dr. Admin User', role: 'Administrator', email: 'admin@awthospital.in', active: true },
    { id: 'u2', name: 'Ritika Sahu', role: 'Front Desk', email: 'reception@awthospital.in', active: true },
    { id: 'u3', name: 'Mohan Ekka', role: 'Pharmacist', email: 'pharmacy@awthospital.in', active: true },
    { id: 'u4', name: 'Sister Grace Kujur', role: 'Nursing In-charge', email: 'nursing@awthospital.in', active: true },
    { id: 'u5', name: 'Alok Prasad', role: 'Accounts', email: 'accounts@awthospital.in', active: true },
    { id: 'u6', name: 'Neeraj Das', role: 'Lab Technician', email: 'lab@awthospital.in', active: false }
  ] });

  const docNames = ['Dr. A. K. Sinha','Dr. Rekha Mishra','Dr. S. N. Oraon','Dr. Pallavi Agarwal','Dr. V. K. Choudhary','Dr. Nisha Tirkey','Dr. Rahul Bhagat','Dr. Imran Ansari','Dr. Kiran Lakra','Dr. P. K. Mahto','Dr. Sweta Jha','Dr. Arvind Kerketta'];
  const doctors = docNames.map((n, i) => put('doctors', { id: 'D' + pad(i + 1, 2), name: n, dept: departments[i % departments.length].id, qualification: pick(['MBBS, MD', 'MBBS, MS', 'MBBS, DNB', 'MBBS, DGO', 'MBBS, DM']), phone: '98' + int(10000000, 99999999), room: 'OPD-' + (101 + i), days: pick(['Mon–Sat', 'Mon–Fri', 'Tue, Thu, Sat', 'Mon, Wed, Fri']), available: rnd() > 0.15 }));
  const docOf = dept => { const d = doctors.filter(x => x.dept === dept); return (d.length ? pick(d) : pick(doctors)).id; };

  let emr = 210578400, uh = 120;
  const patients = [];
  const newPatient = (regOff, h, m) => {
    const g = rnd() < 0.5 ? 'M' : 'F';
    const age = int(1, 82);
    const p = put('patients', { id: 'P' + (++uh), uhid: 'AWT-' + pad(uh, 6), emr: String(++emr), name: pick(first[g]) + ' ' + pick(last), gender: g === 'M' ? 'Male' : 'Female', age, phone: pick(['98', '97', '94', '70', '88']) + int(10000000, 99999999), address: pick(areas) + ', Jharkhand', blood: pick(['A+', 'B+', 'O+', 'AB+', 'O-', 'B-', 'A-']), payer: rnd() < 0.72 ? 'SELF' : pick(['STAR', 'MDI', 'CGHS', 'CCL', 'AYU']), registeredAt: at(regOff, h, m) });
    patients.push(p); return p;
  };

  // In-patients
  const occupied = bedIds.filter(() => rnd() < 0.72).slice(0, 44);
  let ipn = 400;
  const statusByBed = {};
  occupied.forEach((b, i) => {
    const off = -int(0, 9);
    const p = newPatient(off - int(0, 30), int(8, 18), int(0, 59));
    const dept = pick(departments).id;
    const w = wards.find(x => x.id === b.ward);
    const admittedAt = off === 0 ? at(0, 8 + Math.floor(i / 3) % 3, int(0, 59)) : at(off, int(7, 21), int(0, 59));
    const deposit = pick([5000, 10000, 15000, 20000, 25000]);
    const payments = [{ at: admittedAt, amount: deposit, mode: pick(['Cash', 'UPI', 'Card']), note: 'Admission deposit' }];
    if (off < -2 && rnd() < 0.5) payments.push({ at: at(0, int(8, 10), int(0, 59)), amount: pick([3000, 5000, 8000]), mode: 'UPI', note: 'Interim payment' });
    put('admissions', { id: 'A' + (++ipn), ipNo: 'IP-2026-' + pad(ipn, 4), patientId: p.id, doctorId: docOf(dept), dept, bed: b.id, ward: b.ward, rate: w.rate, admittedAt, diagnosis: pick(['Acute gastroenteritis', 'Fracture — left femur', 'Pneumonia', 'Dengue fever', 'Post-op observation', 'Typhoid fever', 'Hypertension crisis', 'Normal delivery', 'Appendicitis', 'Diabetic ketoacidosis', 'Viral fever', 'COPD exacerbation']), status: 'Admitted', payments, charges: [] });
    statusByBed[b.id] = 'occ';
  });
  // Discharged
  const freeBeds = bedIds.filter(b => !statusByBed[b.id]);
  for (let i = 0; i < 10; i++) {
    const b = freeBeds[i % freeBeds.length];
    const p = newPatient(-int(5, 40), int(8, 18), int(0, 59));
    const dept = pick(departments).id; const w = wards.find(x => x.id === b.ward);
    const dOff = i < 6 ? 0 : -int(1, 4);
    const stay = int(2, 6);
    const admittedAt = at(dOff - stay, int(8, 20), int(0, 59));
    const total = stay * w.rate + int(3, 15) * 1000;
    const dep = Math.min(total, pick([10000, 15000, 20000]));
    put('admissions', { id: 'A' + (++ipn), ipNo: 'IP-2026-' + pad(ipn, 4), patientId: p.id, doctorId: docOf(dept), dept, bed: b.id, ward: b.ward, rate: w.rate, admittedAt, dischargedAt: at(dOff, 8 + i, int(0, 59)), diagnosis: pick(['Viral fever', 'Fracture — right radius', 'Cholecystitis', 'LSCS', 'Urinary tract infection']), status: 'Discharged', payments: [{ at: admittedAt, amount: dep, mode: 'Cash', note: 'Admission deposit' }, { at: at(dOff, 8 + i, 5), amount: total - dep, mode: pick(['UPI', 'Card', 'Cash']), note: 'Final settlement' }], charges: [{ at: admittedAt, desc: 'Procedures & consumables', amount: total - stay * w.rate }] });
  }
  put('beds', { id: freeBeds[12].id, status: 'Maintenance', note: 'AC repair' });
  put('beds', { id: freeBeds[14].id, status: 'Blocked', note: 'Reserved for scheduled surgery' });

  // OPD visits: today and yesterday
  let tok = 0;
  const mkVisit = (off, idx, n) => {
    const reuse = rnd() < 0.2 && patients.length > 60;
    const hh = 9 + Math.floor(idx * 8 / n), mm = int(0, 59);
    const p = reuse ? pick(patients) : newPatient(off, hh, mm);
    const dep = departments[Math.min(departments.length - 1, Math.floor(Math.pow(rnd(), 1.4) * departments.length))];
    const status = off < 0 ? 'Completed' : (idx < n * 0.6 ? 'Completed' : idx < n * 0.75 ? 'In consultation' : 'Waiting');
    put('visits', { id: 'V' + day(off).replace(/-/g, '') + pad(idx + 1, 3), token: idx + 1, patientId: p.id, dept: dep.id, doctorId: docOf(dep.id), at: at(off, hh, mm), fee: dep.fee, mode: pick(['Cash', 'UPI', 'UPI', 'Card']), status, complaint: pick(['Fever and body ache', 'Knee pain', 'Follow-up', 'Cough since 5 days', 'Skin rash', 'Ear pain', 'Routine check-up', 'Abdominal pain', 'Headache', 'Chest discomfort']) });
  };
  for (let i = 0; i < 32; i++) mkVisit(0, i, 32);
  for (let i = 0; i < 18; i++) mkVisit(-1, i, 18);
  tok;

  // Pharmacy stock
  const meds = [['Paracetamol 650mg', 'Tablet', 2.1], ['Amoxicillin 500mg', 'Capsule', 8.5], ['Pantoprazole 40mg', 'Tablet', 6], ['Azithromycin 500mg', 'Tablet', 22], ['Cetirizine 10mg', 'Tablet', 1.8], ['Metformin 500mg', 'Tablet', 3.2], ['Amlodipine 5mg', 'Tablet', 2.9], ['ORS Sachet', 'Sachet', 21], ['Ceftriaxone 1g Inj', 'Vial', 58], ['Normal Saline 500ml', 'Bottle', 32], ['Diclofenac Gel 30g', 'Tube', 96], ['Insulin Glargine', 'Pen', 690], ['Ondansetron 4mg', 'Tablet', 5.5], ['Cough Syrup 100ml', 'Bottle', 88], ['Vitamin D3 60K', 'Capsule', 32], ['Ranitidine 150mg', 'Tablet', 1.5], ['Salbutamol Inhaler', 'Inhaler', 145], ['Ibuprofen 400mg', 'Tablet', 2.4]];
  meds.forEach((m, i) => put('pharmacy', { id: 'M' + pad(i + 1, 3), name: m[0], form: m[1], price: m[2], stock: i % 7 === 3 ? int(4, 18) : int(60, 900), reorder: 50, batch: 'B' + int(2401, 2499), expiry: day(int(40, 700)) }));
  // Pharmacy sales (today + yesterday)
  for (let i = 0; i < 10; i++) {
    const off = i < 7 ? 0 : -1;
    const lines = []; const k = int(1, 3);
    for (let j = 0; j < k; j++) { const mi = int(0, meds.length - 1); const q = int(1, 20); lines.push({ itemId: 'M' + pad(mi + 1, 3), name: meds[mi][0], qty: q, price: meds[mi][2] }); }
    put('sales', { id: 'S' + day(off).replace(/-/g, '') + pad(i + 1, 3), at: at(off, int(9, 18), int(0, 59)), patientId: pick(patients).id, lines, amount: Math.round(lines.reduce((s, l) => s + l.qty * l.price, 0)), mode: pick(['Cash', 'UPI']) });
  }
  // Lab orders
  for (let i = 0; i < 16; i++) {
    const off = i < 11 ? 0 : -1;
    const t = [pick(tests)]; if (rnd() < 0.4) t.push(pick(tests));
    const status = off < 0 ? 'Reported' : pick(['Pending', 'Sample collected', 'Reported', 'Reported']);
    put('labs', { id: 'L' + day(off).replace(/-/g, '') + pad(i + 1, 3), at: at(off, int(9, 17), int(0, 59)), patientId: pick(patients).id, doctorId: pick(doctors).id, tests: t.map(x => x.code), amount: t.reduce((s, x) => s + x.price, 0), status, result: status === 'Reported' ? 'Within normal limits.' : '', mode: pick(['Cash', 'UPI', 'Card']) });
  }
  // OT
  const procs = ['Laparoscopic cholecystectomy', 'Total knee replacement', 'LSCS', 'Appendectomy', 'ORIF — femur', 'Tonsillectomy', 'Hernia repair'];
  for (let i = 0; i < 6; i++) {
    const off = i < 3 ? 0 : i < 5 ? 1 : 2;
    put('ot', { id: 'OT' + pad(i + 1, 3), patientId: pick(patients).id, surgeonId: pick(doctors).id, procedure: pick(procs), theatre: pick(['OT-1', 'OT-2', 'OT-3']), start: at(off, 9 + i * 2 % 8, 0), duration: pick([60, 90, 120, 180]), anaesthesia: pick(['General', 'Spinal', 'Local']), status: off === 0 && i === 0 ? 'Completed' : off === 0 && i === 1 ? 'In progress' : 'Scheduled' });
  }
  // Inventory (non-drug)
  [['Surgical gloves (box)', 'Consumables', 120, 40], ['N95 masks', 'Consumables', 35, 50], ['IV cannula 20G', 'Consumables', 400, 100], ['Bed sheets', 'Linen', 260, 80], ['Syringes 5ml', 'Consumables', 900, 200], ['Oxygen cylinder (D-type)', 'Medical gas', 14, 10], ['Printer paper A4 (ream)', 'Stationery', 22, 10], ['Hand sanitizer 500ml', 'Consumables', 8, 30], ['Cotton roll 500g', 'Consumables', 60, 25], ['Patient gowns', 'Linen', 140, 60], ['Glucometer strips', 'Diagnostics', 18, 25], ['Urine bags', 'Consumables', 210, 60]]
    .forEach((x, i) => put('inventory', { id: 'I' + pad(i + 1, 3), name: x[0], category: x[1], stock: x[2], reorder: x[3], unit: 'units', location: pick(['Central store', 'OT store', 'Ward store']) }));
  // Assets
  [['Ventilator — Hamilton C3', 'ICU', 'Working'], ['Defibrillator', 'Emergency', 'Working'], ['X-Ray machine 500mA', 'Radiology', 'Working'], ['Ultrasound — Mindray DC-70', 'Radiology', 'Under service'], ['Patient monitor (x6)', 'ICU', 'Working'], ['Autoclave 100L', 'CSSD', 'Working'], ['Ambulance JH01-AB-2201', 'Transport', 'Working'], ['DG set 250kVA', 'Facilities', 'Working']]
    .forEach((x, i) => put('assets', { id: 'AS' + pad(i + 1, 3), name: x[0], location: x[1], status: x[2], purchased: day(-int(200, 1400)), nextService: day(int(-5, 120)), value: int(2, 40) * 50000 }));
  // Queries
  [['Room rent for Deluxe ward?', 'Enquiry', 'Closed'], ['Delay in discharge summary', 'Complaint', 'Open'], ['Is cardiology OPD open on Sunday?', 'Enquiry', 'Closed'], ['Billing discrepancy — pharmacy', 'Complaint', 'In progress'], ['Ambulance availability at night', 'Enquiry', 'Open']]
    .forEach((x, i) => put('queries', { id: 'Q' + pad(i + 1, 3), subject: x[0], type: x[1], status: x[2], from: pick(first.M) + ' ' + pick(last), phone: '98' + int(10000000, 99999999), at: at(-int(0, 4), int(9, 18), int(0, 59)), note: '' }));
  put('receipts', { id: 'R' + day(0).replace(/-/g, '') + '001', at: at(0, 10, 5), patientId: pick(patients).id, desc: 'Medical certificate', amount: 300, mode: 'Cash' });
  put('receipts', { id: 'R' + day(0).replace(/-/g, '') + '002', at: at(0, 11, 40), patientId: pick(patients).id, desc: 'Ambulance (local)', amount: 650, mode: 'UPI' });
  return out;
}
if (typeof module !== 'undefined') module.exports = awtGenerate;
