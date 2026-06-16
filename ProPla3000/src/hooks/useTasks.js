import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks(projectId) {
  const [taken,  setTaken]  = useState([])
  const [laden,  setLaden]  = useState(true)
  const [fout,   setFout]   = useState(null)

  const laadTaken = useCallback(async () => {
    if (!projectId) return
    setLaden(true)
    const { data, error } = await supabase
      .from('taken')
      .select('*')
      .eq('project_id', projectId)
      .order('startdatum', { ascending: true })

    if (error) { setFout(error.message); setLaden(false); return }
    setTaken(data ?? [])
    setLaden(false)
  }, [projectId])

  useEffect(() => { laadTaken() }, [laadTaken])

  async function updateTaak(id, wijzigingen) {
    setTaken(prev => prev.map(t => t.id === id ? { ...t, ...wijzigingen } : t))
    const { error } = await supabase
      .from('taken')
      .update({ ...wijzigingen, bijgewerkt_op: new Date().toISOString() })
      .eq('id', id)
    if (error) { setFout(error.message); laadTaken() }
  }

  async function voegTaakToe(taak) {
    const { data, error } = await supabase
      .from('taken')
      .insert({ ...taak, project_id: projectId })
      .select()
      .single()
    if (error) { setFout(error.message); return null }
    setTaken(prev => [...prev, data])
    return data
  }

  async function verwijderTaak(id) {
    setTaken(prev => prev.filter(t => t.id !== id))
    await supabase.from('taken').delete().eq('id', id)
  }

  // Herschikking: verschuif start + einddatum met N dagen
  async function verschuifTaak(id, aantalDagen) {
    const taak = taken.find(t => t.id === id)
    if (!taak) return
    const start = verschuifDatumStr(taak.startdatum, aantalDagen)
    const einde = verschuifDatumStr(taak.einddatum, aantalDagen)
    await updateTaak(id, { startdatum: start, einddatum: einde })
  }

  return { taken, laden, fout, laadTaken, updateTaak, voegTaakToe, verwijderTaak, verschuifTaak }
}

function verschuifDatumStr(dateStr, dagen) {
  const dt = new Date(dateStr + 'T00:00:00')
  dt.setDate(dt.getDate() + dagen)
  return dt.toISOString().slice(0, 10)
}
