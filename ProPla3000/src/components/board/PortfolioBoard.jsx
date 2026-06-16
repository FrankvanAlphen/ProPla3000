import { useState, useMemo } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCenter, useDroppable,
} from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { useNavigate } from 'react-router-dom'
import { T, PHASES } from '../../styles/tokens'
import { GezondheidsBadge, Badge, Spinner } from '../ui/index.jsx'
import { formateerDatum, dagenVanafVandaag, vandaag, blokkadeLeeftijd } from '../../lib/helpers'

// ── Kaart-component ────────────────────────────────────────────────────────
function ProjectKaart({ project, overlay = false }) {
  const navigate = useNavigate()

  const openBlokkades   = (project.blokkades  || []).filter(b => b.status === 'open').length
  const openBesluiten   = (project.besluiten  || []).filter(b => b.status === 'open').length
  const verlate         = (project.taken       || []).filter(t => t.status !== 'afgerond' && t.einddatum < vandaag).length
  const volgendeMijlpaal = (project.taken     || [])
    .filter(t => t.mijlpaal && t.einddatum >= vandaag)
    .sort((a, b) => a.einddatum.localeCompare(b.einddatum))[0]

  const gezondheidKleur = { groen: T.green, oranje: T.amber, rood: T.red }[project.gezondheid] || T.green

  return (
    <div
      onClick={() => !overlay && navigate(`/project/${project.id}`)}
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderTop: `3px solid ${gezondheidKleur}`,
        borderRadius: T.radius,
        padding: '12px 14px',
        cursor: overlay ? 'grabbing' : 'pointer',
        boxShadow: overlay
          ? '0 8px 30px rgba(99,13,128,0.2)'
          : '0 1px 3px rgba(99,13,128,0.06)',
        userSelect: 'none',
        transition: overlay ? undefined : 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (!overlay) e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,13,128,0.12)' }}
      onMouseLeave={e => { if (!overlay) e.currentTarget.style.boxShadow = '0 1px 3px rgba(99,13,128,0.06)' }}
    >
      {/* Titel + gezondheid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, lineHeight: 1.3, flex: 1 }}>
          {project.titel}
        </div>
        <GezondheidsBadge gezondheid={project.gezondheid} klein />
      </div>

      {/* Eigenaar */}
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>{project.eigenaar_naam || '—'}</div>

      {/* Volgende mijlpaal */}
      {volgendeMijlpaal && (
        <div style={{ background: T.bgPage, borderRadius: 5, padding: '5px 8px', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: T.textSecond }}>◆ {volgendeMijlpaal.titel}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: dagenVanafVandaag(volgendeMijlpaal.einddatum) <= 7 ? T.amber : T.textMuted }}>
            {dagenVanafVandaag(volgendeMijlpaal.einddatum)}d
          </span>
        </div>
      )}

      {/* Signalen */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {openBlokkades > 0 && (
          <Badge kleur={T.red} bg={T.redLight} rand={T.redBorder} klein>⊗ {openBlokkades} blokkade{openBlokkades > 1 ? 's' : ''}</Badge>
        )}
        {verlate > 0 && (
          <Badge kleur={T.amber} bg={T.amberLight} rand={T.amberBorder} klein>▲ {verlate} verlaat</Badge>
        )}
        {openBesluiten > 0 && (
          <Badge kleur={T.purple} bg={T.purpleLight} rand={T.border} klein>◈ {openBesluiten} besluit{openBesluiten > 1 ? 'en' : ''}</Badge>
        )}
        {openBlokkades === 0 && verlate === 0 && openBesluiten === 0 && (
          <Badge kleur={T.green} bg={T.greenLight} rand={T.greenBorder} klein>✓ Op schema</Badge>
        )}
      </div>
    </div>
  )
}

// ── Draagbaar wrapper ──────────────────────────────────────────────────────
function DraagbareKaart({ project }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: project.id,
    data: { project },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        marginBottom: 8,
        opacity: isDragging ? 0.35 : 1,
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <ProjectKaart project={project} />
    </div>
  )
}

