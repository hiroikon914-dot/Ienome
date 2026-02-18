/* ================================================================
   家の目 — Minecraft Quest Website
   script.js
================================================================ */

'use strict';

/* ─── QUEST DATA ────────────────────────────────────────────── */
const QUESTS = [
  {
    id: 'q01',
    icon: '🏚️',
    title: '屋根の茅葺き修復',
    rarity: 'urgent',
    status: '緊急',
    statusKey: 'urgent',
    desc: '築150年の茅葺き屋根が各所で崩落しかけています。雨漏りが激しく、内部構造への影響が深刻です。専門の茅葺き職人とともに、伝統技法で屋根を蘇らせます。',
    goal: 500000,
    raised: 312000,
    supporters: 23,
  },
  {
    id: 'q02',
    icon: '🔥',
    title: '囲炉裏の復元',
    rarity: 'inprogress',
    status: '進行中',
    statusKey: 'inprogress',
    desc: '埋め立てられていた囲炉裏を発掘・復元します。灰・五徳・鉄瓶など、当時の道具も可能な限り再現。完成後はワークショップ会場として活用予定です。',
    goal: 150000,
    raised: 98000,
    supporters: 14,
  },
  {
    id: 'q03',
    icon: '🪵',
    title: '縁側の修繕',
    rarity: 'open',
    status: '募集中',
    statusKey: 'open',
    desc: '腐食が進んだ縁側の板を、地域の木材（飛騨スギ）で張り替えます。縁側は家と外をつなぐ大切な空間。修繕後は訪問者が腰かけてくつろげる場所に。',
    goal: 120000,
    raised: 15000,
    supporters: 5,
  },
  {
    id: 'q04',
    icon: '🏗️',
    title: '柱の補強工事',
    rarity: 'urgent',
    status: '緊急',
    statusKey: 'urgent',
    desc: '複数の主要柱が土台から腐食し、傾きが発生しています。古民家の骨格を守るため、根継ぎ工法による補強を実施。建物全体の耐震性を確保します。',
    goal: 800000,
    raised: 240000,
    supporters: 31,
  },
  {
    id: 'q05',
    icon: '🌊',
    title: '古井戸の修復と発掘',
    rarity: 'open',
    status: '募集中',
    statusKey: 'open',
    desc: '屋敷の裏に埋もれていた古井戸を掘り起こします。かつてこの家を支えた水源を復活させ、庭の景観の一部として整備。歴史的な調査も同時に行います。',
    goal: 200000,
    raised: 0,
    supporters: 0,
  },
  {
    id: 'q06',
    icon: '🏔️',
    title: '土間の整備',
    rarity: 'completed',
    status: '完了',
    statusKey: 'completed',
    desc: '土間に三和土（たたき）仕上げを施し、昔ながらの美しい土間空間を再現しました。地域の皆さんの支援により、このクエストは無事達成されました！',
    goal: 100000,
    raised: 107500,
    supporters: 18,
  },
  {
    id: 'q07',
    icon: '🪟',
    title: '障子・欄間の修復',
    rarity: 'open',
    status: '募集中',
    statusKey: 'open',
    desc: '破れた障子紙の張り替えと、彫刻が施された欄間（らんま）の修復を行います。光と影が美しく交差する、日本建築ならではの空間美を取り戻します。',
    goal: 80000,
    raised: 12000,
    supporters: 4,
  },
  {
    id: 'q08',
    icon: '🌿',
    title: '庭園の整備',
    rarity: 'inprogress',
    status: '進行中',
    statusKey: 'inprogress',
    desc: '荒れ果てた裏庭を伝統的な日本庭園として整備します。苔・石・植栽を丁寧に配置し、古民家の佇まいに合った庭の景観を復活させます。',
    goal: 180000,
    raised: 65000,
    supporters: 9,
  },
];

/* ─── STATE ─────────────────────────────────────────────────── */
const state = {
  filter: 'all',
  selectedQuestId: null,
  selectedAmount: null,
  quests: JSON.parse(JSON.stringify(QUESTS)), // deep copy
};

/* ─── STARS ─────────────────────────────────────────────────── */
function initStars() {
  const container = document.getElementById('stars');
  const count = 120;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (2 + Math.random() * 3) + 's';
    star.style.opacity = Math.random();
    container.appendChild(star);
  }
}

