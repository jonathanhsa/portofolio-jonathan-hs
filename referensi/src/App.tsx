import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const fn = () => setY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return y
}

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useSectionInView(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { threshold: 0.5 }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])
  return active
}

// ─── Pixel wipe transition overlay ───────────────────────────────────────────

function PixelWipe({ active }: { active: boolean }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500, pointerEvents: 'none',
      display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
    }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{
          background: '#0a0a1a',
          transform: active ? 'scaleY(1)' : 'scaleY(0)',
          transformOrigin: 'top',
          transition: `transform 0.4s cubic-bezier(.77,0,.18,1) ${i * 30}ms`,
        }} />
      ))}
    </div>
  )
}

// ─── Stage HUD (side navigation) ─────────────────────────────────────────────

const STAGES = [
  { id: 'hero',     label: 'STAGE 1', name: 'INTRO',    color: '#00ffcc', icon: '🏰' },
  { id: 'about',    label: 'STAGE 2', name: 'HERO',     color: '#ff00aa', icon: '👾' },
  { id: 'skills',   label: 'STAGE 3', name: 'SKILLS',   color: '#ffee00', icon: '⚔️' },
  { id: 'projects', label: 'STAGE 4', name: 'QUESTS',   color: '#00ff44', icon: '🗺️' },
  { id: 'contact',  label: 'STAGE 5', name: 'CONTACT',  color: '#aa00ff', icon: '📡' },
]

