# claude-plugins

wmkeza の Claude Code プラグイン集（marketplace 名は `wmkeza`）。

| プラグイン | 種類 | 中身 |
|---|---|---|
| [`handoff`](plugins/handoff) | skill | `handoff`（新しいセッションへの引き継ぎプロンプト。短い形と項目つきの形を、頼み方と会話の中身で選ぶ） |
| [`tech-research`](plugins/tech-research) | skill | `tech-research`（技術の調べもの） |
| [`usage-line`](mods/usage-line) | mod | ステータス行に 5h / 週の使用率とコンテキスト使用率を出す |

skill は `plugins/`、mod は `mods/` に置く。1 プラグイン = 1 用途で、プラグイン名は用途名にする。skill を足すときは、既存の用途に合えばそのプラグインに入れ、合わなければプラグインを新しく作る。

プラグインの skill は `/プラグイン名:skill名`（例：`/handoff:handoff`）で一覧に出るが、ほかのコマンドと名前がかぶらなければ `/handoff` だけで呼べる。

## インストール

ローカル（CLI・デスクトップアプリの Code タブ）:

```
/plugin marketplace add wmkeza/claude-plugins
/plugin install handoff@wmkeza
/plugin install tech-research@wmkeza
/plugin install usage-line@wmkeza
```

claude.ai の Customize > Plugins で marketplace として追加すると、チャットとローカルの Claude Code にも同期される。

## クラウドセッション

クラウドセッション（claude.ai/code、モバイルの Code タブ）は、claude.ai で有効にしたプラグインも、リポジトリの `.claude/settings.json` で宣言したプラグインも読み込まない。クラウド環境のセットアップスクリプトで入れる。

```bash
#!/bin/bash
claude plugin marketplace add wmkeza/claude-plugins || true
claude plugin install handoff@wmkeza || true
claude plugin install tech-research@wmkeza || true
```

セットアップスクリプトは Claude Code の起動前に走るので、入れたプラグインはそのセッションから使える。結果は環境のキャッシュに残り、約 7 日ごとか、スクリプトを書き換えたときに作り直される。push した変更をすぐ反映したいときは、スクリプトを書き換える。
