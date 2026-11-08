/**
 * SMART sentence assembled from the answers with hand-written templates (D-027).
 * Deterministic: no rephrasing, only trimming, punctuation and capitalisation.
 */

export type SmartAnswers = {
  specific?: string | null
  measurable?: string | null
  achievable?: string | null
  obstacle?: string | null
  if_then?: string | null
  relevant?: string | null
  time_bound?: string | null
}

export type SmartTemplates = {
  timeFirst: string
  specificOnly: string
  measured: string
  ifThen: string
  because: string
}

const clean = (v: string | null | undefined) =>
  (v ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\s.!…;,]+$/u, '')

/** Lower-cases the first letter when the text continues a sentence (keeps "Léa", "ONU"…). */
function continuing(text: string) {
  const [first, second] = [...text]
  if (!first || !second) return text
  return first === first.toUpperCase() && second === second.toLowerCase() && /\p{Ll}/u.test(second)
    ? first.toLowerCase() + text.slice(first.length)
    : text
}

const capitalise = (text: string) => (text ? text[0]!.toUpperCase() + text.slice(1) : text)

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')
}

export function assembleSmartSentence(answers: SmartAnswers, templates: SmartTemplates): string {
  const specific = clean(answers.specific)
  const time = clean(answers.time_bound)
  const measurable = clean(answers.measurable)
  const ifThen = clean(answers.if_then)
  const relevant = clean(answers.relevant)

  const parts: string[] = []
  if (specific && time)
    parts.push(capitalise(fill(templates.timeFirst, { time, specific: continuing(specific) })))
  else if (specific) parts.push(capitalise(fill(templates.specificOnly, { specific })))
  else if (time) parts.push(capitalise(`${time}.`))
  if (measurable) parts.push(fill(templates.measured, { measurable: continuing(measurable) }))
  if (ifThen) parts.push(capitalise(`${fill(templates.ifThen, { ifThen })}.`))
  if (relevant) parts.push(fill(templates.because, { relevant: continuing(relevant) }))
  return parts.join(' ')
}

/** "4 critères sur 5 renseignés": A counts if any of its three answers is filled. */
export function smartFilledCount(answers: SmartAnswers): number {
  const filled = (v?: string | null) => Boolean(v && v.trim())
  return [
    filled(answers.specific),
    filled(answers.measurable),
    filled(answers.achievable) || filled(answers.obstacle) || filled(answers.if_then),
    filled(answers.relevant),
    filled(answers.time_bound),
  ].filter(Boolean).length
}
