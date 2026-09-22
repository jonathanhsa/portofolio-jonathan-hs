import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import cloudImg1 from '../assets/cloud cute 1.png'
import cloudImg2 from '../assets/cloud cute 2.png'
import jonathanImg from '../assets/jonathan rounded.jpg'

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    let ticking = false
    const fn = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }
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
          background: 'var(--bg)',
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
  { id: 'hero',     label: 'STAGE 1', name: 'INTRO',    color: 'var(--gold)', icon: '🏰' },
  { id: 'about',    label: 'STAGE 2', name: 'HERO',     color: 'var(--hp)', icon: '👾' },
  { id: 'skills',   label: 'STAGE 3', name: 'SKILLS',   color: 'var(--gold-light)', icon: '⚔️' },
  { id: 'projects', label: 'STAGE 4', name: 'QUESTS',   color: 'var(--forest)', icon: '🗺️' },
  { id: 'contact',  label: 'STAGE 5', name: 'CONTACT',  color: 'var(--mana)', icon: '📡' },
]

function StageHUD({ active }: { active: string }) {
  return (
    <div className="hidden md:flex flex-col gap-3" style={{
      position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)',
      zIndex: 100,
    }}>
      {STAGES.map((s, i) => {
        const isActive = active === s.id
        return (
          <a key={s.id} href={`#${s.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <div style={{
              fontFamily: "'Press Start 2P'", fontSize: 7, color: isActive ? s.color : 'var(--stone)',
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateX(0)' : 'translateX(8px)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}>{s.name}</div>
            <div style={{
              width: isActive ? 18 : 10, height: isActive ? 18 : 10,
              background: isActive ? s.color : 'var(--stone)',
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 8, background: 'var(--bg)', borderBottom: '2px solid var(--stone)' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: 'repeating-linear-gradient(90deg,var(--gold) 0,var(--gold) 10px,var(--gold-dark) 10px,var(--gold-dark) 20px,var(--hp) 20px,var(--hp) 30px,var(--forest) 30px,var(--forest) 40px)',
        transition: 'width 0.08s linear',
        boxShadow: '0 0 10px rgba(196,154,69,0.7)',
      }} />
      <div style={{
        position: 'absolute', right: 6, top: 8, fontFamily: "'Press Start 2P'",
        fontSize: 7, color: 'var(--gold)', background: 'var(--bg)', padding: '2px 5px', border: '2px solid var(--stone)',
      }}>{pct}%</div>
    </div>
  )
}

// ─── Walking sprite ───────────────────────────────────────────────────────────

function Walker({ progress, expansion }: { progress: number, expansion: number }) {
  const [frame, setFrame] = useState(0)
  const [facingRight, setFacingRight] = useState(true)
  const [jumping, setJumping] = useState(false)
  const prevProgress = useRef(progress)

  useEffect(() => {
    // Detect scroll direction and set facing
    if (progress > prevProgress.current + 0.0005) setFacingRight(true)
    else if (progress < prevProgress.current - 0.0005) setFacingRight(false)
    prevProgress.current = progress
  }, [progress])

  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 160)
    return () => clearInterval(t)
  }, [])

  const legs = [
    [[2,8,2,2],[4,8,2,2]], 
    [[1,8,2,2],[4,7,2,2]], 
    [[2,8,2,2],[4,8,2,2]], 
    [[2,7,2,2],[5,8,2,2]], 
  ]
  const [ll, rl] = legs[frame]

  return (
    <div 
      onClick={() => {
        if (!jumping) {
          setJumping(true)
          setTimeout(() => setJumping(false), 180)
        }
      }}
      style={{
        position: 'fixed', bottom: 40 + expansion, zIndex: 150, cursor: 'pointer', pointerEvents: 'auto',
        left: 0, // Reset left to 0, use translateX
        transform: `translate3d(max(0px, calc(${progress * 100}vw - 48px)), 0, 0)`,
        transition: 'transform 0.12s linear',
        willChange: 'transform'
      }}
    >
      <div style={{
        translate: `0 ${jumping ? -24 : 0}px`,
        transform: `scaleX(${facingRight ? 1 : -1})`,
        transition: 'translate 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.1s',
      }}>
        <svg width="48" height="60" viewBox="0 0 8 10" style={{ imageRendering: 'pixelated', display: 'block', filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.5))' }}>
        {/* plume (red feather) */}
        <rect x="3" y="0" width="4" height="1" fill="var(--hp)" />
        <rect x="3" y="1" width="1" height="1" fill="var(--hp)" />
        {/* knight helmet */}
        <rect x="2" y="1" width="4" height="1" fill="#8B898F" />
        <rect x="1" y="2" width="6" height="3" fill="#8B898F" />
        {/* visor slit */}
        <rect x="4" y="3" width="3" height="1" fill="var(--bg)" />
        {/* body armor */}
        <rect x="2" y="5" width="4" height="3" fill="var(--stone)" />
        {/* belt */}
        <rect x="2" y="7" width="4" height="1" fill="#4A3024" />
        {/* arms */}
        <rect x="1" y="5" width="1" height="2" fill="#8B898F" />
        <rect x="6" y="5" width="1" height="2" fill="#8B898F" />
        {/* legs */}
        <rect x={ll[0]} y={ll[1]} width={ll[2]} height={ll[3]} fill="#4A484D" />
        <rect x={rl[0]} y={rl[1]} width={rl[2]} height={rl[3]} fill="#4A484D" />
        </svg>
      </div>
    </div>
  )
}

// Ground track
function Torch({ x, y }: { x: string | number; y: string | number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 8, height: 20 }}>
      {/* Stick */}
      <div style={{ position: 'absolute', bottom: 0, left: 2, width: 4, height: 12, background: '#4A3024', borderRight: '1px solid #2A1D17' }} />
      {/* Flame */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: 8, height: 10, background: '#FFAA00', 
        borderRadius: '4px 4px 2px 2px', animation: 'flicker 0.15s infinite alternate' 
      }} />
      {/* Light */}
      <div className="torch-light" style={{
        position: 'absolute', top: -45, left: -46, width: 100, height: 100,
        background: 'radial-gradient(circle, rgba(255, 150, 0, 0.4) 0%, rgba(255, 100, 0, 0.1) 40%, transparent 70%)',
        pointerEvents: 'none', mixBlendMode: 'screen',
      }} />
    </div>
  )
}

const Barrel = ({ top, left, right, bottom }: any) => (
  <div style={{ position: 'absolute', top, left, right, bottom, width: 32, height: 40, background: '#704020', border: '3px solid #301000', borderRadius: '4px', boxShadow: 'inset -8px 0 0 rgba(0,0,0,0.4)' }}>
    <div style={{ position: 'absolute', top: 6, left: 0, right: 0, height: 4, background: '#301000' }} />
    <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, height: 4, background: '#301000' }} />
  </div>
)

const WoodenStair = ({ top, left, steps, direction }: any) => (
  <div style={{ position: 'absolute', top, left }}>
    {Array.from({ length: steps }).map((_, i) => (
      <div key={i} style={{ 
        position: 'absolute', 
        top: i * 24, 
        left: direction === 'right' ? i * 24 : -i * 24, 
        width: 48, height: 12, 
        background: '#A05A2C',
        borderTop: '4px solid #C07A44',
        borderBottom: '4px solid #5A3219',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
        zIndex: 2
      }} />
    ))}
  </div>
)

const Doorway = ({ top, left, right, bottom, width = 64, height = 96 }: any) => (
  <div style={{ position: 'absolute', top, left, right, bottom, width, height, background: '#050508', border: '6px solid #1c1c24', borderBottom: 'none', boxShadow: 'inset 0 16px 32px rgba(0,0,0,0.8)' }} />
)

function GroundTrack({ expansion }: { expansion: number }) {
  const height = 48 + expansion;
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height, zIndex: 149, pointerEvents: 'none'
    }}>
      {/* Grass edge (always at the top of the track) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 48 }}>
        <svg width="100%" height="100%" style={{ display: 'block', imageRendering: 'pixelated' }}>
          <defs>
             <pattern id="ground-grass" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="scale(3)">
               <rect width="16" height="16" fill="#5B3E31" />
               <rect x="0" y="8" width="16" height="1" fill="#4A3024" />
               <rect x="0" y="15" width="16" height="1" fill="#4A3024" />
               <rect x="7" y="8" width="1" height="8" fill="#4A3024" />
               <rect x="15" y="8" width="1" height="8" fill="#4A3024" />
               <rect x="3" y="4" width="1" height="4" fill="#4A3024" />
               <rect x="11" y="4" width="1" height="4" fill="#4A3024" />
               <rect x="1" y="9" width="6" height="1" fill="#6A4B3C" />
               <rect x="9" y="9" width="6" height="1" fill="#6A4B3C" />
               <rect x="4" y="5" width="4" height="1" fill="#6A4B3C" />
               
               <rect x="0" y="0" width="16" height="5" fill="var(--forest-dark)" />
               <rect x="0" y="0" width="16" height="2" fill="var(--forest)" />
               <rect x="1" y="2" width="2" height="1" fill="var(--forest)" />
               <rect x="4" y="2" width="3" height="2" fill="var(--forest)" />
               <rect x="9" y="2" width="2" height="1" fill="var(--forest)" />
               <rect x="13" y="2" width="2" height="2" fill="var(--forest)" />
               
               <rect x="2" y="5" width="1" height="1" fill="var(--forest-dark)" />
               <rect x="6" y="5" width="1" height="2" fill="var(--forest-dark)" />
               <rect x="10" y="5" width="1" height="1" fill="var(--forest-dark)" />
               <rect x="14" y="5" width="1" height="2" fill="var(--forest-dark)" />
             </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ground-grass)" />
        </svg>
      </div>

      {/* Dirt body -> Dungeon transition */}
      <div style={{ position: 'absolute', top: 48, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        
        {/* Dirt layer (top 100px) */}
        <svg style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, width: '100%', zIndex: -1, imageRendering: 'pixelated' }}>
          <defs>
             <pattern id="ground-dirt" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="scale(3)">
               <rect width="16" height="16" fill="#5B3E31" />
               <rect x="0" y="8" width="16" height="1" fill="#4A3024" />
               <rect x="0" y="15" width="16" height="1" fill="#4A3024" />
               <rect x="7" y="8" width="1" height="8" fill="#4A3024" />
               <rect x="15" y="8" width="1" height="8" fill="#4A3024" />
               <rect x="3" y="4" width="1" height="4" fill="#4A3024" />
               <rect x="11" y="4" width="1" height="4" fill="#4A3024" />
               <rect x="1" y="9" width="6" height="1" fill="#6A4B3C" />
               <rect x="9" y="9" width="6" height="1" fill="#6A4B3C" />
               <rect x="4" y="5" width="4" height="1" fill="#6A4B3C" />
             </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ground-dirt)" />
        </svg>

        {/* The Dungeon (Condensed - Starts at top 100) */}
        <div style={{ position: 'absolute', top: 100, left: 0, right: 0, height: 350 }}>
          
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: -2, imageRendering: 'pixelated' }}>
            <defs>
              <pattern id="bg-brick" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                <rect width="48" height="48" fill="#15151A" />
                <rect x="2" y="2" width="20" height="20" fill="#202028" />
                <rect x="24" y="2" width="22" height="20" fill="#202028" />
                <rect x="-10" y="24" width="20" height="20" fill="#202028" />
                <rect x="12" y="24" width="22" height="20" fill="#202028" />
                <rect x="36" y="24" width="20" height="20" fill="#202028" />
              </pattern>
              
              <pattern id="wall-brick" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                <rect width="48" height="48" fill="#202028" />
                <rect x="2" y="2" width="20" height="20" fill="#4B4B56" />
                <rect x="24" y="2" width="22" height="20" fill="#4B4B56" />
                <rect x="-10" y="24" width="20" height="20" fill="#4B4B56" />
                <rect x="12" y="24" width="22" height="20" fill="#4B4B56" />
                <rect x="36" y="24" width="20" height="20" fill="#4B4B56" />
                <rect x="2" y="2" width="20" height="3" fill="#6A6A76" />
                <rect x="24" y="2" width="22" height="3" fill="#6A6A76" />
                <rect x="-10" y="24" width="20" height="3" fill="#6A6A76" />
                <rect x="12" y="24" width="22" height="3" fill="#6A6A76" />
                <rect x="36" y="24" width="20" height="3" fill="#6A6A76" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bg-brick)" />
          </svg>

          {/* Side Walls */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '10%', bottom: 0, background: 'url(#wall-brick)', borderRight: '6px solid #15151A', zIndex: -1 }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '10%', bottom: 0, background: 'url(#wall-brick)', borderLeft: '6px solid #15151A', zIndex: -1 }} />

          {/* Floor 1 (Ledge) */}
          <div style={{ position: 'absolute', top: 40, left: '10%', width: '30%', height: 32, background: 'url(#wall-brick)', borderTop: '6px solid #6A6A76', borderBottom: '6px solid #15151A', borderRight: '6px solid #15151A' }}>
            <Barrel bottom={32} left="40%" />
            <Torch y={-50} x="85%" />
          </div>
          <WoodenStair top={40} left="40%" steps={5} direction="right" />

          {/* Floor 2 (Main Chamber) */}
          <div style={{ position: 'absolute', top: 160, left: '10%', right: '10%', bottom: 0, background: 'url(#wall-brick)', borderTop: '6px solid #6A6A76' }}>
            
            {/* Small Boss Door */}
            <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 140, height: 100, background: '#050508', border: '6px solid #15151A', borderBottom: 'none', borderRadius: '40px 40px 0 0', boxShadow: 'inset 0 20px 40px rgba(0,0,0,1)' }}>
              <div style={{ position: 'absolute', top: 40, left: 40, width: 8, height: 8, background: '#FF0000', borderRadius: '50%', boxShadow: '0 0 12px #FF0000', animation: 'blink 4s infinite' }} />
              <div style={{ position: 'absolute', top: 40, right: 40, width: 8, height: 8, background: '#FF0000', borderRadius: '50%', boxShadow: '0 0 12px #FF0000', animation: 'blink 4s infinite' }} />
            </div>

            <Torch y={-100} x="20%" />
            <Torch y={-100} x="80%" />
            <Torch y={-100} x="35%" />
            <Torch y={-100} x="65%" />

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32, filter: 'drop-shadow(4px 4px 0 #000)' }}>⚔️</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 'clamp(10px, 2.5vw, 14px)', color: '#E8DFC8', textShadow: '4px 4px 0 #000' }}>
                © 2024 JONATHAN H. SARAGIH
              </div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 9, color: '#A99F89', textShadow: '4px 4px 0 #000' }}>
                BUILT PIXEL BY PIXEL
              </div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: 'var(--gold)', marginTop: 8, animation: 'blink 1.5s step-start infinite', textShadow: '4px 4px 0 #000' }}>
                INSERT COIN TO CONTINUE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Background Stars ─────────────────────────────────────────────────────────

const STAR_LAYERS = [
  // Slow layer
  Array.from({ length: 50 }).map((_, i) => ({ id: `s_${i}`, x: Math.random()*100, y: Math.random()*500, size: 1, delay: -Math.random()*5, color: 'var(--stone)' })),
  // Medium layer
  Array.from({ length: 50 }).map((_, i) => ({ id: `m_${i}`, x: Math.random()*100, y: Math.random()*500, size: 2, delay: -Math.random()*5, color: 'var(--text-muted)' })),
  // Fast layer
  Array.from({ length: 40 }).map((_, i) => ({ id: `f_${i}`, x: Math.random()*100, y: Math.random()*500, size: 3, delay: -Math.random()*5, color: 'var(--text)' })),
]

const Stars = React.memo(function Stars({ scrollY }: { scrollY: number }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div style={{ transform: `translate3d(0, ${-scrollY * 0.15}px, 0)`, willChange: 'transform' }}>
        {STAR_LAYERS[0].map(p => <div key={p.id} className="twinkle" style={{ position: 'absolute', left: `${p.x}vw`, top: `${p.y}vh`, width: p.size, height: p.size, background: p.color, animationDelay: `${p.delay}s` }} />)}
      </div>
      <div style={{ transform: `translate3d(0, ${-scrollY * 0.3}px, 0)`, willChange: 'transform' }}>
        {STAR_LAYERS[1].map(p => <div key={p.id} className="twinkle" style={{ position: 'absolute', left: `${p.x}vw`, top: `${p.y}vh`, width: p.size, height: p.size, background: p.color, animationDelay: `${p.delay}s` }} />)}
      </div>
      <div style={{ transform: `translate3d(0, ${-scrollY * 0.5}px, 0)`, willChange: 'transform' }}>
        {STAR_LAYERS[2].map(p => <div key={p.id} className="twinkle" style={{ position: 'absolute', left: `${p.x}vw`, top: `${p.y}vh`, width: p.size, height: p.size, background: p.color, animationDelay: `${p.delay}s` }} />)}
      </div>
    </div>
  )
})

// ─── Scanlines ────────────────────────────────────────────────────────────────

function Scanlines() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none',
      background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)',
    }} />
  )
}

// ─── Vines & Leaves ──────────────────────────────────────────────────────────

const VINE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='64'%3E%3Crect x='4' y='0' width='6' height='64' fill='%23344B35' /%3E%3Crect x='10' y='8' width='12' height='6' fill='%23557A45' /%3E%3Crect x='10' y='14' width='8' height='4' fill='%23344B35' /%3E%3Crect x='0' y='28' width='10' height='6' fill='%23557A45' /%3E%3Crect x='2' y='34' width='6' height='4' fill='%23344B35' /%3E%3Crect x='10' y='48' width='16' height='8' fill='%23557A45' /%3E%3Crect x='12' y='56' width='10' height='4' fill='%23344B35' /%3E%3C/svg%3E`

function Vines() {
  return (
    <>
      <div className="vine-left hidden md:block" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 48, zIndex: 148, pointerEvents: 'none',
        background: `url("${VINE_SVG}") repeat-y`,
        backgroundSize: '48px 96px',
        imageRendering: 'pixelated'
      }} />
      <div className="vine-right hidden md:block" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 48, zIndex: 148, pointerEvents: 'none',
        background: `url("${VINE_SVG}") repeat-y`,
        backgroundSize: '48px 96px',
        imageRendering: 'pixelated'
      }} />
    </>
  )
}

function FallingLeaves() {
  const leaves = useRef(Array.from({ length: 25 }, (_, i) => {
    const dur = 8 + Math.random() * 10;
    const steps = Math.floor(dur * 15);
    return {
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * -20,
      dur,
      steps,
      size: Math.random() > 0.5 ? 6 : 10,
      color: Math.random() > 0.5 ? 'var(--forest)' : 'var(--forest-dark)',
    }
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 147, overflow: 'hidden' }}>
      {leaves.current.map(l => (
        <div key={l.id} className="pixel-leaf" style={{
          position: 'absolute',
          left: `${l.left}%`,
          top: -30,
          width: l.size, height: Math.floor(l.size * 1.3),
          background: l.color,
          animation: `leafFall ${l.dur}s ${l.delay}s infinite`,
          animationTimingFunction: `steps(${l.steps}, end)`,
        }} />
      ))}
    </div>
  )
}

// ─── Pixel reveal text ────────────────────────────────────────────────        

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
  hp: 'repeating-linear-gradient(90deg,var(--hp) 0,var(--hp) 12px,#803030 12px,#803030 16px)',
  mana: 'repeating-linear-gradient(90deg,var(--mana) 0,var(--mana) 12px,#355070 12px,#355070 16px)',
  stamina: 'repeating-linear-gradient(90deg,var(--forest) 0,var(--forest) 12px,var(--forest-dark) 12px,var(--forest-dark) 16px)',
  xp: 'repeating-linear-gradient(90deg,var(--gold) 0,var(--gold) 12px,var(--gold-dark) 12px,var(--gold-dark) 16px)',
}

function PixelBar({ value, color = 'hp', triggered }: { value: number; color?: string; triggered: boolean }) {
  return (
    <div style={{ height: 16, background: 'var(--bg)', border: '3px solid var(--stone)', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        background: BAR_COLORS[color] ?? BAR_COLORS.hp,
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
  return <>{out}<span style={{ animation: 'blink 1s step-start infinite', color: 'var(--gold)' }}>█</span></>
}

// ─── SECTION 1: HERO ─────────────────────────────────────────────────────────

const HeroSection = React.memo(function HeroSection({ scrollY }: { scrollY: number }) {
  const { ref, inView } = useInView(0.1)
  const scale = Math.max(0.88, 1 - scrollY * 0.00015)
  const opacity = Math.max(0, 1 - scrollY * 0.0015)

  return (
    <section id="hero" ref={ref as React.RefObject<HTMLElement>} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', paddingTop: 60,
    }}>
      {/* Grid bg */}
      <div className="grid-bg" style={{
        position: 'absolute', inset: 0,
        transform: `translateY(${scrollY * 0.15}px)`,
      }} />

      {/* Parallax mountain layers */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, transform: `translateY(${scrollY * 0.4}px)`, pointerEvents: 'none' }}>
        {/* Back mountains */}
        <svg viewBox="0 0 400 80" style={{ position: 'absolute', bottom: 0, width: '100%', height: 80 }} preserveAspectRatio="none">
          <polygon points="0,80 60,30 120,60 180,20 240,50 300,10 360,45 400,25 400,80" fill="var(--surface-light)" />
        </svg>
        {/* Front hills */}
        <svg viewBox="0 0 400 60" style={{ position: 'absolute', bottom: 0, width: '100%', height: 60 }} preserveAspectRatio="none">
          <polygon points="0,60 80,20 160,45 240,15 320,40 400,10 400,60" fill="var(--surface)" />
        </svg>
      </div>

      {/* Marquee */}
      <div style={{ position: 'absolute', top: 8, left: 0, right: 0, background: 'var(--gold-dark)', padding: '5px 0', overflow: 'hidden', zIndex: 2 }}>
        <div className="marquee-text" style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--bg)', letterSpacing: 3 }}>
          {'  ★ AVAILABLE FOR HIRE  ★  OPEN TO REMOTE  ★  SCROLL TO EXPLORE  ★  PIXEL BY PIXEL  ★  '.repeat(3)}
        </div>
      </div>

      <div className="container mx-auto max-w-6xl flex flex-col-reverse md:flex-row items-center justify-between gap-12" style={{ transform: `scale(${scale})`, opacity, transition: 'transform 0.05s,opacity 0.05s', position: 'relative', zIndex: 2, padding: '0 24px' }}>
        
        {/* Left: Info */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <PixelReveal inView={inView} delay={0}>
            <div className="section-label" style={{ marginBottom: 14 }}>★ PLAYER SELECT ★</div>
          </PixelReveal>
          <PixelReveal inView={inView} delay={100}>
            <h1 className="pixel-heading glow-gold" style={{ fontSize: 'clamp(22px,4vw,48px)', color: 'var(--gold)', lineHeight: 1.4, marginBottom: 20 }}>
              JONATHAN H. SARAGIH
            </h1>
          </PixelReveal>
          <PixelReveal inView={inView} delay={200}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 'clamp(9px,1.5vw,14px)', color: 'var(--gold)', marginBottom: 44, minHeight: 28 }}>
              <Typewriter text="INFORMATION SYSTEMS WIZARD" trigger={inView} />
            </div>
          </PixelReveal>

          {/* Stat cards */}
          <PixelReveal inView={inView} delay={300}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 44 }}>
              {[
                { label: 'AGE', value: '21', color: 'var(--gold)' },
                { label: 'BASE', value: 'JAKARTA', color: 'var(--hp)' },
                { label: 'GUILD', value: 'UBSI', color: 'var(--gold-light)' },
                { label: 'CLASS', value: 'SYS INFO', color: 'var(--forest)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface)', border: '3px solid var(--stone)', padding: '14px 18px', textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: 20, color: s.color, marginBottom: 6 }}>{s.value}</div>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </PixelReveal>

          <PixelReveal inView={inView} delay={400}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="#projects" className="pixel-btn">▶ VIEW WORK</a>
              <a href="#contact" className="pixel-btn pixel-btn-parchment">✉ HIRE ME</a>
            </div>
          </PixelReveal>
        </div>

        {/* Right: Avatar */}
        <div style={{ flex: '0 0 auto', position: 'relative' }}>
          <PixelReveal inView={inView} delay={200} dir="left">
            <div className="float w-[280px] h-[280px] md:w-[340px] md:h-[340px]" style={{ position: 'relative' }}>
              {/* Vine Frame Wrapper */}
              <div style={{
                position: 'absolute', inset: -16,
                background: 'var(--forest-dark)',
                borderRadius: '50%',
                border: '6px solid var(--stone)',
                boxShadow: '8px 8px 0 rgba(0,0,0,0.8)',
                overflow: 'hidden'
              }}>
                {/* Vines overlay inside the frame */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 48,
                  background: `url("${VINE_SVG}") repeat-y`, backgroundSize: '48px 96px', opacity: 0.8
                }} />
                <div style={{
                  position: 'absolute', right: 0, top: 0, bottom: 0, width: 48,
                  background: `url("${VINE_SVG}") repeat-y`, backgroundSize: '48px 96px', opacity: 0.8, transform: 'scaleX(-1)'
                }} />
                <div style={{
                  position: 'absolute', right: 0, top: 0, left: 0, height: 48,
                  background: `url("${VINE_SVG}") repeat-x`, backgroundSize: '48px 96px', opacity: 0.8, transform: 'rotate(90deg) translateY(-24px)'
                }} />
                <div style={{
                  position: 'absolute', right: 0, bottom: 0, left: 0, height: 48,
                  background: `url("${VINE_SVG}") repeat-x`, backgroundSize: '48px 96px', opacity: 0.8, transform: 'rotate(-90deg) translateY(-24px)'
                }} />
              </div>

              {/* Image */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid var(--forest)',
                background: 'var(--surface-light)'
              }}>
                <img src={jonathanImg} alt="Jonathan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </PixelReveal>
        </div>

      </div>

      {/* Scroll Hint */}
      <div style={{ position: 'absolute', bottom: 120, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
        <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--text-muted)', animation: 'blink 1.2s step-start infinite' }}>
          ↓ SCROLL TO CONTINUE ↓
        </div>
      </div>
    </section>
  )
})

