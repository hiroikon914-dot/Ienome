/**
 * main.js - index.html 用スクリプト
 * ・ワールド統計の計算と表示
 * ・Active クエスト上位3件のカード表示
 */

// utils.js に依存（index.html で先に読み込まれること）

document.addEventListener('DOMContentLoaded', async () => {
  // ---------- ワールド統計 ----------
  // ★ 後で差し替えやすいよう定数として定義
  const WORLD_STATS = {
    population:   '--',       // YouTube登録者 + Instagramフォロワー（手動更新）
    supportPower: '¥--',      // 支援総額（手動更新）
    // Quests Cleared と Build Level は quests.json から算出
  };

  const statsEl = document.getElementById('world-stats');
  const activeQuestsEl = document.getElementById('active-quests');

  // ---------- データ取得 ----------
  try {
    showLoading(activeQuestsEl);

    const quests = await fetchQuests();

    // ---------- 統計計算 ----------
    const cleared = quests.filter(q => q.status === 'cleared').length;
    // Build Level: cleared 数に応じたダミー計算（5クリアごとに+1）
    const buildLevel = Math.max(1, Math.floor(cleared / 2) + 1);

    // 統計カードを更新
    renderStats(statsEl, {
      population:   WORLD_STATS.population,
      supportPower: WORLD_STATS.supportPower,
      cleared,
      buildLevel
    });

    // ---------- Active クエスト上位3件 ----------
    const activeQuests = quests
      .filter(q => q.status === 'active')
      .slice(0, 3);

    if (activeQuests.length === 0) {
      activeQuestsEl.innerHTML = `
        <div class="state-message">
          <p>現在アクティブなクエストはありません。</p>
        </div>
      `;
    } else {
      renderActiveQuests(activeQuestsEl, activeQuests);
    }

  } catch (err) {
    console.error(err);
    showError(activeQuestsEl, `データ読み込みエラー: ${err.message}`);
  }
});

// ============================================================
// 統計カード描画
// ============================================================

/**
 * ワールド統計を画面に反映
 * @param {HTMLElement} container
 * @param {{ population, supportPower, cleared, buildLevel }} stats
 */
function renderStats(container, stats) {
  if (!container) return;

  const cards = [
    {
      label: 'Population',
      value: stats.population,
      unit: 'followers & subscribers'
    },
    {
      label: 'Support Power',
      value: stats.supportPower,
      unit: 'total funded'
    },
    {
      label: 'Quests Cleared',
      value: stats.cleared,
      unit: 'completed quests'
    },
    {
      label: 'Build Level',
      value: `Lv.${stats.buildLevel}`,
      unit: 'world progress'
    }
  ];

  container.innerHTML = `
    <div class="stats-grid">
      ${cards.map(c => `
        <div class="stat-card">
          <div class="stat-card__label">${escHtml(c.label)}</div>
          <div class="stat-card__value">${escHtml(String(c.value))}</div>
          <div class="stat-card__unit">${escHtml(c.unit)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================================
// Active クエストカード描画
// ============================================================

/**
 * アクティブクエストのカードグリッドを描画
 * @param {HTMLElement} container
 * @param {Array} quests
 */
function renderActiveQuests(container, quests) {
  container.innerHTML = `
    <div class="quest-grid">
      ${quests.map(q => buildQuestCard(q)).join('')}
    </div>
  `;
}

/**
 * クエストカードのHTML文字列を生成（index用・簡易版）
 * @param {Object} q クエストオブジェクト
 * @returns {string}
 */
function buildQuestCard(q) {
  const pct = calcProgress(q.currentAmount, q.goalAmount);

  return `
    <div class="quest-card quest-card--${escHtml(q.status)}">
      ${q.status === 'locked' ? '<div class="locked-banner">🔒 LOCKED — 解放待ち</div>' : ''}
      <div class="quest-card__header">
        <div class="quest-card__icon">${q.icon || '❓'}</div>
        <div class="quest-card__meta">
          <div class="quest-card__name">${escHtml(q.name)}</div>
          ${categoryBadge(q.category)}
        </div>
      </div>
      <div class="quest-card__body">
        <p class="quest-card__desc">${escHtml(q.shortDescription)}</p>
        ${buildProgressBar(q.currentAmount, q.goalAmount)}
      </div>
      <div class="quest-card__footer">
        ${q.status === 'active' && q.donationUrl
          ? `<a href="${escHtml(q.donationUrl)}" target="_blank" rel="noopener" class="btn btn--primary btn--sm">支援する</a>`
          : q.status === 'locked'
            ? `<span class="btn btn--danger btn--sm" aria-disabled="true">支援する</span>`
            : ''
        }
        <a href="quest.html?id=${escHtml(q.id)}" class="btn btn--sm">詳細 ▶</a>
      </div>
    </div>
  `;
}
