import { HoofdLay_out, Topbalk } from '../components/layout/Layout.jsx'
import { Beheer } from '../components/beheer/Beheer.jsx'
import { useAuth } from '../hooks/useAuth'
import { T } from '../styles/tokens'

export function BeheerPage() {
  const { profiel } = useAuth()

  if (profiel?.rol !== 'admin') {
    return (
      <HoofdLay_out>
        <Topbalk broodkruimel={[{ label: 'Beheer' }]} />
        <div style={{ padding: 40, color: T.textMuted, fontSize: 14 }}>
          U heeft geen toegang tot deze pagina. Neem contact op met een beheerder.
        </div>
      </HoofdLay_out>
    )
  }

  return (
    <HoofdLay_out>
      <Topbalk broodkruimel={[{ label: 'Projectenboard', pad: '/' }, { label: 'Beheer' }]} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Beheer />
      </div>
    </HoofdLay_out>
  )
}
