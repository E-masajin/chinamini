# いつでもクイズ（仮）

期間限定・1回のみ回答可能なクイズアプリケーション

## 🎯 プロジェクト概要

**名称**: いつでもクイズ（仮）  
**目的**: 企業イベントや交流会で活用できる公平なクイズプラットフォーム  
**主な特徴**:
- 期間限定アクセス（開始日〜終了日の間のみ）
- 1ユーザー1回のみ回答可能
- ID紐付けによる問題振り分け（カンニング防止）
- リアルタイムランキング機能
- チーム対抗戦・グループ対抗戦・企業対抗戦に対応可能

## 🌐 URLs

- **開発環境**: https://3000-ij8kn2qe6mtefy1cqmqbl-8f57ffe2.sandbox.novita.ai
- **GitHub**: （未設定）
- **本番環境**: （未デプロイ）

## 📊 データアーキテクチャ

### データモデル

**主要テーブル**:
1. **events** - イベント（大会）情報
   - id, name, description, start_date, end_date, questions_per_user, is_active

2. **questions** - 問題プール
   - id, event_id, question_text, option_a/b/c/d, correct_answer, pool_group

3. **users** - ユーザー情報
   - id, user_id (社員番号など), name

4. **answers** - 回答記録
   - id, user_id, event_id, question_id, user_answer, is_correct

5. **user_event_status** - ユーザーごとのイベント参加状態
   - id, user_id, event_id, has_completed, score, completed_at

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

現在50問を10グループに分け、各グループ5問ずつ配置。ランダムに10問出題。

## 📖 ユーザーガイド

### 基本的な使い方

1. **ログイン**
   - ユーザーID（社員番号など）を入力
   - 任意で名前を入力

2. **クイズ開始**
   - イベント情報を確認
   - 「クイズを開始」ボタンをクリック
   - ⚠️ 開始すると途中で中断できません

3. **回答**
   - 10問すべてに回答
   - 進捗バーで回答状況を確認
   - すべて回答後、「回答を送信」ボタンが有効化

4. **結果確認**
   - スコアと正答率を表示
   - 現在の順位を確認
   - 回答詳細（正解/不正解）を確認

5. **ランキング**
   - 全参加者のランキングを閲覧
   - スコア順・回答完了時刻順で表示

### 管理者向け

**新しいイベントを作成**:
```sql
INSERT INTO events (name, description, start_date, end_date, questions_per_user, is_active)
VALUES (
  'イベント名',
  '説明',
  datetime('2025-01-01 00:00:00'),
  datetime('2025-01-07 23:59:59'),
  10,
  1
);
```

**問題を追加**:
```sql
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES (1, '問題文', '選択肢A', '選択肢B', '選択肢C', '選択肢D', 'B', 0);
```

## 🚀 デプロイ

### 開発環境

- **プラットフォーム**: Cloudflare Pages (Sandbox)
- **ステータス**: ✅ 稼働中
- **技術スタック**: 
  - バックエンド: Hono (TypeScript)
  - フロントエンド: HTML + TailwindCSS + Vanilla JavaScript
  - データベース: Cloudflare D1 (SQLite)
  - デプロイ: Cloudflare Pages
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

- ✅ ユーザー認証（シンプルID入力方式）
- ✅ 期間限定アクセス制御
- ✅ 1回のみ回答制限
- ✅ ID紐付け問題振り分けロジック
- ✅ 10問クイズ出題
- ✅ 自動採点機能
- ✅ リアルタイムランキング
- ✅ 回答詳細表示
- ✅ レスポンシブデザイン
- ✅ 50問のサンプル問題（10グループ）

## 🔄 未実装機能

- ⏳ チーム対抗戦モード
- ⏳ グループ対抗戦モード
- ⏳ 企業対抗戦モード
- ⏳ Googleマップ連動ゲーム
- ⏳ 世界なんでもクイズ
- ⏳ 日替わり問題配信機能
- ⏳ 管理者ダッシュボード
- ⏳ 問題作成UI
- ⏳ イベント作成UI

## 🎯 推奨される次のステップ

1. **本番環境へのデプロイ**
   - Cloudflare D1本番データベース作成
   - Cloudflare Pagesへデプロイ
   - カスタムドメイン設定

2. **問題数の拡充**
   - 現在50問 → 100問以上に拡大
   - ジャンル別に問題を分類

3. **チーム対抗戦機能の実装**
   - チームテーブル追加
   - チーム登録・管理機能
   - チームスコア集計

4. **管理画面の追加**
   - イベント作成・編集UI
   - 問題作成・管理UI
   - 参加者管理・統計表示

5. **追加ゲームモードの実装**
   - Googleマップ連動機能
   - 日替わりクイズ機能

## 📁 プロジェクト構造

```
webapp/
├── src/
│   └── index.tsx              # メインアプリケーション（Hono + フロントエンド）
├── migrations/
│   └── 0001_initial_schema.sql # データベーススキーマ
├── seed.sql                   # テストデータ（50問）
├── ecosystem.config.cjs       # PM2設定
├── wrangler.jsonc            # Cloudflare設定
├── package.json              # 依存関係とスクリプト
└── README.md                 # このファイル
```

## 🔧 API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/events/active` | アクティブなイベント取得 |
| POST | `/api/auth/login` | ユーザー認証・登録 |
| GET | `/api/events/:eventId/questions` | 問題取得 |
| POST | `/api/events/:eventId/submit` | 回答送信 |
| GET | `/api/events/:eventId/ranking` | ランキング取得 |
| GET | `/api/events/:eventId/result/:userId` | ユーザー結果取得 |

## 📝 開発メモ

- **問題群の決定**: ユーザーIDの末尾1桁で自動振り分け（0-9）
- **カンニング防止**: 各ユーザーは異なる問題群から出題
- **公平性**: 同一イベント内では同じ難易度の問題を出題
- **拡張性**: データベース設計は100問以上に対応済み

---

**開発者**: Claude Code  
**最終更新**: 2025-12-26
