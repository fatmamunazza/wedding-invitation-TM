import { assets } from './assets.js';
import { weddingDetails } from './weddingDetails.js';
import { formatDate, formatTime } from './pages.js';
import { isValidInvitation } from './guest.js';

// Override at build time with SITE_URL=https://your-domain.com (or Vercel's production URL).
export const siteUrl = 'https://wedding-invitation-munazza-tajdar.vercel.app';
export const previewImages = {
  welcome: { path: assets.crest, type: 'image/png', width: 1242, height: 1237, alt: 'Munazza and Tajdar wedding monogram' },
  general: { path: 'assests/Munazza-Tajdar-Nikaah-Invitation.jpeg', type: 'image/jpeg', width: 887, height: 1774, alt: 'Munazza and Tajdar — Nikaah invitation' },
  special: { path: 'assests/Invitation-Munazza-Tajdar.jpeg', type: 'image/jpeg', width: 921, height: 1708, alt: 'Munazza and Tajdar — Haldi and Nikaah invitation' },
};

export function invitationMetadata(guest, origin = siteUrl) {
  const valid = isValidInvitation(guest);
  const preview = previewImages[valid ? guest.type : 'welcome'];
  const path = valid ? '/invite/' + guest.token : '/';
  const description = valid
    ? guest.events.map(id => {
      const event = weddingDetails.events[id];
      return `${event.title}: ${formatDate(event.date)}, ${formatTime(event.time)}, ${event.venue}.`;
    }).join(' ') + ' We invite you to celebrate this blessed union.'
    : 'Welcome to the wedding of Munazza Fatma and Tajdar Abbas Rizvi. Please use your personal invitation link.';
  return {
    title: guest === undefined ? 'Invitation not found · Munazza & Tajdar' : weddingDetails.shortNames + ' · Wedding Invitation',
    description, preview, image: new URL('/' + preview.path, origin).href,
    url: new URL(path, origin).href,
  };
}

export function metadataTags(meta) {
  return [
    ['name', 'description', meta.description], ['name', 'robots', 'noindex, nofollow'],
    ['property', 'og:type', 'website'], ['property', 'og:site_name', 'Munazza & Tajdar'],
    ['property', 'og:title', meta.title], ['property', 'og:description', meta.description],
    ['property', 'og:url', meta.url], ['property', 'og:image', meta.image],
    ['property', 'og:image:secure_url', meta.image], ['property', 'og:image:type', meta.preview.type],
    ['property', 'og:image:width', String(meta.preview.width)], ['property', 'og:image:height', String(meta.preview.height)],
    ['property', 'og:image:alt', meta.preview.alt], ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', meta.title], ['name', 'twitter:description', meta.description],
    ['name', 'twitter:image', meta.image], ['name', 'twitter:image:alt', meta.preview.alt],
  ];
}
