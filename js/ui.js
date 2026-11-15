/**
 * Модуль пользовательского интерфейса (UI Components) для «Новогодний движ 2027»
 */

import { CONFIG } from './config.js';
import { escapeHtml } from './models.js';

export class UIManager {
  constructor(storage, onEventCreate, onEventUpdate, onEventDelete) {
    this.storage = storage;
    this.onEventCreate = onEventCreate;
    this.onEventUpdate = onEventUpdate;
    this.onEventDelete = onEventDelete;
    this.activeTab = 'calendar'; // 'calendar' | 'proposals' | 'plan' | 'members'
    this.filterCategory = 'all';
    this.filterSearch = '';
    this.selectedEventForDetail = null;

    this.initDOM();
    this.startNewYearCountdown();
  }

  initDOM() {
    // Основные контейнеры
    this.headerEl = document.getElementById('appHeader');
    this.dashboardStatsEl = document.getElementById('dashboardStats');
    this.tabNavEl = document.getElementById('tabNav');
    this.tabContentEl = document.getElementById('tabContent');
    this.toastContainerEl = document.getElementById('toastContainer');
    this.modalsContainerEl = document.getElementById('modalsContainer');
  }

  // --- Таймер обратного отсчета до Нового Года 2027 ---
  startNewYearCountdown() {
    const updateCountdown = () => {
      const now = new Date();
      const diff = CONFIG.TARGET_NEW_YEAR.getTime() - now.getTime();
      const countdownEl = document.getElementById('nyCountdown');

      if (!countdownEl) return;

      if (diff <= 0) {
        countdownEl.innerHTML = '<span class="ny-celebrate">🎉 С Новым 2027 Годом! 🍾</span>';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      countdownEl.innerHTML = `
        <span class="countdown-label">До 2027 года:</span>
        <span class="countdown-timer">
          <strong>${days}</strong>д <strong>${hours}</strong>ч <strong>${minutes}</strong>м <strong>${seconds}</strong>с 🎄
        </span>
      `;
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // --- Отрисовка Dashboard Stats ---
  renderDashboardStats() {
    if (!this.dashboardStatsEl) return;

    const events = this.storage.state.events;
    const votes = this.storage.state.votes;
    const currentUser = this.storage.getCurrentUser();

    // 1. Ближайшее подтвержденное мероприятие
    const nowISO = new Date().toISOString().split('T')[0];
    const upcoming = events
      .filter(e => e.status === 'confirmed' && e.confirmedDate && e.confirmedDate >= nowISO)
      .sort((a, b) => a.confirmedDate.localeCompare(b.confirmedDate))[0];

    // 2. Статистика
    const confirmedCount = events.filter(e => e.status === 'confirmed').length;
    const votingCount = events.filter(e => e.status === 'voting' || e.status === 'proposed').length;

    // 3. Сколько голосований требуют ответа от меня
    let pendingMyVoteCount = 0;
    if (currentUser) {
      events.filter(e => e.status === 'voting' && e.dateOptions?.length > 0).forEach(ev => {
        const hasVotedAll = ev.dateOptions.every(opt => 
          votes.some(v => v.dateOptionId === opt.id && v.userId === currentUser.id)
        );
        if (!hasVotedAll) pendingMyVoteCount++;
      });
    }

    let upcomingHtml = '';
    if (upcoming) {
      const d = new Date(upcoming.confirmedDate);
      const dateStr = `${d.getDate()} ${CONFIG.MONTH_NAMES_GENITIVE[d.getMonth()]}`;
      const cat = CONFIG.CATEGORIES[upcoming.category] || CONFIG.CATEGORIES.other;
      upcomingHtml = `
        <div class="stat-card stat-upcoming" data-event-id="${upcoming.id}">
          <div class="stat-icon" style="background: ${cat.bg}; color: ${cat.color};">${cat.emoji}</div>
          <div class="stat-info">
            <span class="stat-label">Ближайшее событие</span>
            <span class="stat-value truncate">${escapeHtml(upcoming.title)}</span>
            <span class="stat-sub">${dateStr} ${upcoming.timeStart ? `• ${upcoming.timeStart}` : ''}</span>
          </div>
        </div>
      `;
    } else {
      upcomingHtml = `
        <div class="stat-card stat-upcoming">
          <div class="stat-icon" style="background: rgba(244, 63, 94, 0.15); color: #f43f5e;">🎄</div>
          <div class="stat-info">
            <span class="stat-label">Ближайшее событие</span>
            <span class="stat-value">Новогодняя ночь</span>
            <span class="stat-sub">31 декабря 2026</span>
          </div>
        </div>
      `;
    }

    this.dashboardStatsEl.innerHTML = `
      <div class="stats-grid">
        ${upcomingHtml}
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">✅</div>
          <div class="stat-info">
            <span class="stat-label">Утверждено</span>
            <span class="stat-value">${confirmedCount}</span>
            <span class="stat-sub">Точно состоятся</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">🗳️</div>
          <div class="stat-info">
            <span class="stat-label">На голосовании</span>
            <span class="stat-value">${votingCount}</span>
            <span class="stat-sub">Ждут решения</span>
          </div>
        </div>
        <div class="stat-card ${pendingMyVoteCount > 0 ? 'highlight-vote' : ''}">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">⚡</div>
          <div class="stat-info">
            <span class="stat-label">Ждут вашего голоса</span>
            <span class="stat-value">${pendingMyVoteCount}</span>
            <span class="stat-sub">${pendingMyVoteCount > 0 ? 'Нужен ваш голос!' : 'Вы проголосовали'}</span>
          </div>
        </div>
      </div>
    `;

    // Привязываем клик по ближайшему событию для открытия модалки
    this.dashboardStatsEl.querySelector('.stat-upcoming[data-event-id]')?.addEventListener('click', (e) => {
      const eventId = e.currentTarget.dataset.eventId;
      const found = events.find(ev => ev.id === eventId);
      if (found) this.openEventDetailModal(found);
    });
  }

  // --- Переключение табов ---
  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Скрываем/показываем соответствующие секции
    const sections = ['calendarTab', 'proposalsTab', 'planTab', 'membersTab'];
    sections.forEach(secId => {
      const el = document.getElementById(secId);
      if (el) {
        if (secId === `${tabId}Tab`) {
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      }
    });

    if (tabId === 'proposals') this.renderProposalsTab();
    if (tabId === 'plan') this.renderPlanTab();
    if (tabId === 'members') this.renderMembersTab();
  }

  // --- Вкладка 2: Предложения и Голосования ---
  renderProposalsTab() {
    const container = document.getElementById('proposalsTab');
    if (!container) return;

    const events = this.storage.state.events.filter(e => e.status === 'voting' || e.status === 'proposed');
    const votes = this.storage.state.votes;
    const currentUser = this.storage.getCurrentUser();
    const isOrganizer = currentUser && currentUser.role === 'organizer';

    if (events.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">💡</div>
          <h3>Пока нет предложений</h3>
          <p>Будьте первым! Предложите поехать за город, пойти на каток или собраться на настолки.</p>
          <button type="button" class="btn btn-primary" id="btnProposeEmpty">
            + Предложить мероприятие
          </button>
        </div>
      `;
      container.querySelector('#btnProposeEmpty')?.addEventListener('click', () => {
        this.openEventCreateModal();
      });
      return;
    }

    const cardsHtml = events.map(evt => {
      const cat = CONFIG.CATEGORIES[evt.category] || CONFIG.CATEGORIES.other;
      const statusCfg = CONFIG.STATUSES[evt.status] || CONFIG.STATUSES.proposed;

      // Отрисовка вариантов дат и голосований
      const dateOptionsHtml = (evt.dateOptions || []).map(opt => {
        const d = new Date(opt.date);
        const dateStr = `${d.getDate()} ${CONFIG.MONTH_NAMES_GENITIVE[d.getMonth()]}`;
        
        // Голоса за этот вариант даты
        const optVotes = votes.filter(v => v.dateOptionId === opt.id);
        const yesCount = optVotes.filter(v => v.vote === 'yes').length;
        const maybeCount = optVotes.filter(v => v.vote === 'maybe').length;
        const noCount = optVotes.filter(v => v.vote === 'no').length;
        const myVote = currentUser ? optVotes.find(v => v.userId === currentUser.id)?.vote : null;

        // Аватары проголосовавших за
        const yesAvatars = optVotes.filter(v => v.vote === 'yes').map(v => `
          <span class="voter-mini-avatar" title="${escapeHtml(v.userName)}: Подходит">${v.userEmoji}</span>
        `).join('');

        return `
          <div class="vote-option-row" data-option-id="${opt.id}" data-event-id="${evt.id}">
            <div class="vote-option-date">
              <span class="vote-date-text">📅 ${dateStr}</span>
              ${opt.timeStart ? `<span class="vote-time-text">⏰ ${opt.timeStart}</span>` : ''}
              <div class="vote-voters-list">${yesAvatars}</div>
            </div>

            <!-- Кнопки голосования для текущего пользователя -->
            <div class="vote-buttons-group">
              <button type="button" class="btn-vote vote-yes ${myVote === 'yes' ? 'selected' : ''}" 
                      data-vote="yes" title="Мне подходит!">
                ✅ <span>${yesCount}</span>
              </button>
              <button type="button" class="btn-vote vote-maybe ${myVote === 'maybe' ? 'selected' : ''}" 
                      data-vote="maybe" title="Возможно смогу">
                🤔 <span>${maybeCount}</span>
              </button>
              <button type="button" class="btn-vote vote-no ${myVote === 'no' ? 'selected' : ''}" 
                      data-vote="no" title="Не подходит">
                ❌ <span>${noCount}</span>
              </button>
            </div>

            <!-- Для организатора или автора: утвердить эту дату -->
            ${(isOrganizer || evt.authorId === currentUser?.id) ? `
              <button type="button" class="btn btn-sm btn-outline btn-confirm-date" 
                      data-event-id="${evt.id}" data-date="${opt.date}" data-time="${opt.timeStart || ''}"
                      title="Утвердить окончательную дату">
                Утвердить
              </button>
            ` : ''}
          </div>
        `;
      }).join('');

      return `
        <div class="proposal-card" data-event-id="${evt.id}">
          <div class="proposal-card-header">
            <div class="proposal-category-badge" style="background: ${cat.bg}; color: ${cat.color};">
              ${cat.emoji} ${cat.name}
            </div>
            <span class="badge ${statusCfg.badgeClass}">${statusCfg.emoji} ${statusCfg.label}</span>
          </div>

          <h3 class="proposal-title">${escapeHtml(evt.title)}</h3>
          ${evt.description ? `<p class="proposal-desc">${escapeHtml(evt.description)}</p>` : ''}
          ${evt.location ? `<div class="proposal-loc">📍 ${escapeHtml(evt.location)}</div>` : ''}

          <!-- Блок голосования за даты -->
          <div class="proposal-voting-box">
            <span class="voting-box-title">Голосование за даты:</span>
            <div class="vote-options-list">
              ${dateOptionsHtml || '<span class="text-muted">Даты не указаны</span>'}
            </div>
          </div>

          <div class="proposal-footer">
            <div class="proposal-author">
              <span>Предложил:</span>
              <strong>${evt.authorEmoji} ${escapeHtml(evt.authorName)}</strong>
            </div>
            <button type="button" class="btn btn-outline btn-sm btn-open-detail" data-event-id="${evt.id}">
              Обсуждение и детали
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="proposals-container">
        <div class="proposals-header-bar">
          <div>
            <h2>🗳️ Предложения и выбор дат</h2>
            <p>Голосуйте за удобные дни, чтобы собрать всех друзей вместе.</p>
          </div>
          <button type="button" class="btn btn-primary" id="btnNewProposal">
            + Предложить движ
          </button>
        </div>
        <div class="proposals-grid">
          ${cardsHtml}
        </div>
      </div>
    `;

    // Привязываем события голосования
    container.querySelectorAll('.btn-vote').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!currentUser) {
          this.openAuthModal();
          return;
        }
        const row = btn.closest('.vote-option-row');
        const eventId = row.dataset.eventId;
        const dateOptionId = row.dataset.optionId;
        const voteType = btn.dataset.vote;

        await this.storage.castVote(eventId, dateOptionId, currentUser, voteType);
        this.renderProposalsTab();
        this.renderDashboardStats();
      });
    });

    // Утверждение даты
    container.querySelectorAll('.btn-confirm-date').forEach(btn => {
      btn.addEventListener('click', async () => {
        const eventId = btn.dataset.eventId;
        const date = btn.dataset.date;
        const time = btn.dataset.time;

        if (confirm(`Утвердить дату ${date} для этого мероприятия?`)) {
          await this.storage.updateEvent(eventId, {
            status: 'confirmed',
            confirmedDate: date,
            timeStart: time || null
          }, currentUser);
          this.showToast('Мероприятие утверждено и перенесено в календарь! 🎉', 'success');
          this.renderProposalsTab();
          this.renderDashboardStats();
        }
      });
    });

    container.querySelector('#btnNewProposal')?.addEventListener('click', () => {
      this.openEventCreateModal();
    });

    container.querySelectorAll('.btn-open-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const eventId = btn.dataset.eventId;
        const found = this.storage.state.events.find(ev => ev.id === eventId);
        if (found) this.openEventDetailModal(found);
      });
    });
  }

  // --- Вкладка 3: Наш план (Утвержденные мероприятия) ---
  renderPlanTab() {
    const container = document.getElementById('planTab');
    if (!container) return;

    const events = this.storage.state.events
      .filter(e => e.status === 'confirmed' && e.confirmedDate)
      .sort((a, b) => a.confirmedDate.localeCompare(b.confirmedDate));

    const rsvps = this.storage.state.rsvps;
    const currentUser = this.storage.getCurrentUser();

    if (events.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">🎯</div>
          <h3>Утверждённых мероприятий пока нет</h3>
          <p>Когда вы проголосуете за даты и утвердите предложения, они появятся в этом едином расписании.</p>
          <button type="button" class="btn btn-primary" id="btnGoToProposals">
            Перейти к предложениям
          </button>
        </div>
      `;
      container.querySelector('#btnGoToProposals')?.addEventListener('click', () => {
        this.switchTab('proposals');
      });
      return;
    }

    // Подсчет общего бюджета на праздники
    const totalBudget = events.reduce((sum, e) => sum + (Number(e.budgetPerPerson) || 0), 0);

    const timelineHtml = events.map(evt => {
      const d = new Date(evt.confirmedDate);
      const dateFormatted = `${d.getDate()} ${CONFIG.MONTH_NAMES_GENITIVE[d.getMonth()]}`;
      const weekday = CONFIG.WEEKDAY_NAMES_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1];
      const cat = CONFIG.CATEGORIES[evt.category] || CONFIG.CATEGORIES.other;

      // Участники этого события
      const eventRsvps = rsvps.filter(r => r.eventId === evt.id);
      const goingUsers = eventRsvps.filter(r => r.status === 'going');
      const maybeUsers = eventRsvps.filter(r => r.status === 'maybe');
      const myRsvp = currentUser ? eventRsvps.find(r => r.userId === currentUser.id)?.status : null;

      const goingAvatarsHtml = goingUsers.map(u => `
        <span class="user-chip-avatar" title="${escapeHtml(u.userName)} (Идёт)">${u.userEmoji}</span>
      `).join('');

      return `
        <div class="timeline-item" data-event-id="${evt.id}">
          <div class="timeline-date-ribbon">
            <span class="ribbon-day">${d.getDate()}</span>
            <span class="ribbon-month">${CONFIG.MONTH_NAMES[d.getMonth()].slice(0, 3)}</span>
            <span class="ribbon-weekday">${weekday}</span>
          </div>

          <div class="timeline-card">
            <div class="timeline-card-header">
              <span class="badge" style="background: ${cat.bg}; color: ${cat.color};">
                ${cat.emoji} ${cat.name}
              </span>
              ${evt.timeStart ? `<span class="timeline-time">⏰ ${evt.timeStart}${evt.timeEnd ? ` – ${evt.timeEnd}` : ''}</span>` : ''}
              <button type="button" class="btn-icon btn-export-single-ics" data-event-id="${evt.id}" title="Добавить в Apple/Google Calendar (.ics)">
                📅 .ics
              </button>
            </div>

            <h3 class="timeline-title">${escapeHtml(evt.title)}</h3>
            ${evt.location ? `<div class="timeline-loc">📍 ${escapeHtml(evt.location)}</div>` : ''}
            ${evt.description ? `<p class="timeline-desc">${escapeHtml(evt.description)}</p>` : ''}

            <!-- Блок RSVP: подтверждение участия -->
            <div class="timeline-rsvp-box">
              <div class="rsvp-status-line">
                <strong>Идут: ${goingUsers.length} чел.</strong>
                <div class="rsvp-avatars-row">${goingAvatarsHtml || '<span class="text-muted">Пока никто не отметился</span>'}</div>
              </div>

              <!-- Кнопки выбора участия для меня -->
              <div class="rsvp-buttons-group">
                <button type="button" class="btn-rsvp ${myRsvp === 'going' ? 'selected' : ''}" data-event-id="${evt.id}" data-status="going">
                  ✅ Пойду
                </button>
                <button type="button" class="btn-rsvp ${myRsvp === 'maybe' ? 'selected' : ''}" data-event-id="${evt.id}" data-status="maybe">
                  🤔 Не уверен
                </button>
                <button type="button" class="btn-rsvp ${myRsvp === 'not_going' ? 'selected' : ''}" data-event-id="${evt.id}" data-status="not_going">
                  ❌ Не смогу
                </button>
              </div>
            </div>

            <div class="timeline-footer">
              <div class="timeline-meta">
                ${evt.budgetPerPerson ? `<span>💰 ~${evt.budgetPerPerson} ₽/чел</span>` : ''}
                <span>Автор: ${evt.authorEmoji} ${escapeHtml(evt.authorName)}</span>
              </div>
              <button type="button" class="btn btn-outline btn-sm btn-open-detail" data-event-id="${evt.id}">
                Обсудить (${(this.storage.state.comments.filter(c => c.eventId === evt.id)).length})
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="plan-container">
        <div class="plan-header-bar">
          <div>
            <h2>🎯 Наш утверждённый план</h2>
            <p>Здесь только согласованные мероприятия, куда мы точно идем вместе.</p>
          </div>
          <div class="plan-actions">
            <span class="plan-budget-badge">💰 Примерный бюджет: ~${totalBudget} ₽</span>
            <button type="button" class="btn btn-outline btn-sm" id="btnExportAllIcs">
              📥 Экспорт всех в .ics
            </button>
          </div>
        </div>
        <div class="plan-timeline">
          ${timelineHtml}
        </div>
      </div>
    `;

    // Кнопки RSVP
    container.querySelectorAll('.btn-rsvp').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!currentUser) {
          this.openAuthModal();
          return;
        }
        const eventId = btn.dataset.eventId;
        const status = btn.dataset.status;
        await this.storage.setRSVP(eventId, currentUser, status);
        this.renderPlanTab();
        this.showToast('Ваш статус участия обновлён!', 'success');
      });
    });

