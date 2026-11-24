# milestone-pane

Claude Code の mod（関数フックのプラグイン）とスキル `/milestone`。作業の状態を Milestone・Task・Step の 3 段のチェックリストで `milestone.md` に書き、チャットの横の「Milestone」ペインに表示する。

```
- [x] Milestone 1: 要件を決める
- [ ] **Milestone 2: 画面を作る**
  - [x] Task 1: 一覧画面
  - [ ] **Task 2: 詳細画面**
    - [ ] ▶ **Step 2-1: 項目を並べる**
    - [ ] Step 2-2: 保存ボタンを付ける
- [ ] Milestone 3: 公開する
```

## しくみ

- 読むのはセッションのフォルダ（`$.session.root()`。シェルの `cd` では動かない）の直下にある `milestone.md` だけ。worktree のセッションでは、その worktree の `milestone.md` を読む
- セッションを始めたときに `milestone.md` があれば、ペインを開く。なければ開かない
- 次のときに読み直し、中身が変わっていれば描き直す
  - このセッションのファイルを書くツール（Write、Edit など）が `milestone.md` を書いた直後
  - 30 秒ごと（人の手や別のセッションで書き換えたときのため）
- `milestone.md` があるセッションでは、書き方と更新のしかたのルールを Claude への指示（システムプロンプト）に足す。ルールは [hooks/rules.ts](hooks/rules.ts) の 1 か所だけにある。各リポジトリの CLAUDE.md には何も書かない
- リストの各行は字下げの深さ（半角スペース 2 つで 1 段）に合わせて、字下げした Box に入れて描く。terminal、desktop、mobile のどれでも段が見える
- 1 つの Milestone に Task が 2 つ以上あるとき、済んだ Task（`[x]`）の下の Step は描かない。`milestone.md` の中身は変えない

## /milestone

- `milestone.md` がないときは、これからの作業の Milestone を聞いて `milestone.md` を作り、`.git/info/exclude` に `milestone.md` の 1 行を足す（すでにあれば足さない。git のリポジトリでなければ足さない）。書いたところでペインが開く
- `milestone.md` があるときは、ペインを開く

`milestone.md` はコミットしない。`.gitignore` は変えない。

## インストール

```
/plugin marketplace add wmkeza/claude-plugins
/plugin install milestone-pane@wmkeza
```

ローカルで試すだけなら `claude --plugin-dir <このフォルダ>`。