/* ─── TYPEWRITER ─────────────────────────────────────────────── */
function initTypewriter() {
  const messages = [
    '>> 新しいクエストが追加されました！',
    '>> 囲炉裏の復元が進行中です。',
    '>> 23人の冒険者が応援中！',
    '>> あなたの投げ銭が家を救う。',
  ];
  const el = document.getElementById('typewriter');
  let msgIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const msg = messages[msgIdx];
    if (!deleting) {
      el.textContent = msg.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === msg.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
    } else {
      el.textContent = msg.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        msgIdx = (msgIdx + 1) % messages.length;
      }
    }
    setTimeout(tick, deleting ? 40 : 80);
  }
  tick();
}

/* ─── STATS COUNTER ──────────────────────────────────────────── */
function initStats() {
  const items = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const prefix = el.dataset.prefix || '';
      const duration = 1500;
      const start = performance.now();
      function update(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = Math.round(eased * target);
        el.textContent = prefix + val.toLocaleString('ja-JP');
        if (t < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }, { threshold: 0.5 });
  items.forEach(el => observer.observe(el));
}

/* ─── SCROLL REVEAL ──────────────────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.about-card, .log-entry, .quest-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

/* ─── QUEST CARD ─────────────────────────────────────────────── */
function createQuestCard(quest) {
  const pct = Math.min(Math.round((quest.raised / quest.goal) * 100), 100);
  const isCompleted = quest.statusKey === 'completed';

  const card = document.createElement('div');
  card.className = 'quest-card';
  card.dataset.rarity = quest.rarity;
  card.dataset.status = quest.statusKey;
  card.dataset.id = quest.id;

  const statusClasses = {
    urgent:    'badge-urgent',
    inprogress:'badge-inprogress',
    open:      'badge-open',
    completed: 'badge-completed',
  };

  card.innerHTML = `
    <div class="quest-card-inner">
      <div class="quest-header">
        <div class="quest-icon">${quest.icon}</div>
        <div class="quest-meta">
          <div class="quest-title">${quest.title}</div>
          <span class="quest-status-badge ${statusClasses[quest.statusKey]}">${quest.status}</span>
        </div>
      </div>
      <p class="quest-desc">${quest.desc}</p>
      <div class="quest-progress">
        <div class="progress-labels">
          <span class="progress-raised">¥${quest.raised.toLocaleString('ja-JP')}</span>
          <span class="progress-goal">目標 ¥${quest.goal.toLocaleString('ja-JP')}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${isCompleted ? 'completed-fill' : ''}" style="width: 0%" data-pct="${pct}"></div>
        </div>
        <div class="progress-pct">${pct}% 達成</div>
      </div>
      <div class="quest-footer">
        <div class="quest-supporters">
          👥 <span>${quest.supporters}</span> 人が応援中
        </div>
        <button class="quest-donate-btn" ${isCompleted ? 'disabled' : ''}>
          ${isCompleted ? '✓ 達成済み' : '💰 投げ銭する'}
        </button>
      </div>
    </div>
  `;

  // animate progress bar after card mounts
  setTimeout(() => {
    const fill = card.querySelector('.progress-fill');
    if (fill) fill.style.width = pct + '%';
  }, 300);

  // click events
  const btn = card.querySelector('.quest-donate-btn');
  if (btn && !isCompleted) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(quest.id);
    });
  }
  card.addEventListener('click', () => {
    if (!isCompleted) openModal(quest.id);
  });

  return card;
}

/* ─── RENDER QUESTS ──────────────────────────────────────────── */
function renderQuests() {
  const grid = document.getElementById('questGrid');
  grid.innerHTML = '';

  state.quests.forEach(quest => {
    const card = createQuestCard(quest);
    if (state.filter !== 'all' && quest.statusKey !== state.filter) {
      card.classList.add('hidden');
    }
    grid.appendChild(card);
  });

  // re-run scroll reveal on new cards
  setTimeout(() => {
    document.querySelectorAll('.quest-card').forEach(el => {
      el.classList.add('reveal');
    });
    initReveal();
  }, 50);
}

