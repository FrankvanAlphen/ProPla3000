import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { T } from '../../styles/tokens'
import { Spinner } from '../ui/index.jsx'
import { relatieveDatum } from '../../lib/helpers'

const ACTIE_LABELS = {
  fase_gewijzigd:      { label: 'Fase gewijzigd',       icoon: '→', kleur: '#7C3AED' },
  project_bijgewerkt:  { label: 'Project bijgewerkt',   icoon: '✎', kleur: T.purple  },
  taak_afgerond:       { label: 'Taak afgerond',        icoon: '✓', kleur: T.green   },
  taak_bijgewerkt:     { label: 'Taak bijgewerkt',      icoon: '○', kleur: T.textMuted },
  blokkade_gemeld:     { label: 'Blokkade gemeld',      icoon: '⊗', kleur: T.red     },
  blokkade_opgelost:   { label: 'Blokkade opgelost',    icoon: '✓', kleur: T.green   },
  besluit_toegevoegd:  { label: 'Besluit toegevoegd',   icoon: '◈', kleur: T.amber   },
  besluit_vastgelegd:  { label: 'Besluit vastgelegd',   icoon: '✓', kleur: T.green   },
}

export function Historie({ projectId }) {
  const [items, setItems] = useState([])
  const [laden, setLaden] = useState(true)

  useEffect(() => {
    if (!projectId) return
    supabase
      .from('geschiedenis')
      .select('*, profielen(naam)')
      .eq('project_id', projectId)
      .order('aangemaakt_op', { ascending: false })
      .limit(100)
      .then(({ data }) => { setItems(data ?? []); setLaden(false) })
  }, [projectId])

  if (laden) return <Spinner tekst="Geschiedenis ophalen…" />

  return (
    <div style={{ padding: 28, maxWidth: 700 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>Historie</div>
      <div style={{ fontSize: 13, color: T.textSecond, marginBottom: 20 }}>Alle activiteit op dit project</div>

      {items.length === 0 ? (
        <div style={{ color: T.textMuted, fontSize: 13 }}>Nog geen activiteit geregistreerd.</div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Tijdlijnlijn */}
          <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0, width: 2, background: T.border }} />
          {items.map(item => {
            const meta = ACTIE_LABELS[item.actie] || { label: item.actie, icoon: '○', kleur: T.textMuted }
            return (
              <div key={item.id} style={{ display: 'flex', gap: 16, marginBottom: 16, position: 'relative' }}>
                {/* Icoon */}
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${meta.kleur}15`, border: `2px solid ${meta.kleur}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, fontSize: 13, color: meta.kleur, fontWeight: 700 }}>
                  {meta.icoon}
                </div>
                {/* Inhoud */}
                <div style={{ flex: 1, paddingTop: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{meta.label}</span>
                      {item.profielen?.naam && (
                        <span style={{ fontSize: 12, color: T.textMuted }}> door {item.profielen.naam}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: T.textMuted, whiteSpace: 'nowrap' }}>
                      {relatieveDatum(item.aangemaakt_op?.slice(0,10))}
                    </span>
                  </div>
                  {item.details && Object.keys(item.details).length > 0 && (
                    <div style={{ fontSize: 12, color: T.textSecond, marginTop: 4, lineHeight: 1.5 }}>
                      {item.details.nieuwe_fase && `→ ${item.details.nieuwe_fase}`}
                      {item.details.titel && `"${item.details.titel}"`}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
