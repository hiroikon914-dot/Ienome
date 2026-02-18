/**
 * quest.js - quest.html 用スクリプト
 * URLパラメータ ?id=xxx を読み取り、quests.json から該当クエストを取得して詳細表示
 */

// utils.js に依存（quest.html で先に読み込まれること）

document.addEventListener('DOMContentLoaded', async () => {
  const mainEl    = document.getElementById('quest-detail');
  const sidebarEl = document.getElementById('quest-sidebar');

  if (!mainEl) return; // guard

  // URL から id を取得
  const id = getParam('id');

  if (!id) {
    showError(mainEl, 'クエストIDが指定されていません。URLに ?id=xxx を追加してください。');
    return;
  }

  showLoading(mainEl);

  try {
    const quest = await fetchQuestById(id);

    if (!quest) {
      showError(mainEl, `クエスト "${escHtml(id)}" が見つかりませんでした。`);
      document.title = 'Quest Not Found – Ienome World';
      return;
    }

    // ページタイトルを更新
    document.title = `${quest.name} – Ienome World`;

    // パンくずの名前も更新
    const breadcrumbNameEl = document.getElementById('breadcrumb-name');
    if (breadcrumbNameEl) breadcrumbNameEl.textContent = quest.name;

    // メインエリア描画
    renderQuestDetail(mainEl, quest);
    // サイドバー描画
    renderSidebar(sidebarEl, quest);

  } catch (err) {
    console.error(err);
    showError(mainEl, `データ読み込みエラー: ${err.message}`);
  }
});

// ============================================================
// メイン詳細描画
// ============================================================

/**
 * クエスト詳細コンテンツを描画
 * @param {HTMLElement} container
 * @param {Object} q クエストオブジェクト
 */
function renderQuestDetail(container, q) {
  const isCleared = q.status === 'cleared';
  const isLocked  = q.status === 'locked';

  // 予算内訳テーブル
  const budgetRows = (q.budgetBreakdown || []).map(item =>
    `<tr>
      <td>${escHtml(item.label)}</td>
      <td>${formatCurrency(item.amount)}</td>
    </tr>`
  );
  const budgetTotal = (q.budgetBreakdown || []).reduce((s, i) => s + i.amount, 0);
  if (budgetRows.length > 0) {
    budgetRows.push(`<tr><td>合計</td><td>${formatCurrency(budgetTotal)}</td></tr>`);
  }

  // 進捗ログ（タイムライン）
  const updates = (q.updates || []).slice().reverse(); // 新しい順
  const timelineItems = updates.map(u => {
    const videoHtml = u.videoUrl ? buildYouTubeEmbed(u.videoUrl) || '' : '';
    return `
      <li class="timeline__item">
        <div class="timeline__date">${escHtml(u.date)}</div>
        <div class="timeline__text">${escHtml(u.text)}</div>
        ${videoHtml ? `<div style="margin-top:12px">${videoHtml}</div>` : ''}
      </li>
    `;
  });

  // YouTube埋め込み（本体）
  const youtubeEmbed = buildYouTubeEmbed(q.youtubeUrl);

  // ステータスバナー
  let statusBanner = '';
  if (isCleared) {
    statusBanner = `<div style="color:var(--color-success); font-family:var(--font-main); font-size:1.2rem; margin-bottom:16px; border:2px solid var(--color-success); padding:8px 16px; display:inline-block; letter-spacing:0.2em;">✓ CLEARED</div>`;
  } else if (isLocked) {
    statusBanner = `<div style="color:var(--color-danger); font-family:var(--font-main); font-size:1rem; margin-bottom:16px; border:2px solid var(--color-danger); padding:8px 16px; display:inline-block; letter-spacing:0.2em;">🔒 LOCKED — このクエストはまだ解放されていません</div>`;
  }

  container.innerHTML = `
    <div class="quest-detail__icon-wrap">${q.icon || '❓'}</div>
    ${categoryBadge(q.category)}
    <h1 class="quest-detail__title" style="margin-top:12px">${escHtml(q.name)}</h1>
    ${statusBanner}

    <!-- 進捗バー -->
    <div class="quest-detail__section">
      <div class="quest-detail__section-title">Quest Progress</div>
      ${buildProgressBar(q.currentAmount, q.goalAmount, isCleared)}
    </div>

    <!-- 概要 -->
    <div class="quest-detail__section">
      <div class="quest-detail__section-title">Overview</div>
      <p class="quest-detail__text">${escHtml(q.shortDescription)}</p>
    </div>

    <!-- なぜ必要か -->
    ${q.why ? `
    <div class="quest-detail__section">
      <div class="quest-detail__section-title">Why — なぜ必要か</div>
      <p class="quest-detail__text">${escHtml(q.why)}</p>
    </div>
    ` : ''}

    <!-- 達成したら何が変わる -->
    ${q.outcome ? `
    <div class="quest-detail__section">
      <div class="quest-detail__section-title">Outcome — 達成したら</div>
      <p class="quest-detail__text">${escHtml(q.outcome)}</p>
    </div>
    ` : ''}

    <!-- 予算内訳 -->
    ${budgetRows.length > 0 ? `
    <div class="quest-detail__section">
      <div class="quest-detail__section-title">Budget — 予算内訳</div>
      <table class="budget-table">
        <thead>
          <tr><th>項目</th><th>金額</th></tr>
        </thead>
        <tbody>${budgetRows.join('')}</tbody>
      </table>
    </div>
    ` : ''}

    <!-- Before / After 画像 -->
    <div class="quest-detail__section">
      <div class="quest-detail__section-title">Before / After</div>
      <div class="before-after">
        <div class="before-after__item">
          <div class="before-after__label">Before</div>
          <img src="${escHtml(q.beforeImage || 'assets/placeholder_before.png')}"
               alt="Before image"
               class="before-after__img"
               onerror="this.src='assets/placeholder_before.png'">
        </div>
        <div class="before-after__item">
          <div class="before-after__label">After</div>
          <img src="${escHtml(q.afterImage || 'assets/placeholder_after.png')}"
               alt="After image"
               class="before-after__img"
               onerror="this.src='assets/placeholder_after.png'">
        </div>
      </div>
    </div>

    <!-- YouTube 動画（あれば） -->
    ${youtubeEmbed ? `
    <div class="quest-detail__section">
      <div class="quest-detail__section-title">Video</div>
      ${youtubeEmbed}
    </div>
    ` : q.youtubeUrl ? `
    <div class="quest-detail__section">
      <div class="quest-detail__section-title">Video</div>
      <p><a href="${escHtml(q.youtubeUrl)}" target="_blank" rel="noopener">▶ YouTubeで見る</a></p>
    </div>
    ` : ''}

    <!-- 進捗ログ -->
    ${timelineItems.length > 0 ? `
    <div class="quest-detail__section">
      <div class="quest-detail__section-title">Updates — 進捗ログ</div>
      <ul class="timeline">
        ${timelineItems.join('')}
      </ul>
    </div>
    ` : ''}
  `;
}

