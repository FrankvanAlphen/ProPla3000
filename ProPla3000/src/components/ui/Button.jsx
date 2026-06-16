import { T } from '../../styles/tokens'

const VARIANTEN = {
  primair:    { background: T.purple,     color: '#fff',         border: `1px solid ${T.purple}`     },
  secundair:  { background: T.white,      color: T.purple,       border: `1px solid ${T.borderMid}`  },
  gevaar:     { background: T.redLight,   color: T.red,          border: `1px solid ${T.redBorder}`  },
  succes:     { background: T.greenLight, color: T.green,        border: `1px solid ${T.greenBorder}`},
  amber:      { background: T.amberLight, color: T.amber,        border: `1px solid ${T.amberBorder}`},
  geest:      { background: 'transparent',color: T.textSecond,   border: '1px solid transparent'     },
}

export function Knop({ kinderen, onClick, variant = 'secundair', klein, uitgeschakeld, stijl, type = 'button' }) {
  const base = {
    borderRadius: T.radiusSm,
    fontWeight: 600,
    cursor: uitgeschakeld ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
    fontSize: klein ? 11 : 13,
    padding: klein ? '4px 10px' : '8px 16px',
    opacity: uitgeschakeld ? 0.5 : 1,
    fontFamily: T.fontBase,
    transition: 'opacity 0.1s',
    lineHeight: 1.4,
  }
  return (
    <button
      type={type}
      onClick={uitgeschakeld ? undefined : onClick}
      style={{ ...base, ...VARIANTEN[variant], ...stijl }}
    >
      {kinderen}
    </button>
  )
}
