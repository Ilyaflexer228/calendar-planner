/**
 * Простой интерактивный календарь с общим доступом и сохранением событий
 */

// Облачное хранилище (общий доступ для всех пользователей)
const CLOUD_STORAGE_URL = 'https://kvdb.io/R4sWpSfetVkvDaeMNdAVWi/events';
const LOCAL_STORAGE_KEY = 'simple_calendar_events';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

class SimpleCalendar {
  constructor() {
    this.currentDate = new Date(); // Текущий отображаемый месяц
    this.events = [];
    this.isSaving = false;

    this.initElements();
    this.bindEvents();
    this.loadEvents();
    this.render();

    // Автоматическая проверка обновлений каждые 6 секунд (для совместной работы)
    setInterval(() => this.fetchCloudEvents(false), 6000);
  }

  initElements() {
    this.currentMonthYearEl = document.getElementById('currentMonthYear');
    this.daysGridEl = document.getElementById('daysGrid');
    this.btnPrev = document.getElementById('btnPrev');
    this.btnNext = document.getElementById('btnNext');
    this.btnToday = document.getElementById('btnToday');
    this.btnAddEvent = document.getElementById('btnAddEvent');
    this.syncStatus = document.getElementById('syncStatus');

    // Modal
    this.eventModal = document.getElementById('eventModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.eventForm = document.getElementById('eventForm');
    this.eventIdInput = document.getElementById('eventId');
    this.eventDateInput = document.getElementById('eventDate');
    this.eventTimeInput = document.getElementById('eventTime');
    this.eventTitleInput = document.getElementById('eventTitle');
    this.btnDeleteEvent = document.getElementById('btnDeleteEvent');
    this.btnCloseModal = document.getElementById('btnCloseModal');
    this.btnCancelModal = document.getElementById('btnCancelModal');
    this.toastEl = document.getElementById('toast');
  }

  bindEvents() {
    // Навигация
    this.btnPrev.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });
    this.btnNext.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });
    this.btnToday.addEventListener('click', () => {
      this.currentDate = new Date();
      this.render();
    });

    // Кнопка добавления в шапке
    this.btnAddEvent.addEventListener('click', () => {
      this.openAddModal(this.formatDateISO(new Date()));
    });

    // Модальное окно
    this.btnCloseModal.addEventListener('click', () => this.closeModal());
    this.btnCancelModal.addEventListener('click', () => this.closeModal());
    this.eventModal.addEventListener('click', (e) => {
      if (e.target === this.eventModal) this.closeModal();
    });

    // Отправка формы (сохранение / редактирование)
    this.eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Удаление события
    this.btnDeleteEvent.addEventListener('click', () => {
      const id = this.eventIdInput.value;
      if (id) {
        this.deleteEvent(id);
        this.closeModal();
      }
    });

    // Закрытие по Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  // --- Хранение и синхронизация ---

  loadEvents() {
    // 1. Сначала мгновенно загружаем из локального хранилища браузера
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        this.events = JSON.parse(local);
        this.render();
      }
    } catch (e) {
      console.warn('Не удалось прочитать локальные события', e);
    }

    // 2. Затем подтягиваем актуальные данные из облачной базы общего доступа
    this.fetchCloudEvents(true);
  }

  async fetchCloudEvents(isInitial = false) {
    if (this.isSaving) return;

    try {
      this.setSyncStatus('syncing', 'Обновление...');
      const response = await fetch(CLOUD_STORAGE_URL, { cache: 'no-store' });
      
      if (response.ok) {
        const cloudData = await response.json();
        if (Array.isArray(cloudData)) {
          const cloudStr = JSON.stringify(cloudData);
          const currentStr = JSON.stringify(this.events);
          
          if (cloudStr !== currentStr) {
            this.events = cloudData;
            localStorage.setItem(LOCAL_STORAGE_KEY, cloudStr);
            this.render();
          }
          this.setSyncStatus('online', '🟢 Общий доступ (онлайн)');
          return;
        }
      }
      this.setSyncStatus('online', '🟢 Общий доступ (онлайн)');
    } catch (err) {
      if (isInitial && this.events.length === 0) {
        // Если база пуста или офлайн, добавим стартовые демо-события
        this.events = this.getDefaultEvents();
        this.render();
      }
      this.setSyncStatus('offline', 'Автономный режим');
    }
  }

  async saveEventsToStorage() {
    this.isSaving = true;
    const jsonStr = JSON.stringify(this.events);
    
    // Сохраняем в localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, jsonStr);
    } catch (e) {
      console.error(e);
    }

    // Сохраняем в облако kvdb.io
    try {
      this.setSyncStatus('syncing', 'Сохранение в облако...');
      await fetch(CLOUD_STORAGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonStr
      });
      this.setSyncStatus('online', '🟢 Общий доступ (онлайн)');
    } catch (err) {
      console.warn('Ошибка сохранения в облако, сохранено локально', err);
      this.setSyncStatus('offline', 'Сохранено локально');
    } finally {
      this.isSaving = false;
    }
  }

  setSyncStatus(state, text) {
    this.syncStatus.className = 'sync-badge ' + (state === 'syncing' ? 'syncing' : state === 'offline' ? 'offline' : '');
    this.syncStatus.querySelector('.sync-text').textContent = text;
  }

  getDefaultEvents() {
    const today = new Date();
    const dStr = this.formatDateISO(today);
    return [
      { id: 'evt_1', date: dStr, time: '12:00', title: 'Планирование задач' },
      { id: 'evt_2', date: dStr, time: '16:30', title: 'Встреча команды' }
    ];
  }

  // --- Отрисовка календаря ---

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Заголовок месяца
    this.currentMonthYearEl.textContent = `${MONTH_NAMES[month]} ${year}`;

    this.daysGridEl.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay(); // 0 - Вс, 1 - Пн...
    startDayOfWeek = (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1); // Делаем Понедельник = 0

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const todayISO = this.formatDateISO(today);

    // Сетка из 42 ячеек (6 строк по 7 дней)
    for (let i = 0; i < 42; i++) {
      let cellDate;
      let isOtherMonth = false;

      if (i < startDayOfWeek) {
        // Дни предыдущего месяца
        const dayNum = daysInPrevMonth - (startDayOfWeek - 1 - i);
        cellDate = new Date(year, month - 1, dayNum);
        isOtherMonth = true;
      } else if (i < startDayOfWeek + daysInMonth) {
        // Дни текущего месяца
        const dayNum = i - startDayOfWeek + 1;
        cellDate = new Date(year, month, dayNum);
      } else {
        // Дни следующего месяца
        const dayNum = i - (startDayOfWeek + daysInMonth) + 1;
        cellDate = new Date(year, month + 1, dayNum);
        isOtherMonth = true;
      }

      const dateISO = this.formatDateISO(cellDate);
      const isToday = (dateISO === todayISO);

      const cell = document.createElement('div');
      cell.className = `day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;

      // Верхняя строчка дня с номером и подсказкой "+"
      cell.innerHTML = `
        <div class="day-number-row">
          <span class="day-number">${cellDate.getDate()}</span>
          <span class="day-add-hint">+</span>
        </div>
        <div class="events-container"></div>
      `;

      // Находим события на этот день
      const dayEvents = this.events.filter(e => e.date === dateISO);
      // Сортируем по времени
      dayEvents.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

      const container = cell.querySelector('.events-container');
      dayEvents.forEach(evt => {
        const item = document.createElement('div');
        item.className = 'event-item';
        item.innerHTML = `
          <span class="event-time">${this.escapeHtml(evt.time || '')}</span>
          <span class="event-title">${this.escapeHtml(evt.title)}</span>
        `;
        // Клик по событию -> Редактирование
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openEditModal(evt);
        });
        container.appendChild(item);
      });

      // Клик по свободной ячейке дня -> Добавление события на этот день
      cell.addEventListener('click', () => {
        this.openAddModal(dateISO);
      });

      this.daysGridEl.appendChild(cell);
    }
  }

  // --- Модальное окно создания и редактирования ---

  openAddModal(presetDate) {
    this.eventForm.reset();
    this.eventIdInput.value = '';
    this.modalTitle.textContent = 'Новое событие';
    this.btnDeleteEvent.classList.add('hidden');

    this.eventDateInput.value = presetDate || this.formatDateISO(new Date());

    // Время по умолчанию: текущий час + 00 минут
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    this.eventTimeInput.value = `${hh}:00`;

    this.eventModal.classList.remove('hidden');
    this.eventTitleInput.focus();
  }

  openEditModal(evt) {
    this.eventIdInput.value = evt.id;
    this.modalTitle.textContent = 'Редактировать событие';
    this.btnDeleteEvent.classList.remove('hidden');

    this.eventDateInput.value = evt.date;
    this.eventTimeInput.value = evt.time || '12:00';
    this.eventTitleInput.value = evt.title;

    this.eventModal.classList.remove('hidden');
    this.eventTitleInput.focus();
  }

  closeModal() {
    this.eventModal.classList.add('hidden');
  }

  handleFormSubmit() {
    const title = this.eventTitleInput.value.trim();
    const date = this.eventDateInput.value;
    const time = this.eventTimeInput.value;
    const id = this.eventIdInput.value;

    if (!title || !date || !time) return;

    if (id) {
      // Редактирование существующего события
      const index = this.events.findIndex(e => e.id === id);
      if (index !== -1) {
        this.events[index] = { id, date, time, title };
        this.showToast('Событие изменено');
      }
    } else {
      // Добавление нового события
      const newEvent = {
        id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        date,
        time,
        title
      };
      this.events.push(newEvent);
      this.showToast('Событие добавлено в календарь');
    }

    this.closeModal();
    this.render();
    this.saveEventsToStorage();
  }

  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id);
    this.render();
    this.saveEventsToStorage();
    this.showToast('Событие удалено');
  }

  // --- Вспомогательные методы ---

  formatDateISO(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  showToast(msg) {
    this.toastEl.textContent = msg;
    this.toastEl.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.add('hidden');
    }, 2500);
  }
}

// Запуск приложения
window.addEventListener('DOMContentLoaded', () => {
  window.calendarApp = new SimpleCalendar();
});
