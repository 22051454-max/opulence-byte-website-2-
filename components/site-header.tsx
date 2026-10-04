'use client'

import { ArrowUpRight, LayoutGrid, LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Logo } from './logo'
import { Avatar, useSession } from './session'
import { ThemeToggle } from './theme-toggle'

const links = [
  { href: '/#services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/play', label: 'Play' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { user, signOut, loading } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { setOpen(false); setMenu(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  useEffect(() => {
    if (!menu) return
    const close = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenu(false) }
    const esc = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenu(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [menu])

  const isActive = (href: string) => (href.startsWith('/#') ? false : pathname === href || pathname.startsWith(`${href}/`))
  const signInHref = `/signin?next=${encodeURIComponent(pathname === '/signin' ? '/products' : pathname)}`

  return (
    <>
      <header className={`header ${scrolled || open ? 'is-scrolled' : ''}`}>
        <div className="shell header-inner">
          <Logo />
          <nav className="nav" aria-label="Main">
            {links.map((link) => <Link key={link.href} href={link.href} className={isActive(link.href) ? 'active' : ''}>{link.label}</Link>)}
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            {user ? (
              <div className="user-menu" ref={menuRef}>
                <button className="user-chip" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-haspopup="menu">
                  <Avatar user={user} /><span className="hide-mobile">{user.name.split(' ')[0]}</span>
                </button>
                {menu && (
                  <div className="user-dropdown" role="menu">
                    <p>Signed in as<br /><b>{user.email}</b></p>
                    <Link href="/products" role="menuitem"><LayoutGrid size={16} /> Browse products</Link>
                    <button onClick={signOut} role="menuitem"><LogOut size={16} /> Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={signInHref} className="btn btn-ghost btn-sm hide-mobile" aria-busy={loading}>Sign in</Link>
            )}
            <Link href="/#contact" className="btn btn-primary btn-sm hide-mobile">Start a project <ArrowUpRight size={15} /></Link>
            <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <div className={`mobile-nav ${open ? 'open' : ''}`} aria-hidden={!open}>
        <Link href="/" tabIndex={open ? 0 : -1}>Home</Link>
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>{link.label}</Link>)}
        {!user && <Link href={signInHref} className="btn btn-ghost btn-block" tabIndex={open ? 0 : -1}>Sign in</Link>}
        <Link href="/#contact" onClick={() => setOpen(false)} className="btn btn-primary btn-block" tabIndex={open ? 0 : -1}>Start a project <ArrowUpRight size={16} /></Link>
      </div>
    </>
  )
}
