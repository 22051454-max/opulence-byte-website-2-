'use client'

import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { products } from '@/lib/products'
import { services } from '@/lib/services'

export function ContactForm() {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setBusy(true)
    setStatus(null)
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      form.reset()
      setStatus({ type: 'success', text: 'Thanks! Your message is with our team and we’ll reply within one business day.' })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error && error.message ? error.message : 'Something went wrong. Please email hello@opulencebyte.com.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card contact-form" onSubmit={submit} data-reveal="right">
      <div className="form-row">
        <label className="field">Your name<input name="name" required minLength={2} autoComplete="name" placeholder="Priya Sharma" /></label>
        <label className="field">Work email<input name="email" type="email" required autoComplete="email" placeholder="you@company.com" /></label>
      </div>
      <label className="field">I’m interested in
        <select name="interest" defaultValue="">
          <option value="" disabled>Choose one</option>
          <optgroup label="Services">{services.map((s) => <option key={s.title}>{s.title}</option>)}</optgroup>
          <optgroup label="Products">{products.map((p) => <option key={p.slug}>{p.name}</option>)}</optgroup>
        </select>
      </label>
      <label className="field">Tell us about your project<textarea name="message" required minLength={10} rows={5} placeholder="What are you building, and by when?" /></label>
      <label className="hp" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? <><LoaderCircle size={17} className="spin" /> Sending</> : status?.type === 'success' ? <><Check size={17} /> Sent</> : <>Send message <ArrowUpRight size={17} /></>}
      </button>
      {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
    </form>
  )
}
