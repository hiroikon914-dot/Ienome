# Ienome World | 家の芽ワールド

現実の家がクエストで進化する、参加型ワールドサイト。
バックエンドなし・Vanilla JS・GitHub Pages 対応。

---

## ローカルで見る方法

`fetch()` で `data/quests.json` を読み込むため、**ファイルを直接ブラウザで開くだけでは動きません**。
簡易 HTTP サーバーを立ち上げてください。

### Python 3（推奨）

```bash
# リポジトリのルートで実行
python3 -m http.server 8000
```

その後、ブラウザで `http://localhost:8000` を開く。

### Node.js（npx）

```bash
npx serve .
```

---

## ファイル構成

```
/
  index.html       # トップページ
  quests.html      # クエスト一覧
  quest.html       # クエスト詳細（?id=xxx）
  about.html       # 世界観・参加方法
  /css
    styles.css     # ピクセル/Minecraftテーマ（全CSS）
  /js
    utils.js       # 共通ユーティリティ（fetch・フォーマット・埋め込み）
    main.js        # index.html 用
    quests.js      # quests.html 用（フィルタ・ソート）
    quest.js       # quest.html 用（詳細表示）
  /data
    quests.json    # クエストデータ（ここを編集して更新）
  /assets
    placeholder_before.png
    placeholder_after.png
```

---

## quests.json を編集してサイトに反映する

`data/quests.json` を直接編集するだけで OK。
再ビルドは不要。ブラウザリロードで反映されます。

### 主要フィールド

| フィールド | 説明 |
|---|---|
| `id` | ユニークなID（URLに使用）|
| `name` | クエスト名 |
| `icon` | 絵文字アイコン |
| `category` | `BUILD` / `LIFE` / `LORE` / `EVENT` / `WORLD` |
| `status` | `active` / `locked` / `cleared` |
| `goalAmount` | 目標金額（円、整数）|
| `currentAmount` | 現在の達成金額（手動更新）|
| `donationUrl` | 決済ページURL |
| `updates` | 進捗ログ（日付 + テキスト の配列）|

### 金額を更新する手順

1. `data/quests.json` を開く
2. 該当クエストの `currentAmount` を更新
3. `updates` 配列に新しい日付とテキストを追加
4. コミット & プッシュ → GitHub Pages に自動反映

```json
{
  "id": "solar-lv1",
  "currentAmount": 60000,
  "updates": [
    {"date": "2026-03-01", "text": "温水器本体を購入しました！"}
  ]
}
```

---

## 決済URLを本物に差し替える手順

各クエストの `donationUrl` フィールドを本物のURLに変更してください。

```json
"donationUrl": "https://buy.stripe.com/your-link-here"
```

対応している決済サービス（外部リンクとして開くだけなので何でもOK）：

- **Stripe Payment Links** — `https://buy.stripe.com/...`
- **PayPal.me** — `https://paypal.me/yourname/amount`
- **BuyMeACoffee** — `https://buymeacoffee.com/yourname`
- **その他** — URLが開ける形式なら何でも

---

## YouTube URLを入れると埋め込みになる

クエストの `youtubeUrl` フィールドに YouTube の URL を入れると、
quest.html 詳細ページで自動的に `<iframe>` 埋め込みに変換されます。

対応形式：
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`

```json
"youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

---

## GitHub Pages への公開

1. GitHub リポジトリの **Settings > Pages**
2. Source: `main` ブランチ、`/ (root)` フォルダを選択
3. Save → 数分後に `https://USERNAME.github.io/REPO_NAME/` で公開

---

## カスタマイズのヒント

- **色テーマ変更**: `css/styles.css` の `:root {}` 内の CSS変数を編集
- **SNSリンク変更**: 各HTMLファイルの YouTube / Instagram URL を自分のURLに変更
- **統計の手動更新**: `js/main.js` の `WORLD_STATS` 定数（population, supportPower）を直接編集
- **新しいカテゴリ追加**: `css/styles.css` の `.badge--XXX` クラスを追加し、`js/quests.js` の `CATEGORIES` 配列にも追加
