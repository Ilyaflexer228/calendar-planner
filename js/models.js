/**
 * Модели данных и фабричные функции для приложения «Новогодний движ 2027»
 */

export function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Фабрика пользователя с защищённым идентификатором
 */
export function createUser(name, emoji = '🚀', role = 'member') {
  return {
    id: generateId('usr'),
    name: name.trim(),
    emoji: emoji,
    role: role, // 'organizer' | 'member'
    clientToken: generateId('tok'),
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString()
  };
}

/**
 * Фабрика мероприятия
 */
export function createEvent(data, currentUser) {
  const isDirectlyConfirmed = Boolean(data.confirmedDate && !data.dateOptions?.length);
  const status = data.status || (isDirectlyConfirmed ? 'confirmed' : (data.dateOptions?.length > 1 ? 'voting' : 'proposed'));

  // Нормализуем варианты дат
  let dateOptions = [];
  if (Array.isArray(data.dateOptions) && data.dateOptions.length > 0) {
    dateOptions = data.dateOptions.map(opt => ({
      id: opt.id || generateId('opt'),
      date: opt.date,
      timeStart: opt.timeStart || data.timeStart || null
    }));
  } else if (data.confirmedDate) {
    dateOptions = [{
      id: generateId('opt'),
      date: data.confirmedDate,
      timeStart: data.timeStart || null
    }];
  }

  return {
    id: data.id || generateId('evt'),
    title: (data.title || '').trim(),
    category: data.category || 'party',
    status: status, // 'proposed' | 'voting' | 'confirmed' | 'cancelled' | 'completed'
    authorId: currentUser ? currentUser.id : (data.authorId || null),
    authorName: currentUser ? currentUser.name : (data.authorName || 'Друг'),
    authorEmoji: currentUser ? currentUser.emoji : (data.authorEmoji || '🚀'),
    confirmedDate: data.confirmedDate || (isDirectlyConfirmed ? dateOptions[0]?.date : null),
    timeStart: data.timeStart || null,
    timeEnd: data.timeEnd || null,
    location: (data.location || '').trim() || null,
    locationUrl: (data.locationUrl || '').trim() || null,
    description: (data.description || '').trim() || null,
    budgetPerPerson: data.budgetPerPerson ? Number(data.budgetPerPerson) : 0,
    dateOptions: dateOptions,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Фабрика голоса за дату
 */
export function createVote(eventId, dateOptionId, user, voteType) {
  return {
    id: generateId('vote'),
    eventId: eventId,
    dateOptionId: dateOptionId,
    userId: user.id,
    userName: user.name,
    userEmoji: user.emoji,
    vote: voteType, // 'yes' | 'maybe' | 'no'
    updatedAt: new Date().toISOString()
  };
}

/**
 * Фабрика подтверждения участия (RSVP)
 */
export function createRSVP(eventId, user, status) {
  return {
    id: generateId('rsvp'),
    eventId: eventId,
    userId: user.id,
    userName: user.name,
    userEmoji: user.emoji,
    status: status, // 'going' | 'maybe' | 'not_going'
    updatedAt: new Date().toISOString()
  };
}

/**
 * Фабрика комментария к событию
 */
export function createComment(eventId, user, content) {
  return {
    id: generateId('cmt'),
    eventId: eventId,
    userId: user.id,
    userName: user.name,
    userEmoji: user.emoji,
    content: (content || '').trim(),
    createdAt: new Date().toISOString()
  };
}
