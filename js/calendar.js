/**
 * Модуль Календаря для «Новогодний движ 2027»
 * Поддерживает:
 * - Отображение месяца, переход между декабрём 2026 и январём 2027
 * - Быстрый прыжок к Новому Году 2027 и Сегодня
 * - Различие подтвержденных событий и голосований
 * - Подсветку 31 декабря и 1 января
 * - Детектор конфликтов расписания (пересечения по времени)
 * - Адаптивный мобильный режим с точками-индикаторами и карточками под сеткой
 */

import { CONFIG } from './config.js';
import { escapeHtml } from './models.js';

export class CalendarView {
  constructor(containerEl, onSelectDate, onSelectEvent) {
    this.container = containerEl;
    this.onSelectDate = onSelectDate;
    this.onSelectEvent = onSelectEvent;
    this.currentDate = new Date('2026-12-25'); // По умолчанию открываем предновогоднюю неделю!
    this.selectedDateISO = '2026-12-31';
    this.events = [];
    this.votes = [];
  }

  setEvents(events, votes = []) {
    this.events = events || [];
    this.votes = votes || [];
    this.render();
  }

  setDate(date) {
    this.currentDate = new Date(date);
    this.render();
  }

  jumpToToday() {
    this.currentDate = new Date();
    this.selectedDateISO = this.formatDateISO(this.currentDate);
    this.render();
  }

  jumpToNewYear() {
    this.currentDate = new Date('2026-12-31');
    this.selectedDateISO = '2026-12-31';
    this.render();
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  }