function StageHUD({ active }: { active: string }) {
  return (
    <div style={{
      position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)',
      zIndex: 100, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {STAGES.map((s, i) => {
        const isActive = active === s.id
        return (
          <a key={s.id} href={`#${s.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <div style={{
              fontFamily: "'Press Start 2P'", fontSize: 7, color: isActive ? s.color : '#3333aa',
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateX(0)' : 'translateX(8px)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}>{s.name}</div>
            <div style={{
              width: isActive ? 18 : 10, height: isActive ? 18 : 10,
              background: isActive ? s.color : '#3333aa',
              boxShadow: isActive ? `0 0 12px ${s.color}` : 'none',
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }} />
          </a>
        )
      })}
    </div>
  )
}

// ─── Scroll progress strip ────────────────────────────────────────────────────

function ProgressStrip({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100)
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 8, background: '#0a0a1a', borderBottom: '2px solid #1a1a3a' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: 'repeating-linear-gradient(90deg,#00ffcc 0,#00ffcc 10px,#ff00aa 10px,#ff00aa 20px,#ffee00 20px,#ffee00 30px,#00ff44 30px,#00ff44 40px)',
        transition: 'width 0.08s linear',
        boxShadow: '0 0 10px rgba(0,255,204,0.7)',
      }} />
      <div style={{
        position: 'absolute', right: 6, top: 8, fontFamily: "'Press Start 2P'",
        fontSize: 7, color: '#00ffcc', background: '#0a0a1a', padding: '2px 5px', border: '2px solid #3333aa',
      }}>{pct}%</div>
    </div>
  )
}

// ─── Walking sprite ───────────────────────────────────────────────────────────

function Walker({ progress }: { progress: number }) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 160)
    return () => clearInterval(t)
  }, [])

  const legs = [
    [[2,6,2,2],[4,6,2,2]], [[1,6,2,2],[4,5,2,2]],
    [[2,6,2,2],[4,6,2,2]], [[2,5,2,2],[5,6,2,2]],
  ]
  const [ll, rl] = legs[frame]

  return (
    <div style={{
      position: 'fixed', bottom: 40, zIndex: 150, pointerEvents: 'none',
      left: `max(0px, calc(${progress * 100}vw - 48px))`,
      transition: 'left 0.12s linear',
    }}>
      <svg width="40" height="48" viewBox="0 0 8 10" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {/* hair */}
        <rect x="1" y="0" width="6" height="2" fill="#ffee00" />
        {/* head */}
        <rect x="2" y="1" width="4" height="3" fill="#00ffcc" />
        {/* eye */}
        <rect x="3" y="2" width="1" height="1" fill="#0a0a1a" />
        {/* body */}
        <rect x="1" y="4" width="6" height="3" fill="#ff00aa" />
        {/* arm l */}
        <rect x="0" y="4" width="1" height="2" fill="#00ffcc" />
        {/* arm r */}
        <rect x="7" y="4" width="1" height="2" fill="#00ffcc" />
        {/* leg l */}
        <rect x={ll[0]} y={ll[1]} width={ll[2]} height={ll[3]} fill="#3333aa" />
        {/* leg r */}
        <rect x={rl[0]} y={rl[1]} width={rl[2]} height={rl[3]} fill="#3333aa" />
      </svg>
    </div>
  )
}

// Ground track
function GroundTrack() {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: 0, right: 0, height: 8, zIndex: 149,
      background: 'repeating-linear-gradient(90deg,#3333aa 0,#3333aa 16px,#1a1a3a 16px,#1a1a3a 32px)',
      borderTop: '3px solid #00ffcc22',
    }} />
  )
}

// ─── Stars parallax ───────────────────────────────────────────────────────────

function Stars({ scrollY }: { scrollY: number }) {
  const pts = useRef(Array.from({ length: 100 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() > 0.7 ? 3 : 2,
    speed: 0.05 + Math.random() * 0.2,
    color: i % 4 === 0 ? '#00ffcc' : i % 4 === 1 ? '#ff00aa' : i % 4 === 2 ? '#ffee00' : '#ffffff',
    dur: 1.5 + Math.random() * 3, delay: Math.random() * 5,
  })))

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {pts.current.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `calc(${p.y}% - ${scrollY * p.speed}px)`,
          width: p.s, height: p.s,
          background: p.color,
          animation: `twinkle ${p.dur}s ${p.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  )
}

// ─── Scanlines ────────────────────────────────────────────────────────────────

function Scanlines() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none',
      background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)',
    }} />
  )
}

// ─── Pixel reveal text ────────────────────────────────────────────────────────

function PixelReveal({ children, inView, delay = 0, dir = 'up' }: {
  children: React.ReactNode; inView: boolean; delay?: number; dir?: 'up' | 'left' | 'right' | 'down'
}) {
  const t = { up: 'translateY(32px)', left: 'translateX(-32px)', right: 'translateX(32px)', down: 'translateY(-32px)' }
  return (
    <div style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : t[dir],
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>{children}</div>
  )
}

// ─── Pixel bar ────────────────────────────────────────────────────────────────

const BAR_COLORS: Record<string, string> = {
  cyan:    'repeating-linear-gradient(90deg,#00ffcc 0,#00ffcc 12px,#009988 12px,#009988 16px)',
  magenta: 'repeating-linear-gradient(90deg,#ff00aa 0,#ff00aa 12px,#aa0077 12px,#aa0077 16px)',
  yellow:  'repeating-linear-gradient(90deg,#ffee00 0,#ffee00 12px,#aaaa00 12px,#aaaa00 16px)',
  green:   'repeating-linear-gradient(90deg,#00ff44 0,#00ff44 12px,#00aa33 12px,#00aa33 16px)',
  purple:  'repeating-linear-gradient(90deg,#aa00ff 0,#aa00ff 12px,#7700bb 12px,#7700bb 16px)',
  red:     'repeating-linear-gradient(90deg,#ff2244 0,#ff2244 12px,#bb1133 12px,#bb1133 16px)',
}

function PixelBar({ value, color = 'cyan', triggered }: { value: number; color?: string; triggered: boolean }) {
  return (
    <div style={{ height: 16, background: '#0a1a0a', border: '3px solid #223322', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        background: BAR_COLORS[color] ?? BAR_COLORS.cyan,
        width: triggered ? `${value}%` : '0%',
        transition: 'width 1.4s ease 0.3s',
      }} />
    </div>
  )
}

// ─── Typewriter ───────────────────────────────────────────────────────────────

function Typewriter({ text, trigger }: { text: string; trigger: boolean }) {
  const [out, setOut] = useState('')
  useEffect(() => {
    if (!trigger) return
    let i = 0; setOut('')
    const t = setInterval(() => { if (i < text.length) setOut(text.slice(0, ++i)); else clearInterval(t) }, 70)
    return () => clearInterval(t)
  }, [trigger, text])
  return <>{out}<span style={{ animation: 'blink 1s step-start infinite', color: '#00ffcc' }}>█</span></>
}

// ─── SECTION 1: HERO ─────────────────────────────────────────────────────────

function HeroSection({ scrollY }: { scrollY: number }) {
  const { ref, inView } = useInView(0.1)
  const scale = Math.max(0.88, 1 - scrollY * 0.00015)
  const opacity = Math.max(0, 1 - scrollY * 0.0015)

  return (
    <section id="hero" ref={ref as React.RefObject<HTMLElement>} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', paddingTop: 60,
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(51,51,170,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(51,51,170,0.18) 1px,transparent 1px)',
        backgroundSize: '32px 32px',
        transform: `translateY(${scrollY * 0.15}px)`,
      }} />

      {/* Parallax mountain layers */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, transform: `translateY(${scrollY * 0.4}px)`, pointerEvents: 'none' }}>
        {/* Back mountains */}
        <svg viewBox="0 0 400 80" style={{ position: 'absolute', bottom: 0, width: '100%', height: 80 }} preserveAspectRatio="none">
          <polygon points="0,80 60,30 120,60 180,20 240,50 300,10 360,45 400,25 400,80" fill="#1a1a3a" />
        </svg>
        {/* Front hills */}
        <svg viewBox="0 0 400 60" style={{ position: 'absolute', bottom: 0, width: '100%', height: 60 }} preserveAspectRatio="none">
          <polygon points="0,60 80,20 160,45 240,15 320,40 400,10 400,60" fill="#12122a" />
        </svg>
      </div>

      {/* Marquee */}
      <div style={{ position: 'absolute', top: 8, left: 0, right: 0, background: '#ff00aa', padding: '5px 0', overflow: 'hidden', zIndex: 2 }}>
        <div className="marquee-text" style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: '#fff', letterSpacing: 3 }}>
          {'  ★ AVAILABLE FOR HIRE  ★  OPEN TO REMOTE  ★  SCROLL TO EXPLORE  ★  PIXEL BY PIXEL  ★  '.repeat(3)}
        </div>
      </div>

      <div style={{ transform: `scale(${scale})`, opacity, transition: 'transform 0.05s,opacity 0.05s', position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
        {/* Animated sprite */}
        <div className="float" style={{ marginBottom: 28 }}>
          <svg width="112" height="112" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
            <rect x="4" y="1" width="8" height="2" fill="#ffee00" />
            <rect x="3" y="2" width="1" height="2" fill="#ffee00" />
            <rect x="12" y="2" width="1" height="2" fill="#ffee00" />
            <rect x="5" y="2" width="6" height="6" fill="#00ffcc" />
            <rect x="6" y="4" width="1" height="1" fill="#0a0a1a" />
            <rect x="9" y="4" width="1" height="1" fill="#0a0a1a" />
            <rect x="7" y="6" width="2" height="1" fill="#0a0a1a" />
            <rect x="7" y="8" width="2" height="1" fill="#00ddaa" />
            <rect x="4" y="9" width="8" height="4" fill="#ff00aa" />
            <rect x="4" y="11" width="8" height="1" fill="#cc0088" />
            <rect x="2" y="9" width="2" height="3" fill="#00ffcc" />
            <rect x="12" y="9" width="2" height="3" fill="#00ffcc" />
            <rect x="4" y="13" width="3" height="3" fill="#1a1a3a" />
            <rect x="9" y="13" width="3" height="3" fill="#1a1a3a" />
            <rect x="3" y="15" width="4" height="1" fill="#3333aa" />
            <rect x="9" y="15" width="4" height="1" fill="#3333aa" />
          </svg>
        </div>

        <PixelReveal inView={inView} delay={0}>
          <div className="section-label" style={{ marginBottom: 14 }}>★ PLAYER SELECT ★</div>
        </PixelReveal>
        <PixelReveal inView={inView} delay={100}>
          <h1 className="pixel-heading glitch glow-cyan" style={{ fontSize: 'clamp(22px,4.5vw,52px)', color: '#00ffcc', lineHeight: 1.5, marginBottom: 20 }}>
            ALEX MORGAN
          </h1>
        </PixelReveal>
        <PixelReveal inView={inView} delay={200}>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: 'clamp(9px,1.5vw,14px)', color: '#ff00aa', marginBottom: 44, minHeight: 28 }}>
            <Typewriter text="FULL-STACK DEVELOPER" trigger={inView} />
          </div>
        </PixelReveal>

        {/* Stat cards */}
        <PixelReveal inView={inView} delay={300}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
            {[
              { label: 'XP', value: '8YRS', color: '#00ffcc' },
              { label: 'PROJECTS', value: '40+', color: '#ff00aa' },
              { label: 'CLIENTS', value: '25', color: '#ffee00' },
              { label: 'COMMITS', value: '3.2K', color: '#00ff44' },
            ].map(s => (
              <div key={s.label} style={{ background: '#12122a', border: '3px solid #3333aa', padding: '14px 18px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 20, color: s.color, marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: '#8888cc' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </PixelReveal>

        <PixelReveal inView={inView} delay={400}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#projects" className="pixel-btn">▶ VIEW WORK</a>
            <a href="#contact" className="pixel-btn pixel-btn-magenta">✉ HIRE ME</a>
          </div>
        </PixelReveal>

        <div style={{ marginTop: 60, fontFamily: "'Press Start 2P'", fontSize: 7, color: '#3333aa', animation: 'blink 1.2s step-start infinite' }}>
          ↓ SCROLL TO CONTINUE ↓
        </div>
      </div>

      {/* Rainbow floor */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: 'repeating-linear-gradient(90deg,#00ffcc 0,#00ffcc 16px,#ff00aa 16px,#ff00aa 32px,#ffee00 32px,#ffee00 48px,#00ff44 48px,#00ff44 64px)' }} />
    </section>
  )
}

// ─── SECTION 2: ABOUT ─────────────────────────────────────────────────────────

function AboutSection() {
  const { ref, inView } = useInView(0.15)
  return (
    <section id="about" ref={ref as React.RefObject<HTMLElement>} style={{ minHeight: '100vh', padding: '100px 24px', position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Side accent */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: 'repeating-linear-gradient(180deg,#ff00aa 0,#ff00aa 16px,#0a0a1a 16px,#0a0a1a 32px)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <PixelReveal inView={inView} delay={0}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label" style={{ marginBottom: 12, color: '#ff00aa' }}>// STAGE 2 — HERO BIO</div>
            <h2 className="pixel-heading glow-magenta" style={{ fontSize: 22, color: '#ff00aa' }}>
              ABOUT ME
            </h2>
          </div>
        </PixelReveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          <div>
            <PixelReveal inView={inView} delay={150} dir="left">
              <div className="dialogue-box" style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: '#8888cc', marginBottom: 14 }}>ALEX says:</div>
                <p style={{ fontSize: 19, lineHeight: 1.85, color: '#e8e8f0' }}>
                  Hey! I'm a full-stack developer with 8 years of XP crafting fast, beautiful products — from pixel-perfect UIs to battle-hardened backends.
                </p>
                <p style={{ fontSize: 19, lineHeight: 1.85, color: '#8888cc', marginTop: 14 }}>
                  I grew up modding 16-bit games. Now I build things used by thousands — still thinking in sprites and tile maps.
                </p>
              </div>
            </PixelReveal>

            <PixelReveal inView={inView} delay={280} dir="left">
              <div style={{ background: '#12122a', border: '3px solid #3333aa', padding: 20 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: '#8888cc', marginBottom: 16 }}>CHARACTER VITALS</div>
                {[
                  { label: 'HP', value: 98, color: 'red' },
                  { label: 'MANA', value: 85, color: 'purple' },
                  { label: 'STAMINA', value: 92, color: 'green' },
                ].map(s => (
                  <div key={s.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: '#8888cc' }}>{s.label}</span>
                      <span style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: BAR_COLORS[s.color]?.includes('#ff2244') ? '#ff2244' : '#00ffcc' }}>{s.value}/100</span>
                    </div>
                    <PixelBar value={s.value} color={s.color} triggered={inView} />
                  </div>
                ))}
              </div>
            </PixelReveal>
          </div>

          <PixelReveal inView={inView} delay={200} dir="right">
            <div style={{ background: '#12122a', border: '4px solid #ff00aa', boxShadow: '0 0 24px rgba(255,0,170,0.25), 4px 4px 0 rgba(0,0,0,0.8)', padding: 28 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 80, marginBottom: 10 }}>👾</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: '#ff00aa' }}>ALEX MORGAN</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: '#8888cc', marginTop: 8 }}>CLASS: FULLSTACK WIZARD LV.99</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { k: 'STR', v: 'Backend', e: '⚡' },
                  { k: 'INT', v: 'Systems', e: '🧠' },
                  { k: 'DEX', v: 'Frontend', e: '✨' },
                  { k: 'WIS', v: 'Architecture', e: '🔮' },
                  { k: 'CHA', v: 'Leadership', e: '👑' },
                  { k: 'LCK', v: 'Open Source', e: '🍀' },
                ].map(s => (
                  <div key={s.k} style={{ background: '#0a0a1a', border: '2px solid #3333aa', padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 14 }}>{s.e}</span>
                    <div>
                      <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: '#8888cc' }}>{s.k}</div>
                      <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: '#e8e8f0' }}>{s.v}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '2px solid #3333aa', paddingTop: 16 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: '#8888cc', marginBottom: 10 }}>EQUIPPED</div>
                {['VS Code ⚔️', 'Figma 🛡️', 'Terminal 🔮', 'Docker 🐳'].map(e => (
                  <div key={e} style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: '#ff00aa', marginBottom: 6 }}>▸ {e}</div>
                ))}
              </div>
            </div>
          </PixelReveal>
        </div>
      </div>
    </section>
  )
}

