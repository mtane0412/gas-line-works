# LINE WORKS API + Google Apps Script プロジェクト

## 概要
Google Apps ScriptでLINE WORKS APIを使用するプロジェクト。

## ドキュメント
- LINE WORKS API: https://developers.worksmobile.com/jp/docs

## 技術スタック
- Google Apps Script
- TypeScript（claspでトランスパイル後にpush）
- clasp v3+

## 開発コマンド
```bash
npm run build    # TypeScriptをトランスパイル
npm run push     # GASにデプロイ
npm run lint     # ESLintでチェック
npm test         # テスト実行
```

## ディレクトリ構成
```
src/           # TypeScriptソースコード
dist/          # トランスパイル後のJSファイル（claspがpush）
__tests__/     # テストファイル
```
