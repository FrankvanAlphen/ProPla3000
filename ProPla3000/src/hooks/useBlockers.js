import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBlockers(projectId) {
  const [blokkades, setBlokkades] = useState([])
  const [laden,     setLaden]     = useState(true)

  const laadBlokkades = useCallback(async () => {
    if (!projectId) return
    setLaden(true)
    const { data } = await supabase
      .from('blokkades')
      .select('*')
      .eq('project_id', projectId)
      .order('aangemaakt_op', { ascending: true })
    setBlokkades(data ?? [])
    setLaden(false)
  }, [projectId])

  useEffect(() => { laadBlokkades() }, [laadBlokkades])

  async function voegBlokkadeToe(blokkade) {
    const { data, error } = await supabase
      .from('blokkades')
      .insert({ ...blokkade, project_id: projectId, status: 'open' })
      .select()
      .single()
    if (!error) setBlokkades(prev => [...prev, data])
  }

  async function losBlokkadeOp(id, oplossing) {
    setBlokkades(prev => prev.map(b =>
      b.id === id ? { ...b, status: 'opgelost', oplossing } : b
    ))
    await supabase
      .from('blokkades')
      .update({ status: 'opgelost', oplossing, opgelost_op: new Date().toISOString() })
      .eq('id', id)
  }

  const openBlokkades  = blokkades.filter(b => b.status === 'open')
  const opgelostBlokkades = blokkades.filter(b => b.status === 'opgelost')

  return { blokkades, openBlokkades, opgelostBlokkades, laden, laadBlokkades, voegBlokkadeToe, losBlokkadeOp }
}
