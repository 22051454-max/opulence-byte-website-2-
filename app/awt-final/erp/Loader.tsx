'use client'

import dynamic from 'next/dynamic'

/** The ERP runs entirely in the browser (its services persist locally), so it is never server-rendered. */
const App = dynamic(() => import('./App'), { ssr: false, loading: () => <div style={{ position: 'fixed', inset: 0, zIndex: 2147483000, background: '#0a1a36' }} /> })

export default function Loader() {
  return <App />
}
