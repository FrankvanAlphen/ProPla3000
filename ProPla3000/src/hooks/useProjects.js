import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProjects() {
  const [projecten, setProjecten] = useState([])
  const [laden,     setLaden]     = useState(true)
  const [fout,      setFout]      = useState(null)

  const laadProjecten = useCallback(async () => {
    setLaden(true)
    const { data, error } = await supabase
      .from('projecten')
      .select(`
        *,
        blokkades(id, status),
        besluiten(id, status),
        taken(id, status, einddatum, mijlpaal)
      `)
      .order('aangemaakt_op', { ascending: false })

    if (error) { setFout(error.message); setLaden(false); return }
    setProjecten(data ?? [])
    setLaden(false)
  }, [])

  useEffect(() => { laadProjecten() }, [laadProjecten])

  async function updateFase(projectId, nieuweFase, gebruikerId) {
    // Optimistische UI-update
    setProjecten(prev => prev.map(p =>
      p.id === projectId ? { ...p, fase: nieuweFase } : p
    ))

    const { error } = await supabase
      .from('projecten')
      .update({ fase: nieuweFase, bijgewerkt_op: new Date().toISOString() })
      .eq('id', projectId)

    if (error) {
      setFout(error.message)
      laadProjecten() // herstel bij fout
      return false
    }

    // Log in geschiedenis
    await supabase.from('geschiedenis').insert({
      project_id: projectId,
      gebruiker_id: gebruikerId,
      actie: 'fase_gewijzigd',
      details: { nieuwe_fase: nieuweFase },
    })

    return true
  }

  async function updateProject(id, wijzigingen, gebruikerId) {
    setProjecten(prev => prev.map(p => p.id === id ? { ...p, ...wijzigingen } : p))

    const { error } = await supabase
      .from('projecten')
      .update({ ...wijzigingen, bijgewerkt_op: new Date().toISOString() })
      .eq('id', id)

    if (error) { setFout(error.message); laadProjecten(); return false }

    await supabase.from('geschiedenis').insert({
      project_id: id,
      gebruiker_id: gebruikerId,
      actie: 'project_bijgewerkt',
      details: wijzigingen,
    })
    return true
  }

  async function voegProjectToe(project, gebruikerId) {
    const { data, error } = await supabase
      .from('projecten')
      .insert({ ...project, eigenaar_id: gebruikerId })
      .select()
      .single()

    if (error) { setFout(error.message); return null }
    setProjecten(prev => [data, ...prev])
    return data
  }

  return { projecten, laden, fout, laadProjecten, updateFase, updateProject, voegProjectToe }
}