    container.querySelectorAll('.btn-open-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const eventId = btn.dataset.eventId;
        const found = this.storage.state.events.find(ev => ev.id === eventId);
        if (found) this.openEventDetailModal(found);
      });
    });

    // Экспорт отдельного события в .ics
    container.querySelectorAll('.btn-export-single-ics').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.eventId;
        const found = this.storage.state.events.find(ev => ev.id === eventId);
        if (found) this.exportEventToIcs(found);
      });
    });

    // Экспорт всех подтвержденных
    container.querySelector('#btnExportAllIcs')?.addEventListener('click', () => {
      this.exportAllConfirmedToIcs(events);
    });
  }

  // --- Вкладка 4: Участники ---
  renderMembersTab() {
    const container = document.getElementById('membersTab');
    if (!container) return;

    const users = Object.values(this.storage.state.users || {});
    const events = this.storage.state.events;
    const rsvps = this.storage.state.rsvps;
    const currentUser = this.storage.getCurrentUser();

    const membersCardsHtml = users.map(u => {
      // Подсчет активности
      const createdCount = events.filter(e => e.authorId === u.id).length;
      const attendingCount = rsvps.filter(r => r.userId === u.id && r.status === 'going').length;

      return `
        <div class="member-card">
          <div class="member-avatar-box">${u.emoji}</div>
          <div class="member-info">
            <div class="member-name-row">
              <span class="member-name">${escapeHtml(u.name)}</span>
              ${u.role === 'organizer' ? '<span class="role-badge">Организатор</span>' : ''}
              ${u.id === currentUser?.id ? '<span class="you-badge">Вы</span>' : ''}
            </div>
            <div class="member-stats">
              <span>Предложил: ${createdCount}</span>
              <span>•</span>
              <span>Идёт на: ${attendingCount}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="members-container">
        <div class="members-header-bar">
          <div>
            <h2>👥 Друзья и участники (${users.length})</h2>
            <p>Все, кто присоединился к планированию праздников.</p>
          </div>
          <button type="button" class="btn btn-primary" id="btnInviteFriend">
            🔗 Скопировать ссылку-приглашение
          </button>
        </div>
        <div class="members-grid">
          ${membersCardsHtml || '<div class="text-muted">Пока нет других участников</div>'}
        </div>
      </div>
    `;

    container.querySelector('#btnInviteFriend')?.addEventListener('click', () => {
      this.copyInviteLink();
    });
  }

  // --- Модалка создания мероприятия (Progressive Disclosure) ---
  openEventCreateModal(presetDate = null) {
    const currentUser = this.storage.getCurrentUser();
    if (!currentUser) {
      this.openAuthModal();
      return;
    }

    const defaultDate = presetDate || '2026-12-31';

    const modalHtml = `
      <div class="modal-backdrop" id="createEventModal">
        <div class="modal-card modal-card-lg">
          <div class="modal-header">
            <h3>✨ Предложить мероприятие</h3>
            <button type="button" class="btn-close" id="btnCloseCreateModal">&times;</button>
          </div>

          <form id="createEventForm">
            <!-- 1. Название (Обязательное) -->
            <div class="form-group">
              <label for="eventTitleInput">Название мероприятия <span class="required">*</span></label>
              <input type="text" id="eventTitleInput" placeholder="Например: Новогодние шашлыки или Поход на каток" required autofocus>
            </div>

            <!-- 2. Категория (Красивые чипсы с эмодзи) -->
            <div class="form-group">
              <label>Категория:</label>
              <div class="category-chips-grid">
                ${Object.values(CONFIG.CATEGORIES).map(cat => `
                  <label class="category-chip">
                    <input type="radio" name="eventCategory" value="${cat.id}" ${cat.id === 'party' ? 'checked' : ''}>
                    <span class="chip-label" style="--chip-color: ${cat.color};">
                      ${cat.emoji} ${cat.name}
                    </span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- 3. Выбор дат: одна точная или голосование -->
            <div class="form-group">
              <label>Формат даты:</label>
              <div class="date-mode-toggle">
                <button type="button" class="btn-mode active" id="btnModeSingle">Точная дата</button>
                <button type="button" class="btn-mode" id="btnModeMultiple">Несколько дат (на голосование)</button>
              </div>
            </div>

            <!-- Контейнер одиночной даты -->
            <div id="singleDateBox" class="form-group">
              <label for="singleDateInput">Дата проведения:</label>
              <input type="date" id="singleDateInput" value="${defaultDate}">
            </div>

            <!-- Контейнер множественных дат для голосования -->
            <div id="multipleDatesBox" class="form-group" style="display: none;">
              <label>Варианты дат для голосования друзей:</label>
              <div id="dateOptionsList" class="date-options-inputs-list">
                <div class="date-option-input-row">
                  <input type="date" class="date-opt-val" value="${defaultDate}">
                  <input type="time" class="date-opt-time" placeholder="Время">
                  <button type="button" class="btn-remove-opt">&times;</button>
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-outline" id="btnAddDateOptRow">+ Добавить ещё дату</button>
            </div>

            <!-- 4. Progressive Disclosure: Дополнительные детали -->
            <div class="disclosure-section">
              <button type="button" class="btn-toggle-disclosure" id="btnToggleDisclosure">
                <span>➕ Указать время, место, бюджет и описание</span>
              </button>

              <div id="disclosureContent" class="disclosure-content" style="display: none;">
                <div class="form-row-2">
                  <div class="form-group">
                    <label for="eventTimeStart">Время начала:</label>
                    <input type="time" id="eventTimeStart" value="18:00">
                  </div>
                  <div class="form-group">
                    <label for="eventTimeEnd">Время окончания:</label>
                    <input type="time" id="eventTimeEnd">
                  </div>
                </div>

                <div class="form-group">
                  <label for="eventLocation">Место проведения:</label>
                  <input type="text" id="eventLocation" placeholder="Локация, адрес или ресторан">
                </div>

                <div class="form-group">
                  <label for="eventBudget">Примерный бюджет (руб/чел):</label>
                  <input type="number" id="eventBudget" placeholder="0" min="0" step="100">
                </div>

                <div class="form-group">
                  <label for="eventDescription">Описание и детали:</label>
                  <textarea id="eventDescription" rows="2" placeholder="Что взять с собой, дресс-код, меню..."></textarea>
                </div>
              </div>
            </div>

            <!-- Кнопки -->
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" id="btnCancelCreate">Отмена</button>
              <button type="submit" class="btn btn-primary">Создать мероприятие 🎉</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.modalsContainerEl.innerHTML = modalHtml;

    const modal = document.getElementById('createEventModal');
    const closeBtn = document.getElementById('btnCloseCreateModal');
    const cancelBtn = document.getElementById('btnCancelCreate');
    const form = document.getElementById('createEventForm');

    const closeModal = () => {
      modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Переключение режима дат
    const btnModeSingle = document.getElementById('btnModeSingle');
    const btnModeMultiple = document.getElementById('btnModeMultiple');
    const singleBox = document.getElementById('singleDateBox');
    const multiBox = document.getElementById('multipleDatesBox');
    let isMulti = false;

    btnModeSingle.addEventListener('click', () => {
      isMulti = false;
      btnModeSingle.classList.add('active');
      btnModeMultiple.classList.remove('active');
      singleBox.style.display = 'block';
      multiBox.style.display = 'none';
    });

    btnModeMultiple.addEventListener('click', () => {
      isMulti = true;
      btnModeMultiple.classList.add('active');
      btnModeSingle.classList.remove('active');
      singleBox.style.display = 'none';
      multiBox.style.display = 'block';
    });

    // Добавление строки даты
    const dateOptionsList = document.getElementById('dateOptionsList');
    document.getElementById('btnAddDateOptRow').addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'date-option-input-row';
      row.innerHTML = `
        <input type="date" class="date-opt-val" value="${defaultDate}">
        <input type="time" class="date-opt-time" placeholder="Время">
        <button type="button" class="btn-remove-opt">&times;</button>
      `;
      row.querySelector('.btn-remove-opt').addEventListener('click', () => row.remove());
      dateOptionsList.appendChild(row);
    });

    // Progressive disclosure
    const btnToggleDisclosure = document.getElementById('btnToggleDisclosure');
    const disclosureContent = document.getElementById('disclosureContent');
    btnToggleDisclosure.addEventListener('click', () => {
      const isVisible = disclosureContent.style.display !== 'none';
      disclosureContent.style.display = isVisible ? 'none' : 'block';
      btnToggleDisclosure.querySelector('span').textContent = isVisible 
        ? '➕ Указать время, место, бюджет и описание' 
        : '➖ Свернуть дополнительные поля';
    });

    // Отправка формы
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('eventTitleInput').value.trim();
      const category = form.querySelector('input[name="eventCategory"]:checked')?.value || 'party';
      const timeStart = document.getElementById('eventTimeStart')?.value || null;
      const timeEnd = document.getElementById('eventTimeEnd')?.value || null;
      const location = document.getElementById('eventLocation')?.value || null;
      const budget = document.getElementById('eventBudget')?.value || 0;
      const description = document.getElementById('eventDescription')?.value || null;

      let confirmedDate = null;
      let dateOptions = [];

      if (!isMulti) {
        confirmedDate = document.getElementById('singleDateInput').value;
        dateOptions = [{ date: confirmedDate, timeStart }];
      } else {
        const rows = dateOptionsList.querySelectorAll('.date-option-input-row');
        rows.forEach(r => {
          const dVal = r.querySelector('.date-opt-val').value;
          const tVal = r.querySelector('.date-opt-time').value;
          if (dVal) {
            dateOptions.push({ date: dVal, timeStart: tVal || timeStart });
          }
        });
      }

      const eventData = {
        title,
        category,
        confirmedDate,
        dateOptions,
        timeStart,
        timeEnd,
        location,
        budgetPerPerson: budget,
        description
      };

      await this.storage.addEvent(eventData, currentUser);
      this.showToast('Мероприятие успешно создано!', 'success');
      closeModal();

      if (this.onEventCreate) this.onEventCreate();
    });
  }

  // --- Модальное окно просмотра и обсуждения мероприятия ---
  openEventDetailModal(evt) {
    this.selectedEventForDetail = evt;
    const currentUser = this.storage.getCurrentUser();
    const isOrganizer = currentUser && currentUser.role === 'organizer';
    const isAuthor = currentUser && evt.authorId === currentUser.id;
    const cat = CONFIG.CATEGORIES[evt.category] || CONFIG.CATEGORIES.other;
    const statusCfg = CONFIG.STATUSES[evt.status] || CONFIG.STATUSES.proposed;

    const comments = this.storage.state.comments.filter(c => c.eventId === evt.id);

    const modalHtml = `
      <div class="modal-backdrop" id="eventDetailModal">
        <div class="modal-card modal-card-lg">
          <div class="modal-header">
            <div class="detail-header-badges">
              <span class="badge" style="background: ${cat.bg}; color: ${cat.color};">${cat.emoji} ${cat.name}</span>
              <span class="badge ${statusCfg.badgeClass}">${statusCfg.emoji} ${statusCfg.label}</span>
            </div>
            <button type="button" class="btn-close" id="btnCloseDetailModal">&times;</button>
          </div>

          <div class="modal-body detail-modal-body">
            <h2 class="detail-title">${escapeHtml(evt.title)}</h2>

            <!-- Информация о дате и времени -->
            <div class="detail-meta-grid">
              <div class="meta-item">
                <span class="meta-label">📅 Дата:</span>
                <span class="meta-val">${evt.confirmedDate ? `${evt.confirmedDate} (${CONFIG.STATUSES[evt.status].label})` : 'Идёт голосование по датам'}</span>
              </div>
              ${evt.timeStart ? `
                <div class="meta-item">
                  <span class="meta-label">⏰ Время:</span>
                  <span class="meta-val">${evt.timeStart}${evt.timeEnd ? ` – ${evt.timeEnd}` : ''}</span>
                </div>
              ` : ''}
              ${evt.location ? `
                <div class="meta-item">
                  <span class="meta-label">📍 Место:</span>
                  <span class="meta-val">${escapeHtml(evt.location)}</span>
                </div>
              ` : ''}
              ${evt.budgetPerPerson ? `
                <div class="meta-item">
                  <span class="meta-label">💰 Бюджет:</span>
                  <span class="meta-val">~${evt.budgetPerPerson} ₽ на человека</span>
                </div>
              ` : ''}
              <div class="meta-item">
                <span class="meta-label">👤 Предложил:</span>
                <span class="meta-val">${evt.authorEmoji} ${escapeHtml(evt.authorName)}</span>
              </div>
            </div>

            ${evt.description ? `
              <div class="detail-description-box">
                <h4>Описание:</h4>
                <p>${escapeHtml(evt.description)}</p>
              </div>
            ` : ''}

            <!-- Блок комментариев / обсуждения -->
            <div class="detail-comments-section">
              <h4>💬 Обсуждение и договорённости (${comments.length})</h4>
              <div class="comments-list" id="detailCommentsList">
                ${comments.map(c => `
                  <div class="comment-item">
                    <span class="comment-avatar">${c.userEmoji}</span>
                    <div class="comment-content">
                      <div class="comment-head">
                        <strong>${escapeHtml(c.userName)}</strong>
                        <span class="comment-time">${new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p>${escapeHtml(c.content)}</p>
                    </div>
                  </div>
                `).join('') || '<div class="text-muted">Пока никто ничего не написал. Задайте вопрос или предложите идею!</div>'}
              </div>

              <!-- Форма добавления комментария -->
              <form id="commentForm" class="comment-input-row">
                <input type="text" id="commentTextInput" placeholder="Написать комментарий..." required autocomplete="off">
                <button type="submit" class="btn btn-primary btn-sm">Отправить</button>
              </form>
            </div>

            <!-- Действия -->
            <div class="modal-actions detail-actions-bar">
              ${evt.confirmedDate ? `
                <button type="button" class="btn btn-outline btn-sm" id="btnExportModalIcs">
                  📅 В календарь (.ics)
                </button>
              ` : ''}
              <button type="button" class="btn btn-outline btn-sm" id="btnShareEventLink">
                🔗 Поделиться
              </button>

              <div class="actions-right">
                ${(isOrganizer || isAuthor) ? `
                  <button type="button" class="btn btn-danger btn-sm" id="btnDeleteEventModal">
                    Удалить
                  </button>
                ` : ''}
                <button type="button" class="btn btn-outline btn-sm" id="btnCloseDetailFooter">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.modalsContainerEl.innerHTML = modalHtml;

    const modal = document.getElementById('eventDetailModal');
    const close = () => modal.remove();

    document.getElementById('btnCloseDetailModal').addEventListener('click', close);
    document.getElementById('btnCloseDetailFooter').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    // Добавление комментария
    document.getElementById('commentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) {
        this.openAuthModal();
        return;
      }
      const txt = document.getElementById('commentTextInput').value;
      if (txt.trim()) {
        await this.storage.addComment(evt.id, currentUser, txt);
        this.openEventDetailModal(evt); // перерисовываем
      }
    });

    // Поделиться ссылкой
    document.getElementById('btnShareEventLink')?.addEventListener('click', () => {
      this.copyInviteLink(evt.id);
    });

    // Экспорт в iCal
    document.getElementById('btnExportModalIcs')?.addEventListener('click', () => {
      this.exportEventToIcs(evt);
    });

    // Удаление
    document.getElementById('btnDeleteEventModal')?.addEventListener('click', async () => {
      if (confirm(`Вы уверены, что хотите удалить «${evt.title}»?`)) {
        await this.storage.deleteEvent(evt.id, currentUser);
        this.showToast('Мероприятие удалено', 'info');
        close();
        if (this.onEventDelete) this.onEventDelete();
      }
    });
  }

  // --- Модалка авторизации / Профиля ---
  openAuthModal(isFirstTime = false) {
    const currentUser = this.storage.getCurrentUser();

    const modalHtml = `
      <div class="modal-backdrop" id="authModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>${isFirstTime ? '🎄 Добро пожаловать в «Новогодний движ 2027»!' : 'Настройка профиля'}</h3>
            ${!isFirstTime ? '<button type="button" class="btn-close" id="btnCloseAuth">&times;</button>' : ''}
          </div>

          <form id="authFormModal">
            <p class="auth-intro">Выберите своё имя и праздничный аватар, чтобы друзья видели ваши предложения и голоса.</p>

            <div class="form-group">
              <label for="authNameInput">Ваше имя:</label>
              <input type="text" id="authNameInput" value="${currentUser ? escapeHtml(currentUser.name) : ''}" placeholder="Например: Илья, Аня, Макс..." required autofocus>
            </div>

            <div class="form-group">
              <label>Ваш аватар-смайлик:</label>
              <div class="emoji-picker-grid" id="modalEmojiPicker">
                ${CONFIG.AVATARS.map(em => `
                  <button type="button" class="emoji-btn ${(currentUser?.emoji === em || (!currentUser && em === '🚀')) ? 'active' : ''}" data-emoji="${em}">
                    ${em}
                  </button>
                `).join('')}
              </div>
              <input type="hidden" id="selectedEmojiVal" value="${currentUser?.emoji || '🚀'}">
            </div>

            <div class="modal-actions">
              <button type="submit" class="btn btn-primary" style="width: 100%;">
                ${isFirstTime ? 'Войти в планировщик 🚀' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.modalsContainerEl.innerHTML = modalHtml;

    const modal = document.getElementById('authModal');
    const form = document.getElementById('authFormModal');
    const emojiHidden = document.getElementById('selectedEmojiVal');

    modal.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        emojiHidden.value = btn.dataset.emoji;
      });
    });

    document.getElementById('btnCloseAuth')?.addEventListener('click', () => modal.remove());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('authNameInput').value.trim();
      const emoji = emojiHidden.value;

      if (!name) return;

      let user = currentUser;
      if (!user) {
        // Создаем нового пользователя с постоянным UUID
        user = {
          id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
          name: name,
          emoji: emoji,
          role: Object.keys(this.storage.state.users || {}).length === 0 ? 'organizer' : 'member',
          createdAt: new Date().toISOString()
        };
      } else {
        user.name = name;
        user.emoji = emoji;
      }

      this.storage.saveCurrentUser(user);
      this.updateHeaderUserBadge();
      this.showToast(`Добро пожаловать, ${user.name}! ${user.emoji}`, 'success');
      modal.remove();

      this.renderDashboardStats();
    });
  }

  // --- Модалка настроек группы (Организатор) ---
  openGroupSettingsModal() {
    const currentUser = this.storage.getCurrentUser();
    const group = this.storage.state.group;
    const isOrganizer = currentUser && currentUser.role === 'organizer';

    const modalHtml = `
      <div class="modal-backdrop" id="groupSettingsModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>⚙️ Настройки группы</h3>
            <button type="button" class="btn-close" id="btnCloseSettings">&times;</button>
          </div>

          <form id="groupSettingsForm">
            <div class="form-group">
              <label for="groupNameInput">Название группы / встречи:</label>
              <input type="text" id="groupNameInput" value="${escapeHtml(group.name)}" required ${!isOrganizer ? 'disabled' : ''}>
            </div>

            <div class="form-group">
              <label for="groupSubtitleInput">Подзаголовок:</label>
              <input type="text" id="groupSubtitleInput" value="${escapeHtml(group.subtitle || '')}" ${!isOrganizer ? 'disabled' : ''}>
            </div>

            <div class="form-group">
              <label for="groupTimezone">Часовой пояс:</label>
              <select id="groupTimezone" ${!isOrganizer ? 'disabled' : ''}>
                <option value="Europe/Moscow" selected>Москва (UTC+3)</option>
                <option value="Europe/Kaliningrad">Калининград (UTC+2)</option>
                <option value="Europe/Samara">Самара (UTC+4)</option>
                <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
                <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
              </select>
            </div>

            <!-- Интеграция Supabase -->
            <div class="disclosure-section">
              <h4>База данных и облако:</h4>
              <p class="text-sm text-muted">По умолчанию используется распределённый Cloud KV. При желании можно подключить собственный Supabase:</p>
              <div class="form-group">
                <input type="text" id="supabaseUrlInput" placeholder="Supabase Project URL">
                <input type="text" id="supabaseKeyInput" placeholder="Supabase Anon Key" style="margin-top: 6px;">
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" id="btnCancelSettings">Отмена</button>
              ${isOrganizer ? '<button type="submit" class="btn btn-primary">Сохранить настройки</button>' : ''}
            </div>
          </form>
        </div>
      </div>
    `;

    this.modalsContainerEl.innerHTML = modalHtml;
    const modal = document.getElementById('groupSettingsModal');
    const close = () => modal.remove();

    document.getElementById('btnCloseSettings').addEventListener('click', close);
    document.getElementById('btnCancelSettings').addEventListener('click', close);

    document.getElementById('groupSettingsForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('groupNameInput').value;
      const subtitle = document.getElementById('groupSubtitleInput').value;
      const tz = document.getElementById('groupTimezone').value;

      await this.storage.updateGroupSettings({ name, subtitle, timezone: tz }, currentUser);

      // Проверяем Supabase поля
      const sUrl = document.getElementById('supabaseUrlInput').value.trim();
      const sKey = document.getElementById('supabaseKeyInput').value.trim();
      if (sUrl && sKey) {
        await this.storage.configureSupabase(sUrl, sKey);
      }

      this.updateHeaderGroupInfo();
      this.showToast('Настройки группы успешно обновлены!', 'success');
      close();
    });
  }

  // --- Обновление плашки пользователя в шапке ---
  updateHeaderUserBadge() {
    const user = this.storage.getCurrentUser();
    const btn = document.getElementById('userProfileBtn');
    if (!btn) return;

    if (user && user.name) {
      btn.innerHTML = `
        <span class="user-emoji">${user.emoji || '🚀'}</span>
        <span class="user-name">${escapeHtml(user.name)}</span>
        ${user.role === 'organizer' ? '<span class="header-role-dot" title="Организатор">👑</span>' : ''}
      `;
    } else {
      btn.innerHTML = `
        <span class="user-emoji">👤</span>
        <span class="user-name">Войти</span>
      `;
    }
  }

  updateHeaderGroupInfo() {
    const group = this.storage.state.group;
    const titleEl = document.getElementById('appGroupTitle');
    const subtitleEl = document.getElementById('appGroupSubtitle');
    if (titleEl) titleEl.textContent = group.name || CONFIG.APP_NAME;
    if (subtitleEl) subtitleEl.textContent = group.subtitle || CONFIG.APP_SUBTITLE;
  }

  // --- Скопировать ссылку-приглашение ---
  copyInviteLink(eventId = null) {
    let url = window.location.origin + window.location.pathname;
    if (eventId) {
      url += `?event=${eventId}`;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('Ссылка скопирована в буфер обмена! Отправьте её друзьям 📋', 'success');
      });
    } else {
      prompt('Скопируйте ссылку для друзей:', url);
    }
  }

  // --- Экспорт iCalendar (.ics) ---
  formatIcsDate(dateISO, timeStr) {
    if (!dateISO) return '';
    const cleanDate = dateISO.replace(/-/g, '');
    if (timeStr) {
      const cleanTime = timeStr.replace(/:/g, '') + '00';
      return `${cleanDate}T${cleanTime}`;
    }
    return cleanDate;
  }

  exportEventToIcs(evt) {
    const dtStart = this.formatIcsDate(evt.confirmedDate, evt.timeStart);
    const dtEnd = this.formatIcsDate(evt.confirmedDate, evt.timeEnd || evt.timeStart);
    const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Novogodniy Dvizh 2027//RU',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${evt.id}@ny2027.app`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${evt.title.replace(/\n/g, ' ')}`,
      evt.description ? `DESCRIPTION:${evt.description.replace(/\n/g, '\\n')}` : '',
      evt.location ? `LOCATION:${evt.location.replace(/\n/g, ' ')}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean);

    this.downloadFile(lines.join('\r\n'), `${evt.title.slice(0, 20)}.ics`, 'text/calendar;charset=utf-8');
    this.showToast('Мероприятие экспортировано в .ics формат! 📅', 'success');
  }

  exportAllConfirmedToIcs(events) {
    const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Novogodniy Dvizh 2027//RU',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    events.forEach(evt => {
      const dtStart = this.formatIcsDate(evt.confirmedDate, evt.timeStart);
      const dtEnd = this.formatIcsDate(evt.confirmedDate, evt.timeEnd || evt.timeStart);

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${evt.id}@ny2027.app`);
      lines.push(`DTSTAMP:${nowStr}`);
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`DTEND:${dtEnd}`);
      lines.push(`SUMMARY:${evt.title.replace(/\n/g, ' ')}`);
      if (evt.description) lines.push(`DESCRIPTION:${evt.description.replace(/\n/g, '\\n')}`);
      if (evt.location) lines.push(`LOCATION:${evt.location.replace(/\n/g, ' ')}`);
      lines.push('STATUS:CONFIRMED');
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    this.downloadFile(lines.join('\r\n'), 'novogodniy-plan-2027.ics', 'text/calendar;charset=utf-8');
    this.showToast('Все подтверждённые мероприятия экспортированы! 📅', 'success');
  }

  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Всплывающие уведомления (Toasts) ---
  showToast(message, type = 'info') {
    if (!this.toastContainerEl) return;
    const toast = document.createElement('div');
    toast.className = `app-toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    this.toastContainerEl.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
}
