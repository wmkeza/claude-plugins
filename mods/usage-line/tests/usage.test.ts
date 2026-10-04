import { describe, expect, test } from 'claude-code/testing'

import { toLine, toReading } from '../hooks/format'
import { applyArgs, DEFAULTS, toList, toSettings } from '../hooks/settings'

const figures = {
  context: { window: 200000, tokens: 126000, percent: 63 },
  rateLimits: [
    { kind: 'five_hour', percentUsed: 62.4, resetsAt: '2026-10-02T14:00:00' },
    { kind: 'seven_day', percentUsed: 18, resetsAt: '2026-10-06T09:05:00' },
  ],
}

// Empty cells are figure spaces
const _ = (n: number) => '\u2007'.repeat(n)

const line = `5h [██████░${_(3)}] 62% (14:00)${_(1)}7d 18% (10/6)${_(1)}ctx 63%`

const fiveHour = (percentUsed: number) =>
  toLine(toReading({ context: { window: 200000 }, rateLimits: [{ kind: 'five_hour', percentUsed }] }))

describe('format', () => {
  test('one line with 5h, 7d and context', () => {
    expect(toLine(toReading(figures))).toBe(line)
  })

  test('the meter fills ten cells in quarters', () => {
    expect(fiveHour(0)).toBe(`5h [${_(10)}] 0%`)
    expect(fiveHour(1)).toBe(`5h [${_(10)}] 1%`)
    expect(fiveHour(2)).toBe(`5h [░${_(9)}] 2%`)
    expect(fiveHour(5)).toBe(`5h [▒${_(9)}] 5%`)
    expect(fiveHour(8)).toBe(`5h [▓${_(9)}] 8%`)
    expect(fiveHour(10)).toBe(`5h [█${_(9)}] 10%`)
    expect(fiveHour(88)).toBe(`5h [████████▓${_(1)}] 88%`)
    expect(fiveHour(99)).toBe('5h [██████████] 99%')
    expect(fiveHour(100)).toBe('5h [██████████] 100%')
    expect(fiveHour(120)).toBe('5h [██████████] 120%')
  })

  test('the meter follows the rounded percent beside it', () => {
    expect(fiveHour(4.6)).toBe(`5h [▒${_(9)}] 5%`)
    expect(fiveHour(14.6)).toBe(`5h [█▒${_(8)}] 15%`)
  })

  test('a reset time that does not parse is left off', () => {
    const r = toReading({
      context: { window: 200000 },
      rateLimits: [{ kind: 'five_hour', percentUsed: 10, resetsAt: 'not a date' }],
    })
    expect(toLine(r)).toBe(`5h [█${_(9)}] 10%`)
  })

  test('no rate limits off a subscription', () => {
    expect(toLine(toReading({ context: { window: 200000, percent: 14 }, rateLimits: [] }))).toBe('ctx 14%')
    expect(toLine(toReading({ context: { window: 200000 }, rateLimits: [] }))).toBe('no reading yet')
  })
})

describe('settings', () => {
  const reading = toReading(figures)
  const set = (args: string) => applyArgs(DEFAULTS, args)

  test('each setting changes its own part', () => {
    expect(toLine(reading, set('5h meter off'))).toBe(`5h 62% (14:00)${_(1)}7d 18% (10/6)${_(1)}ctx 63%`)
    expect(toLine(reading, set('5h reset off'))).toBe(`5h [██████░${_(3)}] 62%${_(1)}7d 18% (10/6)${_(1)}ctx 63%`)
    expect(toLine(reading, set('7d meter on'))).toBe(
      `5h [██████░${_(3)}] 62% (14:00)${_(1)}7d [█▓${_(8)}] 18% (10/6)${_(1)}ctx 63%`,
    )
    expect(toLine(reading, set('7d reset on'))).toBe(`5h [██████░${_(3)}] 62% (14:00)${_(1)}7d 18% (10/6 09:05)${_(1)}ctx 63%`)
    expect(toLine(reading, set('7d reset off'))).toBe(`5h [██████░${_(3)}] 62% (14:00)${_(1)}7d 18%${_(1)}ctx 63%`)
    expect(toLine(reading, set('ctx off'))).toBe(`5h [██████░${_(3)}] 62% (14:00)${_(1)}7d 18% (10/6)`)
  })

  test('args that name no setting are refused', () => {
    for (const args of ['ctx', 'ctx maybe', '5h reset date', '7d', '7d meter', 'week reset on', '5h meter on off']) {
      expect(set(args)).toBeUndefined()
    }
  })

  test('a stored value keeps what it can and defaults the rest', () => {
    expect(toSettings(undefined)).toEqual(DEFAULTS)
    expect(toSettings({ context: false, sevenDay: { reset: 'never', meter: true } })).toEqual({
      ...DEFAULTS,
      context: false,
      sevenDay: { meter: true, reset: 'date' },
    })
  })

  test('the list reads like the settings', () => {
    expect(toList(DEFAULTS)).toBe(
      [
        '',
        '5h - Session limit',
        `${_(2)}meter: on`,
        `${_(2)}reset: on`,
        '7d - Weekly limit',
        `${_(2)}meter: off`,
        `${_(2)}reset: date`,
        'Context window: on',
      ].join('\n'),
    )
  })
})

describe('hooks', () => {
  test('a measurement pins the status line', async ($, on) => {
    const lines: (string | undefined)[] = []
    on('ui.status', (_$, e) => {
      lines.push(e.text)

      return null as never
    })
    on('session.measure', (_$, e) => ({ changed: e.changed }))
    await $.session.measure({ ...figures, changed: ['rateLimits', 'context'] })
    expect(lines.at(-1)).toBe(line)
  })

  test('/usage-line redraws the line and keeps the setting', async ($, on) => {
    const lines: (string | undefined)[] = []
    const stored = new Map<string, unknown>()
    on('ui.status', (_$, e) => {
      lines.push(e.text)

      return { value: undefined }
    })
    on('store.get', (_$, e) => ({ value: stored.get(e.key) }))
    on('store.set', (_$, e) => {
      stored.set(e.key, e.value)

      return { value: undefined }
    })
    on('session.measure', (_$, e) => ({ changed: e.changed }))
    await $.session.measure({ ...figures, changed: ['rateLimits', 'context'] })

    const ran = await $.command.run({ command: 'usage-line', args: 'ctx off' })
    expect(lines.at(-1)).toBe(`5h [██████░${_(3)}] 62% (14:00)${_(1)}7d 18% (10/6)`)
    expect(ran.text).toContain('Context window: off')
    expect(stored.get('settings')).toEqual({ ...DEFAULTS, context: false })

    const wrong = await $.command.run({ command: 'usage-line', args: 'ctx maybe' })
    expect(wrong.text).toContain('Usage:')
  })
})
