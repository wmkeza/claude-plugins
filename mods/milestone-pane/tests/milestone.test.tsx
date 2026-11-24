import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

// The test runtime has it; the hooks module's lib does not declare it
declare function setTimeout(fn: () => void, ms: number): unknown

const CWD = 'C:/work/repo'
const FILE = `${CWD}/milestone.md`
const BODY = '- [x] Milestone 1: 要件を決める\n- [ ] **Milestone 2: 画面を作る**\n  - [ ] ▶ **Task 1: 一覧画面**\n'

const PANE = {
  plugin: 'milestone-pane',
  component: 'Pane',
  requestId: 'milestone',
  props: {
    title: 'Milestone',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

const COMPOSE = { model: 'm', promptModel: 'm', surfaces: ['desktop'], tools: [], outputStyle: null, traits: [] } as const

const BASE = [{ id: 'intro', text: 'intro', scope: 'shared' }] as const

const slash = (p: string) => p.replace(/\\/g, '/')

// A file system holding `files`; returns the panes opened
const engine = (on: On, files: Map<string, string>) => {
  const opened: string[] = []
  on('session.root', () => ({ value: CWD }))
  on('session.cwd', () => ({ value: CWD }))
  on('clock.every', () => ({ value: undefined }))
  on('fs.read', (_, e) => {
    const t = files.get(slash(e.path))
    if (t === undefined) throw new Error('ENOENT')

    return { value: t }
  })
  on('fs.exists', (_, e) => ({ value: files.has(slash(e.path)) }))
  on('ui.open', (_, e) => {
    opened.push(e.id)

    return { value: { isPlaced: true } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('prompt.compose', () => ({ sections: BASE }))
  on('skill.prompt', (_, e) => ({ text: e.text }))
  on('tool.call', () => ({ result: {} }))

  return opened
}

// session.start opens the pane without waiting for it: let that open land
const start = async ($: Engine) => {
  await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
  await new Promise<void>(r => setTimeout(r, 0))
}

test('with milestone.md: the pane opens, draws each level indented, and the rules are added', async ($, on) => {
  const opened = engine(on, new Map([[FILE, BODY]]))
  await start($)
  expect(opened).toEqual(['milestone'])

  const { sections } = await $.prompt.compose(COMPOSE)
  const rules = sections.find(s => s.id === 'milestone-pane:rules')
  expect(rules?.scope).toBe('session')
  expect(rules?.text).toContain('Milestone ペインに表示される')

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const boxes = await ui.findAll({ type: 'Box' })
    const pads = boxes.map(b => b.props.paddingLeft).filter(p => p !== undefined)
    expect(pads).toEqual([0, 0, 4])
    await ui.unmount()
  }
})

test('without milestone.md: no pane, no rules', async ($, on) => {
  const opened = engine(on, new Map())
  await start($)
  expect(opened).toEqual([])

  const { sections } = await $.prompt.compose(COMPOSE)
  expect(sections.map(s => s.id)).toEqual(['intro'])
})

test('/milestone, then Claude writes milestone.md: the pane opens and redraws at once', async ($, on) => {
  const files = new Map<string, string>()
  const opened = engine(on, files)
  await start($)
  await $.skill.prompt({ skill: 'milestone-pane:milestone', text: 'x', frontmatter: {}, source: 'plugin' })
  expect(opened).toEqual([])

  files.set(FILE, BODY)
  await $.tool.call({ tool: 'Write', file_path: 'C:\\work\\repo\\milestone.md', content: BODY })
  expect(opened).toEqual(['milestone'])

  files.set(FILE, '- [x] Milestone 1: 要件を決める\n')
  await $.tool.call({ tool: 'Edit', file_path: 'milestone.md', old_string: 'a', new_string: 'b' })
  expect(opened).toEqual(['milestone'])
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const md = await ui.findAll({ type: 'Markdown' })
  expect(md.map(m => m.props.text)).toEqual(['- [x] Milestone 1: 要件を決める'])
  await ui.unmount()
})

test('CRLF or LF milestone.md: Step lines draw as list items, not code', async ($, on) => {
  const lines = [
    '- [ ] **Milestone 2: 画面を作る**',
    '  - [ ] **Task 2: 詳細画面**',
    '    - [ ] ▶ **Step 2-1: 項目を並べる**',
    '    - [ ] Step 2-2: 保存ボタンを付ける',
  ]
  const files = new Map<string, string>()
  engine(on, files)
  for (const eol of ['\r\n', '\n']) {
    files.set(FILE, lines.join(eol) + eol)
    await start($)
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const boxes = await ui.findAll({ type: 'Box' })
    expect(boxes.map(b => b.props.paddingLeft).filter(p => p !== undefined)).toEqual([0, 4, 8, 8])
    const md = await ui.findAll({ type: 'Markdown' })
    expect(md.map(m => m.props.text)).toEqual(lines.map(l => l.trimStart()))
    await ui.unmount()
  }
})

test('a Milestone with two or more Tasks: Steps under a finished Task are not drawn', async ($, on) => {
  const files = new Map<string, string>()
  engine(on, files)
  files.set(FILE, [
    '- [x] Milestone 1: 要件を決める',
    '- [ ] **Milestone 2: 画面を作る**',
    '  - [x] Task 1: 一覧画面',
    '    - [x] Step 1-1: 表を置く',
    '    - [x] Step 1-2: 並べ替えを付ける',
    '  - [ ] **Task 2: 詳細画面**',
    '    - [x] Step 2-1: 項目を並べる',
    '    - [ ] ▶ **Step 2-2: 保存ボタンを付ける**',
    '- [ ] Milestone 3: 公開する',
  ].join('\r\n'))
  await start($)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const md = await ui.findAll({ type: 'Markdown' })
  expect(md.map(m => m.props.text)).toEqual([
    '- [x] Milestone 1: 要件を決める',
    '- [ ] **Milestone 2: 画面を作る**',
    '- [x] Task 1: 一覧画面',
    '- [ ] **Task 2: 詳細画面**',
    '- [x] Step 2-1: 項目を並べる',
    '- [ ] ▶ **Step 2-2: 保存ボタンを付ける**',
    '- [ ] Milestone 3: 公開する',
  ])
  await ui.unmount()
})

test('a Milestone with one Task: its Steps stay even when the Task is finished', async ($, on) => {
  const lines = [
    '- [ ] **Milestone 1: 画面を作る**',
    '  - [x] Task 1: 一覧画面',
    '    - [x] Step 1-1: 表を置く',
  ]
  const files = new Map<string, string>([[FILE, lines.join('\n')]])
  engine(on, files)
  await start($)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const md = await ui.findAll({ type: 'Markdown' })
  expect(md.map(m => m.props.text)).toEqual(lines.map(l => l.trimStart()))
  await ui.unmount()
})
