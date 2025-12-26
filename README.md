# いつでもクイズ

期間限定・1回のみ回答可能なマルチモードクイズアプリケーション

## 🎯 プロジェクト概要

**名称**: いつでもクイズ  
**目的**: 企業イベントや交流会で活用できる公平なクイズプラットフォーム  

### 主な特徴

- **3つの対戦モード**: 個人戦・チーム戦・企業戦
- **期間限定アクセス**: 開始日〜終了日の間のみ参加可能
- **1回のみ回答制限**: ユーザーごとに1回のみ回答可能
- **ID紐付け問題振り分け**: カンニング防止のため、ユーザーIDから問題群を自動決定
- **高度なランキング機能**: 
  - 個人ランキング（スコア順・回答時間順）
  - チーム/企業ランキング（平均正答率・平均回答時間）
  - 最低参加人数設定
- **管理者画面**: イベント作成・問題管理・参加者管理

## 🌐 URLs

- **開発環境**: https://3000-ij8kn2qe6mtefy1cqmqbl-8f57ffe2.sandbox.novita.ai
- **管理者画面**: https://3000-ij8kn2qe6mtefy1cqmqbl-8f57ffe2.sandbox.novita.ai/admin
- **GitHub**: https://github.com/E-masajin/chinamini
- **本番環境**: （未デプロイ）

## 📊 データアーキテクチャ

### データモデル

**主要テーブル**:

1. **events** - イベント（大会）情報
   - `id`, `name`, `description`, `start_date`, `end_date`
   - `questions_per_user`, `mode` (個人/チーム/企業)
   - `min_participants` (最低参加人数), `is_active`

2. **questions** - 問題プール
   - `id`, `event_id`, `question_text`
   - `option_a/b/c/d`, `correct_answer`
   - `pool_group` (0-9の問題群)

3. **users** - ユーザー情報
   - `id`, `user_id` (社員番号など), `name`
   - `team_name`, `company_name`

4. **answers** - 回答記録
   - `id`, `user_id`, `event_id`, `question_id`
   - `user_answer`, `is_correct`

5. **user_event_status** - ユーザーごとのイベント参加状態
   - `id`, `user_id`, `event_id`
   - `has_completed`, `score`
   - `started_at`, `completed_at`, `answer_duration`

6. **admins** - 管理者アカウント
   - `id`, `username`, `password_hash`

### ストレージサービス

- **Cloudflare D1**: SQLiteベースのグローバル分散データベース
  - ローカル開発: `.wrangler/state/v3/d1/` に自動作成
  - 本番環境: Cloudflare D1にデプロイ

### 問題振り分けロジック

```typescript
// ユーザーIDの末尾1文字から問題群（0-9）を決定
function getPoolGroup(userId: string): number {
  const lastChar = userId.slice(-1)
  const num = parseInt(lastChar, 10)
  return isNaN(num) ? 0 : num
}
```

**例**:
- ID "00001" → 問題群1
- ID "00002" → 問題群2
- ID "ABC10" → 問題群0

### ランキング集計ロジック

**個人ランキング**:
- 第一優先: スコア（正答数）
- 第二優先: 回答時間（短い方が上位）
- 第三優先: 回答完了時刻（早い方が上位）

**チーム/企業ランキング**:
- 第一優先: 平均正答率（%）
- 第二優先: 平均回答時間（秒）
- 最低参加人数に満たないチーム/企業は表示されない

## 📖 ユーザーガイド

### 基本的な使い方

1. **ログイン**
   - ユーザーID（社員番号など）を入力
   - 任意で名前を入力
   - イベントのモードに応じて：
     - **チーム戦**: チーム名を入力
     - **企業戦**: 企業名を入力

2. **クイズ開始**
   - イベント情報とモードを確認
   - 「クイズを開始」ボタンをクリック
   - ⚠️ 開始すると途中で中断できません

3. **回答**
   - 全問題に回答
   - 回答時間が自動計測される
   - 進捗バーで回答状況を確認

4. **結果確認**
   - スコアと正答率を表示
   - 回答時間を表示
   - 個人順位を確認
   - 回答詳細（正解/不正解）を確認

5. **ランキング**
   - **個人ランキング**: 全参加者のランキング
   - **チーム/企業ランキング**: 平均正答率順のランキング

### 管理者向け

**ログイン情報**:
- URL: `/admin`
- デフォルトアカウント: `admin` / `admin123`

**イベント管理**:
- イベントの作成・編集・削除
- モード設定（個人戦/チーム戦/企業戦）
- 期間設定
- 問題数設定
- 最低参加人数設定

**問題管理**:
- 問題の追加・編集・削除
- 問題群（0-9）の設定
- 選択肢と正解の設定

**参加者管理**:
- 参加者一覧の閲覧
- スコアと回答時間の確認
- チーム/企業情報の確認

## 🚀 デプロイ

### 開発環境

- **プラットフォーム**: Cloudflare Pages (Sandbox)
- **ステータス**: ✅ 稼働中
- **技術スタック**: 
  - バックエンド: Hono (TypeScript)
  - フロントエンド: Vanilla JavaScript + TailwindCSS
  - データベース: Cloudflare D1 (SQLite)
- **最終更新**: 2025-12-26

### ローカル開発

