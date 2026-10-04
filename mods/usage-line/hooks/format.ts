import type { SessionMeasureInput } from 'claude-code'

import { DEFAULTS, type Settings } from './settings'

export type Reading = {
  fiveHour?: { percent: number; resetsAt?: string }
  sevenDay?: { percent: number; resetsAt?: string }
  context?: number
}

type Figures = Pick<SessionMeasureInput, 'context' | 'rateLimits'>

export const toReading = ({ context, rateLimits }: Figures): Reading => {
  const pick = (kind: string) => {
    const w = rateLimits.find(one => one.kind === kind)

    return w && { percent: w.percentUsed, resetsAt: w.resetsAt }
  }

  return {
    fiveHour: pick('five_hour'),
    sevenDay: pick('seven_day'),
    context: context.percent,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

// A reset time that does not parse is left off rather than drawn as NaN
const parse = (iso?: string) => {
  const d = iso === undefined ? undefined : new Date(iso)

  return d && !Number.isNaN(d.getTime()) ? d : undefined
}

const clock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

const date = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`

const CELLS = 10

// The cell at the edge fills in quarters
const SHADES = ['', '░', '▒', '▓']

// Figure space: the desktop status line collapses plain spaces and draws them
// far narrower than █
const EMPTY = '\u2007'

// Takes the rounded percent shown beside it, so meter and number always agree
const bar = (percent: number) => {
  const quarters = Math.min(CELLS * 4, Math.max(0, Math.round((percent / 100) * CELLS * 4)))
  const full = Math.floor(quarters / 4)
  const edge = SHADES[quarters % 4]
  const used = full + (edge ? 1 : 0)

  return `[${'█'.repeat(full)}${edge}${EMPTY.repeat(CELLS - used)}]`
}

// The same figure space as the empty cells between the parts
const SEP = EMPTY

export const toLine = (r: Reading, s: Settings = DEFAULTS): string => {
  const parts: string[] = []

  if (r.fiveHour) {
    const p = Math.round(r.fiveHour.percent)
    const at = s.fiveHour.reset ? parse(r.fiveHour.resetsAt) : undefined
    const meter = s.fiveHour.meter ? ` ${bar(p)}` : ''
    parts.push(`5h${meter} ${p}%${at ? ` (${clock(at)})` : ''}`)
  }
  if (r.sevenDay) {
    const p = Math.round(r.sevenDay.percent)
    const at = s.sevenDay.reset === 'off' ? undefined : parse(r.sevenDay.resetsAt)
    const when = at && (s.sevenDay.reset === 'date' ? date(at) : `${date(at)} ${clock(at)}`)
    const meter = s.sevenDay.meter ? ` ${bar(p)}` : ''
    parts.push(`7d${meter} ${p}%${when ? ` (${when})` : ''}`)
  }
  if (r.context !== undefined && s.context) {
    parts.push(`ctx ${Math.round(r.context)}%`)
  }

  return parts.length === 0 ? 'no reading yet' : parts.join(SEP)
}
