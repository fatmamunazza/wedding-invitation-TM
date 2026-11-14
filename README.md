# Munazza & Tajdar — React Wedding Invitation

A responsive React + Vite application based on the final approved invitation video. It follows video v19 with the original artwork, ornamental salam, compact MT crest, colour themes and updated animation choreography.

## Run

Use Node.js 22.12 or newer.

    npm install
    npm run dev

Open the local URL printed by Vite.

    npm test
    npm run build
    npm run preview

The production output is in **dist/**. Serve that folder using any static web host. Open it through an HTTP server; opening index.html directly as a file does not run a Vite app.

## Edit the invitation

All editable content and presentation data is in **src/data/**:

| File | What to change |
| --- | --- |
| guest.js | Guest IDs, display names and invited event IDs |
| weddingDetails.js | Couple and parents, locations, event dates, times, venues, address lines and map links |
| invitationCopy.js | Greetings, blessings, invitation wording, dinner line, closing blessing and family compliments |
| assets.js | Image and music paths |
| themes.js | Theme backgrounds and ink/accent colours |
| settings.js | Page order, music offset/volume, timing, effects, typography, player labels and couple/envelope animation settings |
| pages.js | Individual page layouts, block positions, font sizes, page durations and reveal timing |
| responsive.js | Desktop canvas, layout positions, calendar spacing and responsive breakpoint |
| motion.js | Positions and settings for sparkles and falling petals |

For example, an event time is a 24-hour local value:

    time: '18:00'

It automatically appears as **06:00 PM** on both the Haldi page and the save-the-dates page. Dates use YYYY-MM-DD; the calendar, date labels and heart locations derive from those values. The calendar uses the Haldi event's month. Keep both event dates in that month to show both hearts.

Each event has a location pin icon. Clicking/tapping it opens that event’s configured Google Maps link in a new tab.

The greeting's ornate Arabic and the MT crest are artwork so that they retain the approved lettering. Replace their image files to change that artwork. To show editable Arabic text instead, set **greeting.useCalligraphyImage** to false in invitationCopy.js and edit greeting.arabic.

## Images and sound

All images and audio are in **public/assests/**, using the spelling requested. The image paths in assets.js are relative to public/. The photographic backgrounds are lossless WebP copies of the approved PNGs; conversion was checked for identical decoded pixels. The calligraphy, crest and couple are transparent PNGs.

The font stack uses the video's Baskerville, Snell Roundhand and Geeza Pro when installed. Locally bundled Cormorant Garamond, Pinyon Script and Amiri are the portable fallbacks. Font appearance can vary slightly across operating systems; the imagery and composition stay fixed. Font licences are included in public/assests/licenses/.

## Experience and controls

- Seven invitation pages plus the opening: envelope → greeting → blessings → family → save the dates → Haldi → Nikaah → farewell.
- Haldi: 15 January 2027, 06:00 PM; Nikaah: 16 January 2027, 08:00 PM. Both are followed by dinner.
- Phones use the original 9:16 artwork. Landscape screens at least 768px wide use dedicated 16:9 desktop artwork, a wider arch, and separately arranged text, calendar, location icons and couple image. The invitation fills the viewport.
- Clicking anywhere on the closed envelope starts the 78-second sequence and begins the music at 01:12 of the supplied track. Browsers require this user interaction to start sound.
- After opening the envelope, three controls appear overlaid at the bottom of the artwork: previous arrow, Start/Pause, and next arrow. A single music icon appears at the top right; it rotates while music is playing and toggles sound off/on without stopping the scene animation. The closed envelope has no visible playback or music controls. There is no separate toolbar, progress bar, page selector or fullscreen button.
- The invitation uses one URL. Scene changes stay in React state and do not add page names, hashes or history entries to the link. Reloading returns to the closed envelope.
- Space toggles playback; arrow keys navigate pages when focus is outside a form or button.
- Playback advances automatically until paused. While playing, an arrow starts the chosen page and playback continues. While paused, an arrow shows the chosen page fully revealed for reading. The same Start button restarts the invitation after it finishes.
- Playback pauses when the tab is hidden. Decorative floating effects respect the operating system's reduced-motion setting.

The app has no backend, sign-in, analytics or external runtime content requests. The supplied music is kept local. No image generation service is called by the app.

## Validation

npm test checks the latest approved sequence/time values, data propagation between event and calendar pages, local date handling, and configured asset paths. The app was also built successfully and checked in the browser at mobile and desktop viewport sizes.

## Desktop artwork

The four desktop backgrounds were created with the built-in ImageGen tool using the approved portrait artwork as visual references. Prompts requested a 16:9 ivory carved floral arch and lakeside setting, broad blank central space, lace and lantern, with matching pastel pink, yellow Haldi and maroon Nikaah variants. The envelope prompt requested symmetrical ivory embossed doors, pink satin ribbon, pearl tassels and an empty central oval for the existing MT crest. No text was generated into the artwork. Files: desktop-pink.webp, desktop-haldi.webp, desktop-nikaah.webp and desktop-envelope.webp in public/assests/. Mobile artwork is preserved.

## Guest invitations and share previews

The root `/` shows a generic wedding welcome with no dates, venues or event list.
`/invite/{token}` opens only the events configured for that token. Unknown tokens,
old named IDs and other routes show “Invitation not found”; they never fall back
 to either invitation. Query parameters and hash fragments cannot add events.

Manage entries in **src/data/guest.js**. Each has `token`, `name`, `type` and `events`:

- `general`: `events: ['nikaah']` — Nikaah only.
- `special`: `events: ['haldi', 'nikaah']` — both celebrations.

The build validates type/event consistency and duplicate tokens. Names may be blank.
Two working entries are included:

- General: `/invite/K9e_L2xT7zDBrbme`
- Special (Ali & Family): `/invite/VwVUp3gC-nzVOUa9`

Generate a fresh random token using Node's built-in crypto (no new package):

```sh
npm run invite:new -- general "Guest Name & Family"
npm run invite:new -- special "Guest Name & Family"
```

Copy the printed entry into the `guests` array in **src/data/guest.js**, then run
`npm test` and `npm run build`, and redeploy `dist`. Share the printed URL using
your actual website domain. Generate a separate token for each guest if desired;
do not change a general token to special after sharing it. To revoke a link,
remove its entry and rebuild/redeploy. Existing named links are intentionally invalid.

**src/data/sharing.js** selects the existing Nikaah-only or Haldi + Nikaah JPEG in
`public/assests/`. The public root uses the MT crest with no event details.
**scripts/generate-invite-previews.js** writes one static HTML entry per token
(`dist/invite/{token}.html` and a matching directory index) containing the correct Open Graph/Twitter tags
and the same React app. This is a build step, not a backend or server-rendered app.
This lets sharing crawlers read the correct preview without executing JavaScript.

Set `siteUrl` in **src/data/sharing.js** to your deployed domain. Alternatively:

```sh
SITE_URL=https://your-domain.com npm run build
```

On Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is used automatically when available;
`SITE_URL` takes precedence. The supplied **vercel.json** serves actual static files
first, then falls back to the React entry for invalid routes. Directory index files
support direct visits and refreshes on valid invitations. For another static host,
retain directory-index serving and add an SPA fallback for unknown paths. No new
packages or runtime services are required. The app remains a single React experience;
scene navigation never changes the URL.

Preview images contain printed details: update the JPEGs if you change dates or times.
WhatsApp/social services may cache previews or crop portrait images; a new token
usually gets a fresh preview. Test after deployment; localhost cannot be crawled publicly.

This is intentionally frontend-only. Tokens prevent accidental disclosure through
ordinary navigation, not inspection of bundled JavaScript or public images. Anyone
with a valid special link can open or forward it. No authentication is provided.

## Video v19 update

- Greeting holds for 3 seconds after the envelope opening; the full two-event sequence lasts 78 seconds.
- Nikaah says “Together with our families, we invite you to witness this blessed union”.
- The prayer scene is removed. The closing uses the English/Arabic blessing and best compliments from Akbar Ali & Ruby Ali, Patna, Bihar, with dusty-rose type, two fine dividers and the MT crest on the tiles below the frame.
- Blush/ivory falling petals and slower roaming sparkles appear on selected pages. The petal PNGs and deterministic motion data are taken from the v19 rendering source.
- Nikaah uses staggered births, gravity, shared breeze, soft rotation and folding. Petals leave naturally without wrapping or snapping to side lanes. The couple eases right over 2 seconds.
- Calendar hearts shine as they draw, pulse continuously and carry a moving champagne highlight. Heart timing is editable in settings.calendarHearts.
- Effects use the same playback clock, so pausing freezes motion, shimmer and text reveals together. Reduced-motion preferences hide the decorative particles and extra heart shimmer.
- The closing controls sit above the floor crest to keep the logo visible.

The latest guest URLs, local Google Maps location-pin links, responsive desktop artwork, hidden initial controls and top-right music toggle are retained. Both events remain in the general invitation; guest.js can restrict an invitation to either event. The extra sharing-cover scene from video v20 is not included.

## Taller desktop backgrounds

The pink, Haldi and Nikaah desktop backgrounds now have taller blank panels, more compact upper ornaments and much narrower tiled-floor strips. Generated with the built-in ImageGen tool as precise edits of the original backgrounds: preserve scene, palette, floral arch, lace, lantern, columns and lake; lower the bottom frame and compact the top ornament to increase blank writing height by about 20–25%; no text or logo baked into the art. The closing crest is scaled down to fit the remaining tiles outside the frame. Mobile backgrounds and desktop envelope artwork are unchanged.

## Narrower desktop centre and richer side scenery

The three desktop themes use new coordinated artwork with a narrower tall ivory writing panel, paired lanterns, layered silk/lace, larger floral urns, candle groups and more visible lakeside architecture. Built-in ImageGen edits used the preceding desktop backgrounds as references; prompts requested a centred clear writing panel, preserving the established theme colours and a narrow floor, with decorative detail confined to the side areas and no generated text/logos. Desktop text width and location-pin positions are fitted to this panel. Mobile art, copy, guest filtering and animation settings are preserved.

## Rounded gumbad desktop frame

The desktop panels now follow the original mobile frame’s rounded dome and stepped/scalloped shoulders. Built-in ImageGen used each desktop background as the edit target and welcome-pastel-pink.webp as the architecture reference: preserve side decoration, palette and wide aspect ratio; replace the flat rectangular crown with a raised rounded gumbad, without a sharp conical point. The map pins are inset to remain inside the revised frame. No mobile artwork, wording or animations were changed.

## Generate and download a video at runtime

After opening the envelope, tap the download icon below the music icon. The app renders a new portrait invitation from **src/data/** and the images/music in **public/assests/**. It shows a progress preview and Cancel button. When finished, tap **Save video**. The underlying invitation pauses during export and its controls are not included in the movie.

There is **no pre-rendered MP4 asset**. Changing names, event dates, wording, page order, artwork, music offset or animation settings changes the next generated video. The export always keeps the current invitation’s permitted events and calendar hearts. The 'generic' scope only omits the guest name; 'guest' includes it. Download visibility stays at your existing settings.download.enabled value (currently false).

The export always uses mobile artwork and coordinates, even from a desktop screen. Settings in **settings.download** control dimensions (default 1080×1920), frame rate (24), video/audio bitrate, filename, scope and visibility. The current generic sequence produces 78 seconds. Music is decoded only for the selected interval, starts at settings.audio.offsetSeconds (72), follows the configured volume, and fades at the beginning/end.

**src/export/portraitRenderer.js** paints the portrait scenes, text/Arabic, envelope, calendar hearts, particles and couple animation to a canvas using the same page definitions and shared motion helpers. **src/export/exportPortraitVideo.js** uses Mediabunny and the browser’s WebCodecs encoders to build a fresh H.264/AAC MP4 in memory. The encoder code loads only on demand. **src/components/VideoExport.jsx** handles progress, cancellation, the local Blob save link and cleanup. No recording permission, server render, pre-generated video or screen capture is used.

MP4 export requires browser support for H.264/AAC encoding and MP3 decoding. The app checks this and shows a clear error if unavailable; no static-file fallback is used. Use an up-to-date desktop browser if a phone lacks the encoders or sufficient memory. Serve over HTTPS or localhost. Keep the tab open during export; rendering time depends on the device. Output is held in memory until the export dialog is closed, then released. System fonts/fallbacks can produce small typography differences from the original native-rendered v19 movie.

Validated by generating and saving a complete video through the app: H.264 1080×1920 at 24 fps, AAC stereo, approximately 78 seconds; all frames/audio decoded successfully. Cancel was also checked in the browser.