// ─── SECTION 2: ABOUT ─────────────────────────────────────────────────────────

const AboutSection = React.memo(function AboutSection() {
  const { ref, inView } = useInView(0.15)
  return (
    <section id="about" ref={ref as React.RefObject<HTMLElement>} style={{ minHeight: '100vh', padding: '100px 24px', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <PixelReveal inView={inView} delay={0}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label" style={{ marginBottom: 12, color: 'var(--hp)' }}>// STAGE 2 — HERO BIO</div>
            <h2 className="pixel-heading" style={{ fontSize: 22, color: 'var(--hp)', textShadow: '0 0 20px rgba(169,68,66,0.6)' }}>
              ABOUT ME
            </h2>
          </div>
        </PixelReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 items-start" style={{ gap: 48 }}>
          <div>
            <PixelReveal inView={inView} delay={150} dir="left">
              <div className="dialogue-box" style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: 'var(--text-muted)', marginBottom: 14 }}>JONATHAN says:</div>
                <p style={{ fontSize: 19, lineHeight: 1.85, color: 'var(--text)' }}>
                  Halo! I'm Jonathan (21), a tech-obsessed adventurer based in Jakarta, Indonesia. Currently leveling up my academic stats by studying Information Systems at UBSI.
                </p>
                <p style={{ fontSize: 19, lineHeight: 1.85, color: 'var(--text-muted)', marginTop: 14 }}>
                  When I'm not grinding XP on coding and tech projects, you'll probably find me exploring virtual worlds in games, or diving deep into anime and manga lore!
                </p>
              </div>
            </PixelReveal>

            <PixelReveal inView={inView} delay={280} dir="left">
              <div style={{ background: 'var(--surface)', border: '3px solid var(--stone)', padding: 20 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: 'var(--text-muted)', marginBottom: 16 }}>CHARACTER VITALS</div>
                {[
                  { label: 'HP', value: 98, color: 'hp' },
                  { label: 'MANA', value: 85, color: 'mana' },
                  { label: 'STAMINA', value: 92, color: 'stamina' },
                ].map(s => (
                  <div key={s.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: 'var(--text-muted)' }}>{s.label}</span>
                      <span style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: s.color === 'hp' ? 'var(--hp)' : 'var(--gold)' }}>{s.value}/100</span>
                    </div>
                    <PixelBar value={s.value} color={s.color} triggered={inView} />
                  </div>
                ))}
              </div>
            </PixelReveal>
          </div>

          <PixelReveal inView={inView} delay={200} dir="right">
            <div style={{ background: 'var(--surface)', border: '4px solid var(--gold)', boxShadow: '0 0 24px rgba(196,154,69,0.25), 4px 4px 0 rgba(0,0,0,0.8)', padding: 28 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 80, marginBottom: 10 }}>👾</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: 'var(--gold)' }}>JONATHAN H.S</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--text-muted)', marginTop: 8 }}>CLASS: INFO SYSTEMS WIZARD LV.21</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10, marginBottom: 20 }}>
                {[
                  { k: 'INT', v: 'Tech Savvy', e: '⚡' },
                  { k: 'DEX', v: 'Gaming', e: '🎮' },
                  { k: 'WIS', v: 'Academics', e: '📚' },
                  { k: 'CHR', v: 'Otaku', e: '🎌' },
                  { k: 'VIT', v: 'Student', e: '🎓' },
                  { k: 'LCK', v: 'Gacha', e: '🎲' },
                ].map(s => (
                  <div key={s.k} style={{ background: 'var(--bg)', border: '2px solid var(--stone)', padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 14 }}>{s.e}</span>
                    <div>
                      <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: 'var(--text-muted)' }}>{s.k}</div>
                      <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--text)' }}>{s.v}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '2px solid var(--stone)', paddingTop: 16 }}>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--text-muted)', marginBottom: 10 }}>EQUIPPED</div>
                {['VS Code ⚔️', 'Gaming PC 🕹️', 'Anime Watchlist 📺', 'Manga Volumes 📓'].map(e => (
                  <div key={e} style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--gold-light)', marginBottom: 6 }}>▸ {e}</div>
                ))}
              </div>
            </div>
          </PixelReveal>
        </div>
      </div>
    </section>
  )
})

