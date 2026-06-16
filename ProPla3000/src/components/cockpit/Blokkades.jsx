import { useState } from 'react'
import { T } from '../../styles/tokens'
import { Kaart, KaartLijf, SectieLabel, Modal, FormRij, Invoer, LeegScherm } from '../ui/index.jsx'
import { Knop } from '../ui/Button.jsx'
import { blokkadeLeeftijd, leeftijdKleur, formateerDatum } from '../../lib/helpers'

export function Blokkades({ blokkades, openBlokkades, opgelostBlokkades, kanSchrijven, onVoegToe, onLosOp }) {
  const [toevoegOpen,  setToevoegOpen]  = useState(false)
  const [oplosModal,   setOplosModal]   = useState(null)
  const [oplossing,    setOplossing]    = useState('')
  const [toonOpgelost, setToonOpgelost] = useState(false)

  // Toevoeg-formulier
  const [omschrijving, setOmschrijving] = useState('')
  const [eigenaar,     setEigenaar]     = useState('')

  async function toevoegen() {
    if (!omschrijving.trim()) return
    await onVoegToe({ omschrijving, eigenaar })
    setOmschrijving(''); setEigenaar(''); setToevoegOpen(false)
  }

  async function oplossen() {
    await onLosOp(oplosModal, oplossing)
    setOplosModal(null); setOplossing('')
  }

  function BlokkadeKaart({ b }) {
    const leeftijd = blokkadeLeeftijd(b.aangemaakt_op?.slice(0, 10))
    const kleur    = leeftijdKleur(leeftijd)
    const isOpen   = b.status === 'open'
    return (
      <Kaart accentKleur={isOpen ? kleur : T.green} stijl={{ marginBottom: 10 }}>
        <KaartLijf>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: T.textPrimary, lineHeight: 1.5, marginBottom: 8 }}>{b.omschrijving}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: T.textMuted, flexWrap: 'wrap' }}>
                {b.eigenaar && <span>Eigenaar: <strong style={{ color: T.textSecond }}>{b.eigenaar}</strong></span>}
                <span>Gemeld: {formateerDatum(b.aangemaakt_op?.slice(0,10))}</span>
                {isOpen && <span style={{ color: kleur, fontWeight: 700 }}>{leeftijd} dag{leeftijd !== 1 ? 'en' : ''} open</span>}
              </div>
              {b.oplossing && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: T.greenLight, borderRadius: T.radiusSm, border: `1px solid ${T.greenBorder}`, fontSize: 12, color: T.green }}>
                  ✓ {b.oplossing}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 9px', color: isOpen ? kleur : T.green, background: isOpen ? `${kleur}15` : T.greenLight, border: `1px solid ${isOpen ? `${kleur}40` : T.greenBorder}` }}>
                {isOpen ? 'Open' : 'Opgelost'}
              </span>
              {isOpen && kanSchrijven && (
                <Knop klein variant={leeftijd >= 8 ? 'gevaar' : 'amber'} onClick={() => { setOplosModal(b.id); setOplossing('') }}>
                  Oplossen
                </Knop>
              )}
            </div>
          </div>
        </KaartLijf>
      </Kaart>
    )
  }

  return (
    <div style={{ padding: 28, maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, marginBottom: 2 }}>Blokkades</div>
          <div style={{ fontSize: 13, color: T.textSecond }}>{openBlokkades.length} open · {opgelostBlokkades.length} opgelost</div>
        </div>
        {kanSchrijven && <Knop variant="gevaar" onClick={() => setToevoegOpen(true)}>+ Blokkade melden</Knop>}
      </div>

      <SectieLabel aantal={openBlokkades.length} kleur={openBlokkades.length > 0 ? T.red : T.green}>Open blokkades</SectieLabel>
      {openBlokkades.length === 0
        ? <LeegScherm tekst="Geen open blokkades — project is gedeblokkeerd" />
        : openBlokkades.map(b => <BlokkadeKaart key={b.id} b={b} />)
      }

      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <SectieLabel aantal={opgelostBlokkades.length}>Opgeloste blokkades</SectieLabel>
          <button onClick={() => setToonOpgelost(v => !v)} style={{ fontSize: 12, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.fontBase }}>
            {toonOpgelost ? '▲ Verbergen' : '▼ Tonen'}
          </button>
        </div>
        {toonOpgelost && (opgelostBlokkades.length === 0
          ? <LeegScherm tekst="Nog geen opgeloste blokkades" />
          : opgelostBlokkades.map(b => <BlokkadeKaart key={b.id} b={b} />)
        )}
      </div>

      {/* Toevoeg-modal */}
      {toevoegOpen && (
        <Modal titel="Blokkade melden" onSluiten={() => setToevoegOpen(false)} breedte={460}>
          <FormRij label="Wat wordt er geblokkeerd?" vereist>
            <Invoer meerdereRegels waarde={omschrijving} onChange={setOmschrijving} placeholder="Beschrijf de blokkade en wat het verhindert…" />
          </FormRij>
          <FormRij label="Eigenaar (wie kan dit oplossen?)">
            <Invoer waarde={eigenaar} onChange={setEigenaar} placeholder="Naam of team" />
          </FormRij>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Knop variant="geest" onClick={() => setToevoegOpen(false)}>Annuleren</Knop>
            <Knop variant="gevaar" onClick={toevoegen}>Melden</Knop>
          </div>
        </Modal>
      )}

      {/* Oplossen-modal */}
      {oplosModal && (
        <Modal titel="Blokkade oplossen" onSluiten={() => setOplosModal(null)} breedte={460}>
          <div style={{ fontSize: 13, color: T.textSecond, marginBottom: 16, lineHeight: 1.5, padding: '10px 12px', background: T.redLight, borderRadius: T.radiusSm, border: `1px solid ${T.redBorder}` }}>
            {blokkades.find(b => b.id === oplosModal)?.omschrijving}
          </div>
          <FormRij label="Hoe is dit opgelost? (optioneel)">
            <Invoer meerdereRegels waarde={oplossing} onChange={setOplossing} placeholder="Beschrijf de oplossing…" />
          </FormRij>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Knop variant="geest" onClick={() => setOplosModal(null)}>Annuleren</Knop>
            <Knop variant="succes" onClick={oplossen}>Opgelost</Knop>
          </div>
        </Modal>
      )}
    </div>
  )
}
