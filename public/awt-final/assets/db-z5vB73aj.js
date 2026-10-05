import{t as e}from"./rolldown-runtime-C0FnF6B9.js";var t=e(((e,t)=>{t.exports={join:(...e)=>e.join(`/`),dirname:e=>String(e).split(`/`).slice(0,-1).join(`/`)||`/`,mkdirSync:()=>{},existsSync:()=>!1}})),n=e(((e,t)=>{var n=e=>(e.length===1&&Array.isArray(e[0])?e[0]:e).map(e=>e===void 0?null:typeof e==`boolean`?Number(e):e),r=class{constructor(e,t){this.db=e,this.sql=t}_each(e,t){let r=this.db.cache.get(this.sql);r||(r=this.db.raw.prepare(this.sql),this.db.cache.set(this.sql,r));try{for(r.bind(n(e));r.step()&&t(r.getAsObject())!==!1;);}finally{r.reset()}}all(...e){let t=[];return this._each(e,e=>{t.push(e)}),t}get(...e){let t;return this._each(e,e=>(t=e,!1)),t}run(...e){this._each(e,()=>{});let t=this.db.raw.getRowsModified(),n=this.db.prepare(`SELECT last_insert_rowid() AS id`).get().id;return this.db.dirty=!0,{changes:t,lastInsertRowid:n}}};t.exports=class{constructor(){let{SQL:e,data:t}=globalThis.__awtSql;this.raw=t?new e.Database(t):new e.Database,this.depth=0,this.cache=new Map,this.dirty=!1}prepare(e){return new r(this,e)}exec(e){return this.clearCache(),this.raw.exec(e),this.dirty=!0,this}clearCache(){for(let e of this.cache.values())e.free();this.cache.clear()}export(){return this.clearCache(),this.raw.export()}pragma(e){return/journal_mode/i.test(e)||this.raw.exec(`PRAGMA ${e}`),[]}transaction(e){return(...t)=>{let n=`sp${this.depth++}`;this.raw.exec(`SAVEPOINT ${n}`);try{let r=e(...t);return this.raw.exec(`RELEASE ${n}`),r}catch(e){throw this.raw.exec(`ROLLBACK TO ${n}; RELEASE ${n}`),e}finally{this.depth--}}}}})),r=e(((e,r)=>{var i=t(),a=n(),o=typeof process<`u`&&{}.AWT_DB||i.join(`/`,`data`,`awt-hms.db`);t().mkdirSync(i.dirname(o),{recursive:!0});var s=new a(o);s.pragma(`journal_mode = WAL`),s.pragma(`foreign_keys = ON`);var c=`
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);

-- ───────── Users / auth ─────────
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
  role TEXT NOT NULL, staff_id INTEGER, patient_id INTEGER, active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);

-- ───────── HR ─────────
CREATE TABLE IF NOT EXISTS departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS designations (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS specialists (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS leave_types (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY, staff_code TEXT, name TEXT NOT NULL, surname TEXT, role TEXT NOT NULL,
  designation TEXT, department TEXT, specialist TEXT, qualification TEXT, work_exp TEXT,
  father_name TEXT, mother_name TEXT, gender TEXT, marital_status TEXT, blood_group TEXT, dob TEXT,
  date_of_joining TEXT, phone TEXT, emergency_phone TEXT, email TEXT, address TEXT, permanent_address TEXT,
  pan TEXT, national_id TEXT, basic_salary REAL DEFAULT 0, contract_type TEXT, work_shift TEXT,
  work_location TEXT, bank_account TEXT, bank_name TEXT, ifsc TEXT, note TEXT, photo TEXT, active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS staff_attendance (
  id INTEGER PRIMARY KEY, staff_id INTEGER NOT NULL, date TEXT NOT NULL, type TEXT NOT NULL, note TEXT,
  UNIQUE(staff_id, date));
CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY, staff_id INTEGER NOT NULL, leave_type_id INTEGER, from_date TEXT, to_date TEXT,
  days INTEGER, apply_date TEXT, reason TEXT, status TEXT DEFAULT 'Pending', note TEXT, approved_by INTEGER);
CREATE TABLE IF NOT EXISTS payslips (
  id INTEGER PRIMARY KEY, staff_id INTEGER NOT NULL, month TEXT, year INTEGER, basic REAL, earnings TEXT,
  deductions TEXT, total_earning REAL, total_deduction REAL, gross REAL, tax REAL, net REAL,
  status TEXT DEFAULT 'Generated', payment_mode TEXT, payment_date TEXT, note TEXT);

-- ───────── Patients ─────────
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, guardian_name TEXT, gender TEXT, dob TEXT, age TEXT,
  blood_group TEXT, marital_status TEXT, phone TEXT, email TEXT, address TEXT, remarks TEXT,
  known_allergies TEXT, tpa_id INTEGER, tpa_code TEXT, tpa_validity TEXT, national_id TEXT,
  diabetic TEXT, htm TEXT, photo TEXT, active INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS cases (id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);

-- ───────── Symptoms / findings ─────────
CREATE TABLE IF NOT EXISTS symptom_types (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS symptoms (id INTEGER PRIMARY KEY, type_id INTEGER, title TEXT NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS finding_categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS findings (id INTEGER PRIMARY KEY, category_id INTEGER, name TEXT NOT NULL, description TEXT);
-- Quick-pick disease keywords used for past history and current diagnosis
CREATE TABLE IF NOT EXISTS disease_keywords (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT, common INTEGER DEFAULT 0);

-- ───────── Charges ─────────
CREATE TABLE IF NOT EXISTS charge_types (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS charge_categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, charge_type TEXT, description TEXT);
CREATE TABLE IF NOT EXISTS unit_types (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tax_categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, percentage REAL DEFAULT 0);
CREATE TABLE IF NOT EXISTS charges (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, charge_category_id INTEGER, unit_type TEXT,
  tax_category_id INTEGER, tax REAL DEFAULT 0, standard_charge REAL DEFAULT 0, description TEXT);
CREATE TABLE IF NOT EXISTS tpa_charges (id INTEGER PRIMARY KEY, charge_id INTEGER, tpa_id INTEGER, amount REAL, UNIQUE(charge_id, tpa_id));

-- ───────── TPA / referral ─────────
CREATE TABLE IF NOT EXISTS tpas (id INTEGER PRIMARY KEY, name TEXT NOT NULL, code TEXT, phone TEXT, address TEXT, contact_person TEXT, contact_person_phone TEXT);
CREATE TABLE IF NOT EXISTS referral_categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS referral_commissions (id INTEGER PRIMARY KEY, category_id INTEGER, commissions TEXT);
CREATE TABLE IF NOT EXISTS referral_persons (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, contact TEXT, contact_person TEXT, contact_person_phone TEXT,
  category_id INTEGER, standard_commission REAL, address TEXT, commissions TEXT);
CREATE TABLE IF NOT EXISTS referral_payments (
  id INTEGER PRIMARY KEY, person_id INTEGER, patient_id INTEGER, patient_type TEXT, bill_no TEXT,
  bill_amount REAL, percentage REAL, amount REAL, date TEXT DEFAULT CURRENT_TIMESTAMP);

-- ───────── Beds ─────────
CREATE TABLE IF NOT EXISTS floors (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS bed_types (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS bed_groups (id INTEGER PRIMARY KEY, name TEXT NOT NULL, floor_id INTEGER, color TEXT, description TEXT);
CREATE TABLE IF NOT EXISTS beds (id INTEGER PRIMARY KEY, name TEXT NOT NULL, bed_type_id INTEGER, bed_group_id INTEGER, active INTEGER DEFAULT 1);

-- ───────── Appointments ─────────
CREATE TABLE IF NOT EXISTS shifts (id INTEGER PRIMARY KEY, name TEXT NOT NULL, time_from TEXT, time_to TEXT);
CREATE TABLE IF NOT EXISTS doctor_slots (
  id INTEGER PRIMARY KEY, doctor_id INTEGER, shift_id INTEGER, day TEXT, time_from TEXT, time_to TEXT,
  duration INTEGER DEFAULT 15, charge_id INTEGER, fees REAL DEFAULT 0);
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY, patient_id INTEGER, doctor_id INTEGER, specialist TEXT, date TEXT, shift_id INTEGER,
  slot TEXT, priority TEXT DEFAULT 'Normal', source TEXT DEFAULT 'Offline', live_consult TEXT DEFAULT 'No',
  message TEXT, status TEXT DEFAULT 'Pending', fees REAL DEFAULT 0, payment_mode TEXT DEFAULT 'Cash',
  discount REAL DEFAULT 0, paid REAL DEFAULT 0, queue_no INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);

-- ───────── OPD / IPD ─────────
CREATE TABLE IF NOT EXISTS opd (
  id INTEGER PRIMARY KEY, case_id INTEGER, patient_id INTEGER, appointment_date TEXT, consultant_id INTEGER,
  reference TEXT, symptoms_type TEXT, symptoms TEXT, height TEXT, weight TEXT, bp TEXT, pulse TEXT,
  temperature TEXT, respiration TEXT, known_allergies TEXT, note TEXT, casualty TEXT DEFAULT 'No',
  old_patient TEXT DEFAULT 'No', tpa_id INTEGER, live_consult TEXT DEFAULT 'No', charge_id INTEGER,
  standard_charge REAL DEFAULT 0, applied_charge REAL DEFAULT 0, tax REAL DEFAULT 0, amount REAL DEFAULT 0,
  payment_mode TEXT DEFAULT 'Cash', paid REAL DEFAULT 0, discharged TEXT DEFAULT 'No', discharge_date TEXT,
  discharge_status TEXT, discharge_note TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS ipd (
  id INTEGER PRIMARY KEY, case_id INTEGER, patient_id INTEGER, admission_date TEXT, consultant_id INTEGER,
  bed_id INTEGER, credit_limit REAL DEFAULT 20000, reference TEXT, symptoms_type TEXT, symptoms TEXT,
  height TEXT, weight TEXT, bp TEXT, pulse TEXT, temperature TEXT, respiration TEXT, known_allergies TEXT,
  note TEXT, casualty TEXT DEFAULT 'No', old_patient TEXT DEFAULT 'No', tpa_id INTEGER, live_consult TEXT DEFAULT 'No',
  discharged TEXT DEFAULT 'No', discharge_date TEXT, discharge_status TEXT, discharge_note TEXT,
  operation TEXT, diagnosis TEXT, investigation TEXT, treatment_home TEXT, death_date TEXT, death_report TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS bed_history (id INTEGER PRIMARY KEY, ipd_id INTEGER, bed_id INTEGER, from_date TEXT, to_date TEXT);
CREATE TABLE IF NOT EXISTS ipd_doctors (id INTEGER PRIMARY KEY, ipd_id INTEGER, doctor_id INTEGER);
CREATE TABLE IF NOT EXISTS nurse_notes (id INTEGER PRIMARY KEY, ipd_id INTEGER, date TEXT, nurse_id INTEGER, note TEXT, comment TEXT);
CREATE TABLE IF NOT EXISTS consultant_register (id INTEGER PRIMARY KEY, ipd_id INTEGER, applied_date TEXT, doctor_id INTEGER, instruction TEXT, instruction_date TEXT);
CREATE TABLE IF NOT EXISTS medication (
  id INTEGER PRIMARY KEY, opd_id INTEGER, ipd_id INTEGER, date TEXT, time TEXT, medicine_id INTEGER,
  dosage TEXT, remark TEXT);
CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY, opd_id INTEGER, ipd_id INTEGER, date TEXT, header_note TEXT, footer_note TEXT,
  finding_category TEXT, findings TEXT, finding_description TEXT, finding_print INTEGER DEFAULT 1,
  pathology_tests TEXT, radiology_tests TEXT, notify TEXT, prescribed_by INTEGER, generated_by INTEGER);
CREATE TABLE IF NOT EXISTS prescription_items (
  id INTEGER PRIMARY KEY, prescription_id INTEGER, medicine_category TEXT, medicine_id INTEGER,
  dosage TEXT, dose_interval TEXT, dose_duration TEXT, instruction TEXT);
CREATE TABLE IF NOT EXISTS operation_categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS operation_names (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category_id INTEGER);
CREATE TABLE IF NOT EXISTS operations (
  id INTEGER PRIMARY KEY, opd_id INTEGER, ipd_id INTEGER, date TEXT, operation_name TEXT, category TEXT,
  consultant_id INTEGER, assistant1 TEXT, assistant2 TEXT, anesthetist TEXT, anaesthesia_type TEXT,
  ot_technician TEXT, ot_assistant TEXT, remark TEXT, result TEXT);
CREATE TABLE IF NOT EXISTS patient_charges (
  id INTEGER PRIMARY KEY, opd_id INTEGER, ipd_id INTEGER, date TEXT, charge_id INTEGER, qty REAL DEFAULT 1,
  standard_charge REAL, tpa_charge REAL, applied_charge REAL, tax REAL DEFAULT 0, discount REAL DEFAULT 0,
  amount REAL, note TEXT);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY, type TEXT DEFAULT 'payment', section TEXT, patient_id INTEGER, case_id INTEGER,
  opd_id INTEGER, ipd_id INTEGER, appointment_id INTEGER, pharmacy_bill_id INTEGER, pathology_bill_id INTEGER,
  radiology_bill_id INTEGER, blood_issue_id INTEGER, ambulance_call_id INTEGER, amount REAL,
  payment_mode TEXT DEFAULT 'Cash', payment_date TEXT, note TEXT, received_by INTEGER);

-- ───────── Pharmacy ─────────
CREATE TABLE IF NOT EXISTS medicine_categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS suppliers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, contact TEXT, contact_person TEXT, contact_person_phone TEXT, drug_license TEXT, address TEXT);
CREATE TABLE IF NOT EXISTS medicine_dosages (id INTEGER PRIMARY KEY, category_id INTEGER, dosage TEXT, unit TEXT);
CREATE TABLE IF NOT EXISTS dose_intervals (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS dose_durations (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS medicines (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, category_id INTEGER, company TEXT, composition TEXT,
  medicine_group TEXT, unit TEXT, min_level INTEGER, reorder_level INTEGER, tax REAL DEFAULT 0,
  box_packing TEXT, rack TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS pharmacy_purchases (
  id INTEGER PRIMARY KEY, supplier_id INTEGER, bill_no TEXT, date TEXT, total REAL, discount REAL DEFAULT 0,
  tax REAL DEFAULT 0, net REAL, payment_mode TEXT, payment_amount REAL, note TEXT);
CREATE TABLE IF NOT EXISTS medicine_batches (
  id INTEGER PRIMARY KEY, medicine_id INTEGER, purchase_id INTEGER, batch_no TEXT, expiry TEXT, mrp REAL,
  batch_amount REAL DEFAULT 0, sale_price REAL, packing_qty INTEGER, quantity INTEGER, available_qty INTEGER,
  purchase_price REAL, tax REAL DEFAULT 0, amount REAL);
CREATE TABLE IF NOT EXISTS pharmacy_bills (
  id INTEGER PRIMARY KEY, case_id INTEGER, patient_id INTEGER, prescription_no TEXT, doctor_id INTEGER,
  doctor_name TEXT, date TEXT, total REAL, discount_pct REAL DEFAULT 0, discount REAL DEFAULT 0, tax REAL DEFAULT 0,
  net REAL, note TEXT, generated_by INTEGER);
CREATE TABLE IF NOT EXISTS pharmacy_bill_items (
  id INTEGER PRIMARY KEY, bill_id INTEGER, medicine_id INTEGER, batch_id INTEGER, qty INTEGER, sale_price REAL,
  tax REAL DEFAULT 0, amount REAL);

-- ───────── Pathology / Radiology (same shape, prefixed) ─────────
${[`pathology`,`radiology`].map(e=>`
CREATE TABLE IF NOT EXISTS ${e}_categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ${e}_units (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ${e}_parameters (id INTEGER PRIMARY KEY, name TEXT NOT NULL, reference_range TEXT, unit TEXT, description TEXT);
CREATE TABLE IF NOT EXISTS ${e}_tests (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, short_name TEXT, test_type TEXT, category_id INTEGER,
  sub_category TEXT, method TEXT, report_days INTEGER DEFAULT 1, charge_id INTEGER, parameters TEXT);
CREATE TABLE IF NOT EXISTS ${e}_bills (
  id INTEGER PRIMARY KEY, case_id INTEGER, patient_id INTEGER, prescription_no TEXT, doctor_id INTEGER,
  doctor_name TEXT, date TEXT, total REAL, discount_pct REAL DEFAULT 0, discount REAL DEFAULT 0, tax REAL DEFAULT 0,
  net REAL, note TEXT, generated_by INTEGER);
CREATE TABLE IF NOT EXISTS ${e}_bill_items (
  id INTEGER PRIMARY KEY, bill_id INTEGER, test_id INTEGER, report_date TEXT, tax REAL DEFAULT 0, amount REAL,
  collected_by INTEGER, collected_date TEXT, center TEXT, approved_by INTEGER, approve_date TEXT,
  result TEXT, report_values TEXT);`).join(`
`)}

-- ───────── Blood bank ─────────
CREATE TABLE IF NOT EXISTS blood_products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS blood_donors (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, dob TEXT, blood_group TEXT, gender TEXT, father_name TEXT,
  contact TEXT, address TEXT);
CREATE TABLE IF NOT EXISTS blood_bags (
  id INTEGER PRIMARY KEY, donor_id INTEGER, blood_group TEXT, bag_no TEXT, lot TEXT, quantity REAL DEFAULT 1,
  volume TEXT, unit TEXT, institution TEXT, donate_date TEXT, charge_id INTEGER, standard_charge REAL,
  is_component INTEGER DEFAULT 0, component TEXT, parent_bag_id INTEGER, available INTEGER DEFAULT 1, note TEXT);
CREATE TABLE IF NOT EXISTS blood_issues (
  id INTEGER PRIMARY KEY, case_id INTEGER, patient_id INTEGER, issue_date TEXT, doctor_id INTEGER,
  reference_name TEXT, technician TEXT, bag_id INTEGER, is_component INTEGER DEFAULT 0, charge_id INTEGER,
  standard_charge REAL, total REAL, discount_pct REAL DEFAULT 0, discount REAL DEFAULT 0, tax REAL DEFAULT 0,
  net REAL, note TEXT);

-- ───────── Ambulance ─────────
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY, vehicle_no TEXT NOT NULL, model TEXT, year TEXT, driver_name TEXT,
  driver_license TEXT, driver_contact TEXT, vehicle_type TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS ambulance_calls (
  id INTEGER PRIMARY KEY, case_id INTEGER, patient_id INTEGER, vehicle_id INTEGER, driver_name TEXT, date TEXT,
  charge_id INTEGER, standard_charge REAL, tax_pct REAL DEFAULT 0, tax REAL DEFAULT 0, net REAL, note TEXT);

-- ───────── Finance ─────────
CREATE TABLE IF NOT EXISTS income_heads (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS expense_heads (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS income (id INTEGER PRIMARY KEY, head_id INTEGER, name TEXT, invoice_no TEXT, date TEXT, amount REAL, description TEXT);
CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY, head_id INTEGER, name TEXT, invoice_no TEXT, date TEXT, amount REAL, description TEXT);

-- ───────── Front office ─────────
CREATE TABLE IF NOT EXISTS visitor_purposes (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS complaint_types (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS sources (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS visitors (
  id INTEGER PRIMARY KEY, purpose TEXT, name TEXT NOT NULL, phone TEXT, id_card TEXT, visit_to TEXT,
  related_to TEXT, people INTEGER DEFAULT 1, date TEXT, in_time TEXT, out_time TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS call_logs (
  id INTEGER PRIMARY KEY, name TEXT, phone TEXT, date TEXT, description TEXT, follow_up TEXT,
  duration TEXT, note TEXT, call_type TEXT);
CREATE TABLE IF NOT EXISTS postal (
  id INTEGER PRIMARY KEY, kind TEXT, from_title TEXT, to_title TEXT, reference_no TEXT, address TEXT, note TEXT, date TEXT);
CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY, type TEXT, source TEXT, name TEXT, phone TEXT, date TEXT, description TEXT,
  action_taken TEXT, assigned TEXT, note TEXT);

-- ───────── Birth & death ─────────
CREATE TABLE IF NOT EXISTS birth_records (
  id INTEGER PRIMARY KEY, child_name TEXT, gender TEXT, weight TEXT, birth_date TEXT, phone TEXT, address TEXT,
  case_id INTEGER, mother_name TEXT, father_name TEXT, report TEXT);
CREATE TABLE IF NOT EXISTS death_records (
  id INTEGER PRIMARY KEY, case_id INTEGER, patient_id INTEGER, death_date TEXT, guardian_name TEXT, report TEXT);

-- ───────── Messaging / download / certificates / CMS ─────────
CREATE TABLE IF NOT EXISTS notices (id INTEGER PRIMARY KEY, title TEXT, date TEXT, publish_on TEXT, message TEXT, visible_to TEXT, created_by INTEGER);
CREATE TABLE IF NOT EXISTS message_logs (id INTEGER PRIMARY KEY, channel TEXT, title TEXT, recipients TEXT, message TEXT, date TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS contents (id INTEGER PRIMARY KEY, title TEXT, type TEXT, date TEXT, description TEXT, file_name TEXT, file_data TEXT, visible_to TEXT);
CREATE TABLE IF NOT EXISTS certificate_templates (id INTEGER PRIMARY KEY, name TEXT, header TEXT, body TEXT, footer TEXT);
CREATE TABLE IF NOT EXISTS id_card_templates (id INTEGER PRIMARY KEY, name TEXT, kind TEXT, title TEXT, header_color TEXT);
CREATE TABLE IF NOT EXISTS cms_pages (id INTEGER PRIMARY KEY, title TEXT, slug TEXT UNIQUE, page_type TEXT DEFAULT 'Standard', content TEXT, sidebar INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS cms_banners (id INTEGER PRIMARY KEY, title TEXT, subtitle TEXT, sort INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS cms_menus (id INTEGER PRIMARY KEY, title TEXT, page_slug TEXT, sort INTEGER DEFAULT 0);

-- ───────── Inventory ─────────
CREATE TABLE IF NOT EXISTS item_categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS item_stores (id INTEGER PRIMARY KEY, name TEXT NOT NULL, code TEXT, description TEXT);
CREATE TABLE IF NOT EXISTS item_suppliers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT, contact_person TEXT, contact_person_phone TEXT);
CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category_id INTEGER, unit TEXT, description TEXT);
CREATE TABLE IF NOT EXISTS item_stocks (id INTEGER PRIMARY KEY, item_id INTEGER, supplier_id INTEGER, store_id INTEGER, quantity INTEGER, purchase_price REAL, date TEXT, description TEXT);
CREATE TABLE IF NOT EXISTS item_issues (
  id INTEGER PRIMARY KEY, user_type TEXT, issue_to INTEGER, issued_by TEXT, issue_date TEXT, return_date TEXT,
  note TEXT, item_id INTEGER, quantity INTEGER, status TEXT DEFAULT 'Issued');

-- ───────── Live consultation ─────────
CREATE TABLE IF NOT EXISTS live_consultations (
  id INTEGER PRIMARY KEY, title TEXT, date TEXT, duration INTEGER, kind TEXT, ref_id INTEGER, patient_id INTEGER,
  doctor_id INTEGER, host_video TEXT DEFAULT 'Enabled', client_video TEXT DEFAULT 'Enabled', description TEXT,
  status TEXT DEFAULT 'Awaited', created_by INTEGER, room TEXT);
CREATE TABLE IF NOT EXISTS live_meetings (
  id INTEGER PRIMARY KEY, title TEXT, date TEXT, duration INTEGER, staff TEXT, host_video TEXT DEFAULT 'Enabled',
  client_video TEXT DEFAULT 'Enabled', description TEXT, status TEXT DEFAULT 'Awaited', created_by INTEGER, room TEXT);

-- ───────── Productivity ─────────
CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, title TEXT, description TEXT, start TEXT, end TEXT, color TEXT, event_type TEXT, user_id INTEGER);
CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, title TEXT, date TEXT, done INTEGER DEFAULT 0, user_id INTEGER);
CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY, type TEXT, subject TEXT, message TEXT, roles TEXT, patient_id INTEGER, date TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS chat_messages (id INTEGER PRIMARY KEY, from_user INTEGER, to_user INTEGER, message TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, is_read INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY, message TEXT, user_id INTEGER, ip TEXT, action TEXT, platform TEXT, agent TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`;s.exec(c);for(let[e,t]of[[`patients`,`past_history`],[`opd`,`current_diagnosis`],[`ipd`,`current_diagnosis`]])s.prepare(`PRAGMA table_info(${e})`).all().some(e=>e.name===t)||s.exec(`ALTER TABLE ${e} ADD COLUMN ${t} TEXT`);r.exports=s}));export default r();export{r as t};