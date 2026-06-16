import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [gebruiker, setGebruiker] = useState(null)
  const [profiel,   setProfiel]   = useState(null)
  const [laden,     setLaden]     = useState(true)

  useEffect(() => {
    // Haal huidige sessie op
    supabase.auth.getSession().then(({ data: { session } }) => {
      setGebruiker(session?.user ?? null)
      if (session?.user) laadProfiel(session.user.id)
      else setLaden(false)
    })

    // Luister naar auth-wijzigingen
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setGebruiker(session?.user ?? null)
      if (session?.user) laadProfiel(session.user.id)
      else { setProfiel(null); setLaden(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function laadProfiel(userId) {
    const { data } = await supabase
      .from('profielen')
      .select('*')
      .eq('id', userId)
      .single()
    setProfiel(data)
    setLaden(false)
  }

  async function inloggen(email, wachtwoord) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: wachtwoord })
    if (error) throw error
  }

  async function uitloggen() {
    await supabase.auth.signOut()
  }

  const isViewer = profiel?.rol === 'viewer'
  const kanSchrijven = !isViewer

  return (
    <AuthContext.Provider value={{ gebruiker, profiel, laden, inloggen, uitloggen, isViewer, kanSchrijven }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth moet binnen AuthProvider gebruikt worden')
  return ctx
}