// ============================================================
// サイドバー描画
// ============================================================

/**
 * 支援パネルサイドバーを描画
 * @param {HTMLElement} container
 * @param {Object} q クエストオブジェクト
 */
function renderSidebar(container, q) {
  if (!container) return;

  const isActive  = q.status === 'active';
  const isCleared = q.status === 'cleared';
  const isLocked  = q.status === 'locked';

  let actionBtn = '';
  if (isActive && q.donationUrl) {
    actionBtn = `
      <a href="${escHtml(q.donationUrl)}"
         target="_blank" rel="noopener noreferrer"
         class="btn btn--primary">
        ⚡ 支援する
      </a>
    `;
  } else if (isLocked) {
    actionBtn = `<button class="btn btn--danger" disabled aria-disabled="true">🔒 LOCKED</button>`;
  } else if (isCleared) {
    actionBtn = `<div class="btn" style="border-color:var(--color-success); color:var(--color-success); cursor:default;">✓ CLEARED</div>`;
  }

  // Instagram リンク
  const igLink = q.instagramUrl
    ? `<a href="${escHtml(q.instagramUrl)}" target="_blank" rel="noopener" class="btn btn--sm" style="width:100%;text-align:center;margin-top:8px;">📷 Instagram</a>`
    : '';

  container.innerHTML = `
    <div class="pixel-box support-panel">
      <div class="quest-detail__section-title">Support This Quest</div>
      <div class="support-panel__amount">${formatCurrency(q.currentAmount)}</div>
      <div class="support-panel__goal">目標: ${formatCurrency(q.goalAmount)}</div>
      ${buildProgressBar(q.currentAmount, q.goalAmount)}
      ${actionBtn}
      ${igLink}
      <div style="margin-top:16px; font-size:0.75rem; color:var(--color-text-dim); font-family:var(--font-main); line-height:1.6;">
        ▶ 決済は外部サービスで安全に処理されます<br>
        ▶ このページは金額を自動同期しません<br>
        ▶ 領収書は決済サービスから届きます
      </div>
    </div>
    <div style="margin-top:12px; text-align:center;">
      <a href="quests.html" class="btn btn--sm">← クエスト一覧へ</a>
    </div>
  `;
}
