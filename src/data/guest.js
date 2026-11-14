// Share /invite/{id}. Use event IDs from weddingDetails.js.
// Replace these examples with your guest list before sharing the app.
export const guests = [
  { id: 'ali-family', name: 'Ali & Family', events: ['haldi', 'nikaah'] },
  { id: 'haldi-guest', name: 'Haldi Guest & Family', events: ['haldi'] },
  { id: 'nikaah-guest', name: 'Nikaah Guest & Family', events: ['nikaah'] },
];

export function guestFromPath(pathname, base = '/') {
  const prefix = base.endsWith('/') ? base : base + '/';
  const relative = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname.replace(/^\//, '');
  const match = /^invite\/([^/]+)\/?$/.exec(relative);
  if (!match) return relative === '' || relative === 'index.html' ? null : undefined;
  let id;
  try { id = decodeURIComponent(match[1]); } catch { return undefined; }
  return guests.find(guest => guest.id === id);
}
