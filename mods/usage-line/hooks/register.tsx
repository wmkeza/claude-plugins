import type { Register } from 'claude-code'

import { type Reading, toLine, toReading } from './format'
import { applyArgs, HELP, type Settings, toList, toSettings } from './settings'

const COMMAND = 'usage-line'

export const register: Register = on => {
  // A measurement that lands while session.start awaits usage() is newer: keep it
  let measured = false
  let settings: Settings = toSettings(undefined)
  let last: Reading | undefined

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Choose what the usage status line shows',
      argumentHint: '[5h|7d|ctx] [meter|reset] [on|off|date]',
      immediate: true,
    })
    settings = toSettings(await $.store.get('settings'))
    const r = toReading(await $.session.usage())
    if (!measured) {
      last = r
      $.ui.status(toLine(r, settings))
    }

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    measured = true
    last = toReading(e)
    $.ui.status(toLine(last, settings))

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    if (e.args.trim() === '') {
      return { text: toList(settings) }
    }
    const changed = applyArgs(settings, e.args)
    if (!changed) {
      return { text: HELP }
    }
    settings = changed
    await $.store.set('settings', settings)
    last ??= toReading(await $.session.usage())
    $.ui.status(toLine(last, settings))

    return { text: toList(settings) }
  })
}
