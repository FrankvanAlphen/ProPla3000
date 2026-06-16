import { useState, useRef, useCallback } from 'react'
import { T } from '../../styles/tokens'
import { formateerDatum, vandaag } from '../../lib/helpers'

const RIJHOOGTE   = 36
const RIJAFSTAND  = 44
const LABELBREED  = 180
const DAGBREED    = 22
const KOPBREEDTE  = 30

function datumNaarDagen(dateStr, nulDatum) {
  const a = new Date(nulDatum + 'T00:00:00')
  const b = new Date(dateStr  + 'T00:00:00')
  return Math.round((b - a) / 86400000)
}

function dagenNaarDatum(dagen, nulDatum) {
  const dt = new Date(nulDatum + 'T00:00:00')
  dt.setDate(dt.getDate() + dagen)
  return dt.toISOString().slice(0, 10)
}

// Kleur per taakstatus
function taakKleur(taak, isGeselecteerd) {
  if (taak.mijlpaal) return T.purple
  if (taak.status === 'afgerond') return T.green
  if (taak.status === 'geblokkeerd') return T.red
  if (isGeselecteerd) return T.purpleDark
  const start = new Date(vandaag + 'T00:00:00')
  const eind  = new Date(taak.einddatum + 'T00:00:00')
  if (eind < start && taak.status !== 'afgerond') return T.red
  return T.purple
}

