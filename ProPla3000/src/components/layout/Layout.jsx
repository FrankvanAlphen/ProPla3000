import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { T } from '../../styles/tokens'

const NAV_ITEMS = [
  { pad: '/',       label: 'Projectenboard', icoon: '▦' },
  { pad: '/beheer', label: 'Beheer',         icoon: '⚙' },
]

export function Zijbalk() {
  const { gebruiker, profiel, uitloggen } = useAuth()
  const locatie = useLocation()

  return (
    <div style={{
      width: T.navWidth, flexShrink: 0, background: T.white,
      borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column',
      minHeight: '100vh', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, background: T.purple, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: T.lime, fontSize: 15, fontWeight: 900 }}>P</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.01em' }}>
              Planner<span style={{ color: T.purple }}>++</span>
            </div>
            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Project Cockpit
            </div>
          </div>
        </div>
      </div>

      {/* Navigatie */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted, padding: '4px 8px 8px' }}>
          Menu
        </div>
        {NAV_ITEMS.map(item => {
          const actief = locatie.pathname === item.pad
          return (
            <Link key={item.pad} to={item.pad} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                borderRadius: T.radiusSm, fontSize: 13,
                fontWeight: actief ? 700 : 400,
                background: actief ? T.purpleLight : 'transparent',
                color: actief ? T.purple : T.textSecond,
                marginBottom: 2, cursor: 'pointer',
              }}>
                <span style={{ fontSize: 14 }}>{item.icoon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Gebruikersprofiel */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
            {(profiel?.naam || gebruiker?.email || 'G').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profiel?.naam || gebruiker?.email}
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'capitalize' }}>
              {profiel?.rol || 'contributor'}
            </div>
          </div>
        </div>
        <button onClick={uitloggen} style={{
          width: '100%', padding: '6px 10px', background: T.bgPage, border: `1px solid ${T.border}`,
          borderRadius: T.radiusSm, fontSize: 12, color: T.textSecond, cursor: 'pointer', fontFamily: T.fontBase,
        }}>
          Uitloggen
        </button>
      </div>
    </div>
  )
}

export function Topbalk({ titel, broodkruimel }) {
  return (
    <div style={{
      background: T.white, borderBottom: `1px solid ${T.border}`,
      padding: '0 28px', height: 52, display: 'flex', alignItems: 'center', gap: 8,
      position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
    }}>
      {broodkruimel ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {broodkruimel.map((item, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span style={{ color: T.textMuted }}>›</span>}
              {item.pad ? (
                <Link to={item.pad} style={{ fontSize: 13, color: T.purple, fontWeight: 600, textDecoration: 'none' }}>{item.label}</Link>
              ) : (
                <span style={{ fontSize: 13, color: T.textPrimary, fontWeight: 600 }}>{item.label}</span>
              )}
            </span>
          ))}
        </div>
      ) : (
        <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{titel}</span>
      )}
    </div>
  )
}

export function HoofdLay_out({ kinderen }) {
  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <Zijbalk />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {kinderen}
      </div>
    </div>
  )
}
