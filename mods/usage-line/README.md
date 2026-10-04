# usage-line

Claude Code の mod（関数フックのプラグイン）。5時間枠・週枠の使用率とコンテキスト使用率を、プロンプト下のステータス行に常時表示する。

```
5h [██████░   ] 62% (14:00) 7d 18% (10/6 09:00) ctx 63%
```

- `5h` は 10 マスのメーター付き。満杯のマスは `█`、端のマスは `░▒▓` で 1/4 刻み（四捨五入）。`7d` は週枠
- 括弧内はリセット時刻（5h は時刻、7d は日付。24 時間表記・ローカル時刻）
- 区切りは figure space（U+2007）
- rate limit は直前のモデル応答が返した値なので、セッション開始直後は次の応答まで出ない
- サブスクリプション以外（API キー利用）では rate limit が取れないため `ctx` のみ出る

## 表示の切り替え

`/usage-line` で項目ごとに出す・出さないを切り替える。設定はセッションをまたいで残る。

```
/usage-line                          今の設定を一覧で出す
/usage-line 5h meter on|off          5h のメーター（初期値 on）
/usage-line 5h reset on|off          5h のリセット時刻（初期値 on）
/usage-line 7d meter on|off          7d のメーター（初期値 off）
/usage-line 7d reset on|off|date     7d のリセット日時。date は日付だけ（初期値 date）
/usage-line ctx on|off               コンテキスト使用率（初期値 on）
```

## インストール

```
/plugin marketplace add wmkeza/claude-plugins
/plugin install usage-line@wmkeza
```

CLI・デスクトップアプリの Code タブとも同じ手順。ローカルで試すだけなら `claude --plugin-dir <このフォルダ>`。
