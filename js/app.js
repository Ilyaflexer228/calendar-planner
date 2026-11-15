/**
 * Главный координатор приложения «Новогодний движ 2027»
 */

import { CONFIG } from './config.js';
import { StorageEngine } from './storage.js';
import { CalendarView } from './calendar.js';
import { UIManager } from './ui.js';
import { SnowfallEffect } from './particles.js';

class App {
  constructor() {
    this.storage = new StorageEngine();
    this.calendar = null;
    this.ui = null;
    this.snowfall = null;

    this.init();
  }

  async init() {
    // 1. Инициализация темы
    this.initTheme();

    // 2. Инициализация UI менеджера
    this.ui = new UIManager(
      this.storage,
      () => this.onDataUpdated(), // onEventCreate
      () => this.onDataUpdated(), // onEventUpdate
      () => this.onDataUpdated()  // onEventDelete
    );

    // 3. Инициализация календаря
    const calendarContainer = document.getElementById('calendarMount');
    if (calendarContainer) {
      this.calendar = new CalendarView(
        calendarContainer,
        (dateISO, shouldOpenCreate = false) => {
          if (shouldOpenCreate) {
            this.ui.openEventCreateModal(dateISO);
          }
        },
        (event) => {
          this.ui.openEventDetailModal(event);
        }
      );
    }

    // 4. Праздничный ненавязчивый снег
    this.snowfall = new SnowfallEffect('snowCanvas');

    // 5. Привязка глобальных слушателей
    this.bindGlobalEvents();

    // 6. Запуск хранилища и синхронизации
    await this.storage.init();

    // 7. Подписка на обновление данных из облака
    this.storage.onSync((state) => {
      this.onDataUpdated();
    });

    // 8. Подписка на статус сети
    this.storage.onStatusChange((status) => {
      this.updateSyncBadge(status);
    });

    // 9. Первичная отрисовка
    this.onDataUpdated();

    // 10. Проверка URL параметров (прямой переход к мероприятию по ссылке друга ?event=xxx)
    this.handleUrlParams();

    // 11. Проверка авторизации пользователя при первом входе
    if (!this.storage.getCurrentUser()) {
      setTimeout(() => this.ui.openAuthModal(true), 400);
    }
  }

  initTheme() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
    if (saved === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }

  toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-theme');
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, isLight ? 'light' : 'dark');
    const themeBtn = document.getElementById('btnThemeToggle');
    if (themeBtn) {
      themeBtn.innerHTML = isLight ? '☀️' : '🌙';
    }
  }

  updateSyncBadge(status) {
    const badge = document.getElementById('syncStatusBadge');
    if (!badge) return;

    badge.className = 'sync-badge';
    const textEl = badge.querySelector('.sync-text');

    if (status === 'synced') {
      badge.classList.remove('syncing', 'offline');
      if (textEl) textEl.textContent = '🟢 Онлайн';
    } else if (status === 'syncing') {
      badge.classList.add('syncing');
      if (textEl) textEl.textContent = '🔄 Сохранение...';
    } else {
      badge.classList.add('offline');
      if (textEl) textEl.textContent = '💾 Локальный кэш';
    }
  }

  bindGlobalEvents() {
    // Переключение темы
    document.getElementById('btnThemeToggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Клик по профилю пользователя
    document.getElementById('userProfileBtn')?.addEventListener('click', () => {
      this.ui.openAuthModal(false);
    });

    // Клик по настройкам группы
    document.getElementById('btnGroupSettings')?.addEventListener('click', () => {
      this.ui.openGroupSettingsModal();
    });

    // Кнопка приглашения друга
    document.getElementById('btnCopyInviteTop')?.addEventListener('click', () => {
      this.ui.copyInviteLink();
    });

    // Кнопка "+ Предложить движ" в табах
    document.getElementById('btnNewEventGlobal')?.addEventListener('click', () => {
      this.ui.openEventCreateModal();
    });

    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.ui.switchTab(btn.dataset.tab);
      });
    });

    // Клавиатурные сокращения
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Закрываем активные модалки
        const activeModal = document.querySelector('.modal-backdrop');
        if (activeModal) activeModal.remove();
      }
    });
  }

  onDataUpdated() {
    this.ui.updateHeaderGroupInfo();
    this.ui.updateHeaderUserBadge();
    this.ui.renderDashboardStats();

    if (this.calendar) {
      this.calendar.setEvents(this.storage.state.events, this.storage.state.votes);
    }

    if (this.ui.activeTab === 'proposals') this.ui.renderProposalsTab();
    if (this.ui.activeTab === 'plan') this.ui.renderPlanTab();
    if (this.ui.activeTab === 'members') this.ui.renderMembersTab();
  }

  handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    if (eventId) {
      const found = this.storage.state.events.find(e => e.id === eventId);
      if (found) {
        setTimeout(() => this.ui.openEventDetailModal(found), 500);
      }
    }
  }
}

// Запуск при загрузке документа
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
