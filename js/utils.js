/**
 * utils.js - 共通ユーティリティ
 * fetch / 金額フォーマット / YouTube埋め込み / HTML安全化
 */

// ============================================================
// データ取得
// ============================================================

/**
 * quests.json を取得して返す
 * @returns {Promise<Array>} クエスト配列
 * @throws クエスト取得に失敗した場合はエラーをスロー
 */
async function fetchQuests() {
  // GitHub Pages 等のルートから相対パスで読み込む
  // ローカルでは簡易HTTPサーバーが必要（README参照）
  const res = await fetch('data/quests.json');
  if (!res.ok) {
    throw new Error(`quests.json の読み込みに失敗しました (HTTP ${res.status})`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('quests.json の形式が不正です（配列が必要です）');
  }
  return data;
}

/**
 * ID でクエストを一件取得
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function fetchQuestById(id) {
  const quests = await fetchQuests();
  return quests.find(q => q.id === id) || null;
}

// ============================================================
// 金額フォーマット
// ============================================================

/**
 * 数値を日本円表記にフォーマット
 * 例: 120000 → "¥120,000"
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '¥0';
  return '¥' + amount.toLocaleString('ja-JP');
}

/**
 * 進捗率を計算（0〜100、上限100）
 * @param {number} current
 * @param {number} goal
 * @returns {number}
 */
function calcProgress(current, goal) {
  if (!goal || goal <= 0) return 100; // goalが0（LOREなど）は達成扱い
  return Math.min(Math.round((current / goal) * 100), 100);
}

// ============================================================
// YouTube 埋め込み
// ============================================================

/**
 * YouTube の通常URLや短縮URLから動画IDを抽出
 * 対応形式:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 * @param {string} url
 * @returns {string|null} 動画ID、または null
 */
function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,       // watch?v=
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,  // youtu.be/
    /embed\/([a-zA-Z0-9_-]{11})/       // embed/
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match) return match[1];
  }
  return null;
}

/**
 * YouTube 埋め込み iframe の HTML を返す
 * URLがない、またはIDが取得できない場合は null を返す
 * @param {string} url
 * @returns {string|null}
 */
function buildYouTubeEmbed(url) {
  const id = extractYouTubeId(url);
  if (!id) return null;
  // sandbox でセキュリティ制限を追加
  return `<iframe
    class="video-embed"
    src="https://www.youtube.com/embed/${id}"
    title="YouTube video"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    loading="lazy"
  ></iframe>`;
}

// ============================================================
// セキュリティ：HTML エスケープ
// ============================================================

/**
 * ユーザー入力やJSONデータをHTMLに埋め込む前にエスケープ
 * XSS 対策として必ず使用すること
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// DOM ヘルパー
// ============================================================

/**
 * エラーメッセージを指定要素に表示
 * @param {HTMLElement} el
 * @param {string} message
 */
function showError(el, message) {
  el.innerHTML = `
    <div class="state-message state-message--error pixel-box">
      <p>⚠️ ${escHtml(message)}</p>
    </div>
  `;
}

/**
 * ローディング表示を指定要素に表示
 * @param {HTMLElement} el
 */
function showLoading(el) {
  el.innerHTML = `
    <div class="state-message">
      <p>[ LOADING <span class="loading-dots"></span> ]</p>
    </div>
  `;
}

/**
 * URLクエリパラメータを取得
 * @param {string} key
 * @returns {string|null}
 */
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/**
 * カテゴリバッジHTML を生成
 * @param {string} category
 * @returns {string}
 */
function categoryBadge(category) {
  return `<span class="badge badge--${escHtml(category)}">${escHtml(category)}</span>`;
}

/**
 * 進捗バーHTMLを生成
 * @param {number} current
 * @param {number} goal
 * @param {boolean} [gold=false] ゴールド色にするか
 * @returns {string}
 */
function buildProgressBar(current, goal, gold = false) {
  const pct = calcProgress(current, goal);
  const fillClass = gold ? 'progress-bar-fill--gold' : 'progress-bar-fill';
  return `
    <div class="progress-wrap">
      <div class="progress-bar-bg">
        <div class="${fillClass}" style="width:${pct}%"></div>
      </div>
      <div class="progress-text">
        <span class="progress-text--highlight">${formatCurrency(current)}</span>
        <span>${pct}% / ${formatCurrency(goal)}</span>
      </div>
    </div>
  `;
}
