'use client'

import { useEffect, useState } from 'react'

export function Typewriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(words[0])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const word = words[index % words.length]
    const delay = !deleting && text === word ? 2200 : deleting ? 45 : 85
    const timer = window.setTimeout(() => {
      if (!deleting && text === word) setDeleting(true)
      else if (deleting && text === '') { setDeleting(false); setIndex((i) => i + 1) }
      else setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1))
    }, delay)
    return () => window.clearTimeout(timer)
  }, [text, deleting, index, words])

  return <span className="word-swap gradient-text">{text}<span className="caret" aria-hidden="true" /></span>
}
