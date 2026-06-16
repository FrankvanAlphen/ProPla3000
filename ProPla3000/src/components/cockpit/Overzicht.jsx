import { useState } from 'react'
import { T, GEZONDHEID_OPTIES, PHASES } from '../../styles/tokens'
import { Kaart, KaartLijf, SectieLabel, Modal, FormRij, Invoer, Selectie, LeegScherm } from '../ui/index.jsx'
import { Knop } from '../ui/Button.jsx'
import { formateerDatum, dagenVanafVandaag, blokkadeLeeftijd, leeftijdKleur } from '../../lib/helpers'

export function Overzicht({ project, taken, openBlokkades, openBesluiten, kanSchrijven, onUpdateProject }) {
  const [bewerkModal, setBewerkModal] = useState(false)
  const [formData, setFormData] = useState({ ...project })

  const verlate     = taken.filter(t => t.status !== 'afgerond' && t.einddatum < new Date().toISOString().slice(0,10))
  const dezeWeek    = taken.filter(t => { const d = dagenVanafVandaag(t.einddatum); return t.status !== 'afgerond' && d >= 0 && d <= 7 })
  const volgendeMijlpaal = taken.filter(t => t.mijlpaal && t.einddatum >= new Date().toISOString().slice(0,10)).sort((a,b) => a.einddatum.localeCompare(b.einddatum))[0]

  async function opslaan() {
    await onUpdateProject(project.id, {
      titel:        formData.titel,
      beschrijving: formData.beschrijving,
      eigenaar_naam:formData.eigenaar_naam,
      fase:         formData.fase,
      gezondheid:   formData.gezondheid,
      themas:       formData.themas,
      projecttype:  formData.projecttype,
    })
    setBewerkModal(false)
  }

  return (
    <div style={{ padding: 28, maxWidth: 900 }}>
      {/* KPI-strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { waarde: verlate.length,        label: 'Verlate taken',   kleur: verlate.length > 0 ? T.red : T.textMuted },
          { waarde: dezeWeek.length,       label: 'Deze week',       kleur: T.purple },
          { waarde: openBlokkades.length,  label: 'Open blokkades',  kleur: openBlokkades.length > 0 ? T.red : T.textMuted },
          { waarde: openBesluiten.length,  label: 'Open besluiten',  kleur: openBesluiten.length > 0 ? T.amber : T.textMuted },
        ].map(kpi => (
          <Kaart key={kpi.label} stijl={{ textAlign: 'center', padding: '18px 12px' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: kpi.kleur, letterSpacing: '-0.02em' }}>{kpi.waarde}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</div>
          </Kaart>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Projectgegevens */}
        <Kaart>
          <KaartLijf>
            <SectieLabel actie={kanSchrijven ? 'Bewerken' : undefined} opActie={() => setBewerkModal(true)}>
              Projectgegevens
            </SectieLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { veld: 'Eigenaar',    waarde: project.eigenaar_naam },
                { veld: 'Fase',        waarde: project.fase },
                { veld: 'Gezondheid',  waarde: GEZONDHEID_OPTIES.find(g => g.waarde === project.gezondheid)?.label },
                { veld: 'Type',        waarde: project.projecttype },
                { veld: "Thema's",     waarde: project.themas },
              ].map(rij => (
                <div key={rij.veld} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 12, color: T.textMuted, width: 100, flexShrink: 0 }}>{rij.veld}</span>
                  <span style={{ fontSize: 12, color: T.textPrimary, fontWeight: 500 }}>{rij.waarde || '—'}</span>
                </div>
              ))}
            </div>
          </KaartLijf>
        </Kaart>

        {/* Beschrijving */}
        <Kaart>
          <KaartLijf>
            <SectieLabel>Beschrijving</SectieLabel>
            <p style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.6 }}>
              {project.beschrijving || 'Geen beschrijving ingevuld.'}
            </p>
            {project.blokkade_toelichting && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: T.redLight, borderRadius: T.radiusSm, border: `1px solid ${T.redBorder}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.red, marginBottom: 4 }}>HUIDIGE BLOKKADE</div>
                <div style={{ fontSize: 12, color: T.textSecond }}>{project.blokkade_toelichting}</div>
              </div>
            )}
          </KaartLijf>
        </Kaart>

        {/* Planning puls */}
        <Kaart>
          <KaartLijf>
            <SectieLabel>Planning Puls</SectieLabel>
            {volgendeMijlpaal && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: T.bgPage, borderRadius: T.radiusSm, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>◆ {volgendeMijlpaal.titel}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: dagenVanafVandaag(volgendeMijlpaal.einddatum) <= 7 ? T.amber : T.purple }}>
                  {formateerDatum(volgendeMijlpaal.einddatum)} · {dagenVanafVandaag(volgendeMijlpaal.einddatum)}d
                </span>
              </div>
            )}
            {verlate.slice(0, 3).map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 12, color: T.textPrimary }}>{t.titel}</span>
                <span style={{ fontSize: 11, color: T.red, fontWeight: 700 }}>
                  {Math.abs(dagenVanafVandaag(t.einddatum))}d te laat
                </span>
              </div>
            ))}
            {verlate.length === 0 && <LeegScherm tekst="Geen verlate taken" />}
          </KaartLijf>
        </Kaart>

        {/* Open blokkades */}
        <Kaart>
          <KaartLijf>
            <SectieLabel aantal={openBlokkades.length} kleur={openBlokkades.length > 0 ? T.red : undefined}>Open Blokkades</SectieLabel>
            {openBlokkades.length === 0 ? (
              <LeegScherm tekst="Geen open blokkades" />
            ) : openBlokkades.slice(0, 3).map(b => {
              const leeftijd = blokkadeLeeftijd(b.aangemaakt_op?.slice(0,10))
              return (
                <div key={b.id} style={{ padding: '8px 10px', borderRadius: T.radiusSm, border: `1px solid ${leeftijdKleur(leeftijd)}30`, background: leeftijd >= 8 ? T.redLight : T.amberLight, marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: T.textPrimary, marginBottom: 4 }}>{b.omschrijving}</div>
                  <div style={{ fontSize: 11, color: leeftijdKleur(leeftijd), fontWeight: 700 }}>{leeftijd}d open · {b.eigenaar}</div>
                </div>
              )
            })}
          </KaartLijf>
        </Kaart>
      </div>

      {/* Bewerkmodal */}
      {bewerkModal && (
        <Modal titel="Project bewerken" onSluiten={() => setBewerkModal(false)} breedte={520}>
          <FormRij label="Titel" vereist><Invoer waarde={formData.titel} onChange={v => setFormData(p => ({...p, titel: v}))} /></FormRij>
          <FormRij label="Beschrijving"><Invoer waarde={formData.beschrijving || ''} onChange={v => setFormData(p => ({...p, beschrijving: v}))} meerdereRegels rijen={3} /></FormRij>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormRij label="Eigenaar"><Invoer waarde={formData.eigenaar_naam || ''} onChange={v => setFormData(p => ({...p, eigenaar_naam: v}))} /></FormRij>
            <FormRij label="Fase">
              <Selectie waarde={formData.fase || ''} onChange={v => setFormData(p => ({...p, fase: v}))}>
                {PHASES.map(f => <option key={f.key} value={f.key}>{f.key}</option>)}
              </Selectie>
            </FormRij>
            <FormRij label="Gezondheid">
              <Selectie waarde={formData.gezondheid || 'groen'} onChange={v => setFormData(p => ({...p, gezondheid: v}))}>
                {GEZONDHEID_OPTIES.map(g => <option key={g.waarde} value={g.waarde}>{g.label}</option>)}
              </Selectie>
            </FormRij>
            <FormRij label="Type"><Invoer waarde={formData.projecttype || ''} onChange={v => setFormData(p => ({...p, projecttype: v}))} /></FormRij>
          </div>
          <FormRij label="Strategische thema's"><Invoer waarde={formData.themas || ''} onChange={v => setFormData(p => ({...p, themas: v}))} placeholder="Bijv. Digitalisering, Klantgericht" /></FormRij>
          <FormRij label="Blokkade toelichting"><Invoer waarde={formData.blokkade_toelichting || ''} onChange={v => setFormData(p => ({...p, blokkade_toelichting: v}))} meerdereRegels /></FormRij>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <Knop variant="geest" onClick={() => setBewerkModal(false)}>Annuleren</Knop>
            <Knop variant="primair" onClick={opslaan}>Opslaan</Knop>
          </div>
        </Modal>
      )}
    </div>
  )
}
