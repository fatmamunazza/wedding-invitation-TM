import { randomBytes } from 'node:crypto';
import { guests, invitationTypes } from '../src/data/guest.js';
import { siteUrl } from '../src/data/sharing.js';
const [type, ...name] = process.argv.slice(2);
if (!Object.hasOwn(invitationTypes, type)) {
  console.error('Usage: npm run invite:new -- general|special "Guest Name"');
  process.exitCode = 1;
} else {
  let token;
  do { token = randomBytes(12).toString('base64url'); } while (guests.some(guest => guest.token === token));
  console.log('Add this entry to the guests array in src/data/guest.js:');
  console.log(JSON.stringify({ token, name: name.join(' '), type, events: invitationTypes[type] }, null, 2) + ',');
  console.log('\nAfter saving, rebuild and redeploy. Share:');
  console.log(new URL('/invite/' + token, process.env.SITE_URL || siteUrl).href);
}
