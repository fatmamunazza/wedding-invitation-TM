import test from 'node:test';
import { rosePetals } from '../src/data/motion.js';
import { roseAt } from '../src/lib/motion.js';
import { guestFromPath, guests } from '../src/data/guest.js';
import { layoutPage, artworkPaths } from '../src/data/responsive.js';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { weddingDetails, invitationCopy, assets, settings, createInvitation } from '../src/data/index.js';
import { buildPages, dateParts, formatTime, parseLocalDate } from '../src/data/pages.js';

const special = { ...guests.find(guest => guest.type === 'special'), name: '' };
const { pages, totalDuration } = createInvitation(special);

test('the approved sequence and latest event times are preserved', () => {
  assert.deepEqual(pages.map(page => page.id), ['opening', 'greeting', 'blessings', 'family', 'save-dates', 'haldi', 'nikaah', 'farewell']);
  assert.equal(totalDuration, 78);
  assert.equal(settings.audio.offsetSeconds, 72);
  assert.equal(formatTime(weddingDetails.events.haldi.time), '06:00 PM');
  assert.equal(formatTime(weddingDetails.events.nikaah.time), '07:00 PM');
  assert.equal(pages.find(page => page.id === 'greeting').blocks.length, 2);
});
test('editing family and event data propagates to all relevant page compositions', () => {
  const custom = structuredClone(weddingDetails);
  custom.bride = 'Updated Bride';
  custom.events.haldi.time = '17:30';
  custom.events.haldi.venue = 'Updated Venue';
  const changed = buildPages(custom, invitationCopy, assets, special);
  const values = page => page.blocks.filter(block => block.type === 'text').map(block => block.value).flat();
  assert.ok(values(changed.find(page => page.id === 'family')).includes('Updated Bride'));
  assert.ok(values(changed.find(page => page.id === 'haldi')).includes('05:30 PM'));
  assert.ok(values(changed.find(page => page.id === 'haldi')).includes('Updated Venue'));
  assert.ok(values(changed.find(page => page.id === 'save-dates')).some(value => value.includes('05:30 PM')));
});
test('dates are parsed as calendar dates without UTC timezone shifts', () => {
  const date = parseLocalDate('2028-02-29');
  assert.equal(date.getDate(), 29);
  assert.deepEqual(dateParts('2027-01-16'), { day: '16', month: 'January', year: '2027' });
  assert.equal(formatTime('00:05'), '12:05 AM');
  assert.equal(formatTime('12:00'), '12:00 PM');
});
test('every configured image and audio file is local to public/assests', () => {
  for (const path of Object.values(assets)) {
    assert.ok(path.startsWith('assests/'), path);
    assert.ok(existsSync(resolve('public', path)), path);
  }
  assert.equal(new Set(settings.pageOrder).size, settings.pageOrder.length);
  for (const page of pages) assert.ok(page.duration > 0);
});

test('desktop uses dedicated artwork while preserving the mobile content', () => {
  const original = structuredClone(pages);
  for (const page of pages) {
    const mobile = layoutPage(page, 'mobile');
    const desktop = layoutPage(page, 'desktop');
    assert.deepEqual(mobile.blocks, page.blocks);
    assert.equal(desktop.canvas.width, 1920);
    assert.equal(desktop.canvas.height, 1080);
    assert.equal(desktop.blocks.length, page.blocks.length);
    assert.equal(desktop.duration, page.duration);
  }
  assert.deepEqual(pages, original);
  assert.ok(artworkPaths('desktop').includes(assets.pinkBackgroundDesktop));
  assert.ok(!artworkPaths('desktop').includes(assets.pinkBackground));
  assert.ok(Object.values(assets).every(path => !path.endsWith('.mp4')));
  assert.ok(artworkPaths('mobile').includes(assets.pinkBackground));
  assert.ok(!artworkPaths('mobile').includes(assets.pinkBackgroundDesktop));
});