// ─── SECTION 3: SKILLS ────────────────────────────────────────────────────────

const skills = [
  { name: 'React / TypeScript', value: 95, color: 'cyan' },
  { name: 'Node.js / Backend',  value: 88, color: 'magenta' },
  { name: 'WebGL / Three.js',   value: 72, color: 'yellow' },
  { name: 'Rust / Systems',     value: 65, color: 'green' },
  { name: 'UI / Design',        value: 90, color: 'purple' },
  { name: 'DevOps / Cloud',     value: 80, color: 'cyan' },
]

function SkillsSection() {
  const { ref, inView } = useInView(0.15)
  return (
    <section id="skills" ref={ref as React.RefObject<HTMLElement>} style={{ minHeight: '100vh', padding: '100px 24px', background: '#0d0d20', position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Dither overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(0,255,204,0.07) 1px,transparent 1px)', backgroundSize: '8px 8px', pointerEvents: 'none' }} />
      {/* Side accent */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, background: 'repeating-linear-gradient(180deg,#ffee00 0,#ffee00 16px,#0d0d20 16px,#0d0d20 32px)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <PixelReveal inView={inView}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label" style={{ marginBottom: 12, color: '#ffee00' }}>// STAGE 3 — SKILL TREE</div>
            <h2 className="pixel-heading glow-yellow" style={{ fontSize: 22, color: '#ffee00' }}>ALLOCATE POINTS</h2>
            <p style={{ marginTop: 12, color: '#8888cc', fontSize: 18 }}>8 years of grinding XP</p>
          </div>
        </PixelReveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 56 }}>
          {skills.map((sk, i) => (
            <PixelReveal key={sk.name} inView={inView} delay={i * 90} dir={i % 2 === 0 ? 'left' : 'right'}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: 9, color: '#e8e8f0' }}>{sk.name}</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: 9, color: '#8888cc' }}>{sk.value}%</span>
                </div>
                <PixelBar value={sk.value} color={sk.color} triggered={inView} />
              </div>
            </PixelReveal>
          ))}
        </div>

        <PixelReveal inView={inView} delay={500}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: '#8888cc', marginBottom: 18 }}>— INVENTORY —</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {['React','TypeScript','Node.js','Next.js','Rust','PostgreSQL','Redis','Docker','AWS','Three.js','GraphQL','WebGL','Figma','Git'].map((t, i) => (
                <span key={t} className="pixel-tag" style={{
                  borderColor: ['#00ffcc','#ff00aa','#ffee00','#00ff44','#aa00ff'][i % 5],
                  color: ['#00ffcc','#ff00aa','#ffee00','#00ff44','#aa00ff'][i % 5],
                }}>{t}</span>
              ))}
            </div>
          </div>
        </PixelReveal>
      </div>
    </section>
  )
}