// ── Kolom (droppable) ──────────────────────────────────────────────────────
function FaseKolom({ fase, projecten, isDragOver }) {
  const { setNodeRef } = useDroppable({ id: fase.key })

  return (
    <div
      ref={setNodeRef}
      style={{
        flexShrink: 0,
        width: 240,
        background: isDragOver ? fase.bg : T.bgPage,
        border: `2px solid ${isDragOver ? fase.kleur : T.border}`,
        borderRadius: T.radiusLg,
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s, background 0.15s',
        minHeight: 420,
      }}
    >
      {/* Kolomkop */}
      <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${T.border}`, background: fase.bg, borderRadius: `${T.radiusLg}px ${T.radiusLg}px 0 0` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: fase.kleur, display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: fase.kleur }}>{fase.key}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 20, minWidth: 20, textAlign: 'center', padding: '1px 7px', background: fase.kleur, color: '#fff' }}>
            {projecten.length}
          </span>
        </div>
      </div>

      {/* Kaarten */}
      <div style={{ padding: '10px', flex: 1, minHeight: 60 }}>
        {projecten.length === 0 ? (
          <div style={{
            border: `2px dashed ${isDragOver ? fase.kleur : T.border}`, borderRadius: T.radiusSm,
            padding: '20px 12px', textAlign: 'center',
            color: isDragOver ? fase.kleur : T.textMuted, fontSize: 12,
            transition: 'all 0.15s',
          }}>
            {isDragOver ? 'Hier loslaten' : 'Geen projecten'}
          </div>
        ) : (
          projecten.map(p => <DraagbareKaart key={p.id} project={p} />)
        )}
      </div>
    </div>
  )
}

// ── Portfolio Board hoofd ──────────────────────────────────────────────────
export function PortfolioBoard({ projecten, laden, updateFase, gebruikerId }) {
  const [actiefDragProject, setActiefDragProject] = useState(null)
  const [hoverFase, setHoverFase] = useState(null)

  // dnd-kit: PointerSensor met minimale bewegingsdrempel voorkomt klik-conflicten
  const sensoren = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const perFase = useMemo(() => {
    const kaart = {}
    PHASES.forEach(f => { kaart[f.key] = [] })
    projecten.forEach(p => {
      const fase = p.fase || 'Ideeën'
      if (kaart[fase]) kaart[fase].push(p)
      else kaart['Ideeën'].push(p)
    })
    return kaart
  }, [projecten])

  function onDragStart({ active }) {
    const project = projecten.find(p => p.id === active.id)
    setActiefDragProject(project ?? null)
  }

  function onDragOver({ over }) {
    setHoverFase(over?.id ?? null)
  }

  async function onDragEnd({ active, over }) {
    setActiefDragProject(null)
    setHoverFase(null)
    if (!over) return

    const project = projecten.find(p => p.id === active.id)
    const doelFase = over.id // over.id is de fase-sleutel (string)

    // Controleer of het een geldige fase-sleutel is
    const geldigeFase = PHASES.find(f => f.key === doelFase)
    if (!geldigeFase) return
    if (project?.fase === doelFase) return

    await updateFase(active.id, doelFase, gebruikerId)
  }

  if (laden) return <Spinner tekst="Projecten ophalen…" />

  return (
    <DndContext
      sensors={sensoren}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16,
        scrollbarWidth: 'thin', scrollbarColor: `${T.borderMid} transparent`,
      }}>
        {PHASES.map(fase => (
          <FaseKolom
            key={fase.key}
            fase={fase}
            projecten={perFase[fase.key] || []}
            isDragOver={hoverFase === fase.key}
          />
        ))}
      </div>

      {/* Sleep-overlay — toont kaart terwijl slepen */}
      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {actiefDragProject ? (
          <div style={{ width: 240, transform: 'rotate(2deg)' }}>
            <ProjectKaart project={actiefDragProject} overlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
