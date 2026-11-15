/**
 * Конфигурация и константы приложения «Новогодний движ 2027»
 */

export const CONFIG = {
  APP_NAME: 'Новогодний движ 2027',
  APP_SUBTITLE: 'Планируем праздники вместе',
  TARGET_NEW_YEAR: new Date('2027-01-01T00:00:00'),
  HOLIDAY_WINDOW: {
    start: '2026-12-20',
    end: '2027-01-10'
  },
  DEFAULT_TIMEZONE: 'Europe/Moscow',
  
  // Ключи локального хранилища
  STORAGE_KEYS: {
    USER: 'ny2027_user_session',
    GROUP: 'ny2027_group_settings',
    DATA: 'ny2027_app_state_v1',
    THEME: 'ny2027_theme',
    SUPABASE_CONFIG: 'ny2027_supabase_cfg'
  },

  // Облачный endpoint по умолчанию (резервный kvdb.io для моментальной работы)
  KVDB_URL: 'https://kvdb.io/R4sWpSfetVkvDaeMNdAVWi',

  // Палитра категорий мероприятий
  CATEGORIES: {
    ny: {
      id: 'ny',
      name: 'Новый год',
      emoji: '🎄',
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.15)',
      border: '#f43f5e'
    },
    party: {
      id: 'party',
      name: 'Вечеринка',
      emoji: '🎉',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.15)',
      border: '#8b5cf6'
    },
    food: {
      id: 'food',
      name: 'Еда и кафе',
      emoji: '🍕',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: '#f59e0b'
    },
    games: {
      id: 'games',
      name: 'Игры',
      emoji: '🎮',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.15)',
      border: '#3b82f6'
    },
    cinema: {
      id: 'cinema',
      name: 'Кино',
      emoji: '🎬',
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.15)',
      border: '#a855f7'
    },
    trip: {
      id: 'trip',
      name: 'Поездка',
      emoji: '🚗',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.15)',
      border: '#06b6d4'
    },
    home: {
      id: 'home',
      name: 'Домашние посиделки',
      emoji: '🏠',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: '#10b981'
    },
    other: {
      id: 'other',
      name: 'Другое',
      emoji: '✨',
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.15)',
      border: '#94a3b8'
    }
  },

  // Статусы мероприятий
  STATUSES: {
    proposed: {
      id: 'proposed',
      label: 'Предложено',
      badgeClass: 'badge-proposed',
      emoji: '💡'
    },
    voting: {
      id: 'voting',
      label: 'Идёт голосование',
      badgeClass: 'badge-voting',
      emoji: '🗳️'
    },
    confirmed: {
      id: 'confirmed',
      label: 'Подтверждено',
      badgeClass: 'badge-confirmed',
      emoji: '✅'
    },
    cancelled: {
      id: 'cancelled',
      label: 'Отменено',
      badgeClass: 'badge-cancelled',
      emoji: '❌'
    },
    completed: {
      id: 'completed',
      label: 'Завершено',
      badgeClass: 'badge-completed',
      emoji: '🏁'
    }
  },

  // Набор праздничных аватаров
  AVATARS: [
    '🚀', '🦊', '⚡', '🦁', '🐻', '🐱',
    '🌟', '🎮', '🎯', '🔥', '👑', '🍕',
    '☕', '🎨', '💎', '🦄', '🍀', '🏖️',
    '🎄', '⛄', '🎅', '🎆', '🦉', '🎸'
  ],

  MONTH_NAMES: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ],

  MONTH_NAMES_GENITIVE: [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ],

  WEEKDAY_NAMES_SHORT: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
};
