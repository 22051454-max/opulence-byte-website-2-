import Link from 'next/link'

const sections = [
  {
    number: '01',
    title: 'Foundation & access',
    summary: 'The hospital is configured once so every department works from the same rules and records.',
    workflows: [
      ['Master setup', 'Hospital profile, departments, clinicians, wards, beds, services, tests, products, tax, rates, corporate plans, users and permissions.'],
      ['Login & security', 'Authentication, role and permission checks gate each action. Session controls, password rules and audit logs make every change traceable.'],
    ],
  },
  {
    number: '02',
    title: 'Front office',
    summary: 'Reception establishes a single patient identity and starts the correct care pathway.',
    workflows: [
      ['Registration', 'Search for an existing record first; otherwise create a profile, EMR/Patient ID, ABHA details, category, department and doctor assignment. Duplicate checks use name, phone and date of birth.'],
      ['ABHA / ABDM', 'Verify and link an ABHA using OTP. Records are shared or fetched only after patient consent, which is retained in a consent log.'],
      ['Appointment & queue', 'Select department, doctor and time, collect applicable registration or consultation charges, issue a receipt and add the patient to the queue.'],
      ['Emergency / casualty', 'Triage first, issue a temporary ID, treat immediately, then complete registration and merge the encounter into the permanent EMR.'],
    ],
  },
  {
    number: '03',
    title: 'Clinical care',
    summary: 'Care teams document decisions, orders and treatment against the same live patient record.',
    workflows: [
      ['OPD visit', 'Queue to consultation, clinical notes, diagnosis and prescription. Lab, radiology and pharmacy requests return to the doctor inside the EMR.'],
      ['IPD admission & beds', 'Verify patient and payer, apply package or rates, select an available bed, collect advance where required and capture consent. Bed states move from occupied to cleaning to vacant on discharge.'],
      ['Nursing & daily care', 'Record assessment, vitals, medication administration, procedures, monitoring and shift handover. Abnormal vitals and overdue doses can alert the team.'],
      ['Operation theatre & blood bank', 'Book room and team, complete pre-op checks, record materials, anaesthesia and post-op notes. Blood units are screened, cross-matched, issued and traceable to transfusion.'],
    ],
  },
  {
    number: '04',
    title: 'Diagnostics & pharmacy',
    summary: 'Requests become verified results and correctly controlled stock movements.',
    workflows: [
      ['Laboratory', 'Request, register, barcode sample, process, enter result, technician verify, authorize and release final report to the EMR. Critical values alert the doctor.'],
      ['Radiology', 'Schedule scan or procedure, create and verify report, approve it, and attach final findings and PACS links to the EMR.'],
      ['Pharmacy sales & issue', 'Verify prescription and patient, select batch, check stock and expiry, bill and deduct inventory. IPD issues charge the patient account; unused medicine may be credited.'],
      ['Purchase & returns', 'Purchase orders, GRNs, batches and expiries control incoming stock. Returns reference original sales, adjust stock and issue an approved refund or credit note.'],
    ],
  },
  {
    number: '05',
    title: 'Operations',
    summary: 'The hospital stays ready through controlled stock, asset and room turnaround workflows.',
    workflows: [
      ['Inventory & stores', 'Departments raise indents; stores approve and issue stock when available or start purchase and GRN when it is not. Minimum levels create purchase alerts.'],
      ['Assets', 'Register each asset, allocate it to a department, record maintenance, calibration, repair, transfer and retirement or disposal.'],
      ['Housekeeping', 'Discharge automatically raises a cleaning task. Supervisor sign-off changes the bed from cleaning to vacant and feeds turnaround reporting.'],
    ],
  },
  {
    number: '06',
    title: 'Billing, payer & discharge',
    summary: 'Every patient charge is consolidated, approved and settled before the episode is closed.',
    workflows: [
      ['Corporate / TPA', 'Capture policy details, request cashless authorization, track approvals and enhancements, submit final bills and follow settlement or rejection.'],
      ['Central billing & payments', 'Bed, doctor, diagnostics, pharmacy, procedures, OT, nursing and equipment charges accumulate in one account. Apply package, discount, tax, advance and TPA adjustments before final payment.'],
      ['Refunds & cancellation', 'An authorized role approves the reason and amount, reverses related charge or stock, posts the refund or credit note and records an audit event.'],
      ['Discharge', 'Reconcile investigations and pharmacy, finalize bill and payment, generate and approve discharge summary, release the bed, update EMR and schedule follow-up. LAMA, referral, transfer and death each retain their specific documents.'],
    ],
  },
  {
    number: '07',
    title: 'Management & resilience',
    summary: 'Live information, reconciliations and recoverable data keep the hospital accountable and available.',
    workflows: [
      ['Management dashboard', 'Review occupancy, admissions, discharges, OPD, pharmacy, diagnostic and OT activity, collections, outstanding balances, stock and department performance.'],
      ['End of day', 'Verify department transactions, reconcile cash, card and UPI collections, pharmacy, billing and inventory, then lock the daily close. Changes require approval.'],
      ['Backup & recovery', 'Use scheduled encrypted PostgreSQL and WAL backups to local and cloud storage, verify recoverability and publish backup status. Recovery restores the latest validated point.'],
    ],
  },
]