// ─── SECTION 3: SKILLS ────────────────────────────────────────────────────────

const skills = [
  { name: 'React / TypeScript', value: 95, color: 'hp' },
  { name: 'Node.js / Backend',  value: 88, color: 'mana' },
  { name: 'WebGL / Three.js',   value: 72, color: 'xp' },
  { name: 'Rust / Systems',     value: 65, color: 'stamina' },
  { name: 'UI / Design',        value: 90, color: 'hp' },
  { name: 'DevOps / Cloud',     value: 80, color: 'xp' },
]

const SkillsSection = React.memo(function SkillsSection() {
  const { ref, inView } = useInView(0.15)
  return (
    <section id="skills" ref={ref as React.RefObject<HTMLElement>} style={{ minHeight: '100vh', padding: '100px 24px', background: 'transparent', position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Dither overlay */}
      <div className="dither" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', zIndex: 1 }}>
        <PixelReveal inView={inView}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label" style={{ marginBottom: 12, color: 'var(--gold-light)' }}>// STAGE 3 — SKILL TREE</div>
            <h2 className="pixel-heading" style={{ fontSize: 22, color: 'var(--gold-light)', textShadow: '0 0 20px rgba(224,188,99,0.5)' }}>ALLOCATE POINTS</h2>
            <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 18 }}>8 years of grinding XP</p>
          </div>
        </PixelReveal>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 32, marginBottom: 56 }}>
          {skills.map((sk, i) => (
            <PixelReveal key={sk.name} inView={inView} delay={i * 90} dir={i % 2 === 0 ? 'left' : 'right'}>
              <div style={{ background: 'rgba(42, 32, 32, 0.6)', padding: 16, border: '2px solid var(--stone)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: 9, color: 'var(--text)' }}>{sk.name}</span>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: 9, color: 'var(--text-muted)' }}>{sk.value}%</span>
                </div>
                <PixelBar value={sk.value} color={sk.color} triggered={inView} />
              </div>
            </PixelReveal>
          ))}
        </div>

        <PixelReveal inView={inView} delay={500}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: 'var(--text-muted)', marginBottom: 18 }}>— INVENTORY —</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {['React','TypeScript','Node.js','Next.js','Rust','PostgreSQL','Redis','Docker','AWS','Three.js','GraphQL','WebGL','Figma','Git'].map((t, i) => (
                <span key={t} className="pixel-tag" style={{
                  borderColor: ['var(--gold)','var(--hp)','var(--mana)','var(--forest)','var(--parchment)'][i % 5],
                  color: ['var(--gold)','var(--hp)','var(--mana)','var(--forest)','var(--parchment)'][i % 5],
                }}>{t}</span>
              ))}
            </div>
          </div>
        </PixelReveal>
      </div>
    </section>
  )
})