```bash
# 依存関係インストール
npm install

# データベースマイグレーション
npm run db:migrate:local

# テストデータ投入
npm run db:seed

# ビルド
npm run build

# 開発サーバー起動
pm2 start ecosystem.config.cjs

# ログ確認
pm2 logs quiz-app --nostream

# サーバー停止
pm2 delete quiz-app
```

### 本番デプロイ（未実施）

```bash
# Cloudflare D1データベース作成
npx wrangler d1 create quiz-db-production

# wrangler.jsonc に database_id を設定

# マイグレーション実行
npm run db:migrate:prod

# デプロイ
npm run deploy:prod
```

## ✅ 完成済み機能

### コア機能
- ✅ ユーザー認証（シンプルID入力）
- ✅ 3つの対戦モード（個人/チーム/企業）
- ✅ 期間限定アクセス制御
- ✅ 1回のみ回答制限
- ✅ ID紐付け問題振り分けロジック
- ✅ 回答時間計測機能

### ランキング機能
- ✅ 個人ランキング（スコア・回答時間順）
- ✅ チームランキング（平均正答率・平均時間）
- ✅ 企業ランキング（平均正答率・平均時間）
- ✅ 最低参加人数設定

### 管理者機能
- ✅ 管理者認証
- ✅ イベント管理UI（CRUD）
- ✅ 問題管理UI（CRUD）
- ✅ 参加者一覧・結果閲覧

### UI/UX
- ✅ レスポンシブデザイン
- ✅ 回答詳細表示
- ✅ 進捗バー
- ✅ モーダルダイアログ

## 🔄 未実装機能

- ⏳ Googleマップ連動ゲーム
- ⏳ 世界なんでもクイズ
- ⏳ 日替わり問題配信機能
- ⏳ イベントテンプレート機能
- ⏳ 問題インポート/エクスポート
- ⏳ グラフィカルな統計ダッシュボード
- ⏳ メール通知機能
- ⏳ カスタムブランディング

## 🎯 推奨される次のステップ

1. **本番環境へのデプロイ**
   - Cloudflare D1本番データベース作成
   - Cloudflare Pagesへデプロイ
   - カスタムドメイン設定

2. **セキュリティ強化**
   - 管理者パスワードのハッシュ化（bcrypt）
   - セッション管理の実装
   - CSRF対策

3. **問題数の拡充**
   - 現在50問 → 100問以上に拡大
   - ジャンル別に問題を分類

4. **統計機能の追加**
   - グラフィカルなダッシュボード
   - 問題別正答率
   - 時系列データ分析

5. **追加ゲームモードの実装**
   - Googleマップ連動機能
   - 日替わりクイズ機能

## 📁 プロジェクト構造

```
webapp/
├── src/
│   ├── index.tsx              # メインアプリケーション（ルーティング）
│   └── api.tsx                # APIエンドポイント（管理者・ユーザー）
├── public/
│   └── static/
│       ├── app.js             # ユーザー側フロントエンド
│       └── admin.js           # 管理者画面フロントエンド
├── migrations/
│   ├── 0001_initial_schema.sql    # 初期スキーマ
│   └── 0002_multimode_support.sql # マルチモード対応
├── seed.sql                   # テストデータ（50問）
├── ecosystem.config.cjs       # PM2設定
├── wrangler.jsonc            # Cloudflare設定
├── package.json              # 依存関係とスクリプト
└── README.md                 # このファイル
```

## 🔧 API エンドポイント

### ユーザーAPI

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/events/active` | アクティブなイベント取得 |
| POST | `/api/auth/login` | ユーザー認証・登録 |
| GET | `/api/events/:eventId/questions` | 問題取得（開始時間記録） |
| POST | `/api/events/:eventId/submit` | 回答送信（採点・時間記録） |
| GET | `/api/events/:eventId/ranking/individual` | 個人ランキング |
| GET | `/api/events/:eventId/ranking/team` | チームランキング |
| GET | `/api/events/:eventId/ranking/company` | 企業ランキング |
| GET | `/api/events/:eventId/result/:userId` | ユーザー結果取得 |

### 管理者API

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/admin/api/login` | 管理者ログイン |
| GET | `/admin/api/events` | イベント一覧 |
| POST | `/admin/api/events` | イベント作成 |
| PUT | `/admin/api/events/:id` | イベント更新 |
| DELETE | `/admin/api/events/:id` | イベント削除 |
| GET | `/admin/api/events/:eventId/questions` | 問題一覧 |
| POST | `/admin/api/events/:eventId/questions` | 問題作成 |
| PUT | `/admin/api/questions/:id` | 問題更新 |
| DELETE | `/admin/api/questions/:id` | 問題削除 |
| GET | `/admin/api/events/:eventId/participants` | 参加者一覧 |

## 📝 開発メモ

### 問題振り分けロジック
- ユーザーIDの末尾1桁で自動振り分け（0-9）
- 各ユーザーは異なる問題群から出題されるためカンニング不可

### ランキング集計
- **個人**: スコア → 回答時間 → 完了時刻の順で並べ替え
- **チーム/企業**: 平均正答率 → 平均回答時間の順で並べ替え
- 最低参加人数に満たないグループは非表示

### セキュリティ
- 現在の管理者認証は簡易版（平文パスワード）
- 本番環境ではbcryptによるハッシュ化が必須
- セッション管理の実装推奨

---

**開発者**: Claude Code  
**最終更新**: 2025-12-26  
**バージョン**: 2.0 (マルチモード対応)