// ─── SECTION 4: PROJECTS ──────────────────────────────────────────────────────

const projects = [
  { title: 'DUNGEONCRAFT', type: 'GAME / WEBGL', desc: 'Procedurally generated dungeon crawler with Three.js + WASM. Real-time lighting, 16-bit sprite animations.', tags: ['Three.js','WASM','Rust','WebGL'], color: 'cyan', hp: 92, icon: '⚔️', year: '2024' },
  { title: 'PIXELVAULT',   type: 'APP / WEB3',  desc: 'NFT gallery with pixel-art generation. Mint and trade 16-bit collectibles on-chain. 10K unique characters.', tags: ['React','Solidity','IPFS','Ethers.js'], color: 'magenta', hp: 85, icon: '💎', year: '2024' },
  { title: 'SYNTHWAVE OS', type: 'UI / DESIGN',  desc: 'Retro-futuristic design system with 80+ components. Full dark mode, animations, pixel-perfect docs.', tags: ['TypeScript','Storybook','CSS','Figma'], color: 'yellow', hp: 78, icon: '🖥️', year: '2023' },
  { title: 'CHRONOBIT',   type: 'TOOL / APP',   desc: 'Time tracking app with RPG mechanics. Level up your skills by logging work sessions. Boss battles for deadlines.', tags: ['React','Supabase','Node.js','PWA'], color: 'green', hp: 95, icon: '⏱️', year: '2023' },
]

