// Hulpfuncties — gedeeld door de hele applicatie

/** Geeft het aantal dagen tussen twee datumstrings */
export function dagenTussen(a, b) {
  const msA = new Date(a + 'T00:00:00').getTime()
  const msB = new Date(b + 'T00:00:00').getTime()
  return Math.round((msB - msA) / 86400000)
}

/** Vandaag als ISO-datumstring (YYYY-MM-DD) */
export const vandaag = new Date().toISOString().slice(0, 10)

/** Relatieve datumweergave in het Nederlands */
export function relatieveDatum(dateStr) {
  if (!dateStr) return '—'
  const diff = dagenTussen(dateStr, vandaag)
  if (diff === 0)  return 'Vandaag'
  if (diff === 1)  return 'Gisteren'
  if (diff < 7)    return `${diff}d geleden`
  return formateerDatum(dateStr)
}

/** Datumopmaak: "3 jun" */
export function formateerDatum(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short',
  })
}

/** Dagen vanaf vandaag (positief = toekomst) */
export function dagenVanafVandaag(dateStr) {
  if (!dateStr) return null
  return dagenTussen(vandaag, dateStr)
}

/** Is de taak verlaat? */
export function isVerlaat(taak) {
  if (!taak.einddatum) return false
  return taak.status !== 'afgerond' && taak.einddatum < vandaag
}

/** Is de taak op risico? (niet gestart, deadline < 7 dagen) */
export function isOpRisico(taak) {
  if (taak.status === 'afgerond') return false
  const dagen = dagenVanafVandaag(taak.einddatum)
  return dagen !== null && dagen >= 0 && dagen <= 7 && taak.status === 'niet_gestart'
}

/** Blokkade-leeftijd in dagen */
export function blokkadeLeeftijd(raisedAt) {
  return dagenTussen(raisedAt, vandaag)
}

/** Geeft kleur op basis van blokkade-leeftijd */
export function leeftijdKleur(dagen) {
  if (dagen <= 3) return '#9B95A8'
  if (dagen <= 7) return '#D97706'
  return '#DC2626'
}

/** Uniek ID genereren */
export const nieuwId = () => Math.random().toString(36).slice(2, 9)

/** Datum N dagen verschuiven */
export function verschuifDatum(dateStr, aantalDagen) {
  const dt = new Date(dateStr + 'T00:00:00')
  dt.setDate(dt.getDate() + aantalDagen)
  return dt.toISOString().slice(0, 10)
}
