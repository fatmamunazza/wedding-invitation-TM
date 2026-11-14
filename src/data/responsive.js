import { assets } from './assets.js';

export const responsive = {
  desktopMedia: '(min-width: 768px) and (orientation: landscape)',
  mobileCanvas: { width: 1080, height: 1920 },
  desktopCanvas: { width: 1920, height: 1080 },
  desktop: {
    centerX: 960, textWidth: 700, fontScale: 0.78, verticalScale: 0.58, verticalOffset: -20,
    footerY: 940, footerSize: 17, crestY: 970, crestWidth: 32,
    opening: { centerY: 540, crestWidth: 130 },
    couple: { introWidth: 440, restingWidth: 150, restingTop: 850, rightMargin: 240 },
    calendar: { centerStart: 690, columnWidth: 90, monthY: 310, monthSize: 38,
      weekdayY: 365, weekdaySize: 24, gridY: 415, rowHeight: 55, daySize: 28, heartScale: 0.78 },
  },
};

export function layoutPage(source, mode = 'mobile') {
  const canvas = mode === 'desktop' ? responsive.desktopCanvas : responsive.mobileCanvas;
  if (mode !== 'desktop') return { ...source, canvas, layout: 'mobile' };
  const d = responsive.desktop;
  const page = { ...source, canvas, layout: 'desktop', zoom: 1,
    revealTop: source.blocks.length ? Math.min(...source.blocks.map(block => block.y)) : 0,
    revealBottom: source.footer ? (source.zoom === 1 ? 1670 : 1880) : (source.blocks.length ? Math.max(...source.blocks.map(block => block.y)) : 1920),
    footerRevealY: source.footerY ?? 1755, footerY: d.footerY, footerSize: d.footerSize,
    crestY: d.crestY, crestWidth: d.crestWidth };
  page.blocks = source.blocks.map(block => {
    const next = { ...block, revealY: block.y, x: d.centerX, y: block.y * d.verticalScale + d.verticalOffset };
    if (block.type === 'text') {
      next.width = d.textWidth;
      next.size = block.size * d.fontScale;
    }
    if (block.type === 'image') next.width = block.width * 0.9;
    if (block.type === 'directions') Object.assign(next, { x: 1240, y: 750, size: 75 });
    if (block.type === 'calendar') Object.assign(next, { y: d.calendar.monthY, calendarLayout: d.calendar });
    if (source.id === 'greeting') {
      if (block.type === 'image') Object.assign(next, { y: 300, width: 560, maxHeight: 300 });
      else Object.assign(next, block.guestName ? { y: 760, size: 48 } : { y: 650, size: 44 });
    }
    if (source.id === 'save-dates' && block.type === 'text' && block.y === 450) Object.assign(next, { y: 240, size: 62 });
    if (source.id === 'haldi') {
      const positions = { 935: [530, 42], 1020: [590, 36], 1090: [640, 25], 1150: [690], 1190: [720, 39], 1275: [790, 28] };
      if (positions[block.y]) {
        next.y = positions[block.y][0];
        if (positions[block.y][1]) next.size = positions[block.y][1];
      }
    }
    if (source.id === 'nikaah') {
      if (block.y === 1330 && Array.isArray(block.value)) next.value = block.value.join(' ');
      if (block.y === 685 && Array.isArray(block.value)) next.value = [block.value[0] + ' ' + block.value[1], block.value[2]];
      const positions = { 455: [280, 22], 510: [320, 72], 685: [430, 24], 840: [515], 855: [540, 58],
        980: [620, 30], 1040: [660, 30], 1120: [710, 30], 1180: [750, 23], 1230: [790],
        1260: [815, 32], 1330: [870, 24] };
      if (positions[block.y]) {
        next.y = positions[block.y][0];
        if (positions[block.y][1]) next.size = positions[block.y][1];
      }
    }
    if (source.id === 'farewell') {
      const positions = {430:[260,48], 555:[340,34], 675:[415], 725:[450,26], 890:[545,25],
        1080:[640,30], 1310:[755], 1360:[780,22], 1418:[820,32], 1480:[850,22], 1760:[1038]};
      if (positions[block.y]) {
        next.y = positions[block.y][0];
        if (positions[block.y][1]) next.size = positions[block.y][1];
      }
      if (block.type === 'image') next.width = 30;
      if (block.y === 890 && Array.isArray(block.value)) next.value = [block.value[0] + ' ' + block.value[1], block.value[2]];
      if (block.y === 1080 && Array.isArray(block.value)) next.value = [block.value[0], block.value[1] + ' ' + block.value[2]];
    }
    return next;
  });
  return page;
}

export function artworkPaths(mode) {
  const desktop = mode === 'desktop';
  const photoKeys = ['pinkBackground', 'haldiBackground', 'nikaahBackground', 'envelope'];
  return [...new Set(Object.entries(assets).filter(([key]) => key !== 'music' &&
    (key.endsWith('Desktop') ? desktop : !desktop || !photoKeys.includes(key))).map(([, path]) => path))];
}
