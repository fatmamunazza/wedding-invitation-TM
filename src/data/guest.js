import { invitationCopy } from './invitationCopy.js';

// Generate a token with: npm run invite:new -- general "Guest Name"
// Types and permitted events must agree. Tokens are case-sensitive; never recycle them.
export const invitationTypes = Object.freeze({
  general: Object.freeze(['nikaah']),
  special: Object.freeze(['haldi', 'nikaah']),
});

export function isValidInvitation(guest) {
  const allowed = guest && Object.hasOwn(invitationTypes, guest.type) && invitationTypes[guest.type];
  return Boolean(allowed && typeof guest.token === 'string' && guest.token.length > 0 && typeof guest.name === 'string'
    && Array.isArray(guest.events) && guest.events.length === allowed.length
    && new Set(guest.events).size === allowed.length && allowed.every(id => guest.events.includes(id))
    && (guest.greetingId === undefined || Object.hasOwn(invitationCopy.greetings, guest.greetingId)));
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
  { token: 't_tmNikah', name: '', type: 'general', events: ['nikaah'], greetingId: 'traditional' },
  { token: 't_tmCelebrations', name: '', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'traditional' },
  { token: 'f_tmNikah', name: '', type: 'general', events: ['nikaah'], greetingId: 'friendly' },
  { token: 'f_tmCelebrations', name: '', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'friendly' },
  { token: 'shazia', name: 'Shazia & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'traditional' },
  { token: 'fatima', name: 'Fatima & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'traditional' },
  { token: 'tehseen', name: 'Tehseen & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'traditional' },
  { token: 'rabab', name: 'Rabab & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'traditional' },
  { token: 'ariba', name: 'Ariba & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'traditional' },
  { token: 'aeysha', name: 'Aeysha & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'traditional' },
  { token: 'akriti', name: 'Akriti & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'friendly' },
  { token: 'jagriti', name: 'Jagriti & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'friendly' },
  { token: 'komal', name: 'Komal & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'friendly' },
  { token: 'anupriya', name: 'Anupriya & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'friendly' },
  { token: 'raghav', name: 'Raghav, Kanchan & Family', type: 'special', events: ['haldi', 'nikaah'], greetingId: 'friendly' }
]).map(guest => Object.freeze({
  ...guest,
  events: Object.freeze([...guest.events]),
})));

// null = generic welcome; undefined = invalid. Search/hash never determine events.
export function guestFromPath(pathname, base = '/') {
  const prefix = base.endsWith('/') ? base : base + '/';
  if (pathname === prefix || pathname === prefix + 'index.html') return null;
  if (!pathname.startsWith(prefix)) return undefined;
  const match = /^invite\/([^/]+)\/?$/.exec(pathname.slice(prefix.length));
  if (!match) return undefined;
  let token;
  try { token = decodeURIComponent(match[1]); } catch { return undefined; }
  return guests.find(guest => guest.token === token);
}