test('guest invitations filter scenes, calendar hearts and event summaries together', () => {
  for (const ids of [['nikaah'], ['haldi', 'nikaah']]) {
    const invitation = createInvitation({ token: 'TestToken1234', type: ids.length === 1 ? 'general' : 'special', name: 'Test Family', events: ids });
    const eventPages = invitation.timeline.filter(page => ['haldi', 'nikaah'].includes(page.id));
    assert.deepEqual(eventPages.map(page => page.id), ids);
    const greeting = invitation.timeline.find(page => page.id === 'greeting');
    assert.equal(greeting.blocks.find(block => block.guestName).value, 'Test Family');
    assert.equal(invitation.timeline[0].greeting, greeting);
    const calendar = invitation.pages.find(page => page.id === 'save-dates');
    assert.deepEqual(calendar.blocks.find(block => block.type === 'calendar').eventIds, ids);
    const summary = calendar.blocks.filter(block => [1380, 1470].includes(block.y));
    assert.equal(summary.length, ids.length);
    for (const id of ['haldi', 'nikaah'].filter(id => !ids.includes(id))) {
      assert.ok(!JSON.stringify(calendar).includes(weddingDetails.events[id].title));
    }
    assert.equal(invitation.totalDuration, invitation.pages.reduce((sum, page) => sum + page.duration, 0));
    invitation.timeline.forEach((page, index) => assert.equal(page.start, invitation.pages.slice(0, index).reduce((sum, item) => sum + item.duration, 0)));
  }
});
test('greeting preset is selected by each invite greetingId', () => {
  const guest = guests.find(item => item.type === 'general');
  const friendlyGreeting = createInvitation({ ...guest, greetingId: 'friendly' }).timeline.find(page => page.id === 'greeting').blocks;
  assert.ok(friendlyGreeting.some(block => block.type === 'text' && block.value === invitationCopy.greetings.friendly.arabic));
  assert.ok(friendlyGreeting.some(block => block.type === 'text' && block.value === invitationCopy.greetings.friendly.english));
  assert.equal(friendlyGreeting.some(block => block.type === 'image'), false);
  const defaultGreeting = createInvitation(guest).timeline.find(page => page.id === 'greeting').blocks;
  assert.ok(defaultGreeting.some(block => block.type === 'image' && block.alt === 'السلام عليكم'));
  assert.ok(defaultGreeting.some(block => block.type === 'text' && block.value === 'Assalamu Alaikum'));
  assert.throws(() => createInvitation({ ...guest, greetingId: 'unknown' }));
});
test('v19 closing and invitation copy preserve the approved wording and placement', () => {
  assert.equal(pages.find(page => page.id === 'greeting').duration, 3);
  assert.ok(!pages.some(page => page.id === 'prayer'));
  assert.ok(invitationCopy.events.nikaah.invitation.includes('this blessed union'));
  const closing = pages.find(page => page.id === 'farewell');
  assert.equal(closing.duration, 12);
  assert.equal(closing.footer, null);
  assert.ok(closing.blocks.some(block => block.type === 'image' && block.y === 1760));
  assert.ok(closing.blocks.some(block => String(block.value).includes('Akbar Ali & Ruby Ali')));
  assert.ok(!closing.blocks.some(block => String(block.value).includes('15 & 16')));
});
test('Nikaah petals descend continuously without jumping sideways or wrapping', () => {
  for (const petal of rosePetals) {
    assert.equal(roseAt(petal, petal.birth - 0.01), null);
    let previous;
    for (let time = Math.max(0, petal.birth); time < 18; time += 1 / 24) {
      const position = roseAt(petal, time);
      if (!position) continue;
      if (previous) {
        assert.ok(position.y >= previous.y);
        assert.ok(Math.abs(position.x - previous.x) < 2);
        assert.ok(position.y - previous.y < 9);
      }
      previous = position;
    }
  }
});
