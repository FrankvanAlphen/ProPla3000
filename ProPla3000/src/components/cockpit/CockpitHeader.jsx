import { T } from '../../styles/tokens'
import { GezondheidsBadge, FaseBadge } from '../ui/index.jsx'
import { relatieveDatum } from '../../lib/helpers'

export function CockpitHeader({ project, openBlokkades, openBesluiten, verlate, actieveTab, onTabWissel }) {
  const TABS = [
    { id: 'overzicht',  label: 'Overzicht',      icoon: '⊙' },
    { id: 'taken',      label: 'Taken & Planning',icoon: '☰' },
    { id: 'tijdlijn',   label: 'Tijdlijn',        icoon: '━' },
    { id: 'blokkades',  label: 'Blokkades',       icoon: '⊗', badge: openBlokkades },
    { id: 'besluiten',  label: 'Besluiten',       icoon: '◈', badge: openBesluiten },
    { id: 'historie',   label: 'Historie',         icoon: '↻' },
  ]

  return (
    <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      {/* Projectkop */}
      <div style={{
        background: `linear-gradient(135deg, ${T.purple} 0%, ${T.purpleDark} 100%)`,
        padding: '18px 28px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
              PROJECT COCKPIT
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {project.titel}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>Eigenaar: {project.eigenaar_naam || '—'}</span>
              <span>Bijgewerkt: {relatieveDatum(project.bijgewerkt_op?.slice(0,10))}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <GezondheidsBadge gezondheid={project.gezondheid} />
            <FaseBadge fase={project.fase} />
          </div>
        </div>

        {/* Snelle signalen */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {openBlokkades > 0 && (
            <span style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 700 }}>⊗ {openBlokkades} blokkade{openBlokkades > 1 ? 's' : ''} open</span>
          )}
          {verlate > 0 && (
            <span style={{ fontSize: 12, color: '#FCD34D', fontWeight: 700 }}>▲ {verlate} verlate taken</span>
          )}
          {openBesluiten > 0 && (
            <span style={{ fontSize: 12, color: '#C4B5FD', fontWeight: 700 }}>◈ {openBesluiten} open besluit{openBesluiten > 1 ? 'en' : ''}</span>
          )}
          {openBlokkades === 0 && verlate === 0 && openBesluiten === 0 && (
            <span style={{ fontSize: 12, color: '#86EFAC', fontWeight: 700 }}>✓ Alles op schema</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '0 28px', gap: 0, overflowX: 'auto' }}>
        {TABS.map(tab => {
          const actief = actieveTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabWissel(tab.id)}
              style={{
                padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 13, fontWeight: actief ? 700 : 400, fontFamily: T.fontBase,
                color: actief ? T.purple : T.textSecond,
                borderBottom: `2px solid ${actief ? T.purple : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                transition: 'color 0.1s',
              }}
            >
              <span style={{ fontSize: 12 }}>{tab.icoon}</span>
              {tab.label}
              {tab.badge > 0 && (
                <span style={{ fontSize: 10, fontWeight: 800, background: T.red, color: '#fff', borderRadius: 10, padding: '0 5px', minWidth: 16, textAlign: 'center' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
