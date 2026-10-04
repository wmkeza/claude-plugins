export type SevenDayReset = 'on' | 'off' | 'date'

export type Settings = {
  fiveHour: { meter: boolean; reset: boolean }
  sevenDay: { meter: boolean; reset: SevenDayReset }
  context: boolean
}

export const DEFAULTS: Settings = {
  fiveHour: { meter: true, reset: true },
  sevenDay: { meter: false, reset: 'date' },
  context: true,
}

const flag = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)

const RESETS: readonly SevenDayReset[] = ['on', 'off', 'date']

// What the store hands back is whatever an older version wrote: a field that
// is missing or of the wrong kind falls back to its default
export const toSettings = (raw: unknown): Settings => {
  const o = (raw ?? {}) as Partial<Record<keyof Settings, any>>
  const d = DEFAULTS

  return {
    fiveHour: {
      meter: flag(o.fiveHour?.meter, d.fiveHour.meter),
      reset: flag(o.fiveHour?.reset, d.fiveHour.reset),
    },
    sevenDay: {
      meter: flag(o.sevenDay?.meter, d.sevenDay.meter),
      reset: RESETS.includes(o.sevenDay?.reset) ? o.sevenDay.reset : d.sevenDay.reset,
    },
    context: flag(o.context, d.context),
  }
}

const onOff = (b: boolean) => (b ? 'on' : 'off')

// Figure spaces, as on the status line: the desktop app drops plain leading
// spaces from a command's output
const INDENT = ' '.repeat(2)

// Starts on a new line, below the plugin name the output is shown under
export const toList = (s: Settings): string =>
  [
    '',
    '5h - Session limit',
    `${INDENT}meter: ${onOff(s.fiveHour.meter)}`,
    `${INDENT}reset: ${onOff(s.fiveHour.reset)}`,
    '7d - Weekly limit',
    `${INDENT}meter: ${onOff(s.sevenDay.meter)}`,
    `${INDENT}reset: ${s.sevenDay.reset}`,
    `Context window: ${onOff(s.context)}`,
  ].join('\n')

export const HELP = [
  'Usage:',
  '  /usage-line',
  '  /usage-line 5h meter on|off',
  '  /usage-line 5h reset on|off',
  '  /usage-line 7d meter on|off',
  '  /usage-line 7d reset on|off|date',
  '  /usage-line ctx on|off',
].join('\n')

const toFlag = (v?: string) => (v === 'on' ? true : v === 'off' ? false : undefined)

// The settings after `/usage-line <args>`, or undefined when the args do not
// name one setting and a value it takes
export const applyArgs = (s: Settings, args: string): Settings | undefined => {
  const [group, item, value, ...rest] = args.trim().split(/\s+/)

  if (group === 'ctx' && value === undefined) {
    const b = toFlag(item)

    return b === undefined ? undefined : { ...s, context: b }
  }
  if (rest.length > 0) {
    return undefined
  }
  if (group === '5h' && (item === 'meter' || item === 'reset')) {
    const b = toFlag(value)

    return b === undefined ? undefined : { ...s, fiveHour: { ...s.fiveHour, [item]: b } }
  }
  if (group === '7d' && item === 'meter') {
    const b = toFlag(value)

    return b === undefined ? undefined : { ...s, sevenDay: { ...s.sevenDay, meter: b } }
  }
  if (group === '7d' && item === 'reset' && RESETS.includes(value as SevenDayReset)) {
    return { ...s, sevenDay: { ...s.sevenDay, reset: value as SevenDayReset } }
  }

  return undefined
}
