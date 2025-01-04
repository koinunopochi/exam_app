# Exam Management Application

試験作成・受験・採点を行うWebアプリケーション

## 技術スタック

- **フロントエンド**
  - Vite
  - React + TypeScript
  - Tailwind CSS
  - Shadcn/uiコンポーネントライブラリ

- **その他ツール**
  - ESLint
  - Prettier

## インストール方法

1. リポジトリをクローン
   ```bash
   git clone https://github.com/koinunopochi/exam-app.git
   cd exam-app
   ```

2. 依存パッケージをインストール
   ```bash
   pnpm install
   ```

## 開発サーバーの起動

```bash
pnpm dev
```

開発サーバーは[http://localhost:5173](http://localhost:5173)で起動します。

## プロジェクト構造

```
exam-app/
├── public/            # 静的アセット
├── src/
│   ├── assets/        # 画像などのリソース
│   ├── components/    # Reactコンポーネント
│   │   ├── exam-admin/    # 試験管理関連
│   │   ├── exam-editor/   # 試験編集関連
│   │   ├── exam-taking/   # 試験受験関連
│   │   ├── pages/         # ページコンポーネント
│   │   └── ui/            # UIコンポーネント
│   ├── lib/           # ユーティリティ関数
│   ├── types/         # 型定義
│   ├── utils/         # 共通ユーティリティ
│   ├── App.tsx        # メインアプリケーション
│   └── main.tsx       # エントリポイント
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 主要機能

- **試験作成**
  - 選択問題、記述問題、並べ替え問題など多様な問題形式に対応
  - 問題の追加・編集・削除
  - 解答の正解設定

- **試験受験**
  - 制限時間付き試験
  - リアルタイム採点
  - 解答確認機能

- **試験管理**
  - 試験結果のアップロード
  - 詳細な採点結果表示
  - 統計データの可視化