export default function AwtWorkflowPage() {
  return (
    <main className="min-h-screen bg-[#f4f8f7] px-5 py-10 text-[#12302f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="border-b-2 border-[#0b6b63] pb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0b6b63]">AWT Hospital ERP</p>
              <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">End-to-end workflow</h1>
            </div>
            <Link href="/awt-ppt" className="border border-[#0b6b63] px-4 py-2 text-sm font-semibold text-[#0b6b63] hover:bg-[#e3f1ee]">
              View presentation →
            </Link>
          </div>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#486562]">One connected patient journey: registration, consultation, diagnostics, pharmacy, admission, treatment, billing, discharge, follow-up and the operational controls around it.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {['7 workflow areas', '30 operational flows', '1 central EMR', 'Full audit trail'].map((stat) => <div className="border border-[#c8dcd8] bg-white px-4 py-3 text-sm font-semibold" key={stat}>{stat}</div>)}
          </div>
        </header>

        <section className="py-10" aria-labelledby="journey-title">
          <h2 id="journey-title" className="font-serif text-3xl">Patient journey at a glance</h2>
          <ol className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
            {['Patient', 'Registration', 'Appointment', 'OPD', 'Pharmacy / diagnostics / admission', 'IPD care', 'Final bill', 'Payment', 'Discharge', 'Follow-up'].map((step, index) => (
              <li className="flex items-center gap-2" key={step}><span className="border border-[#b8d1cc] bg-[#e3f1ee] px-3 py-2">{step}</span>{index < 9 && <span aria-hidden="true" className="text-[#0b6b63]">›</span>}</li>
            ))}
          </ol>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          {sections.map((section) => (
            <section className="border border-[#c8dcd8] bg-white p-6" key={section.number}>
              <p className="text-sm font-semibold text-[#0b6b63]">{section.number}</p>
              <h2 className="mt-1 font-serif text-3xl">{section.title}</h2>
              <p className="mt-3 text-[#486562]">{section.summary}</p>
              <div className="mt-6 space-y-4">
                {section.workflows.map(([name, detail]) => (
                  <article className="border-l-4 border-[#0b6b63] bg-[#f7faf9] px-4 py-3" key={name}>
                    <h3 className="font-semibold">{name}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#486562]">{detail}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 border border-[#c8dcd8] bg-[#e3f1ee] p-6">
          <h2 className="font-serif text-3xl">Architecture at a glance</h2>
          <p className="mt-3 max-w-4xl leading-7 text-[#294946]">Patient care modules connect reception, OPD, IPD, EMR, doctors, nursing and blood bank. Operations connect pharmacy, lab, radiology, OT, inventory, assets and housekeeping. Finance handles billing, collections, refunds, corporate and TPA. All modules use the central PostgreSQL database with security, audit, reports, analytics and encrypted local and cloud backups.</p>
        </section>
      </div>
    </main>
  )
}