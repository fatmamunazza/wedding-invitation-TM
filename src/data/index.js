import { weddingDetails } from './weddingDetails.js';
import { invitationCopy } from './invitationCopy.js';
import { assets } from './assets.js';
import { settings } from './settings.js';
import { themes } from './themes.js';
import { buildPages } from './pages.js';

export { weddingDetails, invitationCopy, assets, settings, themes };
export function createInvitation(guest = null) {
  const definitions = buildPages(weddingDetails, invitationCopy, assets, guest);
  const pages = settings.pageOrder.map(id => definitions.find(page => page.id === id)).filter(Boolean);
  let start = 0;
  const timeline = pages.map((page, index) => {
    const scene = { ...page, index, start };
    start += page.duration;
    return scene;
  });
  const greeting = timeline.find(page => page.id === 'greeting');
  timeline.find(page => page.id === 'opening').greeting = greeting;
  return { pages, timeline, totalDuration: start };
}
export const { pages, timeline, totalDuration } = createInvitation();
export const assetUrl = path => import.meta.env.BASE_URL + path.replace(/^\/+/, '');
