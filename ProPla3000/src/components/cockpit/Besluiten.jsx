import { useState } from 'react'
import { T, BESLUIT_STATUSSEN } from '../../styles/tokens'
import { Kaart, KaartLijf, SectieLabel, Modal, FormRij, Invoer, Selectie, LeegScherm } from '../ui/index.jsx'
import { Knop } from '../ui/Button.jsx'
import { formateerDatum, dagenVanafVandaag } from '../../lib/helpers'

export function Besluiten({ besluiten, openBesluiten, gesloten, kanSchrijven, onVoegToe, onSluit, onUpdate }) {
  const [toevoegOpen,  setToevoegOpen]  = useState(false)
  const [sluitModal,   setSluitModal]   = useState(null)
  const [uitkomst,     setUitkomst]     = useState('')
  const [bewerkItem,   setBewerkItem]   = useState(null)
  const [toonGesloten, setToonGesloten] = useState(false)

  // Formulier
  const [vraag,    setVraag]    = useState('')
  const [context,  setContext]  = useState('')
  const [eigenaar, setEigenaar] = useState('')
  const [deadline, setDeadline] = useState('')

  async function toevoegen() {
    if (!vraag.trim()) return
    await onVoegToe({ vraag, context, eigenaar, deadline: deadline || null })
    setVraag(''); setContext(''); setEigenaar(''); setDeadline(''); setToevoegOpen(false)
  }

  async function sluiten() {
    await onSluit(sluitModal, uitkomst)
    setSluitModal(null); setUitkomst('')
  }

  function BesluitKaart({ b }) {
    const isOpen   = b.status === 'open'
    const verlaat  = isOpen && b.deadline && b.deadline < new Date().toISOString().slice(0,10)
    const dagenRest = b.deadline ? dagenVanafVandaag(b.deadline) : null

    return (
      <Kaart accentKleur={verlaat ? T.amber : isOpen ? T.purpleMid : T.green} stijl={{ marginBottom: 10 }}>
        <KaartLijf>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>{b.vraag}</div>
              {b.context && <div style={{ fontSize: 12, color: T.textSecond, marginBottom: 8, lineHeight: 1.5 }}>{b.context}</div>}
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: T.textMuted, flexWrap: 'wrap' }}>
                {b.eigenaar && <span>Eigenaar: <strong style={{ color: T.textSecond }}>{b.eigenaar}</strong></span>}
                {b.deadline && (
                  <span style={{ color: verlaat ? T.amber : T.textMuted, fontWeight: verlaat ? 700 : 400 }}>
                    {isOpen
                      ? verlaat ? `⚠ ${Math.abs(dagenRest)}d verlaat` : `Vóór ${formateerDatum(b.deadline)}`
                      : `Besloten ${formateerDatum(b.besloten_op?.slice(0,10))}`
                    }
                  </span>
                )}
              </div>
              {b.uitkomst && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: T.greenLight, borderRadius: T.radiusSm, border: `1px solid ${T.greenBorder}`, fontSize: 12, color: T.green }}>
                  ✓ {b.uitkomst}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 9px', color: isOpen ? T.amber : T.green, background: isOpen ? T.amberLight : T.greenLight, border: `1px solid ${isOpen ? T.amberBorder : T.greenBorder}` }}>
                {isOpen ? 'Open' : 'Besloten'}
              </span>
              {isOpen && kanSchrijven && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <Knop klein variant="secundair" onClick={() => setBewerkItem({ ...b })}>Bewerken</Knop>
                  <Knop klein variant="primair" onClick={() => { setSluitModal(b.id); setUitkomst('') }}>Vastleggen</Knop>
                </div>
              )}
            </div>
          </div>
        </KaartLijf>
      </Kaart>
    )
  }

  return (
    <div style={{ padding: 28, maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, marginBottom: 2 }}>Besluiten</div>
          <div style={{ fontSize: 13, color: T.textSecond }}>{openBesluiten.length} open · {gesloten.length} vastgelegd</div>
        </div>
        {kanSchrijven && <Knop variant="primair" onClick={() => setToevoegOpen(true)}>+ Besluit toevoegen</Knop>}
      </div>

      <SectieLabel aantal={openBesluiten.length} kleur={openBesluiten.some(b => b.deadline < new Date().toISOString().slice(0,10)) ? T.amber : T.purple}>
        Openstaande besluiten
      </SectieLabel>
      {openBesluiten.length === 0
        ? <LeegScherm tekst="Geen openstaande besluiten" />
        : openBesluiten.map(b => <BesluitKaart key={b.id} b={b} />)
      }

      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <SectieLabel aantal={gesloten.length}>Besluitenlog</SectieLabel>
          <button onClick={() => setToonGesloten(v => !v)} style={{ fontSize: 12, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.fontBase }}>
            {toonGesloten ? '▲ Verbergen' : '▼ Tonen'}
          </button>
        </div>
        {toonGesloten && (gesloten.length === 0
          ? <LeegScherm tekst="Nog geen besluiten vastgelegd" />
          : gesloten.map(b => <BesluitKaart key={b.id} b={b} />)
        )}
      </div>

      {/* Toevoeg-modal */}
      {toevoegOpen && (
        <Modal titel="Besluit toevoegen" onSluiten={() => setToevoegOpen(false)} breedte={520}>
          <FormRij label="Wat moet er besloten worden?" vereist>
            <Invoer waarde={vraag} onChange={setVraag} placeholder="Beslissingsvraag of titel…" />
          </FormRij>
          <FormRij label="Context (optioneel)">
            <Invoer meerdereRegels waarde={context} onChange={setContext} placeholder="Achtergrond, opties, beperkingen…" />
          </FormRij>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormRij label="Eigenaar"><Invoer waarde={eigenaar} onChange={setEigenaar} placeholder="Wie beslist?" /></FormRij>
            <FormRij label="Deadline"><Invoer type="date" waarde={deadline} onChange={setDeadline} /></FormRij>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Knop variant="geest" onClick={() => setToevoegOpen(false)}>Annuleren</Knop>
            <Knop variant="primair" onClick={toevoegen}>Toevoegen</Knop>
          </div>
        </Modal>
      )}

      {/* Vastleggen-modal */}
      {sluitModal && (
        <Modal titel="Besluit vastleggen" onSluiten={() => setSluitModal(null)} breedte={480}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>
            {besluiten.find(b => b.id === sluitModal)?.vraag}
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
            {besluiten.find(b => b.id === sluitModal)?.context}
          </div>
          <FormRij label="Wat is er besloten?" vereist>
            <Invoer meerdereRegels waarde={uitkomst} onChange={setUitkomst} placeholder="Leg de beslissing en onderbouwing vast…" />
          </FormRij>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Knop variant="geest" onClick={() => setSluitModal(null)}>Annuleren</Knop>
            <Knop variant="primair" onClick={sluiten}>Vastleggen</Knop>
          </div>
        </Modal>
      )}

      {/* Bewerk-modal */}
      {bewerkItem && (
        <Modal titel="Besluit bewerken" onSluiten={() => setBewerkItem(null)} breedte={520}>
          <FormRij label="Vraag"><Invoer waarde={bewerkItem.vraag} onChange={v => setBewerkItem(p => ({...p, vraag: v}))} /></FormRij>
          <FormRij label="Context"><Invoer meerdereRegels waarde={bewerkItem.context || ''} onChange={v => setBewerkItem(p => ({...p, context: v}))} /></FormRij>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormRij label="Eigenaar"><Invoer waarde={bewerkItem.eigenaar || ''} onChange={v => setBewerkItem(p => ({...p, eigenaar: v}))} /></FormRij>
            <FormRij label="Deadline"><Invoer type="date" waarde={bewerkItem.deadline || ''} onChange={v => setBewerkItem(p => ({...p, deadline: v}))} /></FormRij>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Knop variant="geest" onClick={() => setBewerkItem(null)}>Annuleren</Knop>
            <Knop variant="primair" onClick={() => { onUpdate(bewerkItem.id, bewerkItem); setBewerkItem(null) }}>Opslaan</Knop>
          </div>
        </Modal>
      )}
    </div>
  )
}
