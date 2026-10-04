'use client'

import { ArrowRight, LogIn } from 'lucide-react'
import Link from 'next/link'
import { Avatar, useSession } from './session'

export function StoreWelcome() {
  const { user, loading } = useSession()
  if (loading) return <div className="card welcome-card" style={{ minHeight: 86 }} aria-busy="true" />
  if (user) {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    return (
      <div className="card welcome-card" data-reveal>
        <div className="who"><Avatar user={user} /><div><strong>{greeting}, {user.name.split(' ')[0]} 👋</strong><small>You’re signed in as {user.email}. Pick a product to request your quote.</small></div></div>
        <a href="#catalog" className="btn btn-primary btn-sm">Start exploring <ArrowRight size={15} /></a>
      </div>
    )
  }
  return (
    <div className="card welcome-card" data-reveal>
      <div className="who"><span className="avatar-fallback">👋</span><div><strong>Welcome to the Opulence Byte store</strong><small>Browse freely. Sign in with Google or GitHub when you’re ready for a quote.</small></div></div>
      <Link href="/signin?next=/products" className="btn btn-primary btn-sm"><LogIn size={15} /> Sign in</Link>
    </div>
  )
}