// ─── SECTION 4: PROJECTS ──────────────────────────────────────────────────────

const projects = [
  { title: 'DUNGEONCRAFT', type: 'GAME / WEBGL', desc: 'Procedurally generated dungeon crawler with Three.js + WASM. Real-time lighting, 16-bit sprite animations.', tags: ['Three.js','WASM','Rust','WebGL'], color: 'xp', hp: 92, icon: '⚔️', year: '2024' },
  { title: 'PIXELVAULT',   type: 'APP / WEB3',  desc: 'NFT gallery with pixel-art generation. Mint and trade 16-bit collectibles on-chain. 10K unique characters.', tags: ['React','Solidity','IPFS','Ethers.js'], color: 'mana', hp: 85, icon: '💎', year: '2024' },
  { title: 'SYNTHWAVE OS', type: 'UI / DESIGN',  desc: 'Retro-futuristic design system with 80+ components. Full dark mode, animations, pixel-perfect docs.', tags: ['TypeScript','Storybook','CSS','Figma'], color: 'hp', hp: 78, icon: '🖥️', year: '2023' },
  { title: 'CHRONOBIT',   type: 'TOOL / APP',   desc: 'Time tracking app with RPG mechanics. Level up your skills by logging work sessions. Boss battles for deadlines.', tags: ['React','Supabase','Node.js','PWA'], color: 'stamina', hp: 95, icon: '⏱️', year: '2023' },
]