const CM: Record<string, { border: string; shadow: string }> = {
  cyan:    { border: '#00ffcc', shadow: 'rgba(0,255,204,0.3)' },
  magenta: { border: '#ff00aa', shadow: 'rgba(255,0,170,0.3)' },
  yellow:  { border: '#ffee00', shadow: 'rgba(255,238,0,0.3)' },
  green:   { border: '#00ff44', shadow: 'rgba(0,255,68,0.3)' },
}

function ProjectCard({ p, i, triggered }: { p: typeof projects[0]; i: number; triggered: boolean }) {
  const [hov, setHov] = useState(false)
  const c = CM[p.color]
  return (
    <PixelReveal inView={triggered} delay={i * 120} dir={i % 2 === 0 ? 'left' : 'right'}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: '#12122a',
          border: `4px solid ${hov ? c.border : '#3333aa'}`,
          boxShadow: hov ? `0 0 24px ${c.shadow}, 4px 4px 0 #000` : '4px 4px 0 #000',
          padding: 24, cursor: 'pointer', position: 'relative',
          transform: hov ? 'translate(-4px,-4px)' : 'none',
          transition: 'border-color 0.12s, box-shadow 0.12s, transform 0.15s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: '#8888cc', marginBottom: 8 }}>{p.type}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: c.border }}>{p.title}</span>
            </div>
          </div>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: '#8888cc' }}>{p.year}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: '#8888cc' }}>COMPLETION</span>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: c.border }}>{p.hp}%</span>
          </div>
          <PixelBar value={p.hp} color={p.color} triggered={triggered} />
        </div>
        <p style={{ color: '#8888cc', fontSize: 17, lineHeight: 1.75, marginBottom: 16 }}>{p.desc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {p.tags.map(t => <span key={t} className="pixel-tag" style={{ borderColor: c.border, color: c.border, fontSize: 7 }}>{t}</span>)}
        </div>
        {hov && <div style={{ position: 'absolute', top: 12, right: 12, fontFamily: "'Press Start 2P'", fontSize: 8, color: c.border, animation: 'blink 0.6s step-start infinite' }}>▶ SELECT</div>}
      </div>
    </PixelReveal>
  )
}

