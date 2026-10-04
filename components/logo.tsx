import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Opulence Byte home">
      <img className="logo-on-dark" src="/logo-light.png" alt="Opulence Byte" width={914} height={275} />
      <img className="logo-on-light" src="/logo.png" alt="" width={914} height={275} />
    </Link>
  )
}
