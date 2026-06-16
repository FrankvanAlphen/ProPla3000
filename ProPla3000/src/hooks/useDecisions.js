import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useDecisions(projectId) {
  const [besluiten, setBesluiten] = useState([])
  const [laden,     setLaden]     = useState(true)

  const laadBesluiten = useCallback(async () => {
    if (!projectId) return
    setLaden(true)
    const { data } = await supabase
      .from('besluiten')
      .select('*')
      .eq('project_id', projectId)
      .order('deadline', { ascending: true })
    setBesluiten(data ?? [])
    setLaden(false)
  }, [projectId])

  useEffect(() => { laadBesluiten() }, [laadBesluiten])

  async function voegBesluitToe(besluit) {
    const { data, error } = await supabase
      .from('besluiten')
      .insert({ ...besluit, project_id: projectId, status: 'open' })
      .select()
      .single()
    if (!error) setBesluiten(prev => [...prev, data])
  }

  async function sluitBesluit(id, uitkomst) {
    setBesluiten(prev => prev.map(b =>
      b.id === id ? { ...b, status: 'besloten', uitkomst } : b
    ))
    await supabase
      .from('besluiten')
      .update({ status: 'besloten', uitkomst, besloten_op: new Date().toISOString() })
      .eq('id', id)
  }

  async function updateBesluit(id, wijzigingen) {
    setBesluiten(prev => prev.map(b => b.id === id ? { ...b, ...wijzigingen } : b))
    await supabase.from('besluiten').update(wijzigingen).eq('id', id)
  }

  const openBesluiten = besluiten.filter(b => b.status === 'open')
  const gesloten      = besluiten.filter(b => b.status !== 'open')

  return { besluiten, openBesluiten, gesloten, laden, laadBesluiten, voegBesluitToe, sluitBesluit, updateBesluit }
}
