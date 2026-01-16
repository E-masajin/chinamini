# CLAUDE_ja.md

このファイルはClaude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

**いつでもクイズ** - AI問題生成、予測クイズ、ゲーミフィケーション機能を備えた企業教育・研修向けフルスタッククイズアプリケーション。

- **バックエンド**: Hono (TypeScript) on Cloudflare Workers
- **フロントエンド**: Vanilla JavaScript + TailwindCSS (CDN)
- **データベース**: Cloudflare D1 (SQLiteベース)
- **AI**: OpenAI統合による問題生成と柔軟な回答判定

## よく使うコマンド

### 開発
```bash
npm run dev:sandbox      # Wrangler開発サーバー起動 (D1付き、ポート3000)
npm run dev              # Vite開発サーバーのみ起動
```

### データベース
```bash
npm run db:migrate:local # ローカルD1にマイグレーション適用
npm run db:seed          # テストデータ投入 (seed.sql)
npm run db:reset         # ローカルDBをリセット・再シード
npm run db:console:local # D1 SQLコンソールを開く
```

### ビルド・デプロイ
```bash
npm run build            # Viteでビルド
npm run deploy           # Cloudflare Pagesにデプロイ (sandbox)
npm run deploy:prod      # 本番環境にデプロイ
npm run cf-typegen       # Cloudflare型定義を再生成
```

### PM2サーバー管理
```bash
pm2 start ecosystem.config.cjs  # サーバー起動
pm2 logs quiz-app --nostream    # ログ確認
pm2 delete quiz-app             # サーバー停止
```

## アーキテクチャ

```
src/
├── index.tsx             # メインHonoアプリエントリ、ルートマウント
├── api.tsx               # コアAPI (ユーザー認証、クイズフロー、ランキング、管理CRUD)
├── ai-api.tsx            # OpenAI経由のAI問題生成
├── ai-prediction-api.tsx # AI予測回答判定
├── ai-helper.ts          # OpenAIクライアント設定とプロンプト
├── analytics-api.tsx     # 統計集計、ナレッジベース生成
├── gamification-api.tsx  # ポイント、バッジ、リーダーボードシステム
├── knowledge-api.tsx     # ナレッジ管理・分類
├── learning-api.tsx      # 学習統計・進捗トラッキング
├── prediction-api.tsx    # 予測クイズエンドポイント
└── renderer.tsx          # JSXレンダラー設定

public/static/
├── app.js                # ユーザー向けクイズUI
└── admin.js              # 管理者ダッシュボードUI

migrations/               # D1スキーママイグレーション (0001-0016)
```

## 主要な設計パターン

### 問題配布
ユーザーはユーザーIDの末尾の数字によって決まるプールグループ (0-9) から問題を受け取ります (`getPoolGroup(userId)`)。これによりユーザー間での回答共有を防止します。

### クイズタイプ
- **choice**: 4択問題
- **prediction**: 記入式予測クイズ（AI柔軟判定付き）

### クイズモード
- **individual**: 個人スコアランキング
- **team**: チーム平均ランキング
- **company**: 会社全体平均ランキング

### ランキングアルゴリズム
1. スコア (高いほど良い)
2. 回答時間 (速いほど良い)
3. 完了時間 (早いほど良い)

### ゲーミフィケーション
- ポイント: 正解+10pt、全問正解ボーナス+50pt
- 11種類のバッジ（予測マスター、連続正解王、パーフェクティストなど）
- 総合/週間/月間リーダーボード

### ナレッジ認識レベル
- HIGH: 正解率 >= 80%
- MEDIUM: 50% <= 正解率 < 80%
- LOW: 正解率 < 50%

## データベーススキーマ

主要テーブル: `events`, `questions`, `users`, `answers`, `user_event_status`, `question_categories`, `question_statistics`, `knowledge_base`, `admins`, `user_points`, `user_badges`, `point_history`

マイグレーションは `migrations/` ディレクトリにあります - スキーマ変更には必ずマイグレーションファイルを使用してください。

## API構成

- `/api/*` - ユーザーエンドポイント (認証、クイズ、ランキング、ゲーミフィケーション)
- `/admin/api/*` - 管理者エンドポイント (イベント/問題CRUD、AI生成、分析)
- `/admin/api/ai/*` - AIエンドポイント (問題生成、予測判定)

## 環境

- ローカルD1データベースは `.wrangler/state/v3/d1/` に保存
- OpenAI APIキーは `.dev.vars` ファイルで設定
- Cloudflare Workers互換性日付: 2025-12-26
