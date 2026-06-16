import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { T } from '../styles/tokens'

export function LoginPage() {
  const { inloggen } = useAuth()
  const [email,      setEmail]      = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [fout,       setFout]       = useState('')
  const [laden,      setLaden]      = useState(false)

  async function submit(e) {
    e.preventDefault()
    setFout(''); setLaden(true)
    try {
      await inloggen(email, wachtwoord)
    } catch (err) {
      setFout('Inloggen mislukt. Controleer uw e-mailadres en wachtwoord.')
    } finally {
      setLaden(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: T.bgPage, width: '100%' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: T.purple, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <span style={{ color: T.lime, fontSize: 28, fontWeight: 900 }}>P</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, letterSpacing: '-0.02em' }}>
            Planner<span style={{ color: T.purple }}>++</span>
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Project Cockpit</div>
        </div>

        {/* Formulier */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 32, boxShadow: '0 4px 24px rgba(99,13,128,0.08)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>Inloggen</div>
          <div style={{ fontSize: 13, color: T.textSecond, marginBottom: 24 }}>Voer uw gegevens in om verder te gaan</div>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.textSecond, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                E-mailadres
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="naam@organisatie.nl"
                style={{ width: '100%', background: T.bgPage, border: `1px solid ${T.borderMid}`, borderRadius: 6, color: T.textPrimary, fontSize: 13, padding: '10px 12px', outline: 'none', boxSizing: 'border-box', fontFamily: T.fontBase }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.textSecond, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Wachtwoord
              </label>
              <input
                type="password" value={wachtwoord} onChange={e => setWachtwoord(e.target.value)} required
                placeholder="••••••••"
                style={{ width: '100%', background: T.bgPage, border: `1px solid ${T.borderMid}`, borderRadius: 6, color: T.textPrimary, fontSize: 13, padding: '10px 12px', outline: 'none', boxSizing: 'border-box', fontFamily: T.fontBase }}
              />
            </div>

            {fout && (
              <div style={{ padding: '10px 12px', background: T.redLight, border: `1px solid ${T.redBorder}`, borderRadius: 6, fontSize: 13, color: T.red, marginBottom: 16 }}>
                {fout}
              </div>
            )}

            <button
              type="submit" disabled={laden}
              style={{ width: '100%', padding: '11px', background: T.purple, color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: laden ? 'not-allowed' : 'pointer', opacity: laden ? 0.7 : 1, fontFamily: T.fontBase }}
            >
              {laden ? 'Inloggen…' : 'Inloggen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
