/**
 * quests.js - quests.html 用スクリプト
 * ・全クエストの一覧表示
 * ・カテゴリフィルタ（ALL / BUILD / LIFE / LORE / EVENT / WORLD）
 * ・ソート（新着 / 進捗率 / 目標金額）
 */

// utils.js に依存（quests.html で先に読み込まれること）

// ---------- 状態管理 ----------
let allQuests    = [];          // 全データ（fetchした原本）
let activeFilter = 'ALL';       // 現在選択中のカテゴリフィルタ
let activeSort   = 'newest';    // 現在のソート順

const CATEGORIES = ['ALL', 'BUILD', 'LIFE', 'LORE', 'EVENT', 'WORLD'];

// ---------- 初期化 ----------
document.addEventListener('DOMContentLoaded', async () => {
  const listEl    = document.getElementById('quest-list');
  const filterBar = document.getElementById('filter-bar');
  const sortSel   = document.getElementById('sort-select');

  if (!listEl) return; // guard

  // ローディング表示
  showLoading(listEl);

  try {
    allQuests = await fetchQuests();

    // フィルタボタン描画
    renderFilterBar(filterBar);
    // ソートセレクトイベント
    sortSel.addEventListener('change', e => {
      activeSort = e.target.value;
      renderList(listEl);
    });

    // 初回描画
    renderList(listEl);

  } catch (err) {
    console.error(err);
    showError(listEl, `クエストデータの読み込みに失敗しました: ${err.message}`);
  }
});

// ============================================================
// フィルタバー描画
// ============================================================

/**
 * カテゴリフィルタボタンを生成
 * @param {HTMLElement} container
 */
function renderFilterBar(container) {
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <button
      class="filter-btn${cat === activeFilter ? ' active' : ''}"
      data-cat="${escHtml(cat)}"
    >${escHtml(cat)}</button>
  `).join('');

  // イベント登録
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.cat;
      // ボタンのアクティブ状態を更新
      container.querySelectorAll('.filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.cat === activeFilter)
      );
      renderList(document.getElementById('quest-list'));
    });
  });
}

// ============================================================
// 一覧描画
// ============================================================

/**
 * フィルタ＋ソートを適用してクエストカードを描画
 * @param {HTMLElement} container
 */
function renderList(container) {
  // フィルタ適用
  let filtered = activeFilter === 'ALL'
    ? [...allQuests]
    : allQuests.filter(q => q.category === activeFilter);

  // ソート適用
  filtered = sortQuests(filtered, activeSort);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="state-message">
        <p>該当するクエストがありません。</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="quest-grid">
      ${filtered.map(q => buildQuestCardFull(q)).join('')}
    </div>
  `;
}

// ============================================================
// ソート
// ============================================================

/**
 * クエスト配列をソートして返す（元配列は変更しない）
 * @param {Array} quests
 * @param {'newest'|'progress'|'goal'} sortKey
 * @returns {Array}
 */
function sortQuests(quests, sortKey) {
  const arr = [...quests];
  switch (sortKey) {
    case 'newest':
      // updates配列の最新日付で並び替え（新しい順）
      return arr.sort((a, b) => {
        const aDate = latestUpdateDate(a);
        const bDate = latestUpdateDate(b);
        return bDate.localeCompare(aDate);
      });

    case 'progress':
      // 進捗率（高い順）
      return arr.sort((a, b) =>
        calcProgress(b.currentAmount, b.goalAmount) -
        calcProgress(a.currentAmount, a.goalAmount)
      );

    case 'goal':
      // 目標金額（高い順）
      return arr.sort((a, b) => b.goalAmount - a.goalAmount);

    default:
      return arr;
  }
}

/**
 * クエストの最新更新日を文字列で返す
 * @param {Object} quest
 * @returns {string} ISO日付文字列 or '0000-00-00'
 */
function latestUpdateDate(quest) {
  if (!quest.updates || quest.updates.length === 0) return '0000-00-00';
  return quest.updates
    .map(u => u.date)
    .sort()
    .reverse()[0];
}

// ============================================================
// フルクエストカード（一覧ページ用）
// ============================================================

/**
 * クエスト一覧ページ用カードHTMLを生成
 * @param {Object} q
 * @returns {string}
 */
function buildQuestCardFull(q) {
  const isActive  = q.status === 'active';
  const isCleared = q.status === 'cleared';
  const isLocked  = q.status === 'locked';

  return `
    <div class="quest-card quest-card--${escHtml(q.status)}">
      ${isLocked ? '<div class="locked-banner">🔒 LOCKED — 解放待ち</div>' : ''}
      <div class="quest-card__header">
        <div class="quest-card__icon" aria-hidden="true">${q.icon || '❓'}</div>
        <div class="quest-card__meta">
          <div class="quest-card__name">${escHtml(q.name)}</div>
          ${categoryBadge(q.category)}
        </div>
      </div>
      <div class="quest-card__body">
        <p class="quest-card__desc">${escHtml(q.shortDescription)}</p>
        ${isCleared
          ? `<div class="progress-wrap">
               <div class="progress-bar-bg">
                 <div class="progress-bar-fill progress-bar-fill--gold" style="width:100%"></div>
               </div>
               <div class="progress-text">
                 <span style="color:var(--color-success)">✓ CLEARED</span>
                 <span>${formatCurrency(q.currentAmount)} / ${formatCurrency(q.goalAmount)}</span>
               </div>
             </div>`
          : buildProgressBar(q.currentAmount, q.goalAmount)
        }
      </div>
      <div class="quest-card__footer">
        ${isActive && q.donationUrl
          ? `<a href="${escHtml(q.donationUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">支援する</a>`
          : isLocked
            ? `<button class="btn btn--danger btn--sm" disabled aria-disabled="true">支援する</button>`
            : ''
        }
        <a href="quest.html?id=${escHtml(q.id)}" class="btn btn--sm">詳細 ▶</a>
      </div>
    </div>
  `;
}
