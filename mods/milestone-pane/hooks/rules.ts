// The one place the milestone.md rules live. register.tsx adds them to the
// system prompt (prompt.compose) only in sessions whose folder holds milestone.md.
export const SECTION_ID = 'milestone-pane:rules'

export const toRules = (file: string): string => `# Milestone

milestone.md（${file}）に作業の状態を書く。Milestone ペインに表示される。

- 作業は Milestone に分ける。Milestone は作業全体の大きな区切りで、番号と名前を付ける。単純な作業なら Milestone だけでよい
- 詳しく分ける必要があれば、Milestone を Task に、Task を Step に分ける。Task は Milestone の中の作業、Step は Task の中の 1 つの手順にする
- Step の番号は「Task の番号-Task の中の順番」にする（例: Task 2 の 3 番目の Step は 2-3）
- 番号と名前の間は「: 」で区切る（例: \`Milestone 1: 名前\`、\`Task 2: 名前\`、\`Step 2-3: 名前\`）
- Task と Step を書くのは進行中の Milestone だけにする。ほかの Milestone は 1 行で書く
- 済みの行は \`[x]\`、未着手と進行中の行は \`[ ]\` にする。進行中の行は太字にし、今いちばん下の段で進めている行だけ先頭に \`▶\` を付ける
- 字下げは半角スペース 2 つで 1 段にする
- Milestone、Task などの名前は略さない（M、T などにしない）
- 作業しているセッションが、次のときに更新する
  - Milestone、Task、Step のどれかを終えたとき、次に移ったとき
  - 人に作業を頼むとき、人の作業が終わったとき
  - Milestone を終えたとき。終えた Milestone を 1 行に戻し、次の Milestone に Task と Step があれば書く
- milestone.md はコミットしない

書き方の例（Milestone 2 の Task 2 の 1 番目の Step を進めているところ）:

\`\`\`
- [x] Milestone 1: 要件を決める
- [ ] **Milestone 2: 画面を作る**
  - [x] Task 1: 一覧画面
  - [ ] **Task 2: 詳細画面**
    - [ ] ▶ **Step 2-1: 項目を並べる**
    - [ ] Step 2-2: 保存ボタンを付ける
- [ ] Milestone 3: 公開する
\`\`\`
`
