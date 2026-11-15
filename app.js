/**
 * PlanSphere - Interactive Calendar & Event Planning App
 * Pure Modern JavaScript (ES6+), Zero Build Dependencies
 */

// --- Category metadata ---
const CATEGORIES = {
  work: { id: 'work', name: 'Работа', color: '#3b82f6', icon: 'briefcase', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  personal: { id: 'personal', name: 'Личное', color: '#ec4899', icon: 'heart', bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' },
  study: { id: 'study', name: 'Учёба', color: '#8b5cf6', icon: 'book-open', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  health: { id: 'health', name: 'Здоровье & Спорт', color: '#10b981', icon: 'activity', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  goal: { id: 'goal', name: 'Цель / Веха', color: '#f59e0b', icon: 'target', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  meeting: { id: 'meeting', name: 'Встреча', color: '#6366f1', icon: 'users', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' }
};

const PRIORITIES = {
  critical: { label: '🔥 Срочно', class: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/50' },
  high: { label: 'Высокий', class: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/50' },
  medium: { label: 'Средний', class: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/50' },
  low: { label: 'Низкий', class: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' }
};

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const MONTH_NAMES_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const WEEKDAY_NAMES_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const WEEKDAY_NAMES_FULL = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

// --- Helper Functions ---
function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatDateISO(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDateTimeLocal(d) {
  return `${formatDateISO(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${MONTH_NAMES_GENITIVE[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDisplayDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return `${d.getDate()} ${MONTH_NAMES_GENITIVE[d.getMonth()]} ${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// Generate unique ID
function uid() {
  return 'evt_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// --- Initial Demo Data Generator ---
function createSeedEvents() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  return [
    {
      id: uid(),
      title: '🚀 Запуск проекта на GitHub Pages',
      startDate: formatDateTimeLocal(new Date(y, m, d, 10, 0)),
      endDate: formatDateTimeLocal(new Date(y, m, d, 12, 0)),
      planningDeadline: formatDateISO(new Date(y, m, d + 1)),
      category: 'goal',
      priority: 'critical',
      status: 'in-progress',
      color: '#f59e0b',
      description: 'Финальное тестирование и выкладка календаря в общий доступ через GitHub Pages.'
    },
    {
      id: uid(),
      title: '💻 Синхронизация архитектуры команды',
      startDate: formatDateTimeLocal(new Date(y, m, d + 1, 14, 0)),
      endDate: formatDateTimeLocal(new Date(y, m, d + 1, 15, 30)),
      planningDeadline: formatDateISO(new Date(y, m, d + 2)),
      category: 'meeting',
      priority: 'high',
      status: 'scheduled',
      color: '#6366f1',
      description: 'Обсуждение нового функционала планирования событий и мобильной версии.'
    },
    {
      id: uid(),
      title: '📚 Изучение современных Web API',
      startDate: formatDateTimeLocal(new Date(y, m, d + 3, 11, 0)),
      endDate: formatDateTimeLocal(new Date(y, m, d + 3, 13, 0)),
      planningDeadline: formatDateISO(new Date(y, m, d + 5)),
      category: 'study',
      priority: 'medium',
      status: 'scheduled',
      color: '#8b5cf6',
      description: 'Чтение документации по Notification API, Service Workers и LocalStorage Sync.'
    },
    {
      id: uid(),
      title: '🏃 Утренняя пробежка и растяжка',
      startDate: formatDateTimeLocal(new Date(y, m, d - 1, 8, 0)),
      endDate: formatDateTimeLocal(new Date(y, m, d - 1, 9, 0)),
      planningDeadline: formatDateISO(new Date(y, m, d - 1)),
      category: 'health',
      priority: 'medium',
      status: 'completed',
      color: '#10b981',
      description: 'Разминка на свежем воздухе перед началом рабочего дня.'
    },
    {
      id: uid(),
      title: '🌟 Семейный ужин на выходных',
      startDate: formatDateTimeLocal(new Date(y, m, d + 6, 18, 30)),
      endDate: formatDateTimeLocal(new Date(y, m, d + 6, 21, 0)),
      planningDeadline: formatDateISO(new Date(y, m, d + 6)),
      category: 'personal',
      priority: 'low',
      status: 'scheduled',
      color: '#ec4899',
      description: 'Купить торт и подготовить настольные игры для уютного вечера.'
    },
    {
      id: uid(),
      title: '💼 Подготовка отчёта по планированию',
      startDate: formatDateTimeLocal(new Date(y, m, d + 4, 16, 0)),
      endDate: formatDateTimeLocal(new Date(y, m, d + 4, 17, 30)),
      planningDeadline: formatDateISO(new Date(y, m, d + 8)),
      category: 'work',
      priority: 'high',
      status: 'scheduled',
      color: '#3b82f6',
      description: 'Сформировать сводку по завершенным этапам и сформировать план на следующий месяц.'
    }
  ];
}

// --- Main App Class ---
class CalendarApp {
  constructor() {
    this.events = this.loadEvents();
    this.currentDate = new Date(); // anchor date
    this.viewMode = 'month'; // 'month' | 'week' | 'day' | 'planning' | 'agenda'
    this.selectedCategory = 'all';
    this.selectedPriority = 'all';
    this.searchQuery = '';
    this.activeDetailEvent = null;

    this.initTheme();
    this.initElements();
    this.bindEvents();
    this.render();
  }

  // --- Persistence ---
  loadEvents() {
    try {
      const stored = localStorage.getItem('plansphere_events');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load events from localStorage', e);
    }
    const seed = createSeedEvents();
    this.saveEvents(seed);
    return seed;
  }

  saveEvents(eventsToSave = this.events) {
    this.events = eventsToSave;
    try {
      localStorage.setItem('plansphere_events', JSON.stringify(this.events));
    } catch (e) {
      console.error('Failed to save events to localStorage', e);
    }
  }

  // --- Theme ---
  initTheme() {
    const saved = localStorage.getItem('plansphere_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('plansphere_theme', isDark ? 'dark' : 'light');
    this.refreshIcons();
  }

  // --- DOM References ---
  initElements() {
    // Navigation
    this.btnPrev = document.getElementById('btnPrev');
    this.btnNext = document.getElementById('btnNext');
    this.btnToday = document.getElementById('btnToday');
    this.currentPeriodLabel = document.getElementById('currentPeriodLabel');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    
    // Search
    this.searchInput = document.getElementById('searchInput');
    this.mobileSearchInput = document.getElementById('mobileSearchInput');

    // Sidebar
    this.sidebar = document.getElementById('sidebar');
    this.toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    this.closeSidebarBtn = document.getElementById('closeSidebarBtn');
    this.sidebarBackdrop = document.getElementById('sidebarBackdrop');
    this.miniMonthLabel = document.getElementById('miniMonthLabel');
    this.miniPrev = document.getElementById('miniPrev');
    this.miniNext = document.getElementById('miniNext');
    this.miniCalendarGrid = document.getElementById('miniCalendarGrid');
    this.categoryFilterList = document.getElementById('categoryFilterList');
    this.resetCategoryFilter = document.getElementById('resetCategoryFilter');
    this.priorityFilters = document.getElementById('priorityFilters');

    // Stats
    this.statTotal = document.getElementById('statTotal');
    this.statPlanned = document.getElementById('statPlanned');
    this.statDone = document.getElementById('statDone');

    // Views
    this.viewButtons = document.querySelectorAll('.view-btn');
    this.views = {
      month: document.getElementById('viewMonth'),
      week: document.getElementById('viewWeek'),
      day: document.getElementById('viewDay'),
      planning: document.getElementById('viewPlanning'),
      agenda: document.getElementById('viewAgenda')
    };
    this.monthGrid = document.getElementById('monthGrid');
    this.weekHeaderGrid = document.getElementById('weekHeaderGrid');
    this.weekBodyGrid = document.getElementById('weekBodyGrid');
    this.dayViewHeader = document.getElementById('dayViewHeader');
    this.dayTimeline = document.getElementById('dayTimeline');
    this.agendaList = document.getElementById('agendaList');
    this.agendaCountBadge = document.getElementById('agendaCountBadge');

    // Kanban cols
    this.columnScheduled = document.getElementById('columnScheduled');
    this.columnInProgress = document.getElementById('columnInProgress');
    this.columnCompleted = document.getElementById('columnCompleted');
    this.planCountScheduled = document.getElementById('planCountScheduled');
    this.planCountInProgress = document.getElementById('planCountInProgress');
    this.planCountCompleted = document.getElementById('planCountCompleted');

    // Modals
    this.btnOpenAddModal = document.getElementById('btnOpenAddModal');
    this.btnNewPlanningItem = document.getElementById('btnNewPlanningItem');
    this.eventModal = document.getElementById('eventModal');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.btnCancelModal = document.getElementById('btnCancelModal');
    this.eventForm = document.getElementById('eventForm');
    this.modalTitle = document.getElementById('modalTitle');
    this.btnDeleteEvent = document.getElementById('btnDeleteEvent');

    // Form inputs
    this.eventId = document.getElementById('eventId');
    this.eventTitleInput = document.getElementById('eventTitleInput');
    this.eventStartDateInput = document.getElementById('eventStartDateInput');
    this.eventEndDateInput = document.getElementById('eventEndDateInput');
    this.eventDeadlineInput = document.getElementById('eventDeadlineInput');
    this.eventCategorySelect = document.getElementById('eventCategorySelect');
    this.eventPrioritySelect = document.getElementById('eventPrioritySelect');
    this.eventStatusSelect = document.getElementById('eventStatusSelect');
    this.eventDescInput = document.getElementById('eventDescInput');
    this.eventColorInput = document.getElementById('eventColorInput');
    this.colorDots = document.querySelectorAll('.color-dot');

    // Detail Preview Modal
    this.viewDetailModal = document.getElementById('viewDetailModal');
    this.closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
    this.detailHeaderColor = document.getElementById('detailHeaderColor');
    this.detailCategoryBadge = document.getElementById('detailCategoryBadge');
    this.detailTitle = document.getElementById('detailTitle');
    this.detailDates = document.getElementById('detailDates');
    this.detailDeadlineRow = document.getElementById('detailDeadlineRow');
    this.detailDeadline = document.getElementById('detailDeadline');
    this.detailPriority = document.getElementById('detailPriority');
    this.detailStatus = document.getElementById('detailStatus');
    this.detailDescContainer = document.getElementById('detailDescContainer');
    this.btnToggleCompleteDetail = document.getElementById('btnToggleCompleteDetail');
    this.btnEditFromDetail = document.getElementById('btnEditFromDetail');
    this.btnExportSingleIcal = document.getElementById('btnExportSingleIcal');
    this.btnDeleteFromDetail = document.getElementById('btnDeleteFromDetail');

    // Data buttons
    this.btnExportIcal = document.getElementById('btnExportIcal');
    this.btnExportJson = document.getElementById('btnExportJson');
    this.importJsonInput = document.getElementById('importJsonInput');
    this.btnResetData = document.getElementById('btnResetData');

    // Filter badge
    this.activeFilterBadge = document.getElementById('activeFilterBadge');
    this.clearFiltersBtn = document.getElementById('clearFiltersBtn');
    this.toastContainer = document.getElementById('toastContainer');
  }

  // --- Bind Event Listeners ---
  bindEvents() {
    // Navigation
    this.btnPrev.addEventListener('click', () => this.navigatePeriod(-1));
    this.btnNext.addEventListener('click', () => this.navigatePeriod(1));
    this.btnToday.addEventListener('click', () => {
      this.currentDate = new Date();
      this.render();
    });

    // Theme toggle
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // Mobile sidebar
    this.toggleSidebarBtn.addEventListener('click', () => {
      this.sidebar.classList.remove('-translate-x-full');
      this.sidebarBackdrop.classList.remove('hidden');
    });
    const closeSidebar = () => {
      this.sidebar.classList.add('-translate-x-full');
      this.sidebarBackdrop.classList.add('hidden');
    };
    this.closeSidebarBtn.addEventListener('click', closeSidebar);
    this.sidebarBackdrop.addEventListener('click', closeSidebar);

    // Mini calendar nav
    this.miniPrev.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });
    this.miniNext.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });

    // View Switching
    this.viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.switchView(view);
      });
    });

    // Search
    const handleSearch = (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.render();
    };
    this.searchInput.addEventListener('input', handleSearch);
    this.mobileSearchInput.addEventListener('input', handleSearch);

    // Filter clearing
    this.clearFiltersBtn.addEventListener('click', () => {
      this.selectedCategory = 'all';
      this.selectedPriority = 'all';
      this.searchQuery = '';
      this.searchInput.value = '';
      this.mobileSearchInput.value = '';
      this.updatePriorityButtonStyles();
      this.render();
    });
    this.resetCategoryFilter.addEventListener('click', () => {
      this.selectedCategory = 'all';
      this.render();
    });

    // Priority filter clicks
    this.priorityFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.priority-btn');
      if (!btn) return;
      this.selectedPriority = btn.dataset.priority;
      this.updatePriorityButtonStyles();
      this.render();
    });

    // Modals
    this.btnOpenAddModal.addEventListener('click', () => this.openAddModal());
    this.btnNewPlanningItem.addEventListener('click', () => this.openAddModal());
    this.closeModalBtn.addEventListener('click', () => this.closeEventModal());
    this.btnCancelModal.addEventListener('click', () => this.closeEventModal());
    this.eventModal.addEventListener('click', (e) => {
      if (e.target === this.eventModal) this.closeEventModal();
    });

    // Detail Preview Modal
    this.closeDetailModalBtn.addEventListener('click', () => this.closeDetailModal());
    this.viewDetailModal.addEventListener('click', (e) => {
      if (e.target === this.viewDetailModal) this.closeDetailModal();
    });
    this.btnToggleCompleteDetail.addEventListener('click', () => {
      if (this.activeDetailEvent) {
        this.toggleEventCompletion(this.activeDetailEvent.id);
      }
    });
    this.btnEditFromDetail.addEventListener('click', () => {
      if (this.activeDetailEvent) {
        const evt = this.activeDetailEvent;
        this.closeDetailModal();
        this.openEditModal(evt);
      }
    });
    this.btnDeleteFromDetail.addEventListener('click', () => {
      if (this.activeDetailEvent) {
        this.deleteEvent(this.activeDetailEvent.id);
        this.closeDetailModal();
      }
    });
    this.btnExportSingleIcal.addEventListener('click', () => {
      if (this.activeDetailEvent) {
        this.exportSingleEventIcs(this.activeDetailEvent);
      }
    });

    // Color picker in form
    this.colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        this.colorDots.forEach(d => d.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-500'));
        dot.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-500');
        this.eventColorInput.value = dot.dataset.color;
      });
    });

    // Form Submit
    this.eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Form Delete
    this.btnDeleteEvent.addEventListener('click', () => {
      const id = this.eventId.value;
      if (id) {
        this.deleteEvent(id);
        this.closeEventModal();
      }
    });

    // Data Export & Import
    this.btnExportIcal.addEventListener('click', () => this.exportAllToIcs());
    this.btnExportJson.addEventListener('click', () => this.exportToJson());
    this.importJsonInput.addEventListener('change', (e) => this.handleImportJson(e));
    this.btnResetData.addEventListener('click', () => {
      if (confirm('Сбросить календарь и восстановить демонстрационные события?')) {
        this.events = createSeedEvents();
        this.saveEvents();
        this.render();
        this.showToast('Демо-события успешно восстановлены!', 'info');
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeEventModal();
        this.closeDetailModal();
        closeSidebar();
      }
    });

    // Drag and drop for kanban columns
    this.initKanbanDragAndDrop();
  }

  // --- View Switcher ---
  switchView(viewName) {
    this.viewMode = viewName;
    this.viewButtons.forEach(btn => {
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
        btn.classList.remove('text-slate-600', 'dark:text-slate-400');
      } else {
        btn.classList.remove('active');
        btn.classList.add('text-slate-600', 'dark:text-slate-400');
      }
    });

    Object.entries(this.views).forEach(([name, el]) => {
      if (name === viewName) {
        el.classList.remove('hidden');
        el.classList.add('flex');
      } else {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }
    });

    this.render();
  }

  // --- Navigation & Period Math ---
  navigatePeriod(direction) {
    if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    } else if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + direction * 7);
    } else if (this.viewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + direction);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    }
    this.render();
  }

  updatePeriodLabel() {
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    
    if (this.viewMode === 'month' || this.viewMode === 'planning' || this.viewMode === 'agenda') {
      this.currentPeriodLabel.textContent = `${MONTH_NAMES[m]} ${y}`;
    } else if (this.viewMode === 'week') {
      const startOfWeek = this.getStartOfWeek(this.currentDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        this.currentPeriodLabel.textContent = `${startOfWeek.getDate()} – ${endOfWeek.getDate()} ${MONTH_NAMES_GENITIVE[startOfWeek.getMonth()]} ${y}`;
      } else {
        this.currentPeriodLabel.textContent = `${startOfWeek.getDate()} ${MONTH_NAMES_GENITIVE[startOfWeek.getMonth()]} – ${endOfWeek.getDate()} ${MONTH_NAMES_GENITIVE[endOfWeek.getMonth()]}`;
      }
    } else if (this.viewMode === 'day') {
      const dayName = WEEKDAY_NAMES_FULL[this.currentDate.getDay()];
      this.currentPeriodLabel.textContent = `${dayName}, ${this.currentDate.getDate()} ${MONTH_NAMES_GENITIVE[m]}`;
    }

    this.miniMonthLabel.textContent = `${MONTH_NAMES[m]} ${y}`;
  }

  getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    // Monday is 1, Sunday is 0 -> shift so Monday is first (diff: 0 for Mon, 6 for Sun)
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // --- Filtering ---
  getFilteredEvents() {
    return this.events.filter(evt => {
      // Category filter
      if (this.selectedCategory !== 'all' && evt.category !== this.selectedCategory) {
        return false;
      }
      // Priority filter
      if (this.selectedPriority !== 'all' && evt.priority !== this.selectedPriority) {
        return false;
      }
      // Search query
      if (this.searchQuery) {
        const titleMatch = evt.title && evt.title.toLowerCase().includes(this.searchQuery);
        const descMatch = evt.description && evt.description.toLowerCase().includes(this.searchQuery);
        if (!titleMatch && !descMatch) return false;
      }
      return true;
    });
  }

  updateFilterBadges() {
    const hasFilter = this.selectedCategory !== 'all' || this.selectedPriority !== 'all' || this.searchQuery !== '';
    if (hasFilter) {
      this.activeFilterBadge.classList.remove('hidden');
      this.activeFilterBadge.classList.add('inline-flex');
    } else {
      this.activeFilterBadge.classList.add('hidden');
      this.activeFilterBadge.classList.remove('inline-flex');
    }
  }

  updatePriorityButtonStyles() {
    const buttons = this.priorityFilters.querySelectorAll('.priority-btn');
    buttons.forEach(btn => {
      if (btn.dataset.priority === this.selectedPriority) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // --- Rendering ---
  render() {
    this.updatePeriodLabel();
    this.updateFilterBadges();
    this.renderStats();
    this.renderCategoryFilterList();
    this.renderMiniCalendar();

    const filtered = this.getFilteredEvents();

    if (this.viewMode === 'month') {
      this.renderMonthView(filtered);
    } else if (this.viewMode === 'week') {
      this.renderWeekView(filtered);
    } else if (this.viewMode === 'day') {
      this.renderDayView(filtered);
    } else if (this.viewMode === 'planning') {
      this.renderPlanningView(filtered);
    } else if (this.viewMode === 'agenda') {
      this.renderAgendaView(filtered);
    }

    this.refreshIcons();
  }

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- Sidebar Widgets ---
  renderStats() {
    const total = this.events.length;
    const planned = this.events.filter(e => e.status !== 'completed').length;
    const done = this.events.filter(e => e.status === 'completed').length;

    this.statTotal.textContent = total;
    this.statPlanned.textContent = planned;
    this.statDone.textContent = done;
  }

  renderCategoryFilterList() {
    this.categoryFilterList.innerHTML = '';
    const counts = {};
    Object.keys(CATEGORIES).forEach(k => counts[k] = 0);
    this.events.forEach(e => {
      if (counts[e.category] !== undefined) counts[e.category]++;
    });

    Object.values(CATEGORIES).forEach(cat => {
      const isSelected = this.selectedCategory === cat.id;
      const item = document.createElement('button');
      item.className = `w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition text-left ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-300'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`;
      
      item.innerHTML = `
        <span class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${cat.color};"></span>
          <span>${cat.name}</span>
        </span>
        <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200/60 dark:bg-slate-700 font-semibold text-slate-600 dark:text-slate-300">
          ${counts[cat.id] || 0}
        </span>
      `;

      item.addEventListener('click', () => {
        this.selectedCategory = (this.selectedCategory === cat.id) ? 'all' : cat.id;
        this.render();
      });

      this.categoryFilterList.appendChild(item);
    });
  }

  renderMiniCalendar() {
    this.miniCalendarGrid.innerHTML = '';
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const firstDay = new Date(y, m, 1);
    let startDay = firstDay.getDay();
    startDay = (startDay === 0 ? 6 : startDay - 1); // Monday is 0

    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();
    const today = new Date();

    // Days from prev month
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const cell = document.createElement('div');
      cell.className = 'py-1 text-center text-slate-300 dark:text-slate-700 text-[11px]';
      cell.textContent = dayNum;
      this.miniCalendarGrid.appendChild(cell);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const thisDay = new Date(y, m, day);
      const isToday = isSameDay(thisDay, today);
      const isCurrentActive = isSameDay(thisDay, this.currentDate);

      // Check if there are events on this day
      const hasEvents = this.events.some(e => {
        const d = new Date(e.startDate);
        return isSameDay(d, thisDay);
      });

      const cell = document.createElement('button');
      cell.className = `py-1 text-center rounded-md font-medium text-[11px] relative transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
        isCurrentActive ? 'bg-indigo-600 text-white hover:bg-indigo-700 font-bold' :
        isToday ? 'border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold' :
        'text-slate-700 dark:text-slate-300'
      }`;
      cell.textContent = day;

      if (hasEvents && !isCurrentActive) {
        const dot = document.createElement('span');
        dot.className = 'absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500';
        cell.appendChild(dot);
      }

      cell.addEventListener('click', () => {
        this.currentDate = thisDay;
        this.render();
      });

      this.miniCalendarGrid.appendChild(cell);
    }
  }

  // --- 1. Month View Renderer ---
  renderMonthView(filteredEvents) {
    this.monthGrid.innerHTML = '';
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const firstDayOfMonth = new Date(y, m, 1);
    let startDayOffset = firstDayOfMonth.getDay();
    startDayOffset = (startDayOffset === 0 ? 6 : startDayOffset - 1); // 0 = Mon, 6 = Sun

    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();
    const today = new Date();

    // 42 cells grid (6 rows x 7 cols)
    for (let i = 0; i < 42; i++) {
      const cell = document.createElement('div');
      cell.className = 'month-day-cell p-1.5 sm:p-2 flex flex-col group relative overflow-hidden select-none';

      let cellDate;
      let isOutside = false;

      if (i < startDayOffset) {
        // Prev month
        const dayNum = daysInPrevMonth - (startDayOffset - 1 - i);
        cellDate = new Date(y, m - 1, dayNum);
        isOutside = true;
      } else if (i < startDayOffset + daysInMonth) {
        // Current month
        const dayNum = i - startDayOffset + 1;
        cellDate = new Date(y, m, dayNum);
      } else {
        // Next month
        const dayNum = i - (startDayOffset + daysInMonth) + 1;
        cellDate = new Date(y, m + 1, dayNum);
        isOutside = true;
      }

      if (isOutside) {
        cell.classList.add('month-day-outside', 'bg-slate-50/50', 'dark:bg-slate-950/40');
      }

      const isToday = isSameDay(cellDate, today);

      // Top cell bar: date number & add button on hover
      const topBar = document.createElement('div');
      topBar.className = 'flex items-center justify-between mb-1';

      const dateNum = document.createElement('span');
      dateNum.className = `text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
        isToday ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30' : 'text-slate-700 dark:text-slate-300'
      }`;
      dateNum.textContent = cellDate.getDate();
      topBar.appendChild(dateNum);

      const addBtn = document.createElement('button');
      addBtn.className = 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded transition';
      addBtn.innerHTML = '<i data-lucide="plus" class="w-3.5 h-3.5"></i>';
      addBtn.title = 'Добавить событие на этот день';
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openAddModal(cellDate);
      });
      topBar.appendChild(addBtn);

      cell.appendChild(topBar);

      // Find events for this cell
      const dayEvents = filteredEvents.filter(e => {
        const start = new Date(e.startDate);
        return isSameDay(start, cellDate);
      });

      // Events container
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'space-y-1 overflow-y-auto flex-1';

      const maxVisible = 3;
      dayEvents.slice(0, maxVisible).forEach(evt => {
        const badge = this.createEventBadge(evt);
        eventsContainer.appendChild(badge);
      });

      if (dayEvents.length > maxVisible) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline block text-left px-1';
        moreBtn.textContent = `+ ещё ${dayEvents.length - maxVisible}`;
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.currentDate = cellDate;
          this.switchView('day');
        });
        eventsContainer.appendChild(moreBtn);
      }

      cell.appendChild(eventsContainer);

      // Click cell to add event
      cell.addEventListener('click', (e) => {
        if (!e.target.closest('.event-badge') && !e.target.closest('button')) {
          this.openAddModal(cellDate);
        }
      });

      this.monthGrid.appendChild(cell);
    }
  }

  createEventBadge(evt) {
    const badge = document.createElement('div');
    const isDone = evt.status === 'completed';
    const cat = CATEGORIES[evt.category] || CATEGORIES.work;
    
    badge.className = `event-badge ${isDone ? 'completed' : ''}`;
    badge.style.backgroundColor = `${evt.color || cat.color}15`;
    badge.style.borderLeft = `3px solid ${evt.color || cat.color}`;
    badge.style.color = evt.color || cat.color;

    // Check urgency if planning deadline exists
    let deadlineBadgeHtml = '';
    if (evt.planningDeadline && !isDone) {
      const days = this.getDaysUntil(evt.planningDeadline);
      if (days < 0) {
        deadlineBadgeHtml = `<span class="ml-auto text-[9px] px-1 py-0.2 rounded bg-rose-500 text-white font-bold animate-pulse">!</span>`;
      } else if (days <= 2) {
        deadlineBadgeHtml = `<span class="ml-auto text-[9px] px-1 py-0.2 rounded bg-amber-500 text-white font-bold">${days}д</span>`;
      }
    }

    badge.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background-color: ${evt.color || cat.color}"></span>
      <span class="event-title-text truncate font-medium">${this.escapeHtml(evt.title)}</span>
      ${deadlineBadgeHtml}
    `;

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openDetailModal(evt);
    });

    return badge;
  }

  // --- 2. Week View Renderer ---
  renderWeekView(filteredEvents) {
    this.weekHeaderGrid.innerHTML = '<div class="text-slate-400 text-xs py-1">Время</div>';
    this.weekBodyGrid.innerHTML = '';

    const startOfWeek = this.getStartOfWeek(this.currentDate);
    const today = new Date();
    const days = [];

    // Header with 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);

      const isToday = isSameDay(d, today);
      const col = document.createElement('div');
      col.className = 'py-1 text-center';
      col.innerHTML = `
        <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">${WEEKDAY_NAMES_SHORT[d.getDay()]}</div>
        <div class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-0.5 ${
          isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-800 dark:text-slate-200'
        }">${d.getDate()}</div>
      `;
      this.weekHeaderGrid.appendChild(col);
    }

    // Time slots (08:00 to 21:00)
    for (let hour = 8; hour <= 21; hour++) {
      // Time label column
      const timeCol = document.createElement('div');
      timeCol.className = 'h-14 border-b border-slate-200 dark:border-slate-800/80 p-1 text-[11px] font-semibold text-slate-400 text-right pr-2 select-none';
      timeCol.textContent = `${pad2(hour)}:00`;
      this.weekBodyGrid.appendChild(timeCol);

      // 7 day columns for this hour
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentSlotDate = new Date(days[dayIndex]);
        currentSlotDate.setHours(hour, 0, 0, 0);

        const slotCol = document.createElement('div');
        slotCol.className = 'h-14 border-b border-slate-200 dark:border-slate-800/80 p-1 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition relative group';

        // Find events in this hour slot
        const matchingEvents = filteredEvents.filter(evt => {
          const start = new Date(evt.startDate);
          return isSameDay(start, currentSlotDate) && start.getHours() === hour;
        });

        matchingEvents.forEach(evt => {
          const card = document.createElement('div');
          card.className = 'text-[11px] p-1 rounded-md mb-1 cursor-pointer truncate shadow-xs font-medium';
          card.style.backgroundColor = `${evt.color}25`;
          card.style.borderLeft = `3px solid ${evt.color}`;
          card.style.color = evt.color;
          card.textContent = evt.title;
          card.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openDetailModal(evt);
          });
          slotCol.appendChild(card);
        });

        // Click slot to create event at this specific hour
        slotCol.addEventListener('click', (e) => {
          if (!e.target.closest('.cursor-pointer')) {
            this.openAddModal(currentSlotDate);
          }
        });

        this.weekBodyGrid.appendChild(slotCol);
      }
    }
  }

  // --- 3. Day View Renderer ---
  renderDayView(filteredEvents) {
    const d = this.currentDate;
    const isToday = isSameDay(d, new Date());
    
    this.dayViewHeader.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">${d.getDate()}</div>
        <div>
          <div class="text-sm font-bold text-slate-800 dark:text-white">
            ${WEEKDAY_NAMES_FULL[d.getDay()]} ${isToday ? '<span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold ml-2">Сегодня</span>' : ''}
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400">${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}</div>
        </div>
      </div>
      <button id="btnDayAddEvent" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition">
        <i data-lucide="plus" class="w-3.5 h-3.5"></i>
        Добавить на этот день
      </button>
    `;

    document.getElementById('btnDayAddEvent').addEventListener('click', () => {
      this.openAddModal(this.currentDate);
    });

    this.dayTimeline.innerHTML = '';
    const dayEvents = filteredEvents.filter(e => isSameDay(new Date(e.startDate), d));

    if (dayEvents.length === 0) {
      this.dayTimeline.innerHTML = `
        <div class="text-center py-12 text-slate-400 dark:text-slate-500">
          <i data-lucide="calendar-x" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
          <p class="text-sm font-medium">Нет запланированных событий на этот день</p>
          <button class="mt-3 px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold" onclick="window.calendarApp.openAddModal(window.calendarApp.currentDate)">
            + Запланировать событие
          </button>
        </div>
      `;
      return;
    }

    dayEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    dayEvents.forEach(evt => {
      const card = document.createElement('div');
      const cat = CATEGORIES[evt.category] || CATEGORIES.work;
      const isDone = evt.status === 'completed';
      const prio = PRIORITIES[evt.priority] || PRIORITIES.medium;

      card.className = `p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start gap-4 transition hover:shadow-md ${isDone ? 'opacity-70' : ''}`;
      
      const timeStr = `${pad2(new Date(evt.startDate).getHours())}:${pad2(new Date(evt.startDate).getMinutes())}`;
      
      card.innerHTML = `
        <div class="text-center min-w-[50px] pt-0.5">
          <div class="text-sm font-bold text-slate-700 dark:text-slate-200">${timeStr}</div>
          <div class="text-[10px] text-slate-400">начало</div>
        </div>
        <div class="w-1 self-stretch rounded-full" style="background-color: ${evt.color || cat.color}"></div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold ${cat.bg}">${cat.name}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-md font-medium border ${prio.class}">${prio.label}</span>
            ${evt.planningDeadline ? `<span class="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">🎯 Срок: ${formatDisplayDate(evt.planningDeadline)}</span>` : ''}
          </div>
          <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white ${isDone ? 'line-through text-slate-400' : ''}">
            ${this.escapeHtml(evt.title)}
          </h4>
          ${evt.description ? `<p class="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">${this.escapeHtml(evt.description)}</p>` : ''}
        </div>
        <div class="flex items-center gap-1.5">
          <button class="btn-quick-check p-2 rounded-lg ${isDone ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'} transition" title="Отметить выполненным">
            <i data-lucide="check-circle" class="w-5 h-5"></i>
          </button>
        </div>
      `;

      card.querySelector('.btn-quick-check').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleEventCompletion(evt.id);
      });

      card.addEventListener('click', () => {
        this.openDetailModal(evt);
      });

      this.dayTimeline.appendChild(card);
    });
  }

  // --- 4. Planning Board (Kanban) Renderer ---
  renderPlanningView(filteredEvents) {
    this.columnScheduled.innerHTML = '';
    this.columnInProgress.innerHTML = '';
    this.columnCompleted.innerHTML = '';

    const scheduled = filteredEvents.filter(e => e.status === 'scheduled');
    const inProgress = filteredEvents.filter(e => e.status === 'in-progress');
    const completed = filteredEvents.filter(e => e.status === 'completed');

    this.planCountScheduled.textContent = scheduled.length;
    this.planCountInProgress.textContent = inProgress.length;
    this.planCountCompleted.textContent = completed.length;

    const renderCard = (evt) => {
      const card = document.createElement('div');
      const cat = CATEGORIES[evt.category] || CATEGORIES.work;
      const prio = PRIORITIES[evt.priority] || PRIORITIES.medium;
      const isDone = evt.status === 'completed';

      card.className = `kanban-card p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs select-none ${isDone ? 'completed' : ''}`;
      card.setAttribute('draggable', 'true');
      card.dataset.id = evt.id;

      // Countdown badge
      let deadlineHtml = '';
      if (evt.planningDeadline) {
        const days = this.getDaysUntil(evt.planningDeadline);
        let badgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        let text = `Через ${days} дн.`;
        if (days < 0) {
          badgeColor = 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 font-bold';
          text = `Просрочено на ${Math.abs(days)} дн.`;
        } else if (days === 0) {
          badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 font-bold';
          text = `Дедлайн сегодня!`;
        } else if (days === 1) {
          text = `Завтра`;
        }

        deadlineHtml = `
          <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span class="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <i data-lucide="target" class="w-3.5 h-3.5 text-indigo-500"></i>
              ${formatDisplayDate(evt.planningDeadline)}
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeColor}">${text}</span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold ${cat.bg}">${cat.name}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded font-medium border ${prio.class}">${prio.label}</span>
        </div>
        <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
          ${this.escapeHtml(evt.title)}
        </h4>
        ${evt.description ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${this.escapeHtml(evt.description)}</p>` : ''}
        ${deadlineHtml}
      `;

      card.addEventListener('click', () => {
        this.openDetailModal(evt);
      });

      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', evt.id);
        card.classList.add('opacity-50');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('opacity-50');
      });

      return card;
    };

    scheduled.forEach(e => this.columnScheduled.appendChild(renderCard(e)));
    inProgress.forEach(e => this.columnInProgress.appendChild(renderCard(e)));
    completed.forEach(e => this.columnCompleted.appendChild(renderCard(e)));
  }

  initKanbanDragAndDrop() {
    const cols = [this.columnScheduled, this.columnInProgress, this.columnCompleted];
    cols.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('bg-indigo-50/50', 'dark:bg-indigo-950/20');
      });
      col.addEventListener('dragleave', () => {
        col.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-950/20');
      });
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('bg-indigo-50/50', 'dark:bg-indigo-950/20');
        const id = e.dataTransfer.getData('text/plain');
        const targetStatus = col.dataset.status;
        if (id && targetStatus) {
          this.updateEventStatus(id, targetStatus);
        }
      });
    });
  }

  // --- 5. Agenda View Renderer ---
  renderAgendaView(filteredEvents) {
    this.agendaList.innerHTML = '';
    this.agendaCountBadge.textContent = `${filteredEvents.length} событий`;

    if (filteredEvents.length === 0) {
      this.agendaList.innerHTML = `
        <div class="text-center py-12 text-slate-400 dark:text-slate-500">
          <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
          <p class="text-sm font-medium">Нет событий, удовлетворяющих условиям фильтрации</p>
        </div>
      `;
      return;
    }

    // Sort by date ascending
    const sorted = [...filteredEvents].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Group by date string
    const groups = {};
    sorted.forEach(evt => {
      const dateKey = formatDateISO(new Date(evt.startDate));
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(evt);
    });

    Object.entries(groups).forEach(([dateStr, groupEvents]) => {
      const groupContainer = document.createElement('div');
      groupContainer.className = 'bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3';

      const d = new Date(dateStr);
      const isToday = isSameDay(d, new Date());
      
      groupContainer.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-slate-800 dark:text-white">${formatDisplayDate(dateStr)}</span>
            <span class="text-xs text-slate-400">(${WEEKDAY_NAMES_FULL[d.getDay()]})</span>
            ${isToday ? '<span class="text-[10px] px-2 py-0.2 rounded-full bg-indigo-600 text-white font-bold">Сегодня</span>' : ''}
          </div>
          <span class="text-xs text-slate-400 font-semibold">${groupEvents.length} соб.</span>
        </div>
        <div class="space-y-2"></div>
      `;

      const listDiv = groupContainer.querySelector('.space-y-2');
      groupEvents.forEach(evt => {
        const cat = CATEGORIES[evt.category] || CATEGORIES.work;
        const prio = PRIORITIES[evt.priority] || PRIORITIES.medium;
        const isDone = evt.status === 'completed';

        const row = document.createElement('div');
        row.className = `flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition ${isDone ? 'opacity-60' : ''}`;
        
        const timeStr = `${pad2(new Date(evt.startDate).getHours())}:${pad2(new Date(evt.startDate).getMinutes())}`;
        
        row.innerHTML = `
          <div class="flex items-center gap-3 min-w-0">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 min-w-[42px]">${timeStr}</span>
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${evt.color || cat.color}"></span>
            <div class="min-w-0">
              <div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate ${isDone ? 'line-through text-slate-400' : ''}">
                ${this.escapeHtml(evt.title)}
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] font-semibold ${cat.bg} px-1.5 py-0.2 rounded">${cat.name}</span>
                <span class="text-[10px] font-medium ${prio.class} px-1.5 py-0.2 rounded">${prio.label}</span>
                ${evt.planningDeadline ? `<span class="text-[10px] text-indigo-600 dark:text-indigo-400">🎯 До ${formatDisplayDate(evt.planningDeadline)}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button class="btn-agenda-complete p-1.5 rounded text-slate-400 hover:text-emerald-600" title="Завершить">
              <i data-lucide="${isDone ? 'check-circle' : 'circle'}" class="w-4 h-4"></i>
            </button>
          </div>
        `;

        row.querySelector('.btn-agenda-complete').addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleEventCompletion(evt.id);
        });

        row.addEventListener('click', () => {
          this.openDetailModal(evt);
        });

        listDiv.appendChild(row);
      });

      this.agendaList.appendChild(groupContainer);
    });
  }

  // --- Modals Logic ---
  openAddModal(presetDate = null) {
    this.eventForm.reset();
    this.eventId.value = '';
    this.modalTitle.innerHTML = '<i data-lucide="calendar-plus" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i> Новое событие';
    this.btnDeleteEvent.classList.add('hidden');

    const base = presetDate ? new Date(presetDate) : new Date();
    if (!presetDate) {
      base.setHours(new Date().getHours() + 1, 0, 0, 0);
    } else {
      base.setHours(10, 0, 0, 0);
    }
    const end = new Date(base);
    end.setHours(end.getHours() + 1);

    this.eventStartDateInput.value = formatDateTimeLocal(base);
    this.eventEndDateInput.value = formatDateTimeLocal(end);
    this.eventDeadlineInput.value = formatDateISO(base);

    this.eventCategorySelect.value = 'work';
    this.eventPrioritySelect.value = 'medium';
    this.eventStatusSelect.value = 'scheduled';
    this.eventColorInput.value = '#6366f1';

    this.colorDots.forEach(d => {
      if (d.dataset.color === '#6366f1') {
        d.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-500');
      } else {
        d.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-500');
      }
    });

    this.eventModal.classList.remove('hidden');
    this.eventTitleInput.focus();
    this.refreshIcons();
  }

  openEditModal(evt) {
    this.eventId.value = evt.id;
    this.modalTitle.innerHTML = '<i data-lucide="edit-3" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i> Редактирование события';
    this.btnDeleteEvent.classList.remove('hidden');

    this.eventTitleInput.value = evt.title || '';
    this.eventStartDateInput.value = evt.startDate || '';
    this.eventEndDateInput.value = evt.endDate || '';
    this.eventDeadlineInput.value = evt.planningDeadline || '';
    this.eventCategorySelect.value = evt.category || 'work';
    this.eventPrioritySelect.value = evt.priority || 'medium';
    this.eventStatusSelect.value = evt.status || 'scheduled';
    this.eventDescInput.value = evt.description || '';
    this.eventColorInput.value = evt.color || '#6366f1';

    this.colorDots.forEach(d => {
      if (d.dataset.color === evt.color) {
        d.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-500');
      } else {
        d.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-500');
      }
    });

    this.eventModal.classList.remove('hidden');
    this.eventTitleInput.focus();
    this.refreshIcons();
  }

  closeEventModal() {
    this.eventModal.classList.add('hidden');
  }

  handleFormSubmit() {
    const title = this.eventTitleInput.value.trim();
    if (!title) return;

    const id = this.eventId.value;
    const eventData = {
      id: id || uid(),
      title: title,
      startDate: this.eventStartDateInput.value,
      endDate: this.eventEndDateInput.value || this.eventStartDateInput.value,
      planningDeadline: this.eventDeadlineInput.value || '',
      category: this.eventCategorySelect.value,
      priority: this.eventPrioritySelect.value,
      status: this.eventStatusSelect.value,
      color: this.eventColorInput.value,
      description: this.eventDescInput.value.trim()
    };

    if (id) {
      // Edit existing
      const index = this.events.findIndex(e => e.id === id);
      if (index !== -1) {
        this.events[index] = eventData;
      }
      this.showToast('Событие успешно обновлено', 'success');
    } else {
      // Add new
      this.events.push(eventData);
      this.showToast('Новое событие добавлено в план', 'success');
    }

    this.saveEvents();
    this.closeEventModal();
    this.render();
  }

  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id);
    this.saveEvents();
    this.render();
    this.showToast('Событие удалено', 'info');
  }

  updateEventStatus(id, newStatus) {
    const evt = this.events.find(e => e.id === id);
    if (evt) {
      evt.status = newStatus;
      if (newStatus === 'completed') {
        this.triggerCelebration();
      }
      this.saveEvents();
      this.render();
    }
  }

  toggleEventCompletion(id) {
    const evt = this.events.find(e => e.id === id);
    if (evt) {
      const isCompleted = evt.status === 'completed';
      evt.status = isCompleted ? 'scheduled' : 'completed';
      if (!isCompleted) {
        this.triggerCelebration();
        this.showToast('Цель выполнена! Отличная работа! 🎉', 'success');
      }
      this.saveEvents();
      this.render();
      if (this.activeDetailEvent && this.activeDetailEvent.id === id) {
        this.openDetailModal(evt);
      }
    }
  }

  // --- Detail Preview Modal ---
  openDetailModal(evt) {
    this.activeDetailEvent = evt;
    const cat = CATEGORIES[evt.category] || CATEGORIES.work;
    const prio = PRIORITIES[evt.priority] || PRIORITIES.medium;
    const isDone = evt.status === 'completed';

    this.detailHeaderColor.style.backgroundColor = evt.color || cat.color;
    this.detailCategoryBadge.className = `text-xs px-2.5 py-0.5 rounded-full font-semibold ${cat.bg}`;
    this.detailCategoryBadge.textContent = cat.name;

    this.detailTitle.textContent = evt.title;
    this.detailDates.textContent = `${formatDisplayDateTime(evt.startDate)} – ${formatDisplayDateTime(evt.endDate)}`;

    if (evt.planningDeadline) {
      this.detailDeadlineRow.classList.remove('hidden');
      const days = this.getDaysUntil(evt.planningDeadline);
      let note = '';
      if (days < 0) note = ` (просрочено на ${Math.abs(days)} дн.)`;
      else if (days === 0) note = ' (сегодня!)';
      else note = ` (осталось ${days} дн.)`;

      this.detailDeadline.textContent = `Целевой дедлайн: ${formatDisplayDate(evt.planningDeadline)}${note}`;
    } else {
      this.detailDeadlineRow.classList.add('hidden');
    }

    this.detailPriority.textContent = `Приоритет: ${prio.label}`;
    
    let statusText = 'Запланировано';
    if (evt.status === 'in-progress') statusText = 'В процессе';
    if (evt.status === 'completed') statusText = 'Выполнено ✅';
    this.detailStatus.textContent = `Статус: ${statusText}`;

    if (evt.description) {
      this.detailDescContainer.textContent = evt.description;
      this.detailDescContainer.classList.remove('hidden');
    } else {
      this.detailDescContainer.classList.add('hidden');
    }

    if (isDone) {
      this.btnToggleCompleteDetail.innerHTML = '<i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> <span>Вернуть в план</span>';
      this.btnToggleCompleteDetail.className = 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 transition';
    } else {
      this.btnToggleCompleteDetail.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i> <span>Отметить как выполненное</span>';
      this.btnToggleCompleteDetail.className = 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 transition';
    }

    this.viewDetailModal.classList.remove('hidden');
    this.refreshIcons();
  }

  closeDetailModal() {
    this.viewDetailModal.classList.add('hidden');
    this.activeDetailEvent = null;
  }

  // --- Days calculation ---
  getDaysUntil(dateStr) {
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }

  // --- Confetti Animation ---
  triggerCelebration() {
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }

  // --- Toast notifications ---
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-600 text-white',
      error: 'bg-rose-600 text-white',
      info: 'bg-indigo-600 text-white'
    };
    toast.className = `toast-enter pointer-events-auto px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold ${colors[type] || colors.info}`;
    toast.innerHTML = `<span>${message}</span>`;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // --- iCalendar (.ics) Generator ---
  formatIcsDate(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}00Z`;
  }

  generateIcsContent(eventsList) {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PlanSphere//Calendar Web App//RU',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    eventsList.forEach(evt => {
      const dtStart = this.formatIcsDate(evt.startDate);
      const dtEnd = this.formatIcsDate(evt.endDate || evt.startDate);
      const nowStr = this.formatIcsDate(new Date().toISOString());

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${evt.id}@plansphere.app`);
      lines.push(`DTSTAMP:${nowStr}`);
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`DTEND:${dtEnd}`);
      lines.push(`SUMMARY:${evt.title.replace(/\n/g, ' ')}`);
      if (evt.description) {
        lines.push(`DESCRIPTION:${evt.description.replace(/\n/g, '\\n')}`);
      }
      if (evt.planningDeadline) {
        lines.push(`COMMENT:Целевой дедлайн: ${evt.planningDeadline}`);
      }
      lines.push('STATUS:CONFIRMED');
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  exportAllToIcs() {
    const icsData = this.generateIcsContent(this.events);
    this.downloadFile(icsData, 'plansphere-calendar.ics', 'text/calendar;charset=utf-8;');
    this.showToast('Календарь успешно экспортирован в .ics формат', 'success');
  }

  exportSingleEventIcs(evt) {
    const icsData = this.generateIcsContent([evt]);
    const safeName = evt.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_').substring(0, 20);
    this.downloadFile(icsData, `${safeName}.ics`, 'text/calendar;charset=utf-8;');
    this.showToast('Событие экспортировано в .ics', 'success');
  }

  exportToJson() {
    const jsonStr = JSON.stringify(this.events, null, 2);
    this.downloadFile(jsonStr, 'plansphere-backup.json', 'application/json');
    this.showToast('Резервная копия событий выгружена', 'success');
  }

  handleImportJson(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          this.events = data;
          this.saveEvents();
          this.render();
          this.showToast(`Успешно импортировано ${data.length} событий!`, 'success');
        } else {
          this.showToast('Неверный формат файла JSON', 'error');
        }
      } catch (err) {
        this.showToast('Ошибка при чтении файла', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Instantiate app on load
window.addEventListener('DOMContentLoaded', () => {
  window.calendarApp = new CalendarApp();
});