export function Tijdlijn({ taken, kanSchrijven, onUpdateTaak }) {
  const [zichtVenster, setZichtVenster] = useState(60) // zichtbare dagen
  const [verschuiving, setVerschuiving] = useState(-7) // offset in dagen van vandaag
  const [sleepState,   setSleepState]   = useState(null)
  const [geselecteerd, setGeselecteerd] = useState(null)
  const svgRef = useRef(null)

  // Sorteer taken: mijlpalen bovenaan, dan op startdatum
  const gesorteerd = [...taken].sort((a, b) => {
    if (a.mijlpaal && !b.mijlpaal) return -1
    if (!a.mijlpaal && b.mijlpaal) return 1
    return (a.startdatum || '').localeCompare(b.startdatum || '')
  })

  // Bereken het tijdvenster
  const nulDatum = dagenNaarDatum(verschuiving, vandaag)
  const svgBreedte = LABELBREED + zichtVenster * DAGBREED
  const svgHoogte  = KOPBREEDTE + gesorteerd.length * RIJAFSTAND + 20

  // Genereer dag-headers
  const dagHeaders = []
  for (let i = 0; i < zichtVenster; i++) {
    const datum = dagenNaarDatum(i, nulDatum)
    const dt    = new Date(datum + 'T00:00:00')
    const isWeekend = dt.getDay() === 0 || dt.getDay() === 6
    const isVandaag = datum === vandaag
    dagHeaders.push({ datum, x: LABELBREED + i * DAGBREED, dag: dt.getDate(), maand: dt.getMonth(), isWeekend, isVandaag })
  }

  // Maandgroepen voor kop
  const maandGroepen = []
  let huidigeKop = null
  dagHeaders.forEach(dh => {
    if (!huidigeKop || dh.maand !== huidigeKop.maand) {
      huidigeKop = { maand: dh.maand, x: dh.x, label: new Date(dh.datum + 'T00:00:00').toLocaleDateString('nl-NL', { month: 'short', year: '2-digit' }) }
      maandGroepen.push(huidigeKop)
    }
    huidigeKop.breedte = (dh.x + DAGBREED) - huidigeKop.x
  })

  // Sleep-logica
  const onMouseDown = useCallback((e, taakId, startdatum, einddatum) => {
    if (!kanSchrijven) return
    e.stopPropagation()
    const startX = e.clientX
    const startDagen = datumNaarDagen(startdatum, nulDatum)
    const duur = datumNaarDagen(einddatum, startdatum)
    setSleepState({ taakId, startX, startDagen, duur, deltaX: 0 })
    setGeselecteerd(taakId)
  }, [kanSchrijven, nulDatum])

  const onMouseMove = useCallback((e) => {
    if (!sleepState) return
    const deltaPixels = e.clientX - sleepState.startX
    const deltaDagen  = Math.round(deltaPixels / DAGBREED)
    setSleepState(prev => ({ ...prev, deltaX: deltaDagen }))
  }, [sleepState])

  const onMouseUp = useCallback(async () => {
    if (!sleepState) return
    const { taakId, startDagen, duur, deltaX } = sleepState
    const nieuwStart = dagenNaarDatum(startDagen + deltaX, nulDatum)
    const nieuwEind  = dagenNaarDatum(startDagen + deltaX + duur, nulDatum)
    setSleepState(null)
    await onUpdateTaak(taakId, { startdatum: nieuwStart, einddatum: nieuwEind })
  }, [sleepState, nulDatum, onUpdateTaak])

  return (
    <div style={{ padding: 28 }}>
      {/* Bediening */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setVerschuiving(v => v - 7)} style={navStijl}>‹ Week terug</button>
        <button onClick={() => setVerschuiving(-7)} style={navStijl}>Vandaag</button>
        <button onClick={() => setVerschuiving(v => v + 7)} style={navStijl}>Week verder ›</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => setZichtVenster(v => Math.max(14, v - 14))} style={navStijl}>– Zoom in</button>
          <button onClick={() => setZichtVenster(v => Math.min(120, v + 14))} style={navStijl}>+ Zoom uit</button>
        </div>
        <span style={{ fontSize: 12, color: T.textMuted }}>Sleep taken horizontaal om te herschikken</span>
      </div>

      {/* SVG Tijdlijn */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 600, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, background: T.white }}>
        <svg
          ref={svgRef}
          width={svgBreedte}
          height={svgHoogte}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{ display: 'block', cursor: sleepState ? 'grabbing' : 'default', userSelect: 'none' }}
        >
          {/* Achtergrond weekends */}
          {dagHeaders.filter(d => d.isWeekend).map(d => (
            <rect key={d.datum} x={d.x} y={0} width={DAGBREED} height={svgHoogte} fill="#F8F7FC" />
          ))}

          {/* Horizontale rasterlijnen */}
          {gesorteerd.map((_, i) => (
            <line key={i} x1={0} y1={KOPBREEDTE + i * RIJAFSTAND + RIJAFSTAND} x2={svgBreedte} y2={KOPBREEDTE + i * RIJAFSTAND + RIJAFSTAND} stroke={T.border} strokeWidth={0.5} />
          ))}

          {/* Vandaag-lijn */}
          {(() => {
            const x = LABELBREED + datumNaarDagen(vandaag, nulDatum) * DAGBREED + DAGBREED / 2
            return x >= LABELBREED && x <= svgBreedte ? (
              <line x1={x} y1={0} x2={x} y2={svgHoogte} stroke={T.purple} strokeWidth={2} strokeDasharray="4 3" opacity={0.5} />
            ) : null
          })()}

          {/* Maandkop */}
          <rect x={0} y={0} width={svgBreedte} height={14} fill={T.bgPage} />
          {maandGroepen.map(mg => (
            <text key={mg.label + mg.x} x={mg.x + 4} y={11} fontSize={9} fill={T.textMuted} fontWeight={700} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {mg.label.toUpperCase()}
            </text>
          ))}

          {/* Dag-nummers */}
          {dagHeaders.map(d => (
            <g key={d.datum}>
              {d.isVandaag && <rect x={d.x} y={14} width={DAGBREED} height={16} fill={T.purple} rx={2} />}
              <text x={d.x + DAGBREED / 2} y={25} textAnchor="middle" fontSize={10} fill={d.isVandaag ? '#fff' : d.isWeekend ? T.textMuted : T.textSecond} fontWeight={d.isVandaag ? 800 : 400}>
                {d.dag}
              </text>
            </g>
          ))}

          {/* Taakbalkjes */}
          {gesorteerd.map((taak, i) => {
            const y = KOPBREEDTE + i * RIJAFSTAND
            const startDagen = datumNaarDagen(taak.startdatum || vandaag, nulDatum)
            const eindDagen  = datumNaarDagen(taak.einddatum  || vandaag, nulDatum)

            // Sleep-delta toepassen
            let effectiefStart = startDagen
            let effectiefEind  = eindDagen
            if (sleepState?.taakId === taak.id) {
              effectiefStart += sleepState.deltaX
              effectiefEind  += sleepState.deltaX
            }

            const x      = LABELBREED + effectiefStart * DAGBREED
            const breedte = Math.max(taak.mijlpaal ? 0 : DAGBREED, (effectiefEind - effectiefStart) * DAGBREED)
            const kleur  = taakKleur(taak, geselecteerd === taak.id)
            const inZicht = effectiefEind >= 0 && effectiefStart <= zichtVenster

            return (
              <g key={taak.id}>
                {/* Taaklabel */}
                <text x={4} y={y + RIJHOOGTE / 2 + 5} fontSize={11} fill={T.textSecond} fontWeight={taak.mijlpaal ? 700 : 400}
                  style={{ overflow: 'hidden' }} clipPath={`url(#label-clip-${i})`}>
                  {taak.mijlpaal ? '◆ ' : ''}{taak.titel}
                </text>
                <clipPath id={`label-clip-${i}`}>
                  <rect x={0} y={y} width={LABELBREED - 4} height={RIJAFSTAND} />
                </clipPath>

                {/* Taakbalkje (alleen als in zicht) */}
                {inZicht && !taak.mijlpaal && (
                  <rect
                    x={Math.max(LABELBREED, x)} y={y + 8} width={Math.max(4, breedte)} height={RIJHOOGTE - 16}
                    rx={4} fill={kleur} opacity={taak.status === 'afgerond' ? 0.6 : 0.85}
                    style={{ cursor: kanSchrijven ? 'grab' : 'default' }}
                    onMouseDown={e => onMouseDown(e, taak.id, taak.startdatum, taak.einddatum)}
                  />
                )}

                {/* Mijlpaal-diamant */}
                {inZicht && taak.mijlpaal && (
                  <polygon
                    points={`${Math.max(LABELBREED, x + 8)},${y + 8} ${Math.max(LABELBREED, x) + 14},${y + RIJHOOGTE / 2} ${Math.max(LABELBREED, x) + 8},${y + RIJHOOGTE - 8} ${Math.max(LABELBREED, x) + 2},${y + RIJHOOGTE / 2}`}
                    fill={kleur} opacity={0.9}
                  />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { kleur: T.purple,  label: 'Actief' },
          { kleur: T.green,   label: 'Afgerond' },
          { kleur: T.red,     label: 'Verlaat / Geblokkeerd' },
          { kleur: '#F8F7FC', label: 'Weekend', rand: T.border },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 10, borderRadius: 2, background: l.kleur, border: l.rand ? `1px solid ${l.rand}` : undefined, display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: T.textMuted }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const navStijl = {
  padding: '6px 12px', borderRadius: 6, background: '#fff', border: `1px solid ${T.border}`,
  fontSize: 12, color: T.textSecond, cursor: 'pointer', fontFamily: T.fontBase,
}
