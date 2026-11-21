import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { SECTION_ID, toRules } from './rules'

const PANE = 'milestone'
const TITLE = 'Milestone'
const NAME = 'milestone.md'
const SKILL = 'milestone'
const POLL_MS = 30_000
const MISSING = '_milestone.md がありません。_'
const text = atom({ plugin: 'milestone-pane', key: 'text' } as const, MISSING, { shape: 'text-1' })

const norm = (p: string) => p.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
const isAbsolute = (p: string) => /^([A-Za-z]:)?[\\/]/.test(p)

// The session's milestone.md: under its folder ($.session.root(), which a shell
// `cd` does not move; a worktree session's is the worktree)
let file = ''
// /milestone ran before milestone.md existed: open the pane once Claude writes it
let isOpenOnWrite = false

async function locate($: EngineInterface): Promise<void> {
  const root = await $.session.root()
  const sep = root.includes('\\') ? '\\' : '/'
  file = `${root.replace(/[\\/]+$/, '')}${sep}${NAME}`
}

// Reads milestone.md into the pane's text; says whether it exists
async function refresh($: EngineInterface): Promise<boolean> {
  await locate($)
  let now = MISSING
  let has = false
  try {
    now = await $.fs.read(file)
    has = true
  } catch { /* not there */ }
  await update($, text, old => (old === now ? old : now))

  return has
}

async function open($: EngineInterface): Promise<void> {
  await $.ui.open({ id: PANE, title: TITLE })
}

export const register: Register = on => {
  file = ''
  isOpenOnWrite = false

  on('session.start', async ($, e, next) => {
    if (await refresh($)) {
      void open($)
    }
    $.clock.every(POLL_MS, () => { void refresh($) })

    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    await locate($)
    if (!(await $.fs.exists(file))) {
      return composed
    }

    return {
      sections: [
        ...composed.sections.filter(s => s.id !== SECTION_ID),
        { id: SECTION_ID, text: toRules(file), scope: 'session' },
      ],
    }
  })

  on('skill.prompt', async ($, e, next) => {
    const isOurs = e.skill === SKILL || e.skill.endsWith(`:${SKILL}`)
    if (isOurs) {
      if (await refresh($)) {
        await open($)
      } else {
        isOpenOnWrite = true
      }
    }

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    const path = 'file_path' in e && typeof e.file_path === 'string' ? e.file_path : undefined
    if (path === undefined) {
      return ran
    }
    await locate($)
    // A relative path is the tool's, resolved against the shell's directory
    const full = isAbsolute(path) ? path : `${await $.session.cwd()}/${path}`
    if (norm(full) === norm(file) && (await refresh($)) && isOpenOnWrite) {
      isOpenOnWrite = false
      await open($)
    }

    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Markdown } = $.ui.resolve(e)

    return (
      // Each list line in its own Box, indented by its nesting, so the levels show on every surface.
      // Split on any line break: with CRLF a trailing \r would keep a line from matching as a
      // list item, and a Step line's 4-space indent would then draw as a code block
      <Box flexDirection="column" rowGap="sm">
        {(await read($, text)).split(/\r\n?|\n/).filter(l => l.trim() !== '').map((line, i) => {
          const m = /^(\s*)- (.*)$/.exec(line)
          const level = m ? Math.floor((m[1] ?? '').length / 2) : 0

          return (
            <Box key={String(i)} paddingLeft={level * 4}>
              <Markdown text={m ? `- ${m[2] ?? ''}` : line} />
            </Box>
          )
        })}
      </Box>
    )
  })
}
