// Ontwerptoken — JP van Eesteren / TBI merkstijl
export const T = {
  // Primaire kleuren
  purple:      '#630D80',
  purpleDark:  '#4A0960',
  purpleLight: '#EDE0F2',
  purpleMid:   '#9B59B6',
  lime:        '#C1E62E',
  limeDark:    '#9BB824',
  limeLight:   '#F0FAC8',

  // Achtergrond & oppervlak
  white:    '#FFFFFF',
  bgPage:   '#F5F4F8',
  bgCard:   '#FFFFFF',

  // Randen
  border:    '#E8E4EE',
  borderMid: '#D4CCE0',

  // Tekst
  textPrimary: '#1A1A2E',
  textSecond:  '#5A5470',
  textMuted:   '#9B95A8',

  // Signalen
  red:         '#DC2626',
  redLight:    '#FEF2F2',
  redBorder:   '#FECACA',
  amber:       '#D97706',
  amberLight:  '#FFFBEB',
  amberBorder: '#FDE68A',
  green:       '#16A34A',
  greenLight:  '#F0FDF4',
  greenBorder: '#BBF7D0',
  blue:        '#2563EB',
  blueLight:   '#EFF6FF',
  blueBorder:  '#BFDBFE',

  // Typografie
  fontBase: "'Verdana', system-ui, sans-serif",

  // Lay-out
  navWidth:    220,
  radius:      8,
  radiusSm:    4,
  radiusLg:    12,
}

// Fase-definities met kleurcodering
export const PHASES = [
  { key: 'Ideeën',             kleur: '#7C3AED', bg: '#F5F3FF', rand: '#DDD6FE', volgorde: 1 },
  { key: 'Inventarisatie',     kleur: '#2563EB', bg: '#EFF6FF', rand: '#BFDBFE', volgorde: 2 },
  { key: 'Analyse',            kleur: '#0891B2', bg: '#ECFEFF', rand: '#A5F3FC', volgorde: 3 },
  { key: 'Implementatie',      kleur: '#630D80', bg: '#EDE0F2', rand: '#D4B0E8', volgorde: 4 },
  { key: 'Nazorg',             kleur: '#16A34A', bg: '#F0FDF4', rand: '#BBF7D0', volgorde: 5 },
  { key: 'Archief',            kleur: '#6B7280', bg: '#F9FAFB', rand: '#E5E7EB', volgorde: 6 },
]

export const GEZONDHEID_OPTIES = [
  { waarde: 'groen',  label: 'Op schema',       kleur: '#16A34A', bg: '#F0FDF4', rand: '#BBF7D0' },
  { waarde: 'oranje', label: 'Aandacht vereist', kleur: '#D97706', bg: '#FFFBEB', rand: '#FDE68A' },
  { waarde: 'rood',   label: 'Kritiek',          kleur: '#DC2626', bg: '#FEF2F2', rand: '#FECACA' },
]

export const TAAK_STATUSSEN = [
  { waarde: 'niet_gestart', label: 'Niet gestart' },
  { waarde: 'actief',       label: 'Actief'       },
  { waarde: 'geblokkeerd',  label: 'Geblokkeerd'  },
  { waarde: 'afgerond',     label: 'Afgerond'     },
]

export const BESLUIT_STATUSSEN = [
  { waarde: 'open',    label: 'Open'    },
  { waarde: 'besloten',label: 'Besloten'},
  { waarde: 'uitgesteld', label: 'Uitgesteld' },
]
