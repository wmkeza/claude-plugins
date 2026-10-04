# claude-plugins

wmkeza の Claude Code プラグイン集（marketplace 名は `wmkeza`）。

| プラグイン | 種類 | 中身 |
|---|---|---|
| [`wmkeza`](plugins/wmkeza) | skill | `handoff-quick`、`handoff-structured`（新しいセッションへの引き継ぎプロンプト）、`tech-research`（技術の調べもの） |
| [`usage-line`](mods/usage-line) | mod | ステータス行に 5h / 週の使用率とコンテキスト使用率を出す |

skill は `plugins/`、mod は `mods/` に置く。

## インストール

ローカル（CLI・デスクトップアプリの Code タブ）:

```
/plugin marketplace add wmkeza/claude-plugins
/plugin install wmkeza@wmkeza
/plugin install usage-line@wmkeza
```

claude.ai の Customize > Plugins で marketplace として追加すると、チャットとローカルの Claude Code にも同期される。

## クラウドセッション

クラウドセッション（claude.ai/code、モバイルの Code タブ）は、claude.ai で有効にしたプラグインも、リポジトリの `.claude/settings.json` で宣言したプラグインも読み込まない。クラウド環境のセットアップスクリプトで入れる。

```bash
#!/bin/bash
claude plugin marketplace add wmkeza/claude-plugins || true
claude plugin install wmkeza@wmkeza || true
```

セットアップスクリプトは Claude Code の起動前に走るので、入れたプラグインはそのセッションから使える。結果は環境のキャッシュに残り、約 7 日ごとか、スクリプトを書き換えたときに作り直される。push した変更をすぐ反映したいときは、スクリプトを書き換える。
