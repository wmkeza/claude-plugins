---
name: milestone
description: Start or show the Milestone pane — the milestone.md checklist (Milestone / Task / Step) of the work in this session's folder. Use when the user runs /milestone, or asks to set up milestones, track progress in milestone.md, or open the Milestone pane (e.g. "マイルストーンを作って", "進み具合を管理したい", "Milestone ペインを開いて").
---

# milestone

セッションのフォルダ（セッションを始めたフォルダ。worktree のセッションではその worktree）の直下の `milestone.md` を作るか、Milestone ペインに表示する。ペインは milestone-pane の mod が開く。milestone.md の書き方と更新のしかたのルールは、milestone.md があるセッションで mod が指示に足す。このスキルはルールを持たない。

人への答えは人が使っている言葉で書く。

## milestone.md があるとき

ペインは mod が開くので、ファイルには触れない。「Milestone ペインを開きました。」とだけ答える。

## milestone.md がないとき

1. これからの作業の Milestone を人に聞く。答えを待つ。人がすでに作業の中身を話していれば、そこから Milestone の案を出して、それでよいか聞く。
2. 答えをもとに、Milestone を 1 行ずつ並べた `milestone.md` をセッションのフォルダの直下に Write で作る。
   - 1 行に 1 つ、`- [ ] Milestone 1: 名前` の形にする。名前は略さない
   - 最初の Milestone は進行中として、太字にし、先頭に `▶` を付ける（`- [ ] ▶ **Milestone 1: 名前**`）
   - Task と Step はまだ書かない
3. `milestone.md` がコミットに入らないように、git の exclude に 1 行足す。
   - `git rev-parse --git-path info/exclude` で exclude ファイルの場所を求める（worktree でも正しい場所が出る。相対パスならセッションのフォルダからの位置）
   - そのファイルに `milestone.md` だけの行がすでにあれば、足さない。なければ、exclude ファイルのフォルダがないときは先に作り、末尾に `milestone.md` の 1 行を足す
   - `.gitignore` は変えない
   - git のリポジトリでなければ（`git rev-parse` が失敗したら）足さず、そのことを人に伝える
4. ペインは、milestone.md を書いたところで mod が開く。作ったファイルの中身と、exclude に足したかどうかを短く伝える。

例（Milestone を 3 つ聞いたとき）

```
- [ ] ▶ **Milestone 1: 要件を決める**
- [ ] Milestone 2: 画面を作る
- [ ] Milestone 3: 公開する
```