  formatDateISO(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Проверка конфликтов по времени для подтвержденных событий
  findConflictsForDate(dateISO) {
    const confirmedEvents = this.events.filter(e => e.status === 'confirmed' && e.confirmedDate === dateISO);
    const conflicts = new Set();

    for (let i = 0; i < confirmedEvents.length; i++) {
      for (let j = i + 1; j < confirmedEvents.length; j++) {
        const e1 = confirmedEvents[i];
        const e2 = confirmedEvents[j];

        if (e1.timeStart && e2.timeStart) {
          const t1Start = this.timeToMinutes(e1.timeStart);
          const t1End = e1.timeEnd ? this.timeToMinutes(e1.timeEnd) : t1Start + 120;
          const t2Start = this.timeToMinutes(e2.timeStart);
          const t2End = e2.timeEnd ? this.timeToMinutes(e2.timeEnd) : t2Start + 120;

          // Проверка пересечения отрезков [t1Start, t1End] и [t2Start, t2End]
          if (t1Start < t2End && t2Start < t1End) {
            conflicts.add(e1.id);
            conflicts.add(e2.id);
          }
        }
      }
    }
    return conflicts;
  }

  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  // Главная отрисовка
  render() {
    if (!this.container) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const todayISO = this.formatDateISO(new Date());

    // Вычисляем дни
    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay(); // 0 - Вс
    startDayOfWeek = (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1); // 0 - Пн, 6 - Вс

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Заголовок и контролы
    const headerHtml = `
      <div class="cal-controls">
        <div class="cal-title-section">
          <h2 class="cal-month-title">${CONFIG.MONTH_NAMES[month]} ${year}</h2>
          <span class="cal-subtitle">${year === 2026 && month === 11 ? '🎄 Предновогодняя пора!' : (year === 2027 && month === 0 ? '✨ Новогодние каникулы 2027!' : 'Планирование')}</span>
        </div>
        <div class="cal-actions">
          <button type="button" class="btn btn-outline btn-sm" id="calJumpToday">Сегодня</button>
          <button type="button" class="btn btn-primary btn-sm btn-ny-sparkle" id="calJumpNY">🎄 Новый год 2027</button>
          <div class="cal-nav-group">
            <button type="button" class="btn-arrow" id="calPrevMonth" title="Предыдущий месяц">&lsaquo;</button>
            <button type="button" class="btn-arrow" id="calNextMonth" title="Следующий месяц">&rsaquo;</button>
          </div>
        </div>
      </div>
    `;

    // Сетка дней недели
    const weekdaysHtml = `
      <div class="cal-weekdays">
        ${CONFIG.WEEKDAY_NAMES_SHORT.map((w, idx) => `<div class="cal-weekday ${idx >= 5 ? 'weekend' : ''}">${w}</div>`).join('')}
      </div>
    `;

    // 42 ячейки
    let cellsHtml = '';
    const dateCellsData = [];

    for (let i = 0; i < 42; i++) {
      let cellDate;
      let isOtherMonth = false;

      if (i < startDayOfWeek) {
        const dNum = daysInPrevMonth - (startDayOfWeek - 1 - i);
        cellDate = new Date(year, month - 1, dNum);
        isOtherMonth = true;
      } else if (i < startDayOfWeek + daysInMonth) {
        const dNum = i - startDayOfWeek + 1;
        cellDate = new Date(year, month, dNum);
      } else {
        const dNum = i - (startDayOfWeek + daysInMonth) + 1;
        cellDate = new Date(year, month + 1, dNum);
        isOtherMonth = true;
      }

      const dateISO = this.formatDateISO(cellDate);
      const isToday = (dateISO === todayISO);
      const isSelected = (dateISO === this.selectedDateISO);
      const isNYEve = (dateISO === '2026-12-31');
      const isNYDay = (dateISO === '2027-01-01');

      // События этого дня:
      // 1. Подтверждённые
      const confirmed = this.events.filter(e => e.status === 'confirmed' && e.confirmedDate === dateISO);
      // 2. Предложенные/голосуемые с такой датой в dateOptions
      const proposed = this.events.filter(e => e.status !== 'confirmed' && e.status !== 'cancelled' && Array.isArray(e.dateOptions) && e.dateOptions.some(opt => opt.date === dateISO));
      const allDayEvents = [...confirmed, ...proposed];

      // Проверка конфликтов
      const conflicts = this.findConflictsForDate(dateISO);

      dateCellsData.push({ dateISO, cellDate, confirmed, proposed, allDayEvents });

      // Отрисовка бейджей мероприятий
      let eventBadgesHtml = '';
      const maxDisplay = 2;

      allDayEvents.slice(0, maxDisplay).forEach(evt => {
        const isConf = evt.status === 'confirmed';
        const cat = CONFIG.CATEGORIES[evt.category] || CONFIG.CATEGORIES.other;
        const hasConflict = conflicts.has(evt.id);

        eventBadgesHtml += `
          <div class="cal-event-pill ${isConf ? 'is-confirmed' : 'is-proposed'} ${hasConflict ? 'has-conflict' : ''}" 
               style="--cat-color: ${cat.color}; --cat-bg: ${cat.bg};"
               data-event-id="${evt.id}"
               title="${escapeHtml(evt.title)} (${CONFIG.STATUSES[evt.status]?.label || ''})">
            <span class="pill-emoji">${evt.authorEmoji || cat.emoji}</span>
            <span class="pill-title">${escapeHtml(evt.title)}</span>
            ${hasConflict ? `<span class="pill-warn" title="Конфликт по времени!">⚠️</span>` : ''}
            ${!isConf ? `<span class="pill-vote-icon" title="Идёт голосование">🗳️</span>` : ''}
          </div>
        `;
      });

      if (allDayEvents.length > maxDisplay) {
        eventBadgesHtml += `
          <div class="cal-more-badge">+ ещё ${allDayEvents.length - maxDisplay}</div>
        `;
      }

      // Отрисовка цветных точек для мобильного вида
      const mobileDotsHtml = allDayEvents.slice(0, 4).map(evt => {
        const cat = CONFIG.CATEGORIES[evt.category] || CONFIG.CATEGORIES.other;
        return `<span class="mobile-dot" style="background-color: ${cat.color};"></span>`;
      }).join('');

      cellsHtml += `
        <div class="cal-day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${isNYEve ? 'is-ny-eve' : ''} ${isNYDay ? 'is-ny-day' : ''}" 
             data-date="${dateISO}">
          <div class="cal-day-header">
            <span class="cal-day-num">${cellDate.getDate()}</span>
            ${isNYEve ? '<span class="ny-tag">31 Декабря 🍾</span>' : ''}
            ${isNYDay ? '<span class="ny-tag">С Новым 2027! 🎆</span>' : ''}
            ${allDayEvents.length > 0 ? `<span class="cal-count-badge">${allDayEvents.length}</span>` : ''}
          </div>
          <div class="cal-events-list">
            ${eventBadgesHtml}
          </div>
          <div class="cal-mobile-dots">
            ${mobileDotsHtml}
          </div>
        </div>
      `;
    }

    // Мобильная панель карточек выбранного дня
    const selectedData = dateCellsData.find(d => d.dateISO === this.selectedDateISO) || dateCellsData[0];
    const selectedDayCardsHtml = this.renderSelectedDayPanel(selectedData);

    this.container.innerHTML = `
      <div class="calendar-component">
        ${headerHtml}
        ${weekdaysHtml}
        <div class="cal-days-grid">
          ${cellsHtml}
        </div>
        <div class="cal-mobile-selected-panel">
          ${selectedDayCardsHtml}
        </div>
      </div>
    `;

    // Привязываем события
    this.bindDOMEvents();
  }

  renderSelectedDayPanel(data) {
    if (!data) return '';
    const d = new Date(data.dateISO);
    const dateFormatted = `${d.getDate()} ${CONFIG.MONTH_NAMES_GENITIVE[d.getMonth()]} ${d.getFullYear()}`;

    let eventsListHtml = '';
    if (data.allDayEvents.length === 0) {
      eventsListHtml = `
        <div class="panel-empty-day">
          <span>На эту дату пока нет мероприятий</span>
          <button type="button" class="btn btn-outline btn-sm btn-quick-propose" data-date="${data.dateISO}">
            + Предложить на этот день
          </button>
        </div>
      `;
    } else {
      eventsListHtml = data.allDayEvents.map(evt => {
        const cat = CONFIG.CATEGORIES[evt.category] || CONFIG.CATEGORIES.other;
        const statusCfg = CONFIG.STATUSES[evt.status] || CONFIG.STATUSES.proposed;
        const isConf = evt.status === 'confirmed';

        return `
          <div class="panel-day-card" data-event-id="${evt.id}">
            <div class="panel-card-left" style="background-color: ${cat.color}"></div>
            <div class="panel-card-body">
              <div class="panel-card-top">
                <span class="badge ${statusCfg.badgeClass}">${statusCfg.emoji} ${statusCfg.label}</span>
                <span class="panel-card-category">${cat.emoji} ${cat.name}</span>
                ${evt.timeStart ? `<span class="panel-card-time">⏰ ${evt.timeStart}</span>` : ''}
              </div>
              <h4 class="panel-card-title">${escapeHtml(evt.title)}</h4>
              ${evt.location ? `<div class="panel-card-loc">📍 ${escapeHtml(evt.location)}</div>` : ''}
              <div class="panel-card-meta">
                <span>Автор: ${evt.authorEmoji} ${escapeHtml(evt.authorName)}</span>
                ${evt.budgetPerPerson ? `<span>• ~${evt.budgetPerPerson} ₽/чел</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <div class="selected-day-header">
        <div class="selected-day-title">
          <span class="selected-day-date">📅 ${dateFormatted}</span>
          <span class="selected-day-badge">${data.allDayEvents.length} событий</span>
        </div>
        <button type="button" class="btn btn-primary btn-sm btn-quick-propose" data-date="${data.dateISO}">
          + Предложить движ
        </button>
      </div>
      <div class="selected-day-events-list">
        ${eventsListHtml}
      </div>
    `;
  }

  bindDOMEvents() {
    // Навигация по календарю
    this.container.querySelector('#calPrevMonth')?.addEventListener('click', () => this.prevMonth());
    this.container.querySelector('#calNextMonth')?.addEventListener('click', () => this.nextMonth());
    this.container.querySelector('#calJumpToday')?.addEventListener('click', () => this.jumpToToday());
    this.container.querySelector('#calJumpNY')?.addEventListener('click', () => this.jumpToNewYear());

    // Клик по ячейке дня
    this.container.querySelectorAll('.cal-day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        // Если клик был не по конкретному мероприятию
        if (e.target.closest('.cal-event-pill')) return;

        const dateISO = cell.dataset.date;
        this.selectedDateISO = dateISO;
        this.render();
        if (this.onSelectDate) {
          this.onSelectDate(dateISO);
        }
      });
    });

    // Клик по бейджу мероприятия
    this.container.querySelectorAll('[data-event-id]').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = badge.dataset.eventId;
        const found = this.events.find(ev => ev.id === eventId);
        if (found && this.onSelectEvent) {
          this.onSelectEvent(found);
        }
      });
    });

    // Клик по кнопке "+ Предложить движ" в мобильной панели
    this.container.querySelectorAll('.btn-quick-propose').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const date = btn.dataset.date || this.selectedDateISO;
        if (this.onSelectDate) {
          this.onSelectDate(date, true); // true = сразу открыть форму создания
        }
      });
    });
  }
}