/* ─── FILTER ─────────────────────────────────────────────────── */
function initFilter() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filter = btn.dataset.filter;

      document.querySelectorAll('.quest-card').forEach(card => {
        const cardStatus = card.dataset.status;
        if (state.filter === 'all' || cardStatus === state.filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ─── MODAL ──────────────────────────────────────────────────── */
function openModal(questId) {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest) return;

  state.selectedQuestId = questId;
  state.selectedAmount = null;

  const overlay = document.getElementById('modalOverlay');
  const pct = Math.min(Math.round((quest.raised / quest.goal) * 100), 100);

  const statusClasses = {
    urgent:    'badge-urgent',
    inprogress:'badge-inprogress',
    open:      'badge-open',
    completed: 'badge-completed',
  };

  document.getElementById('modalIcon').textContent = quest.icon;
  document.getElementById('modalTitle').textContent = quest.title;
  document.getElementById('modalDesc').textContent = quest.desc;
  document.getElementById('modalRaised').textContent = '¥' + quest.raised.toLocaleString('ja-JP');
  document.getElementById('modalGoal').textContent = '¥' + quest.goal.toLocaleString('ja-JP');

  const statusEl = document.getElementById('modalStatus');
  statusEl.textContent = quest.status;
  statusEl.className = 'modal-status quest-status-badge ' + statusClasses[quest.statusKey];

  const fillEl = document.getElementById('modalProgressFill');
  fillEl.style.width = '0%';
  setTimeout(() => { fillEl.style.width = pct + '%'; }, 100);

  // reset amount selection
  document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('customInputWrap').classList.remove('visible');
  document.getElementById('customInput').value = '';

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  state.selectedQuestId = null;
  state.selectedAmount = null;
}

function initModal() {
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Amount buttons
  document.querySelectorAll('.amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const amount = btn.dataset.amount;
      const customWrap = document.getElementById('customInputWrap');

      if (amount === 'custom') {
        customWrap.classList.add('visible');
        state.selectedAmount = 'custom';
        document.getElementById('customInput').focus();
      } else {
        customWrap.classList.remove('visible');
        state.selectedAmount = parseInt(amount, 10);
      }
    });
  });

  // Donate submit
  document.getElementById('donateSubmit').addEventListener('click', handleDonate);
}

/* ─── DONATE ─────────────────────────────────────────────────── */
function handleDonate() {
  let amount = state.selectedAmount;

  if (amount === 'custom') {
    amount = parseInt(document.getElementById('customInput').value, 10);
    if (isNaN(amount) || amount < 100) {
      showToast('100円以上の金額を入力してください！');
      return;
    }
  }

  if (!amount) {
    showToast('金額を選択してください！');
    return;
  }

  const quest = state.quests.find(q => q.id === state.selectedQuestId);
  if (!quest) return;

  // Update state (demo — no real payment)
  quest.raised = Math.min(quest.raised + amount, quest.goal * 1.2);
  quest.supporters += 1;

  // Add log entry
  addLogEntry(quest, amount);

  closeModal();
  renderQuests();

  showToast(`¥${amount.toLocaleString('ja-JP')} 投げ銭しました！ ありがとう！`);
}

/* ─── LOG ENTRY ──────────────────────────────────────────────── */
function addLogEntry(quest, amount) {
  const logList = document.querySelector('.log-list');
  const today = new Date().toISOString().slice(0, 10);

  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.style.background = 'rgba(252, 219, 0, 0.08)';
  entry.style.borderColor = 'rgba(252, 219, 0, 0.4)';
  entry.innerHTML = `
    <span class="log-date">${today}</span>
    <span class="log-badge badge-gold">投げ銭</span>
    <span class="log-text">あなたが「${quest.title}」クエストに <strong>¥${amount.toLocaleString('ja-JP')}</strong> 投げ銭しました！</span>
  `;

  logList.insertBefore(entry, logList.firstChild);

  // animate in
  entry.style.opacity = '0';
  entry.style.transform = 'translateX(-20px)';
  requestAnimationFrame(() => {
    entry.style.transition = 'opacity 0.4s, transform 0.4s';
    entry.style.opacity = '1';
    entry.style.transform = 'translateX(0)';
  });
}

/* ─── TOAST ──────────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ─── SMOOTH SCROLL ──────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ─── PARALLAX STARS ─────────────────────────────────────────── */
function initParallax() {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const stars = document.getElementById('stars');
    if (stars) {
      stars.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  }, { passive: true });
}

/* ─── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initTypewriter();
  initStats();
  renderQuests();
  initFilter();
  initModal();
  initSmoothScroll();
  initParallax();

  // Delay reveal init so cards are rendered first
  setTimeout(initReveal, 100);
});
