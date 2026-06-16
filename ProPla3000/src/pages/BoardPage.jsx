import { useState } from 'react'
import { T, PHASES } from '../styles/tokens'
import { HoofdLay_out, Topbalk } from '../components/layout/Layout.jsx'
import { PortfolioBoard } from '../components/board/PortfolioBoard.jsx'
import { Modal, FormRij, Invoer, Selectie, Spinner } from '../components/ui/index.jsx'
import { Knop } from '../components/ui/Button.jsx'
import { useProjects } from '../hooks/useProjects'
import { useAuth } from '../hooks/useAuth'

// KPI-kaart
function KpiKaart({ icoon, waarde, label, kleur }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '18px 20px', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: T.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: T.purple }}>{icoon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: kleur || T.textPrimary, letterSpacing: '-0.02em', marginBottom: 2 }}>{waarde}</div>
      <div style={{ fontSize: 12, color: T.textSecond }}>{label}</div>
    </div>
  )
}

export function BoardPage() {
  const { gebruiker, kanSchrijven } = useAuth()
  const { projecten, laden, updateFase, updateProject, voegProjectToe } = useProjects()
  const [nieuwProjectModal, setNieuwProjectModal] = useState(false)
  const [formData, setFormData] = useState({ titel: '', beschrijving: '', eigenaar_naam: '', fase: 'Ideeën', gezondheid: 'groen', projecttype: '', themas: '' })

  const actief = projecten.filter(p => p.fase !== 'Archief')
  const kritiek = projecten.filter(p => p.gezondheid === 'rood')
  const geblokkeerd = projecten.filter(p => (p.blokkades || []).some(b => b.status === 'open'))

  async function projectAanmaken() {
    if (!formData.titel.trim()) return
    await voegProjectToe(formData, gebruiker?.id)
    setFormData({ titel: '', beschrijving: '', eigenaar_naam: '', fase: 'Ideeën', gezondheid: 'groen', projecttype: '', themas: '' })
    setNieuwProjectModal(false)
  }

  return (
    <HoofdLay_out>
      <Topbalk broodkruimel={[{ label: 'Projectenboard' }]} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {/* Paginakop */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.purple, marginBottom: 4 }}>
              PORTFOLIO · {new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }).toUpperCase()}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.02em', marginBottom: 2 }}>Projectenboard</div>
            <div style={{ fontSize: 13, color: T.textSecond }}>Sleep projectkaarten om de fase te wijzigen</div>
          </div>
          {kanSchrijven && (
            <Knop variant="primair" onClick={() => setNieuwProjectModal(true)}>+ Nieuw project</Knop>
          )}
        </div>

        {/* KPI strip */}
        <div style={{ display: 'flex', gap: 12, margin: '20px 0', flexWrap: 'wrap' }}>
          <KpiKaart icoon="▦" waarde={actief.length}      label="Actieve projecten" />
          <KpiKaart icoon="⊗" waarde={geblokkeerd.length} label="Geblokkeerd"        kleur={geblokkeerd.length > 0 ? T.red   : undefined} />
          <KpiKaart icoon="▲" waarde={kritiek.length}     label="Kritiek"            kleur={kritiek.length     > 0 ? T.red   : undefined} />
          <KpiKaart icoon="✓" waarde={projecten.filter(p => p.fase === 'Archief').length} label="Gearchiveerd" />
        </div>

        {/* Board */}
        <PortfolioBoard
          projecten={projecten}
          laden={laden}
          updateFase={updateFase}
          gebruikerId={gebruiker?.id}
        />
      </div>

      {/* Nieuw project modal */}
      {nieuwProjectModal && (
        <Modal titel="Nieuw project aanmaken" onSluiten={() => setNieuwProjectModal(false)}>
          <FormRij label="Projecttitel" vereist><Invoer waarde={formData.titel} onChange={v => setFormData(p => ({...p, titel: v}))} placeholder="Naam van het project" /></FormRij>
          <FormRij label="Beschrijving"><Invoer meerdereRegels waarde={formData.beschrijving} onChange={v => setFormData(p => ({...p, beschrijving: v}))} /></FormRij>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormRij label="Eigenaar"><Invoer waarde={formData.eigenaar_naam} onChange={v => setFormData(p => ({...p, eigenaar_naam: v}))} /></FormRij>
            <FormRij label="Fase">
              <Selectie waarde={formData.fase} onChange={v => setFormData(p => ({...p, fase: v}))}>
                {PHASES.map(f => <option key={f.key} value={f.key}>{f.key}</option>)}
              </Selectie>
            </FormRij>
          </div>
          <FormRij label="Strategische thema's"><Invoer waarde={formData.themas} onChange={v => setFormData(p => ({...p, themas: v}))} placeholder="Bijv. Digitalisering, Klantgericht" /></FormRij>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Knop variant="geest" onClick={() => setNieuwProjectModal(false)}>Annuleren</Knop>
            <Knop variant="primair" onClick={projectAanmaken}>Aanmaken</Knop>
          </div>
        </Modal>
      )}
    </HoofdLay_out>
  )
}
