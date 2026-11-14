import { isValidInvitation } from './guest.js';
// Page composition is data, too: wording, positions, fonts, colours and timing.
export const text = (value, y, size = 42, font = 'body', color = 'ink', extra = {}) =>
  ({ type: 'text', value, x: 540, y, width: 620, size, font, color, ...extra });
export const divider = (y) => ({ type: 'divider', y });
export const image = (asset, y, width, extra = {}) => ({ type: 'image', asset, x: 540, y, width, ...extra });

export function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}
export function dateParts(value) {
  const date = parseLocalDate(value);
  return { day: String(date.getDate()), month: date.toLocaleString('en', { month: 'long' }), year: String(date.getFullYear()) };
}
export function formatDate(value) {
  const p = dateParts(value);
  return p.day + ' ' + p.month + ' ' + p.year;
}
export function formatTime(value) {
  const [hour, minute] = value.split(':').map(Number);
  return String(hour % 12 || 12).padStart(2, '0') + ':' + String(minute).padStart(2, '0') + (hour >= 12 ? ' PM' : ' AM');
}
export function buildPages(d, c, a, guest = null) {
  if (!isValidInvitation(guest)) throw new Error('A valid invitation is required to render event pages.');
  const h = d.events.haldi, n = d.events.nikaah, np = dateParts(n.date);
  const footer = d.shortNames.toUpperCase() + '   •   ' + dateParts(h.date).month.toUpperCase() + ' ' + dateParts(h.date).year;
  const base = (id, label, duration, blocks, options = {}) =>
    ({ id, label, duration, theme: 'pink', zoom: 1.2, footer, settleAt: 6.5, blocks, ...options });
  const eventDirections = (event, y) => ({ type: 'directions', y, eventId: event.id, size: 90 });
  const all = [
    base('opening', 'Envelope', 5, [], { kind: 'opening', zoom: 1, footer: null }),
    base('greeting', 'Greeting', 3, [
      c.greeting.useCalligraphyImage
        ? image(a.greetingCalligraphy, 735, 540, { maxHeight: 280, alt: c.greeting.arabic, lang: 'ar' })
        : text(c.greeting.arabic, 760, 142, 'arabic', '#000000', { lang: 'ar', width: 700 }),
      text(c.greeting.english, 1040, 49, 'body', '#94505c', { weight: 600 }),
    ], { zoom: 1, footer: null, reveal: false }),
    base('blessings', 'Blessings', 8, [
      text(c.blessings.arabic, 480, 105, 'arabic', 'accent', { width: 540, lang: 'ar' }),
      divider(700), text(c.blessings.invocation, 775, 49, 'body', 'ink', { italic: true }),
      text(c.blessings.mercy, 865, 44), text(c.blessings.masoomeen, 1045, 44),
      divider(1240), image(a.crest, 1300, 165, { alt: 'MT wedding crest' }),
    ], { zoom: 1, footerY: 1670, smallCrest: false }),
    base('family', 'Family invitation', 13, [
      text(c.family.title, 470, 55, 'script', 'accent'),
      text('Mr. ' + d.parents.father + ' & Mrs. ' + d.parents.mother, 555, 37, 'body', 'ink', { weight: 600 }),
      text(c.family.invitation, 635, 33), divider(805),
      text(d.bride, 835, 72, 'script', 'accent'),
      text('(D/O Mr. ' + d.parents.father + ')', 945, 31),
      text(d.ceremony.brideLocation, 995, 31), text(c.family.connection, 1065, 40, 'script', 'accent'),
      text(d.groom, 1145, 68, 'script', 'accent'),
      text('(S/O ' + d.parents.groomFather + ')', 1250, 30), text(d.ceremony.groomLocation, 1320, 31),
    ], { revealSpan: 5.1 }),
    base('save-dates', 'Save the Dates', 10, [
      text(c.calendar.title, 450, 80, 'script', 'accent'),
      { type: 'calendar', y: 590, month: h.date, weekdays: c.calendar.weekdays, eventIds: [h.id, n.id] },
      divider(1310),
      text(dateParts(h.date).day + '  •  ' + h.title + '  •  ' + formatTime(h.time), 1380, 41, 'body', '#784c1a', { weight: 600 }),
      text(dateParts(n.date).day + '  •  ' + n.title + '  •  ' + formatTime(n.time), 1470, 41, 'body', '#7a0d1a', { weight: 600 }),
    ], { settleAt: 7.2 }),
    base('haldi', h.title, 10, [
      text(c.events.haldi.prelude, 450, 30, 'body', 'accent', { italic: true }),
      text(h.title, 520, 125, 'script', 'accent'), divider(720),
      text(c.events.haldi.invitation, 755, 42, 'body', 'ink', { italic: true }),
      text(formatDate(h.date), 935, 59, 'body', 'accent', { weight: 600 }),
      text(formatTime(h.time), 1020, 48), text(c.events.dinner, 1090, 33, 'body', 'ink', { italic: true }),
      divider(1150), text(h.venue, 1190, 51, 'body', 'ink', { weight: 600 }),
      text(h.address, 1275, 39), eventDirections(h, 1430),
    ], { theme: h.theme }),
    base('nikaah', n.title, 17, [
      text(c.events.nikaah.prelude, 455, 32, 'body', 'accent', { italic: true }),
      text(n.title, 510, 110, 'script', 'accent'),
      text(c.events.nikaah.invitation, 685, 35, 'body', 'ink', { italic: true }), divider(840),
      text(np.day, 855, 103, 'body', 'accent', { weight: 600 }),
      text(np.month.toUpperCase(), 980, 44, 'body', 'accent', { weight: 600 }),
      text(np.year, 1040, 50, 'body', 'accent', { weight: 600 }),
      text(formatTime(n.time), 1120, 44), text(c.events.dinner, 1180, 32, 'body', 'ink', { italic: true }),
      divider(1230), text(n.venue, 1260, 44, 'body', 'ink', { weight: 600 }),
      text(n.address, 1330, 35), eventDirections(n, 1440),
    ], { theme: n.theme, kind: 'nikaah', revealOffset: 4.6, revealSpan: 5.1, settleAt: 12 }),
    base('farewell', 'Farewell', 12, [
      text(c.farewell.arabic, 430, 76, 'arabic', 'accent', { lang: 'ar' }),
      text(c.farewell.thanks, 555, 50, 'arabic', 'accent', { lang: 'ar' }), divider(675),
      text(c.farewell.message, 725, 38, 'body', 'ink', { italic: true }),
      text(c.farewell.blessing, 890, 36, 'body', 'accent', { italic: true }),
      text(c.farewell.blessingArabic, 1080, 42, 'arabic', 'accent', { lang: 'ar', width: 650 }),
      divider(1310), text(c.farewell.compliments, 1360, 29, 'body', 'ink', { italic: true }),
      text(d.parents.father + ' & ' + d.parents.mother, 1418, 38, 'script', 'accent'),
      text(c.farewell.location, 1480, 27, 'body', 'accent'),
      image(a.crest, 1760, 110, { alt: 'MT wedding crest' }),
    ], { theme: 'farewell', footer: null, smallCrest: false, settleAt: 8 }),
  ];
  const eventIds = guest.events;
  const selected = Object.values(d.events).filter(event => eventIds.includes(event.id));
  if (!selected.length) throw new Error('Each guest must have at least one valid event.');
  return all.filter(page => !d.events[page.id] || eventIds.includes(page.id)).map(page => {
    if (page.id === 'greeting' && guest.name) page.blocks.push(text(guest.name, 1170, 49, 'script', 'accent', { guestName: true }));
    if (page.id === 'save-dates') {
      page.blocks = page.blocks.filter(block => !(block.y === 1380 && !eventIds.includes(h.id)) && !(block.y === 1470 && !eventIds.includes(n.id)));
      const calendar = page.blocks.find(block => block.type === 'calendar');
      calendar.month = selected[0].date;
      calendar.eventIds = selected.map(event => event.id);
      if (selected.length === 1) page.blocks[0].value = c.calendar.singleTitle;
    }
    return page;
  });
}