const CM: Record<string, { border: string; shadow: string }> = {
  xp:    { border: 'var(--gold)', shadow: 'rgba(196,154,69,0.3)' },
  mana: { border: 'var(--mana)', shadow: 'rgba(73,106,155,0.3)' },
  hp:  { border: 'var(--hp)', shadow: 'rgba(169,68,66,0.3)' },
  stamina:   { border: 'var(--forest)', shadow: 'rgba(85,122,69,0.3)' },
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
          background: 'var(--surface)',
          border: `4px solid ${hov ? c.border : 'var(--stone)'}`,
          boxShadow: hov ? `0 0 24px ${c.shadow}, 4px 4px 0 #000` : '4px 4px 0 #000',
          padding: 24, cursor: 'pointer', position: 'relative',
          transform: hov ? 'translate(-4px,-4px)' : 'none',
          transition: 'border-color 0.12s, box-shadow 0.12s, transform 0.15s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--text-muted)', marginBottom: 8 }}>{p.type}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: c.border }}>{p.title}</span>
            </div>
          </div>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--text-muted)' }}>{p.year}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--text-muted)' }}>COMPLETION</span>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: c.border }}>{p.hp}%</span>
          </div>
          <PixelBar value={p.hp} color={p.color} triggered={triggered} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 17, lineHeight: 1.75, marginBottom: 16 }}>{p.desc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {p.tags.map(t => <span key={t} className="pixel-tag" style={{ borderColor: c.border, color: c.border, fontSize: 7 }}>{t}</span>)}
        </div>
        {hov && <div style={{ position: 'absolute', top: 12, right: 12, fontFamily: "'Press Start 2P'", fontSize: 8, color: c.border, animation: 'blink 0.6s step-start infinite' }}>▶ SELECT</div>}
      </div>
    </PixelReveal>
  )
}

