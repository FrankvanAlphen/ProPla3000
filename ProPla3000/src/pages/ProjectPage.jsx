import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { useBlockers } from '../hooks/useBlockers'
import { useDecisions } from '../hooks/useDecisions'
import { HoofdLay_out, Topbalk } from '../components/layout/Layout.jsx'
import { CockpitHeader } from '../components/cockpit/CockpitHeader.jsx'
import { Overzicht } from '../components/cockpit/Overzicht.jsx'
import { TakenPlanning } from '../components/cockpit/TakenPlanning.jsx'
import { Tijdlijn } from '../components/cockpit/Tijdlijn.jsx'
import { Blokkades } from '../components/cockpit/Blokkades.jsx'
import { Besluiten } from '../components/cockpit/Besluiten.jsx'
import { Historie } from '../components/cockpit/Historie.jsx'
import { Spinner } from '../components/ui/index.jsx'
import { vandaag } from '../lib/helpers'

export function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { gebruiker, kanSchrijven } = useAuth()
  const [project, setProject] = useState(null)
  const [laden,   setLaden]   = useState(true)
  const [actieveTab, setActieveTab] = useState('overzicht')

  const { taken,    updateTaak,    voegTaakToe,    verwijderTaak   } = useTasks(id)
  const { blokkades, openBlokkades, opgelostBlokkades, voegBlokkadeToe, losBlokkadeOp } = useBlockers(id)
  const { besluiten, openBesluiten, gesloten, voegBesluitToe, sluitBesluit, updateBesluit } = useDecisions(id)

  useEffect(() => {
    if (!id) return
    supabase.from('projecten').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { navigate('/'); return }
      setProject(data)
      setLaden(false)
    })
  }, [id, navigate])

  async function handleUpdateProject(projectId, wijzigingen) {
    setProject(prev => ({ ...prev, ...wijzigingen }))
    await supabase.from('projecten').update({ ...wijzigingen, bijgewerkt_op: new Date().toISOString() }).eq('id', projectId)
    if (wijzigingen.fase) {
      await supabase.from('geschiedenis').insert({ project_id: projectId, gebruiker_id: gebruiker?.id, actie: 'project_bijgewerkt', details: wijzigingen })
    }
  }

  async function handleUpdateTaak(taakId, wijzigingen) {
    await updateTaak(taakId, wijzigingen)
    if (wijzigingen.status === 'afgerond') {
      await supabase.from('geschiedenis').insert({ project_id: id, gebruiker_id: gebruiker?.id, actie: 'taak_afgerond', details: { titel: taken.find(t => t.id === taakId)?.titel } })
    }
  }

  async function handleVoegTaakToe(taak) {
    return voegTaakToe(taak)
  }

  async function handleVoegBlokkadeToe(blokkade) {
    await voegBlokkadeToe(blokkade)
    await supabase.from('geschiedenis').insert({ project_id: id, gebruiker_id: gebruiker?.id, actie: 'blokkade_gemeld', details: { omschrijving: blokkade.omschrijving } })
  }

  async function handleLosBlokkadeOp(blokkadeId, oplossing) {
    await losBlokkadeOp(blokkadeId, oplossing)
    await supabase.from('geschiedenis').insert({ project_id: id, gebruiker_id: gebruiker?.id, actie: 'blokkade_opgelost', details: {} })
  }

  async function handleVoegBesluitToe(besluit) {
    await voegBesluitToe(besluit)
    await supabase.from('geschiedenis').insert({ project_id: id, gebruiker_id: gebruiker?.id, actie: 'besluit_toegevoegd', details: { vraag: besluit.vraag } })
  }

  async function handleSluitBesluit(besluitId, uitkomst) {
    await sluitBesluit(besluitId, uitkomst)
    await supabase.from('geschiedenis').insert({ project_id: id, gebruiker_id: gebruiker?.id, actie: 'besluit_vastgelegd', details: {} })
  }

  if (laden || !project) return (
    <HoofdLay_out>
      <Topbalk broodkruimel={[{ label: 'Projectenboard', pad: '/' }, { label: 'Laden…' }]} />
      <Spinner tekst="Project ophalen…" />
    </HoofdLay_out>
  )

  const verlate = taken.filter(t => t.status !== 'afgerond' && t.einddatum < vandaag)

  return (
    <HoofdLay_out>
      <Topbalk broodkruimel={[{ label: 'Projectenboard', pad: '/' }, { label: project.titel }]} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CockpitHeader
          project={project}
          openBlokkades={openBlokkades.length}
          openBesluiten={openBesluiten.length}
          verlate={verlate.length}
          actieveTab={actieveTab}
          onTabWissel={setActieveTab}
        />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {actieveTab === 'overzicht' && (
            <Overzicht
              project={project}
              taken={taken}
              openBlokkades={openBlokkades}
              openBesluiten={openBesluiten}
              kanSchrijven={kanSchrijven}
              onUpdateProject={handleUpdateProject}
            />
          )}
          {actieveTab === 'taken' && (
            <TakenPlanning
              taken={taken}
              kanSchrijven={kanSchrijven}
              onUpdateTaak={handleUpdateTaak}
              onVoegTaakToe={handleVoegTaakToe}
              onVerwijderTaak={verwijderTaak}
            />
          )}
          {actieveTab === 'tijdlijn' && (
            <Tijdlijn
              taken={taken}
              kanSchrijven={kanSchrijven}
              onUpdateTaak={handleUpdateTaak}
            />
          )}
          {actieveTab === 'blokkades' && (
            <Blokkades
              blokkades={blokkades}
              openBlokkades={openBlokkades}
              opgelostBlokkades={opgelostBlokkades}
              kanSchrijven={kanSchrijven}
              onVoegToe={handleVoegBlokkadeToe}
              onLosOp={handleLosBlokkadeOp}
            />
          )}
          {actieveTab === 'besluiten' && (
            <Besluiten
              besluiten={besluiten}
              openBesluiten={openBesluiten}
              gesloten={gesloten}
              kanSchrijven={kanSchrijven}
              onVoegToe={handleVoegBesluitToe}
              onSluit={handleSluitBesluit}
              onUpdate={updateBesluit}
            />
          )}
          {actieveTab === 'historie' && (
            <Historie projectId={id} />
          )}
        </div>
      </div>
    </HoofdLay_out>
  )
}
