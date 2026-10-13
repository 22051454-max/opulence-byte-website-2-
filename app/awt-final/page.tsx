import type { Metadata } from 'next'
import HospitalErp from './erp/Loader'

export const metadata: Metadata = {
  title: 'SM Imperial Hospital ERP',
  description: 'SM Imperial Hospital: role-based, paperless hospital ERP for an advanced super speciality hospital.',
  icons: { icon: '/sm-imperial-logo.svg' },
  robots: { index: false },
}

export default function AwtFinalPage() {
  return <HospitalErp />
}
