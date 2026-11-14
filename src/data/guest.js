// Generate a token with: npm run invite:new -- general "Guest Name"
// Types and permitted events must agree. Tokens are case-sensitive; never recycle them.
export const invitationTypes = Object.freeze({
  general: Object.freeze(['nikaah']),
  special: Object.freeze(['haldi', 'nikaah']),
});
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

export function isValidInvitation(guest) {
  const allowed = guest && Object.hasOwn(invitationTypes, guest.type) && invitationTypes[guest.type];
  return Boolean(allowed && typeof guest.token === 'string' && TOKEN_PATTERN.test(guest.token) && typeof guest.name === 'string'
    && Array.isArray(guest.events) && guest.events.length === allowed.length
    && new Set(guest.events).size === allowed.length && allowed.every(id => guest.events.includes(id)));
}

export function validateGuests(entries) {
  const seen = new Set();
  for (const guest of entries) {
    if (!isValidInvitation(guest)) throw new Error('Invalid invitation configuration: ' + (guest?.token || 'missing token'));
    if (seen.has(guest.token)) throw new Error('Duplicate invitation token: ' + guest.token);
    seen.add(guest.token);
  }
  return entries;
}

export const guests = Object.freeze(validateGuests([
  { token: 'K9e_L2xT7zDBrbme', name: '', type: 'general', events: ['nikaah'] },
  { token: 'VwVUp3gC-nzVOUa9', name: 'Ali & Family', type: 'special', events: ['haldi', 'nikaah'] },
]).map(guest => Object.freeze({ ...guest, events: Object.freeze([...guest.events]) })));

// null = generic welcome; undefined = invalid. Search/hash never determine events.
export function guestFromPath(pathname, base = '/') {
  const prefix = base.endsWith('/') ? base : base + '/';
  if (pathname === prefix || pathname === prefix + 'index.html') return null;
  if (!pathname.startsWith(prefix)) return undefined;
  const match = /^invite\/([A-Za-z0-9_-]{8,64})\/?$/.exec(pathname.slice(prefix.length));
  return match ? guests.find(guest => guest.token === match[1]) : undefined;
}