const ProjectsSection = React.memo(function ProjectsSection() {
  const { ref, inView } = useInView(0.1)
  return (
    <section id="projects" ref={ref as React.RefObject<HTMLElement>} style={{ minHeight: '100vh', padding: '100px 24px', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <PixelReveal inView={inView}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label" style={{ marginBottom: 12, color: 'var(--forest)' }}>// STAGE 4 — QUEST LOG</div>
            <h2 className="pixel-heading" style={{ fontSize: 22, color: 'var(--forest)', textShadow: '0 0 20px rgba(85,122,69,0.5)' }}>COMPLETED MISSIONS</h2>
          </div>
        </PixelReveal>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 24 }}>
          {projects.map((p, i) => <ProjectCard key={p.title} p={p} i={i} triggered={inView} />)}
        </div>
        <PixelReveal inView={inView} delay={400}>
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <a href="#contact" className="pixel-btn pixel-btn-parchment">★ START A NEW QUEST</a>
          </div>
        </PixelReveal>
      </div>
    </section>
  )
})

// ─── SECTION 5: CONTACT ───────────────────────────────────────────────────────

const ContactSection = React.memo(function ContactSection() {
  const { ref, inView } = useInView(0.15)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', msg: '' })

  return (
    <section id="contact" ref={ref as React.RefObject<HTMLElement>} style={{ minHeight: '100vh', padding: '100px 24px 180px', background: 'transparent', display: 'flex', alignItems: 'center', position: 'relative' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
        <PixelReveal inView={inView}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="section-label" style={{ marginBottom: 12, color: 'var(--mana)' }}>// STAGE 5 — FINAL BOSS</div>
            <h2 className="pixel-heading" style={{ fontSize: 22, color: 'var(--mana)', textShadow: '0 0 20px rgba(73,106,155,0.5)' }}>SEND A MESSAGE</h2>
            <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 18 }}>Response within 24 hours ⚡</p>
          </div>
        </PixelReveal>

        {sent ? (
          <PixelReveal inView dir="up">
            <div className="dialogue-box" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: 14, color: 'var(--forest)', marginBottom: 16 }}>SENT!</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 18 }}>Quest request submitted! I'll respond within 24 hours.</p>
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
                  <label style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>▸ {f.label}</label>
                  <input type={f.type} placeholder={f.ph} required
                    value={form[f.id as keyof typeof form]}
                    onChange={e => setForm(v => ({ ...v, [f.id]: e.target.value }))}
                    style={{ width: '100%', background: 'var(--bg)', border: '3px solid var(--stone)', color: 'var(--text)', padding: '14px 16px', fontFamily: "'VT323',monospace", fontSize: 20, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.1s, box-shadow 0.1s' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 12px rgba(196,154,69,0.3)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--stone)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>▸ MESSAGE</label>
                <textarea placeholder="Describe your quest..." required rows={5}
                  value={form.msg}
                  onChange={e => setForm(v => ({ ...v, msg: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg)', border: '3px solid var(--stone)', color: 'var(--text)', padding: '14px 16px', fontFamily: "'VT323',monospace", fontSize: 20, outline: 'none', resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.1s, box-shadow 0.1s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 12px rgba(196,154,69,0.3)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--stone)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <button type="submit" className="pixel-btn" style={{ alignSelf: 'flex-start' }}>▶ SUBMIT QUEST</button>
            </form>
          </PixelReveal>
        )}

        <PixelReveal inView={inView} delay={300}>
          <div style={{ marginTop: 52, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { l: 'GITHUB', icon: '🐙', c: 'var(--text)' },
              { l: 'TWITTER', icon: '🐦', c: 'var(--mana)' },
              { l: 'LINKEDIN', icon: '💼', c: 'var(--gold-light)' },
              { l: 'DRIBBBLE', icon: '🏀', c: 'var(--hp)' },
            ].map(s => (
              <a key={s.l} href="#" style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: s.c, background: 'var(--surface)', border: '3px solid var(--stone)', padding: '12px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'border-color 0.1s,transform 0.1s,box-shadow 0.1s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = s.c; el.style.transform = 'translate(-2px,-2px)'; el.style.boxShadow = `0 0 14px ${s.c}` }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--stone)'; el.style.transform = 'none'; el.style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: 16 }}>{s.icon}</span>{s.l}
              </a>
            ))}
          </div>
        </PixelReveal>
      </div>
    </section>
  )
})

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = React.memo(function Footer() {
  return <div style={{ height: 450, pointerEvents: 'none' }} /> // Spacer for the dynamic footer cave
})

