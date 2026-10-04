'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export const themeScript = `(function(){try{var t=localStorage.getItem('ob-theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  useEffect(() => { setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark') }, [])
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#05080f' : '#f4f7fc')
    try { localStorage.setItem('ob-theme', next) } catch { /* private mode */ }
  }
  return (
    <button className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
