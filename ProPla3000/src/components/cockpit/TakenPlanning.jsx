import { useState, useMemo } from 'react'
import { T, TAAK_STATUSSEN } from '../../styles/tokens'
import { Kaart, KaartLijf, SectieLabel, Modal, FormRij, Invoer, Selectie, LeegScherm } from '../ui/index.jsx'
import { Knop } from '../ui/Button.jsx'
import { isVerlaat, isOpRisico, dagenVanafVandaag, formateerDatum, vandaag } from '../../lib/helpers'

function StatusPill({ status }) {
  const MAP = {
    niet_gestart:  { label: 'Niet gestart', kleur: T.textMuted,  bg: T.bgPage,      rand: T.border      },
    actief:        { label: 'Actief',        kleur: T.purple,     bg: T.purpleLight, rand: T.border      },
    geblokkeerd:   { label: 'Geblokkeerd',   kleur: T.red,        bg: T.redLight,    rand: T.redBorder   },
    afgerond:      { label: 'Afgerond',      kleur: T.green,      bg: T.greenLight,  rand: T.greenBorder },
  }
  const s = MAP[status] || MAP.niet_gestart
  return (
    <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 9px', color: s.kleur, background: s.bg, border: `1px solid ${s.rand}`, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

function TaakRij({ taak, onUpdateTaak, onVerschuifTaak, onBewerken }) {
  const verlaat = isVerlaat(taak)
  const risico  = isOpRisico(taak)
  const isMijlpaal = taak.mijlpaal

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
      borderRadius: T.radiusSm, marginBottom: 4,
      background: isMijlpaal ? T.purpleLight : verlaat ? '#FFF5F5' : T.white,
      border: `1px solid ${isMijlpaal ? T.border : verlaat ? T.redBorder : T.border}`,
    }}>
      <span style={{ color: isMijlpaal ? T.purple : T.textMuted, fontSize: 14, flexShrink: 0 }}>
        {isMijlpaal ? '◆' : '○'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: isMijlpaal ? 700 : 500,
          color: taak.status === 'afgerond' ? T.textMuted : T.textPrimary,
          textDecoration: taak.status === 'afgerond' ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {taak.titel}
          {risico  && <span style={{ marginLeft: 8, fontSize: 11, color: T.amber, fontWeight: 700 }}>⚠ risico</span>}
          {verlaat && taak.status !== 'afgerond' && <span style={{ marginLeft: 8, fontSize: 11, color: T.red, fontWeight: 700 }}>▲ verlaat</span>}
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
          {taak.eigenaar && <span>{taak.eigenaar} · </span>}
          <span style={{ color: verlaat && taak.status !== 'afgerond' ? T.red : T.textMuted }}>
            {isMijlpaal ? formateerDatum(taak.einddatum) : `${formateerDatum(taak.startdatum)} → ${formateerDatum(taak.einddatum)}`}
          </span>
        </div>
      </div>
      <StatusPill status={taak.status} />
      {taak.status !== 'afgerond' && (
        <div style={{ display: 'flex', gap: 4 }}>
          {taak.status === 'niet_gestart' && !isMijlpaal && (
            <Knop klein variant="secundair" onClick={() => onUpdateTaak(taak.id, { status: 'actief' })}>Start</Knop>
          )}
          <Knop klein variant="succes" onClick={() => onUpdateTaak(taak.id, { status: 'afgerond' })}>
            {isMijlpaal ? 'Bereikt' : 'Klaar'}
          </Knop>
          <Knop klein variant="secundair" onClick={() => onVerschuifTaak(taak)}>Uitstellen</Knop>
        </div>
      )}
      <button onClick={() => onBewerken(taak)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 14, padding: '0 2px' }}>✎</button>
    </div>
  )
}

