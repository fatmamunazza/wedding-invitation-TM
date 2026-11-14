import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { guests, validateGuests } from '../src/data/guest.js';
import { invitationMetadata, metadataTags, siteUrl } from '../src/data/sharing.js';

export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function renderMetadata(html, guest, origin) {
  const meta = invitationMetadata(guest, origin);
  const head = [
    `<title>${escapeHtml(meta.title)}</title>`,
    ...metadataTags(meta).map(([attribute, name, content]) => `<meta ${attribute}="${name}" content="${escapeHtml(content)}" />`),
    `<link rel="canonical" href="${escapeHtml(meta.url)}" />`,
  ].join('\n    ');
  const marker = /<!-- invitation-meta:start -->[\s\S]*?<!-- invitation-meta:end -->/;
  if (!marker.test(html)) throw new Error('Missing invitation metadata markers in index.html');
  return html.replace(marker, `<!-- invitation-meta:start -->\n    ${head}\n    <!-- invitation-meta:end -->`);
}

export async function generatePreviews() {
  validateGuests(guests);
  const origin = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : siteUrl);
  if (!/^https?:$/.test(new URL(origin).protocol)) throw new Error('SITE_URL must be an http(s) URL');
  const root = new URL('../dist/', import.meta.url);
  const template = await readFile(new URL('index.html', root), 'utf8');
  await writeFile(new URL('index.html', root), renderMetadata(template, null, origin));
  // Directory index files work with ordinary static hosting and direct refreshes.
  for (const guest of guests) {
    const directory = new URL(`invite/${guest.token}/`, root);
    await mkdir(directory, { recursive: true });
    const html = renderMetadata(template, guest, origin);
    await writeFile(new URL('index.html', directory), html);
    // Vite and hosts that resolve extensionless HTML also need this entry.
    await writeFile(new URL(`invite/${guest.token}.html`, root), html);
  }
  await writeFile(new URL('404.html', root), renderMetadata(template, undefined, origin));
  console.log(`Generated ${guests.length} static invitation previews for ${origin}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generatePreviews();
