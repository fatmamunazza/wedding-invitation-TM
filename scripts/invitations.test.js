import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { guests, guestFromPath, validateGuests } from '../src/data/guest.js';
import { createInvitation } from '../src/data/index.js';
import { invitationMetadata, previewImages } from '../src/data/sharing.js';
import { renderMetadata } from './generate-invite-previews.js';
const general = guests.find(g => g.type === 'general');
const special = guests.find(g => g.type === 'special');

test('root and removed/unknown/malformed tokens never resolve an invitation', () => {
  assert.equal(guestFromPath('/'), null);
  for (const path of ['/invite', '/invite/', '/haldi', '/nikaah', '/invite/unknown1', '/invite/%ZZ', '/invite/__proto__', '/invite/constructor', '/invite/' + special.token + '/haldi', '/invite/ali-family']) {
    assert.equal(guestFromPath(path), undefined, path);
  }
  assert.equal(guestFromPath('/invite/' + general.token), general);
  assert.equal(guestFromPath('/invite/' + special.token + '/'), special);
  assert.equal(guestFromPath('/invite/shazia')?.name, 'Ali & Family');
  assert.equal(guestFromPath('/wedding/invite/' + general.token, '/wedding/'), general);
  assert.equal(guestFromPath('/wrong/invite/' + general.token, '/wedding/'), undefined);
  assert.equal(guestFromPath('/invite/' + general.token.toLowerCase()), undefined);
});

test('query parameters and hashes do not select extra events', () => {
  for (const suffix of ['?event=haldi', '?type=special&events=haldi,nikaah', '#haldi']) {
    const url = new URL('/invite/' + general.token + suffix, 'https://example.com');
    assert.deepEqual(guestFromPath(url.pathname).events, ['nikaah']);
    assert.equal(guestFromPath(new URL('/' + suffix, url).pathname), null);
  }
});

test('invalid configs, duplicate tokens and missing invitation fail closed', () => {
  assert.throws(() => validateGuests([general, general]), /Duplicate/);
  for (const guest of [null, undefined, { ...general, events: ['haldi', 'nikaah'] }, { ...general, events: [] }, { ...special, events: ['nikaah', 'nikaah'] }, { ...general, type: 'unknown' }, { ...general, token: '' }]) {
    assert.throws(() => createInvitation(guest));
  }
});

test('all rendered event content, navigation and calendar hearts respect permissions', () => {
  const invitation = createInvitation(general);
  assert.deepEqual(invitation.pages.filter(p => ['haldi', 'nikaah'].includes(p.id)).map(p => p.id), ['nikaah']);
  assert.ok(!JSON.stringify(invitation).includes('Haldi'));
  assert.ok(!JSON.stringify(invitation).includes('At Our Residence'));
  assert.ok(JSON.stringify(invitation).includes('07:00 PM'));
  assert.ok(JSON.stringify(invitation).includes('Parmeshwar Banquet Hall'));
  const both = createInvitation(special);
  assert.deepEqual(both.pages.filter(p => ['haldi', 'nikaah'].includes(p.id)).map(p => p.id), ['haldi', 'nikaah']);
});

test('static share HTML has one correct preview and event-specific descriptions without JavaScript', async () => {
  const template = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const guest of [null, undefined, general, special]) {
    const html = renderMetadata(template, guest, 'https://example.com');
    assert.equal((html.match(/property="og:image"/g) || []).length, 1);
    assert.equal((html.match(/name="twitter:image"/g) || []).length, 1);
    assert.ok(html.includes(invitationMetadata(guest, 'https://example.com').image));
    assert.equal(html.includes('Haldi'), guest === special);
    if (!guest) assert.ok(!/January|PM|Parmeshwar/.test(html));
  }
  for (const preview of Object.values(previewImages)) await access(new URL('../public/' + preview.path, import.meta.url));
});