// ─── Loading Screen ───────────────────────────────────────────────────────────

const CLOUD_CONFIGS = Array.from({ length: 35 }).map((_, i) => {
  const size = 30 + Math.random() * 250
  
  // Spread clouds using a grid to prevent clumping
  const cols = 7
  const col = i % cols
  const row = Math.floor(i / cols)
  
  // Base positions from -10% to 110%
  const baseLeft = (col / cols) * 120 - 10
  const baseTop = (row / 5) * 120 - 10
  
  // Jitter (+/- 10%)
  const top = baseTop + (Math.random() * 20 - 10)
  const left = baseLeft + (Math.random() * 20 - 10)

  return {
    id: i,
    src: Math.random() > 0.5 ? cloudImg1 : cloudImg2,
    size: size,
    top: `${top}%`,
    left: `${left}%`,
    duration: 3 + Math.random() * 4,
    delay: -(Math.random() * 5),
    reverse: Math.random() > 0.5,
    zIndex: Math.floor(size / 30),
    opacity: 0.4 + (size / 280) * 0.6, // bigger clouds are more opaque
  }
})

function LoadingScreen({ zooming, onStart }: { zooming: boolean, onStart: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (progress >= 100) return
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 1, 100))
    }, 60) // 60ms * 100 = 6000ms (6 seconds)
    return () => clearInterval(interval)
  }, [progress])

  return (
    <div className={`loading-screen ${zooming ? 'zooming' : ''}`}>
      {CLOUD_CONFIGS.map(c => (
        <img
          key={c.id}
          src={c.src}
          className={`pixel-cloud ${c.reverse ? 'reverse' : ''}`}
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            zIndex: c.zIndex,
            opacity: c.opacity,
          }}
          alt=""
        />
      ))}

      <div style={{ position: 'relative', zIndex: 100, textAlign: 'center' }}>
        <h1 className="pixel-heading" style={{ color: 'var(--text)', fontSize: 'clamp(24px, 5vw, 48px)', marginBottom: 40, textShadow: '4px 4px 0 var(--bg)' }}>
          PORTFOLIO OS
        </h1>
        
        {progress < 100 ? (
          <div style={{ width: '80vw', maxWidth: 500, margin: '0 auto', background: 'var(--bg)', border: '4px solid var(--stone)', padding: 4 }}>
            <div style={{ width: `${progress}%`, height: 24, background: 'var(--gold)', transition: 'width 0.1s linear' }} />
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: 'var(--text)', marginTop: 14 }}>
              LOADING... {progress}%
            </div>
          </div>
        ) : !zooming && (
          <button className="pixel-btn pixel-btn-parchment" onClick={onStart} style={{ fontSize: 16, padding: '16px 32px', animation: 'blink 1.5s step-start infinite' }}>
            PRESS START
          </button>
        )}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const scrollY = useScrollY()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [footerExpansion, setFooterExpansion] = useState(0)
  const activeSection = useSectionInView(['hero','about','skills','projects','contact'])

  const [appState, setAppState] = useState<'booting' | 'zooming' | 'entered'>('booting')

  const bgmLoadingRef = useRef<HTMLAudioElement>(null)
  const bgmMainRef = useRef<HTMLAudioElement>(null)
  const sfxStartRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    let playOnInteract: () => void;

    if (appState === 'booting') {
      // Try to play immediately
      bgmLoadingRef.current?.play().catch(() => {})

      // Also set up a listener just in case it was blocked or pending
      playOnInteract = () => {
        if (appState === 'booting' && bgmLoadingRef.current?.paused) {
          bgmLoadingRef.current?.play().catch(() => {})
        }
      }
      
      window.addEventListener('click', playOnInteract)
      window.addEventListener('keydown', playOnInteract)
      window.addEventListener('touchstart', playOnInteract)
      
    } else if (appState === 'zooming') {
      bgmLoadingRef.current?.pause()
      sfxStartRef.current?.play().catch(() => {})
    } else if (appState === 'entered') {
      bgmMainRef.current?.play().catch(() => {})
      bgmMainRef.current!.volume = 0.5
    }

    return () => {
      if (playOnInteract) {
        window.removeEventListener('click', playOnInteract)
        window.removeEventListener('keydown', playOnInteract)
        window.removeEventListener('touchstart', playOnInteract)
      }
    }
  }, [appState])

  useEffect(() => {
    let ticking = false
    const fn = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const h = document.documentElement.scrollHeight - window.innerHeight
          setScrollProgress(h > 0 ? window.scrollY / h : 0)
          
          const dist = h > 0 ? h - window.scrollY : 0
          setFooterExpansion(Math.max(0, 450 - dist))
          
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', animation: 'none' }}>
      <audio ref={bgmLoadingRef} src="/audio/press-start-bgm.mp3" loop />
      <audio ref={bgmMainRef} src="/audio/medieval.mp3" loop />
      <audio ref={sfxStartRef} src="/audio/press-start-sfx.mp3" />

      {(appState === 'booting' || appState === 'zooming') && (
        <LoadingScreen 
          zooming={appState === 'zooming'} 
          onStart={() => {
            window.scrollTo(0, 0)
            setAppState('zooming')
            setTimeout(() => setAppState('entered'), 1500)
          }} 
        />
      )}

      {/* We apply the transform (zoom in) ONLY to the scrollable sections, 
          because CSS transform breaks position: fixed elements! */}
      <div className={`app-content ${appState === 'entered' ? 'entered' : 'entering'}`}>
        <Stars scrollY={scrollY} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <HeroSection scrollY={scrollY} />
          <AboutSection />
          <SkillsSection />
          <ProjectsSection />
          <ContactSection />
          <Footer />
        </div>
      </div>

      {/* Fixed UI elements are placed outside the transformed container 
          so they correctly stick to the viewport. We just fade them in. */}
      <div style={{
        opacity: appState === 'entered' ? 1 : 0,
        transition: 'opacity 1.5s ease',
        pointerEvents: appState === 'entered' ? 'auto' : 'none'
      }}>
        <ProgressStrip progress={scrollProgress} />
        <StageHUD active={activeSection} />
        <Vines />
        <FallingLeaves />
        <Walker progress={scrollProgress} expansion={footerExpansion} />
        <GroundTrack expansion={footerExpansion} />
      </div>
    </div>
  )
}
