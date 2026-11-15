/**
 * Модуль хранилища данных (Storage Engine)
 * Поддерживает:
 * - Локальный кэш (LocalStorage)
 * - Конфликт-устойчивую синхронизацию через Cloud KV
 * - Опциональный Supabase (PostgreSQL + Realtime)
 * - Автоматическую миграцию старых данных из kvdb/localStorage
 */

import { CONFIG } from './config.js';
import { createEvent, generateId } from './models.js';

export class StorageEngine {
  constructor() {
    this.supabaseClient = null;
    this.isSyncing = false;
    this.syncListeners = [];
    this.statusListeners = [];
    this.status = 'syncing'; // 'synced' | 'syncing' | 'offline' | 'error'
    this.state = this.getEmptyState();
  }

  getEmptyState() {
    return {
      group: {
        id: 'group_ny2027',
        name: CONFIG.APP_NAME,
        subtitle: CONFIG.APP_SUBTITLE,
        timezone: CONFIG.DEFAULT_TIMEZONE,
        organizerId: null,
        createdAt: new Date().toISOString()
      },
      users: {}, // { [userId]: User }
      events: [], // Array<Event>
      votes: [], // Array<Vote>
      rsvps: [], // Array<RSVP>
      comments: [], // Array<Comment>
      version: 1,
      lastSyncedAt: null
    };
  }

  onSync(callback) {
    this.syncListeners.push(callback);
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
    callback(this.status);
  }

  setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach(cb => cb(newStatus));
    }
  }

  // --- Инициализация хранилища ---
  async init() {
    // 1. Загружаем локальный кэш мгновенно
    this.loadFromLocal();

    // 2. Проверяем настройку Supabase
    this.initSupabaseIfConfigured();

    // 3. Выполняем миграцию существующих старых данных (если они есть)
    await this.migrateLegacyData();

    // 4. Запускаем облачную синхронизацию
    await this.syncWithCloud();

    // 5. Периодический опрос обновлений
    setInterval(() => {
      this.syncWithCloud();
    }, 7000);
  }

  // --- Работа с локальным кэшем ---
  loadFromLocal() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.DATA);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.events)) {
          this.state = {
            ...this.getEmptyState(),
            ...parsed
          };
        }
      }
    } catch (e) {
      console.warn('Ошибка чтения локального кэша', e);
    }
  }

  saveToLocal() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.DATA, JSON.stringify(this.state));
    } catch (e) {
      console.error('Ошибка записи локального кэша', e);
    }
  }

  // --- Профиль текущего пользователя ---
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  saveCurrentUser(user) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
      // Добавляем или обновляем в списке участников группы
      if (user && user.id) {
        this.state.users[user.id] = { ...user, lastSeenAt: new Date().toISOString() };
        if (!this.state.group.organizerId) {
          this.state.group.organizerId = user.id;
          user.role = 'organizer';
        }
        this.saveToLocal();
        this.syncWithCloud();
      }
    } catch (e) {}
  }

  // --- Миграция существующих данных ---
  async migrateLegacyData() {
    let migratedCount = 0;
    const existingIds = new Set(this.state.events.map(e => e.id));

    // Проверяем старый ключ localStorage
    const legacyKeys = ['simple_calendar_events_v3', 'simple_calendar_events_v2', 'simple_calendar_events'];
    for (const key of legacyKeys) {
      try {
        const legacy = localStorage.getItem(key);
        if (legacy) {
          const events = JSON.parse(legacy);
          if (Array.isArray(events)) {
            for (const ev of events) {
              if (ev && ev.title && !existingIds.has(ev.id)) {
                this.state.events.push(createEvent({
                  id: ev.id || generateId('migr'),
                  title: ev.title,
                  confirmedDate: ev.date || null,
                  authorName: ev.author || 'Друг',
                  authorEmoji: ev.emoji || '📌',
                  category: 'ny',
                  status: 'confirmed'
                }));
                existingIds.add(ev.id);
                migratedCount++;
              }
            }
          }
        }
      } catch (e) {}
    }

    // Проверяем удаленный kvdb endpoint на наличие старых событий
    try {
      const resp = await fetch(`${CONFIG.KVDB_URL}/events`, { cache: 'no-store' });
      if (resp.ok) {
        const kvEvents = await resp.json();
        if (Array.isArray(kvEvents)) {
          for (const ev of kvEvents) {
            if (ev && ev.title && !existingIds.has(ev.id)) {
              this.state.events.push(createEvent({
                id: ev.id || generateId('migr'),
                title: ev.title,
                confirmedDate: ev.date || null,
                authorName: ev.author || 'Друг',
                authorEmoji: ev.emoji || '📌',
                category: 'ny',
                status: 'confirmed'
              }));
              existingIds.add(ev.id);
              migratedCount++;
            }
          }
        }
      }
    } catch (e) {}

    // Добавляем красивый набор новогодних событий по умолчанию для атмосферы, если база пустая
    if (this.state.events.length === 0) {
      this.populateDefaultHolidayEvents();
      migratedCount++;
    }

    if (migratedCount > 0) {
      this.saveToLocal();
    }
  }

  populateDefaultHolidayEvents() {
    const defaultAuthor = { id: 'usr_init', name: 'Организатор', emoji: '🎄' };
    this.state.events = [
      createEvent({
        id: 'evt_ny_main',
        title: '🎄 Главная Новогодняя Ночь 2027!',
        category: 'ny',
        status: 'confirmed',
        confirmedDate: '2026-12-31',
        timeStart: '21:00',
        location: 'Загородный дом / лофт',
        description: 'Встречаем 2027 год вместе! Куранты, оливье, мандарины, подарки Тайного Санты и фейерверки.',
        budgetPerPerson: 4000
      }, defaultAuthor),
      createEvent({
        id: 'evt_ny_banya',
        title: '🧖 Новогодняя баня и шашлыки',
        category: 'party',
        status: 'voting',
        location: 'Банный комплекс на озере',
        description: 'Отличный способ прогреться перед или сразу после праздников.',
        budgetPerPerson: 2500,
        dateOptions: [
          { id: 'opt_1', date: '2026-12-28', timeStart: '15:00' },
          { id: 'opt_2', date: '2027-01-02', timeStart: '14:00' },
          { id: 'opt_3', date: '2027-01-03', timeStart: '14:00' }
        ]
      }, defaultAuthor),
      createEvent({
        id: 'evt_ny_ice',
        title: '⛸️ Каток в парке и глинтвейн',
        category: 'trip',
        status: 'confirmed',
        confirmedDate: '2027-01-04',
        timeStart: '16:00',
        location: 'Центральный каток',
        description: 'Катаемся под новогоднюю музыку, затем идём греться в кофейню.',
        budgetPerPerson: 1000
      }, defaultAuthor),
      createEvent({
        id: 'evt_ny_games',
        title: '🎲 Ночь настолок и пицца',
        category: 'games',
        status: 'proposed',
        location: 'У кого-нибудь дома',
        description: 'D&D, Мафия, Codenames, плойка и вкусная еда.',
        budgetPerPerson: 800,
        dateOptions: [
          { id: 'opt_g1', date: '2027-01-06', timeStart: '17:00' },
          { id: 'opt_g2', date: '2027-01-07', timeStart: '17:00' }
        ]
      }, defaultAuthor)
    ];

    // Базовые голоса для демонстрации
    this.state.votes = [
      { id: 'v1', eventId: 'evt_ny_banya', dateOptionId: 'opt_2', userId: 'usr_init', userName: 'Организатор', userEmoji: '🎄', vote: 'yes', updatedAt: new Date().toISOString() },
      { id: 'v2', eventId: 'evt_ny_banya', dateOptionId: 'opt_3', userId: 'usr_init', userName: 'Организатор', userEmoji: '🎄', vote: 'maybe', updatedAt: new Date().toISOString() }
    ];

    // Базовые RSVP
    this.state.rsvps = [
      { id: 'r1', eventId: 'evt_ny_main', userId: 'usr_init', userName: 'Организатор', userEmoji: '🎄', status: 'going', updatedAt: new Date().toISOString() }
    ];

    // Базовый комментарий
    this.state.comments = [
      { id: 'c1', eventId: 'evt_ny_main', userId: 'usr_init', userName: 'Организатор', userEmoji: '🎄', content: 'Кто принесёт гитару и колонку? 🎸', createdAt: new Date().toISOString() }
    ];
  }

  // --- Конфликт-устойчивая синхронизация ---
  async syncWithCloud() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.setStatus('syncing');

    try {
      // Если настроен Supabase — синхронизируемся через него
      if (this.supabaseClient) {
        await this.syncWithSupabase();
        this.setStatus('synced');
        this.isSyncing = false;
        return;
      }

      // Иначе используем надежный Cloud KV с трёхсторонним слиянием (Three-Way Merge)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const resp = await fetch(`${CONFIG.KVDB_URL}/ny2027_state`, {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      let remoteState = null;
      if (resp.ok) {
        const text = await resp.text();
        if (text && text.trim().length > 0) {
          remoteState = JSON.parse(text);
        }
      }

      let hasChanges = false;
      if (remoteState && typeof remoteState === 'object') {
        hasChanges = this.mergeStates(remoteState);
      } else {
        // Первый раз — отправляем начальное состояние
        await this.pushStateToCloud();
        hasChanges = false;
      }

      if (hasChanges) {
        this.saveToLocal();
        this.notifyListeners();
      }

      this.setStatus('synced');
    } catch (e) {
      // При ошибке сети остаёмся на локальном кэше
      this.setStatus('offline');
    } finally {
      this.isSyncing = false;
    }
  }

  // Интеллектуальное слияние данных: предотвращает перезапись чужих событий и голосов
  mergeStates(remote) {
    let changed = false;

    // 1. Слияние настроек группы
    if (remote.group && (!this.state.group || new Date(remote.group.updatedAt || 0) > new Date(this.state.group.updatedAt || 0))) {
      this.state.group = { ...this.state.group, ...remote.group };
      changed = true;
    }

    // 2. Слияние пользователей (объединение по ID)
    if (remote.users && typeof remote.users === 'object') {
      for (const [userId, u] of Object.entries(remote.users)) {
        if (!this.state.users[userId] || new Date(u.lastSeenAt || 0) > new Date(this.state.users[userId].lastSeenAt || 0)) {
          this.state.users[userId] = u;
          changed = true;
        }
      }
    }

    // 3. Слияние мероприятий (по ID и updatedAt)
    const localEventsMap = new Map(this.state.events.map(e => [e.id, e]));
    if (Array.isArray(remote.events)) {
      for (const remEv of remote.events) {
        const locEv = localEventsMap.get(remEv.id);
        if (!locEv) {
          localEventsMap.set(remEv.id, remEv);
          changed = true;
        } else if (new Date(remEv.updatedAt || 0) > new Date(locEv.updatedAt || 0)) {
          localEventsMap.set(remEv.id, remEv);
          changed = true;
        }
      }
    }
    this.state.events = Array.from(localEventsMap.values());

    // 4. Слияние голосов (уникальный ключ: dateOptionId + userId)
    const votesKey = v => `${v.dateOptionId}_${v.userId}`;
    const localVotesMap = new Map(this.state.votes.map(v => [votesKey(v), v]));
    if (Array.isArray(remote.votes)) {
      for (const remV of remote.votes) {
        const k = votesKey(remV);
        const locV = localVotesMap.get(k);
        if (!locV || new Date(remV.updatedAt || 0) > new Date(locV.updatedAt || 0)) {
          localVotesMap.set(k, remV);
          changed = true;
        }
      }
    }
    this.state.votes = Array.from(localVotesMap.values());

    // 5. Слияние подтверждений участия (RSVP: eventId + userId)
    const rsvpKey = r => `${r.eventId}_${r.userId}`;
    const localRsvpMap = new Map(this.state.rsvps.map(r => [rsvpKey(r), r]));
    if (Array.isArray(remote.rsvps)) {
      for (const remR of remote.rsvps) {
        const k = rsvpKey(remR);
        const locR = localRsvpMap.get(k);
        if (!locR || new Date(remR.updatedAt || 0) > new Date(locR.updatedAt || 0)) {
          localRsvpMap.set(k, remR);
          changed = true;
        }
      }
    }
    this.state.rsvps = Array.from(localRsvpMap.values());

    // 6. Слияние комментариев (уникальный ID)
    const commentMap = new Map(this.state.comments.map(c => [c.id, c]));
    if (Array.isArray(remote.comments)) {
      for (const remC of remote.comments) {
        if (!commentMap.has(remC.id)) {
          commentMap.set(remC.id, remC);
          changed = true;
        }
      }
    }
    this.state.comments = Array.from(commentMap.values());

    return changed;
  }

  async pushStateToCloud() {
    this.setStatus('syncing');
    try {
      await fetch(`${CONFIG.KVDB_URL}/ny2027_state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state)
      });
      this.setStatus('synced');
    } catch (e) {
      this.setStatus('offline');
    }
  }

  notifyListeners() {
    this.syncListeners.forEach(cb => cb(this.state));
  }

  // --- CRUD Операции ---

  async addEvent(eventData, currentUser) {
    const newEvent = createEvent(eventData, currentUser);
    this.state.events.unshift(newEvent);
    this.saveToLocal();
    this.notifyListeners();
    await this.pushStateToCloud();
    return newEvent;
  }

  async updateEvent(eventId, updates, currentUser) {
    const idx = this.state.events.findIndex(e => e.id === eventId);
    if (idx === -1) return null;

    const existing = this.state.events[idx];
    // Проверка прав: автор или организатор
    const isOrganizer = currentUser && currentUser.role === 'organizer';
    const isAuthor = currentUser && existing.authorId === currentUser.id;
    if (!isOrganizer && !isAuthor) {
      throw new Error('Только автор мероприятия или организатор могут редактировать его.');
    }

    this.state.events[idx] = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToLocal();
    this.notifyListeners();
    await this.pushStateToCloud();
    return this.state.events[idx];
  }

  async deleteEvent(eventId, currentUser) {
    const existing = this.state.events.find(e => e.id === eventId);
    if (!existing) return false;

    const isOrganizer = currentUser && currentUser.role === 'organizer';
    const isAuthor = currentUser && existing.authorId === currentUser.id;
    if (!isOrganizer && !isAuthor) {
      throw new Error('Только автор мероприятия или организатор могут удалить его.');
    }

    this.state.events = this.state.events.filter(e => e.id !== eventId);
    this.state.votes = this.state.votes.filter(v => v.eventId !== eventId);
    this.state.rsvps = this.state.rsvps.filter(r => r.eventId !== eventId);
    this.state.comments = this.state.comments.filter(c => c.eventId !== eventId);

    this.saveToLocal();
    this.notifyListeners();
    await this.pushStateToCloud();
    return true;
  }

  async castVote(eventId, dateOptionId, currentUser, voteType) {
    // voteType: 'yes' | 'maybe' | 'no'
    const idx = this.state.votes.findIndex(v => v.dateOptionId === dateOptionId && v.userId === currentUser.id);
    const voteRecord = {
      id: idx !== -1 ? this.state.votes[idx].id : generateId('vote'),
      eventId,
      dateOptionId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmoji: currentUser.emoji,
      vote: voteType,
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      this.state.votes[idx] = voteRecord;
    } else {
      this.state.votes.push(voteRecord);
    }

    this.saveToLocal();
    this.notifyListeners();
    await this.pushStateToCloud();
    return voteRecord;
  }

  async setRSVP(eventId, currentUser, status) {
    // status: 'going' | 'maybe' | 'not_going'
    const idx = this.state.rsvps.findIndex(r => r.eventId === eventId && r.userId === currentUser.id);
    const rsvpRecord = {
      id: idx !== -1 ? this.state.rsvps[idx].id : generateId('rsvp'),
      eventId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmoji: currentUser.emoji,
      status: status,
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      this.state.rsvps[idx] = rsvpRecord;
    } else {
      this.state.rsvps.push(rsvpRecord);
    }

    this.saveToLocal();
    this.notifyListeners();
    await this.pushStateToCloud();
    return rsvpRecord;
  }

  async addComment(eventId, currentUser, content) {
    const comment = {
      id: generateId('cmt'),
      eventId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmoji: currentUser.emoji,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    this.state.comments.push(comment);
    this.saveToLocal();
    this.notifyListeners();
    await this.pushStateToCloud();
    return comment;
  }

  async updateGroupSettings(updates, currentUser) {
    if (currentUser && currentUser.role !== 'organizer' && this.state.group.organizerId) {
      throw new Error('Только организатор может изменять настройки группы.');
    }
    this.state.group = {
      ...this.state.group,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToLocal();
    this.notifyListeners();
    await this.pushStateToCloud();
    return this.state.group;
  }

  // --- Supabase Интеграция ---
  initSupabaseIfConfigured() {
    try {
      const cfgRaw = localStorage.getItem(CONFIG.STORAGE_KEYS.SUPABASE_CONFIG);
      if (cfgRaw) {
        const { url, key } = JSON.parse(cfgRaw);
        if (url && key && window.supabase) {
          this.supabaseClient = window.supabase.createClient(url, key);
        }
      }
    } catch (e) {}
  }

  async configureSupabase(url, key) {
    if (!url || !key) {
      this.supabaseClient = null;
      localStorage.removeItem(CONFIG.STORAGE_KEYS.SUPABASE_CONFIG);
      this.syncWithCloud();
      return false;
    }

    if (window.supabase) {
      this.supabaseClient = window.supabase.createClient(url, key);
      localStorage.setItem(CONFIG.STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify({ url, key }));
      await this.syncWithCloud();
      return true;
    }
    return false;
  }

  async syncWithSupabase() {
    if (!this.supabaseClient) return;
    // Чтение через Supabase REST
    const { data: evts, error: evError } = await this.supabaseClient.from('events').select('*');
    if (!evError && Array.isArray(evts)) {
      this.mergeStates({ events: evts });
      this.saveToLocal();
      this.notifyListeners();
    }
  }
}
