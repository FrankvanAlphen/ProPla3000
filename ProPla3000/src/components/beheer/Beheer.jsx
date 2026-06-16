import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { T, PHASES } from '../../styles/tokens'
import { Kaart, KaartLijf, SectieLabel, Modal, FormRij, Invoer, Selectie, Spinner } from '../ui/index.jsx'
import { Knop } from '../ui/Button.jsx'

// ── Gebruikersbeheer ───────────────────────────────────────────────────────
function GebruikersBeheer() {
  const [gebruikers, setGebruikers] = useState([])
  const [laden, setLaden] = useState(true)

  useEffect(() => {
    supabase.from('profielen').select('*').order('naam').then(({ data }) => {
      setGebruikers(data ?? [])
      setLaden(false)
    })
  }, [])

  async function rolWijzigen(id, rol) {
    setGebruikers(prev => prev.map(g => g.id === id ? { ...g, rol } : g))
    await supabase.from('profielen').update({ rol }).eq('id', id)
  }

  if (laden) return <Spinner />

  return (
    <Kaart stijl={{ marginBottom: 20 }}>
      <KaartLijf>
        <SectieLabel>Gebruikers & Rollen</SectieLabel>
        {gebruikers.length === 0 ? (
          <p style={{ fontSize: 13, color: T.textMuted }}>Geen gebruikers gevonden.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Naam', 'E-mail', 'Rol', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 8px', borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gebruikers.map(g => (
                <tr key={g.id}>
                  <td style={{ padding: '10px 8px', borderBottom: `1px solid ${T.border}`, fontWeight: 600, color: T.textPrimary }}>{g.naam || '—'}</td>
                  <td style={{ padding: '10px 8px', borderBottom: `1px solid ${T.border}`, color: T.textSecond }}>{g.email}</td>
                  <td style={{ padding: '10px 8px', borderBottom: `1px solid ${T.border}` }}>
                    <Selectie waarde={g.rol || 'contributor'} onChange={v => rolWijzigen(g.id, v)} stijl={{ width: 'auto' }}>
                      <option value="contributor">Contributor</option>
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </Selectie>
                  </td>
                  <td style={{ padding: '10px 8px', borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 11, color: T.textMuted }}>
                      {new Date(g.aangemaakt_op || '').toLocaleDateString('nl-NL') || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </KaartLijf>
    </Kaart>
  )
}

// ── Generiek lijstbeheer (thema's, projecttypes) ────────────────────────────
function LijstBeheer({ tabel, veldnaam, label }) {
  const [items, setItems]     = useState([])
  const [laden, setLaden]     = useState(true)
  const [nieuw, setNieuw]     = useState('')
  const [bewerken, setBewerken] = useState(null)

  useEffect(() => {
    supabase.from(tabel).select('*').order('naam').then(({ data }) => {
      setItems(data ?? [])
      setLaden(false)
    })
  }, [tabel])

  async function toevoegen() {
    if (!nieuw.trim()) return
    const { data } = await supabase.from(tabel).insert({ naam: nieuw }).select().single()
    if (data) { setItems(prev => [...prev, data]); setNieuw('') }
  }

  async function verwijderen(id) {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from(tabel).delete().eq('id', id)
  }

  if (laden) return <Spinner />

  return (
    <Kaart stijl={{ marginBottom: 20 }}>
      <KaartLijf>
        <SectieLabel>{label}</SectieLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={nieuw} onChange={e => setNieuw(e.target.value)} onKeyDown={e => e.key === 'Enter' && toevoegen()}
            placeholder={`Nieuwe ${veldnaam}…`}
            style={{ flex: 1, background: T.bgPage, border: `1px solid ${T.borderMid}`, borderRadius: T.radiusSm, color: T.textPrimary, fontSize: 13, padding: '7px 10px', outline: 'none', fontFamily: T.fontBase }} />
          <Knop variant="primair" onClick={toevoegen}>+ Toevoegen</Knop>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.purpleLight, borderRadius: 20, padding: '4px 10px 4px 12px', border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.purple }}>{item.naam}</span>
              <button onClick={() => verwijderen(item.id)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
            </div>
          ))}
          {items.length === 0 && <span style={{ fontSize: 12, color: T.textMuted }}>Nog niets toegevoegd.</span>}
        </div>
      </KaartLijf>
    </Kaart>
  )
}

// ── Fase-overzicht ─────────────────────────────────────────────────────────
function FaseOverzicht() {
  return (
    <Kaart stijl={{ marginBottom: 20 }}>
      <KaartLijf>
        <SectieLabel>Projectfases</SectieLabel>
        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>De projectfases zijn vast gedefinieerd in de applicatie.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PHASES.map((f, i) => (
            <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: f.bg, borderRadius: T.radiusSm, border: `1px solid ${f.rand}` }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.kleur }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: f.kleur }}>{i + 1}. {f.key}</span>
            </div>
          ))}
        </div>
      </KaartLijf>
    </Kaart>
  )
}

// ── Beheer hoofd ───────────────────────────────────────────────────────────
export function Beheer() {
  return (
    <div style={{ padding: 28, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.purple, marginBottom: 4 }}>SYSTEEM</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.02em', marginBottom: 2 }}>Beheer</div>
        <div style={{ fontSize: 13, color: T.textSecond }}>Gebruikers, rollen en stamdata beheren</div>
      </div>

      <GebruikersBeheer />
      <FaseOverzicht />
      <LijstBeheer tabel="themas"        veldnaam="thema"        label="Strategische thema's" />
      <LijstBeheer tabel="projecttypes"  veldnaam="projecttype"  label="Projecttypes" />
    </div>
  )
}
