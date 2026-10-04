import { ArrowRight, ArrowUpRight, BrainCircuit, Cloud, Gamepad2, HeartPulse, Hotel, Mail, MapPin, Phone, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { ByteGame } from '@/components/byte-game'
import { ContactForm } from '@/components/contact-form'
import { Counter } from '@/components/counter'
import { Icon } from '@/components/icon'
import { ProductCard } from '@/components/product-card'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Typewriter } from '@/components/typewriter'
import { products, QUOTE_FEE_USD } from '@/lib/products'
import { services } from '@/lib/services'

const featured = ['hospital-erp', 'hotel-erp', 'school-erp', 'crm', 'hrms', 'ai-assistant']
const marquee = ['Hospital ERP', 'Hotel ERP', 'AI Agents', 'School ERP', 'E-commerce', 'Mobile Apps', 'CRM', 'Cloud & DevOps', 'HRMS', 'UI/UX Design']

export default function Home() {
  return (
    <div className="page">
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="hero">
          <div className="shell hero-grid">
            <div>
              <span className="eyebrow" data-reveal><Sparkles size={13} /> Software · SaaS · AI</span>
              <h1 data-reveal style={{ '--d': 1 } as React.CSSProperties}>
                We build<br /><Typewriter words={['what matters.', 'hospital ERPs.', 'hotel systems.', 'AI agents.', 'your next app.']} />
              </h1>
              <p className="hero-lede" data-reveal style={{ '--d': 2 } as React.CSSProperties}>
                Opulence Byte designs and engineers websites, apps, AI agents and {products.length} ready-to-deploy SaaS products for hospitals, hotels, schools and growing businesses.
              </p>
              <div className="hero-actions" data-reveal style={{ '--d': 3 } as React.CSSProperties}>
                <Link href="/products" className="btn btn-primary">Explore products <ArrowRight size={17} /></Link>
                <Link href="/#contact" className="btn btn-ghost">Start a project <ArrowUpRight size={17} /></Link>
              </div>
              <div className="hero-trust" data-reveal style={{ '--d': 4 } as React.CSSProperties}>
                <span><ShieldCheck size={16} /> Secure OAuth sign-in</span>
                <span><Zap size={16} /> ${QUOTE_FEE_USD} tailored quotes</span>
                <span><BrainCircuit size={16} /> Claude-powered AI</span>
              </div>
            </div>
            <div className="orbit-stage" data-reveal="zoom" aria-hidden="true">
              <div className="orbit-ring r1"><span className="node"><HeartPulse size={18} /></span><span className="node n2"><Hotel size={18} /></span></div>
              <div className="orbit-ring r2"><span className="node"><Cloud size={18} /></span></div>
              <div className="orbit-ring r3"><span className="node"><BrainCircuit size={18} /></span></div>
              <div className="orbit-core"><img src="/mark.svg" alt="" /></div>
              <div className="float-card f1"><span className="dot" /><div>MediCore ERP<small>Live at AWT Hospital</small></div></div>
              <div className="float-card f2"><Sparkles size={16} color="#22d3ee" /><div>Byte AI<small>Online 24/7</small></div></div>
            </div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...marquee, ...marquee].map((item, i) => <span key={i}>{item}</span>)}
          </div>
        </div>

        {/* Services */}
        <section className="section" id="services">
          <div className="shell">
            <div className="section-head">
              <span className="eyebrow" data-reveal>01 / What we do</span>
              <h2 data-reveal>Every layer of your <span className="gradient-text">digital business.</span></h2>
              <p data-reveal>Strategy, design, engineering and growth in one team, so ideas ship faster and keep improving after launch.</p>
            </div>
            <div className="services-grid">
              {services.map((service, i) => (
                <article key={service.title} className="card tilt card-glow service-card" data-reveal style={{ '--d': i % 4 } as React.CSSProperties}>
                  <span className="num">{service.number}</span>
                  <span className="service-icon"><Icon name={service.icon} size={22} /></span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <div className="tags">{service.tags.map((t) => <span key={t}>{t}</span>)}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="section" id="products" style={{ paddingTop: 0 }}>
          <div className="shell">
            <div className="section-head">
              <span className="eyebrow" data-reveal>02 / Products</span>
              <h2 data-reveal>Ready-made SaaS, <span className="gradient-text">tailored to you.</span></h2>
              <p data-reveal>Deploy proven software in weeks, not months. Sign in, pick a product and get a tailored quote for ${QUOTE_FEE_USD}.</p>
            </div>
            <div className="product-grid">
              {featured.map((slug, i) => {
                const product = products.find((p) => p.slug === slug)!
                return <ProductCard key={slug} product={product} index={i} />
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }} data-reveal>
              <Link href="/products" className="btn btn-ghost">See all {products.length} products <ArrowRight size={17} /></Link>
            </div>
          </div>
        </section>

        {/* Approach */}
        <section className="section" id="about">
          <div className="shell split">
            <div>
              <span className="eyebrow" data-reveal>03 / Our approach</span>
              <h2 className="big-quote" data-reveal>Less noise. <span className="gradient-text">More signal.</span> The best digital work starts with a better question.</h2>
            </div>
            <div className="principles">
              {[
                ['01', 'Get curious.', 'We ask the questions others skip, then turn insight into direction.'],
                ['02', 'Make it clear.', 'Every screen earns its place. Every interaction earns attention.'],
                ['03', 'Ship with intent.', 'Beautiful is the baseline. We build for the world after launch, with support that stays.'],
              ].map(([n, title, text], i) => (
                <div className="card principle" key={n} data-reveal="right" style={{ '--d': i } as React.CSSProperties}>
                  <b>{n}</b>
                  <div><h3>{title}</h3><p>{text}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="shell stats" style={{ marginTop: 70 }}>
            <div className="card stat" data-reveal><Counter to={products.length} /><span>SaaS products ready to deploy</span></div>
            <div className="card stat" data-reveal style={{ '--d': 1 } as React.CSSProperties}><Counter to={services.length} /><span>service lines under one roof</span></div>
            <div className="card stat" data-reveal style={{ '--d': 2 } as React.CSSProperties}><Counter to={24} suffix="/7" /><span>AI assistant on every page</span></div>
            <div className="card stat" data-reveal style={{ '--d': 3 } as React.CSSProperties}><Counter to={QUOTE_FEE_USD} suffix=" USD" /><span>to get a tailored quote</span></div>
          </div>
        </section>

        {/* Game */}
        <section className="section game-section" id="play">
          <div className="shell split">
            <div>
              <span className="eyebrow" data-reveal><Gamepad2 size={13} /> 04 / Take a break</span>
              <div className="section-head" style={{ marginBottom: 0, marginTop: 18 }}>
                <h2 data-reveal>Play <span className="gradient-text">Byte Catcher.</span></h2>
                <p data-reveal>A tiny game for a quick break: catch the bytes and dodge the bugs. Your best score is saved on this device.</p>
              </div>
              <div className="game-legend" data-reveal>
                <div><i style={{ background: '#2d7cf6', color: '#fff' }}>1</i> Byte: +10 points, chain them for combos</div>
                <div><i style={{ background: '#f43f5e', color: '#fff' }}>✕</i> Bug: costs a life</div>
                <div><i style={{ background: '#facc15', color: '#000' }}>★</i> Star: +1 life and +50 points</div>
              </div>
              <Link href="/play" className="link-arrow" style={{ marginTop: 24 }} data-reveal>Open full screen <ArrowRight size={15} /></Link>
            </div>
            <div data-reveal="zoom"><ByteGame /></div>
          </div>
        </section>

        {/* Contact */}
        <section className="section" id="contact">
          <div className="shell contact-grid">
            <div>
              <span className="eyebrow" data-reveal>05 / Let’s talk</span>
              <div className="section-head" style={{ marginTop: 18, marginBottom: 0 }}>
                <h2 data-reveal>Let’s make <span className="gradient-text">something</span> matter.</h2>
                <p data-reveal>Tell us what you’re building. We reply within one business day with next steps.</p>
              </div>
              <div className="contact-info">
                <a className="card tilt" href="mailto:hello@opulencebyte.com" data-reveal="left"><Mail size={20} /><div><small>Email</small>hello@opulencebyte.com</div></a>
                <a className="card tilt" href="tel:+918757924410" data-reveal="left" style={{ '--d': 1 } as React.CSSProperties}><Phone size={20} /><div><small>Phone</small>+91 87579 24410</div></a>
                <div className="card" data-reveal="left" style={{ '--d': 2 } as React.CSSProperties}><MapPin size={20} /><div><small>Studios</small>Ranchi · Jamshedpur, Jharkhand, India</div></div>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>

        <section className="shell" style={{ paddingBottom: 40 }}>
          <div className="card cta-band" data-reveal="zoom">
            <h2>Ready to see your software <span className="gradient-text">in action?</span></h2>
            <p>Browse {products.length} SaaS products, sign in with Google or GitHub and get a tailored quote for ${QUOTE_FEE_USD}.</p>
            <Link href="/products" className="btn btn-primary">Visit the store <ArrowRight size={17} /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