export function TakenPlanning({ taken, kanSchrijven, onUpdateTaak, onVoegTaakToe, onVerwijderTaak }) {
  const [zoekterm,   setZoekterm]   = useState('')
  const [eigenaarFilter, setEigenaarFilter] = useState('alle')
  const [toonAfgerond,  setToonAfgerond]  = useState(false)
  const [toevoegenBand,  setToevoegenBand]  = useState(null)
  const [bewerkTaak,    setBewerkTaak]    = useState(null)
  const [uitstellenTaak, setUitstellenTaak] = useState(null)
  const [uitstellenWeken, setUitstellenWeken] = useState(1)

  // Formulierstaten
  const [nTitel,  setNTitel]  = useState('')
  const [nEigenaar,setNEigenaar]= useState('')
  const [nStart,  setNStart]  = useState(vandaag)
  const [nEind,   setNEind]   = useState('')
  const [nType,   setNType]   = useState('taak')
  const [nStatus, setNStatus] = useState('niet_gestart')

  const eigenaren = useMemo(() => [...new Set(taken.filter(t => t.eigenaar).map(t => t.eigenaar))], [taken])

  const gefilterd = taken.filter(t => {
    if (eigenaarFilter !== 'alle' && t.eigenaar !== eigenaarFilter) return false
    if (zoekterm && !t.titel.toLowerCase().includes(zoekterm.toLowerCase())) return false
    return true
  })

  const banden = useMemo(() => ({
    verlaat:   gefilterd.filter(t => t.status !== 'afgerond' && isVerlaat(t)).sort((a,b) => a.einddatum.localeCompare(b.einddatum)),
    dezeWeek:  gefilterd.filter(t => { if (t.status === 'afgerond' || isVerlaat(t)) return false; const d = dagenVanafVandaag(t.einddatum); return d >= 0 && d <= 7; }).sort((a,b) => a.einddatum.localeCompare(b.einddatum)),
    volgend:   gefilterd.filter(t => { if (t.status === 'afgerond' || isVerlaat(t)) return false; const d = dagenVanafVandaag(t.einddatum); return d > 7 && d <= 21; }).sort((a,b) => a.einddatum.localeCompare(b.einddatum)),
    later:     gefilterd.filter(t => { if (t.status === 'afgerond' || isVerlaat(t)) return false; return dagenVanafVandaag(t.einddatum) > 21; }).sort((a,b) => a.einddatum.localeCompare(b.einddatum)),
    afgerond:  gefilterd.filter(t => t.status === 'afgerond').sort((a,b) => b.einddatum.localeCompare(a.einddatum)),
  }), [gefilterd])

  function resetFormulier() { setNTitel(''); setNEigenaar(''); setNStart(vandaag); setNEind(''); setNType('taak'); setNStatus('niet_gestart') }

  async function taakToevoegen(band) {
    if (!nTitel.trim()) return
    const einddatum = nEind || (band === 'verlaat' ? vandaag : band === 'dezeWeek' ? verschuifStr(vandaag, 5) : band === 'volgend' ? verschuifStr(vandaag, 14) : verschuifStr(vandaag, 30))
    await onVoegTaakToe({ titel: nTitel, eigenaar: nEigenaar, startdatum: nStart, einddatum, status: nStatus, mijlpaal: nType === 'mijlpaal' })
    resetFormulier()
    setToevoegenBand(null)
  }

  async function uitstellen() {
    if (!uitstellenTaak) return
    const dagen = uitstellenWeken * 7
    const nieuweEind  = verschuifStr(uitstellenTaak.einddatum,  dagen)
    const nieuweStart = verschuifStr(uitstellenTaak.startdatum, dagen)
    await onUpdateTaak(uitstellenTaak.id, { startdatum: nieuweStart, einddatum: nieuweEind })
    setUitstellenTaak(null)
    setUitstellenWeken(1)
  }

  async function bewerkOpslaan() {
    if (!bewerkTaak) return
    await onUpdateTaak(bewerkTaak.id, {
      titel:      bewerkTaak.titel,
      eigenaar:   bewerkTaak.eigenaar,
      startdatum: bewerkTaak.startdatum,
      einddatum:  bewerkTaak.einddatum,
      status:     bewerkTaak.status,
      mijlpaal:   bewerkTaak.mijlpaal,
      omschrijving: bewerkTaak.omschrijving,
    })
    setBewerkTaak(null)
  }

  const aantalTaken  = taken.filter(t => !t.mijlpaal).length
  const aantalKlaar  = taken.filter(t => !t.mijlpaal && t.status === 'afgerond').length
  const voortgang    = aantalTaken > 0 ? Math.round((aantalKlaar / aantalTaken) * 100) : 0

  return (
    <div style={{ padding: 28, maxWidth: 900 }}>
      {/* Voortgangsbalk */}
      <Kaart stijl={{ marginBottom: 16, padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: T.textSecond, fontWeight: 600 }}>Taakvoortgang</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: T.purple }}>{aantalKlaar} / {aantalTaken} · {voortgang}%</span>
        </div>
        <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${voortgang}%`, background: voortgang === 100 ? T.green : T.purple, borderRadius: 3, transition: 'width 0.4s ease' }} />
        </div>
      </Kaart>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={zoekterm} onChange={e => setZoekterm(e.target.value)} placeholder="Zoeken in taken…" style={{ background: T.white, border: `1px solid ${T.borderMid}`, borderRadius: T.radiusSm, color: T.textPrimary, fontSize: 13, padding: '7px 12px', outline: 'none', width: 220, fontFamily: T.fontBase }} />
        <Selectie waarde={eigenaarFilter} onChange={setEigenaarFilter} stijl={{ width: 170 }}>
          <option value="alle">Alle eigenaren</option>
          {eigenaren.map(e => <option key={e} value={e}>{e}</option>)}
        </Selectie>
      </div>

      {/* Banden */}
      {[
        { sleutel: 'verlaat',  label: '▲ Verlaat',         kleur: banden.verlaat.length > 0 ? T.red : T.textMuted },
        { sleutel: 'dezeWeek', label: '● Deze week',        kleur: T.purple },
        { sleutel: 'volgend',  label: '○ Volgende 2 weken', kleur: T.textMuted },
        { sleutel: 'later',    label: '○ Later',            kleur: T.textMuted },
      ].map(band => (
        <div key={band.sleutel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0 6px', borderTop: `1px solid ${T.border}`, marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: band.kleur }}>{band.label}</span>
            {banden[band.sleutel].length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, background: band.kleur, color: '#fff', borderRadius: 10, padding: '0 6px' }}>{banden[band.sleutel].length}</span>
            )}
            {kanSchrijven && (
              <button onClick={() => setToevoegenBand(toevoegenBand === band.sleutel ? null : band.sleutel)} style={{ marginLeft: 'auto', fontSize: 12, color: T.purple, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: T.fontBase }}>+ Toevoegen</button>
            )}
          </div>

          {/* Inline toevoegrij */}
          {toevoegenBand === band.sleutel && (
            <div style={{ display: 'flex', gap: 8, padding: '8px 10px', background: T.purpleLight, borderRadius: T.radiusSm, marginBottom: 8, flexWrap: 'wrap', border: `1px solid ${T.border}` }}>
              <Selectie waarde={nType} onChange={setNType} stijl={{ width: 110 }}>
                <option value="taak">Taak</option>
                <option value="mijlpaal">Mijlpaal</option>
              </Selectie>
              <input value={nTitel} onChange={e => setNTitel(e.target.value)} onKeyDown={e => e.key === 'Enter' && taakToevoegen(band.sleutel)} placeholder="Taaknaam…" autoFocus
                style={{ flex: 1, minWidth: 140, background: T.white, border: `1px solid ${T.borderMid}`, borderRadius: T.radiusSm, color: T.textPrimary, fontSize: 13, padding: '6px 10px', outline: 'none', fontFamily: T.fontBase }} />
              <input value={nEigenaar} onChange={e => setNEigenaar(e.target.value)} placeholder="Eigenaar"
                style={{ width: 110, background: T.white, border: `1px solid ${T.borderMid}`, borderRadius: T.radiusSm, color: T.textPrimary, fontSize: 13, padding: '6px 10px', outline: 'none', fontFamily: T.fontBase }} />
              <input type="date" value={nEind} onChange={e => setNEind(e.target.value)}
                style={{ width: 130, background: T.white, border: `1px solid ${T.borderMid}`, borderRadius: T.radiusSm, color: T.textPrimary, fontSize: 13, padding: '6px 10px', outline: 'none', fontFamily: T.fontBase }} />
              <Knop klein variant="primair" onClick={() => taakToevoegen(band.sleutel)}>Toevoegen</Knop>
              <Knop klein variant="geest" onClick={() => { setToevoegenBand(null); resetFormulier() }}>Annuleren</Knop>
            </div>
          )}

          {banden[band.sleutel].length === 0
            ? <LeegScherm tekst={`Geen taken in "${band.label.replace(/[▲●○] /, '')}"`} />
            : banden[band.sleutel].map(t => (
              <TaakRij key={t.id} taak={t}
                onUpdateTaak={onUpdateTaak}
                onVerschuifTaak={setUitstellenTaak}
                onBewerken={setBewerkTaak}
              />
            ))
          }
        </div>
      ))}

      {/* Afgerond */}
      <div style={{ padding: '8px 0 6px', borderTop: `1px solid ${T.border}`, marginTop: 4 }}>
        <button onClick={() => setToonAfgerond(v => !v)} style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.fontBase }}>
          ✓ Afgerond ({banden.afgerond.length}) {toonAfgerond ? '▲' : '▼'}
        </button>
      </div>
      {toonAfgerond && banden.afgerond.map(t => (
        <TaakRij key={t.id} taak={t} onUpdateTaak={onUpdateTaak} onVerschuifTaak={setUitstellenTaak} onBewerken={setBewerkTaak} />
      ))}

      {/* Uitstellen-modal */}
      {uitstellenTaak && (
        <Modal titel="Taak uitstellen" onSluiten={() => setUitstellenTaak(null)} breedte={360}>
          <div style={{ fontSize: 13, color: T.textSecond, marginBottom: 16, padding: '8px 10px', background: T.bgPage, borderRadius: T.radiusSm }}>{uitstellenTaak.titel}</div>
          <FormRij label="Uitstellen met">
            <Selectie waarde={uitstellenWeken} onChange={v => setUitstellenWeken(Number(v))}>
              {[1,2,3,4].map(w => <option key={w} value={w}>{w} week{w > 1 ? 'en' : ''}</option>)}
            </Selectie>
          </FormRij>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
            Nieuwe einddatum: <strong style={{ color: T.textPrimary }}>{formateerDatum(verschuifStr(uitstellenTaak.einddatum, uitstellenWeken * 7))}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Knop variant="geest" onClick={() => setUitstellenTaak(null)}>Annuleren</Knop>
            <Knop variant="primair" onClick={uitstellen}>Uitstellen</Knop>
          </div>
        </Modal>
      )}

      {/* Bewerkmodal */}
      {bewerkTaak && (
        <Modal titel="Taak bewerken" onSluiten={() => setBewerkTaak(null)}>
          <FormRij label="Titel"><Invoer waarde={bewerkTaak.titel} onChange={v => setBewerkTaak(p => ({...p, titel: v}))} /></FormRij>
          <FormRij label="Omschrijving"><Invoer waarde={bewerkTaak.omschrijving || ''} onChange={v => setBewerkTaak(p => ({...p, omschrijving: v}))} meerdereRegels /></FormRij>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormRij label="Eigenaar"><Invoer waarde={bewerkTaak.eigenaar || ''} onChange={v => setBewerkTaak(p => ({...p, eigenaar: v}))} /></FormRij>
            <FormRij label="Status">
              <Selectie waarde={bewerkTaak.status} onChange={v => setBewerkTaak(p => ({...p, status: v}))}>
                {TAAK_STATUSSEN.map(s => <option key={s.waarde} value={s.waarde}>{s.label}</option>)}
              </Selectie>
            </FormRij>
            <FormRij label="Startdatum"><Invoer type="date" waarde={bewerkTaak.startdatum || ''} onChange={v => setBewerkTaak(p => ({...p, startdatum: v}))} /></FormRij>
            <FormRij label="Einddatum"><Invoer type="date" waarde={bewerkTaak.einddatum || ''} onChange={v => setBewerkTaak(p => ({...p, einddatum: v}))} /></FormRij>
          </div>
          <FormRij label="Type">
            <Selectie waarde={bewerkTaak.mijlpaal ? 'mijlpaal' : 'taak'} onChange={v => setBewerkTaak(p => ({...p, mijlpaal: v === 'mijlpaal'}))}>
              <option value="taak">Taak</option>
              <option value="mijlpaal">Mijlpaal</option>
            </Selectie>
          </FormRij>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Knop variant="geest" onClick={() => setBewerkTaak(null)}>Annuleren</Knop>
            <Knop variant="primair" onClick={bewerkOpslaan}>Opslaan</Knop>
          </div>
        </Modal>
      )}
    </div>
  )
}

function verschuifStr(dateStr, dagen) {
  if (!dateStr) return dateStr
  const dt = new Date(dateStr + 'T00:00:00')
  dt.setDate(dt.getDate() + dagen)
  return dt.toISOString().slice(0, 10)
}