function ProjectsSection() {
  const { ref, inView } = useInView(0.1)
  return (
    <section id="projects" ref={ref as React.RefObject<HTMLElement>} style={{ minHeight: '100vh', padding: '100px 24px', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: 'repeating-linear-gradient(180deg,#00ff44 0,#00ff44 16px,#0a0a1a 16px,#0a0a1a 32px)' }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <PixelReveal inView={inView}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label" style={{ marginBottom: 12, color: '#00ff44' }}>// STAGE 4 — QUEST LOG</div>
            <h2 className="pixel-heading" style={{ fontSize: 22, color: '#00ff44', textShadow: '0 0 20px #00ff44, 0 0 40px rgba(0,255,68,0.4)' }}>COMPLETED MISSIONS</h2>
          </div>
        </PixelReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24 }}>
          {projects.map((p, i) => <ProjectCard key={p.title} p={p} i={i} triggered={inView} />)}
        </div>
        <PixelReveal inView={inView} delay={400}>
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <a href="#contact" className="pixel-btn pixel-btn-magenta">★ START A NEW QUEST</a>
          </div>
        </PixelReveal>
      </div>
    </section>
  )
}

// ─── SECTION 5: CONTACT ───────────────────────────────────────────────────────

function ContactSection() {
  const { ref, inView } = useInView(0.15)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', msg: '' })

  return (
    <section id="contact" ref={ref as React.RefObject<HTMLElement>} style={{ minHeight: '100vh', padding: '100px 24px 180px', background: '#0d0d20', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, background: 'repeating-linear-gradient(180deg,#aa00ff 0,#aa00ff 16px,#0d0d20 16px,#0d0d20 32px)' }} />
      <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
        <PixelReveal inView={inView}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="section-label" style={{ marginBottom: 12, color: '#aa00ff' }}>// STAGE 5 — FINAL BOSS</div>
            <h2 className="pixel-heading" style={{ fontSize: 22, color: '#aa00ff', textShadow: '0 0 20px #aa00ff' }}>SEND A MESSAGE</h2>
            <p style={{ marginTop: 12, color: '#8888cc', fontSize: 18 }}>Response within 24 hours ⚡</p>
          </div>
        </PixelReveal>

        {sent ? (
          <PixelReveal inView dir="up">
            <div className="dialogue-box" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 14, color: '#00ff44', marginBottom: 16 }}>SENT!</div>
              <p style={{ color: '#8888cc', fontSize: 18 }}>Quest request submitted! I'll respond within 24 hours.</p>
            </div>
          </PixelReveal>
        ) : (
          <PixelReveal inView={inView} delay={120}>
            <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { id: 'name', label: 'NAME', ph: 'Your name...', type: 'text' },
                { id: 'email', label: 'EMAIL', ph: 'your@email.com', type: 'email' },
              ].map(f => (
                <div key={f.id}>
                  <label style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: '#8888cc', display: 'block', marginBottom: 8 }}>▸ {f.label}</label>
                  <input type={f.type} placeholder={f.ph} required
                    value={form[f.id as keyof typeof form]}
                    onChange={e => setForm(v => ({ ...v, [f.id]: e.target.value }))}
                    style={{ width: '100%', background: '#0a0a1a', border: '3px solid #3333aa', color: '#e8e8f0', padding: '14px 16px', fontFamily: "'VT323',monospace", fontSize: 20, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.1s, box-shadow 0.1s' }}
                    onFocus={e => { e.target.style.borderColor = '#aa00ff'; e.target.style.boxShadow = '0 0 12px rgba(170,0,255,0.3)' }}
                    onBlur={e => { e.target.style.borderColor = '#3333aa'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: '#8888cc', display: 'block', marginBottom: 8 }}>▸ MESSAGE</label>
                <textarea placeholder="Describe your quest..." required rows={5}
                  value={form.msg}
                  onChange={e => setForm(v => ({ ...v, msg: e.target.value }))}
                  style={{ width: '100%', background: '#0a0a1a', border: '3px solid #3333aa', color: '#e8e8f0', padding: '14px 16px', fontFamily: "'VT323',monospace", fontSize: 20, outline: 'none', resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.1s, box-shadow 0.1s' }}
                  onFocus={e => { e.target.style.borderColor = '#aa00ff'; e.target.style.boxShadow = '0 0 12px rgba(170,0,255,0.3)' }}
                  onBlur={e => { e.target.style.borderColor = '#3333aa'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <button type="submit" className="pixel-btn" style={{ alignSelf: 'flex-start' }}>▶ SUBMIT QUEST</button>
            </form>
          </PixelReveal>
        )}

        <PixelReveal inView={inView} delay={300}>
          <div style={{ marginTop: 52, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { l: 'GITHUB', icon: '🐙', c: '#e8e8f0' },
              { l: 'TWITTER', icon: '🐦', c: '#00aaff' },
              { l: 'LINKEDIN', icon: '💼', c: '#0077ff' },
              { l: 'DRIBBBLE', icon: '🏀', c: '#ff00aa' },
            ].map(s => (
              <a key={s.l} href="#" style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: s.c, background: '#12122a', border: '3px solid #3333aa', padding: '12px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'border-color 0.1s,transform 0.1s,box-shadow 0.1s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = s.c; el.style.transform = 'translate(-2px,-2px)'; el.style.boxShadow = `0 0 14px ${s.c}44` }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#3333aa'; el.style.transform = 'none'; el.style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: 16 }}>{s.icon}</span>{s.l}
              </a>
            ))}
          </div>
        </PixelReveal>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ paddingBottom: 80, textAlign: 'center', background: '#0a0a1a', borderTop: '3px solid #3333aa' }}>
      <div style={{ height: 6, background: 'repeating-linear-gradient(90deg,#00ffcc 0,#00ffcc 16px,#ff00aa 16px,#ff00aa 32px,#ffee00 32px,#ffee00 48px,#00ff44 48px,#00ff44 64px)', marginBottom: 24 }} />
      <div style={{ fontFamily: "'Press Start 2P'", fontSize: 9, color: '#3333aa' }}>© 2024 ALEX MORGAN</div>
      <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: '#222244', marginTop: 10 }}>INSERT COIN TO CONTINUE</div>
    </footer>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const scrollY = useScrollY()
  const [scrollProgress, setScrollProgress] = useState(0)
  const activeSection = useSectionInView(['hero','about','skills','projects','contact'])

  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(h > 0 ? window.scrollY / h : 0)
    }
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh', animation: 'flicker 8s infinite' }}>
      <Scanlines />
      <Stars scrollY={scrollY} />
      <ProgressStrip progress={scrollProgress} />
      <StageHUD active={activeSection} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection scrollY={scrollY} />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
        <Footer />
      </div>

      <Walker progress={scrollProgress} />
      <GroundTrack />
    </div>
  )
}
