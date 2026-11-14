import { assets, assetUrl, settings, themes, weddingDetails } from '../data/index.js';
import { layoutPage } from '../data/responsive.js';
import { dateParts, parseLocalDate } from '../data/pages.js';
import { lights, pastelPetals, rosePetals } from '../data/motion.js';
import { roseAt, pastelAt, heartPoint } from '../lib/motion.js';
import { clamp, ease, smooth, fadeFor } from '../lib/animation.js';

const W = 1080, H = 1920;
const canvas = () => Object.assign(document.createElement('canvas'), { width: W, height: H });

export async function preparePortraitRenderer(invitation, target, signal) {
  const imageFiles = [...new Set(Object.entries(assets).filter(([key, path]) => key !== 'music' && /\.(png|webp|jpe?g)$/i.test(path) && !key.endsWith('Desktop')).map(([, path]) => path))];
  const images = new Map();
  await Promise.all(imageFiles.map(async path => {
    signal.throwIfAborted();
    const img = new Image(); img.src = assetUrl(path); await img.decode(); images.set(path, img);
  }));
  await Promise.all([
    document.fonts.load('48px ' + settings.typography.body),
    document.fonts.load('italic 48px ' + settings.typography.body),
    document.fonts.load('600 48px ' + settings.typography.body),
    document.fonts.load('48px ' + settings.typography.script),
    document.fonts.load('48px Amiri', 'بَارَكَ اللَّهُ فِي هَذَا الْعَرِيسَيْنِ'),
    document.fonts.load('48px ' + settings.typography.arabic, 'بَارَكَ اللَّهُ فِي هَذَا الْعَرِيسَيْنِ'),
  ]);
  await document.fonts.ready;
  signal.throwIfAborted();
  const pages = invitation.timeline.map(page => layoutPage(page, 'mobile'));
  const a = canvas(), b = canvas();
  const ctx = target.getContext('2d', { alpha: false });
  target.width = settings.download.width; target.height = settings.download.height;
  const textCache = new Map();
  const image = (c, path, x, y, width, maxHeight = Infinity, opacity = 1, centerY = false) => {
    const img = images.get(path); if (!img || opacity <= 0) return;
    let h = width * img.height / img.width;
    if (h > maxHeight) { width *= maxHeight / h; h = maxHeight; }
    c.save(); c.globalAlpha *= opacity; c.drawImage(img, x - width / 2, y - (centerY ? h / 2 : 0), width, h); c.restore();
  };
  function background(c, path, zoom = 1) {
    const img = images.get(path), ratio = Math.max(W / img.width, H / img.height) * zoom;
    c.drawImage(img, (W - img.width * ratio) / 2, (H - img.height * ratio) / 2, img.width * ratio, img.height * ratio);
  }
  function text(c, block, theme, opacity) {
    if (opacity <= 0) return;
    const key = JSON.stringify(block);
    let layout = textCache.get(key);
    if (!layout) {
      const lines = Array.isArray(block.value) ? block.value : String(block.value).split('\n');
      let size = block.size;
      const font = () => (block.italic ? 'italic ' : '') + (block.weight || 400) + ' ' + size + 'px ' + settings.typography[block.font || 'body'];
      c.font = font();
      while (Math.max(...lines.map(line => c.measureText(line).width)) > (block.width || 620) && size > Math.min(18, block.size)) { size--; c.font = font(); }
      layout = { lines, size, font: font() }; textCache.set(key, layout);
    }
    c.save(); c.globalAlpha *= opacity; c.font = layout.font; c.fillStyle = theme[block.color] || block.color || theme.ink;
    c.textAlign = 'center'; c.textBaseline = 'top'; c.direction = block.lang === 'ar' ? 'rtl' : 'ltr';
    layout.lines.forEach((line, i) => c.fillText(line, block.x || 540, block.y + i * layout.size * (block.lang === 'ar' ? 1.5 : 1.3)));
    c.restore();
  }
  function divider(c, y, color, opacity) {
    c.save(); c.globalAlpha *= opacity; c.strokeStyle = color; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(390, y); c.lineTo(510, y); c.moveTo(570, y); c.lineTo(690, y); c.globalAlpha *= .65; c.stroke();
    c.globalAlpha = opacity; c.fillStyle = color; c.beginPath(); c.moveTo(540, y - 7); c.lineTo(547, y); c.lineTo(540, y + 7); c.lineTo(533, y); c.closePath(); c.fill(); c.restore();
  }
  function pin(c, block, color, opacity) {
    c.save(); c.globalAlpha *= opacity; c.translate(540 - block.size / 2, block.y); c.scale(block.size / 48, block.size / 48);
    c.fillStyle = color; c.globalAlpha *= .08; c.beginPath(); c.arc(24, 24, 22, 0, Math.PI * 2); c.fill(); c.globalAlpha = opacity;
    c.strokeStyle = color; c.lineWidth = 2; c.beginPath(); c.moveTo(35, 20); c.bezierCurveTo(35, 28, 24, 38, 24, 38); c.bezierCurveTo(24, 38, 13, 28, 13, 20); c.arc(24, 20, 11, Math.PI, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(24, 20, 4, 0, Math.PI * 2); c.stroke(); c.restore();
  }
  function effects(c, page, time) {
    if (settings.effects.sparkles) for (const [i, l] of lights.entries()) {
      const x = l.x + 60 * Math.sin(time * .28 + l.phase + page.index * .3);
      const y = 240 + ((l.y - time * (19 + i % 5 * 3)) % 1430 + 1430) % 1430;
      const opacity = (page.id === 'greeting' ? .95 : x < 190 || x > 890 ? .88 : .34) * (.45 + .55 * Math.sin(time * .8 + l.phase) ** 2);
      c.save(); c.globalAlpha = opacity; const gradient = c.createRadialGradient(x, y, 0, x, y, l.size / 2);
      gradient.addColorStop(0, '#fffde1'); gradient.addColorStop(.12, '#ffe8ae77'); gradient.addColorStop(1, '#ffe8ae00');
      c.fillStyle = gradient; c.fillRect(x - l.size / 2, y - l.size / 2, l.size, l.size); c.strokeStyle = '#fffde1b0'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y - l.size * .2); c.lineTo(x, y + l.size * .2); c.moveTo(x - l.size * .2, y); c.lineTo(x + l.size * .2, y); c.stroke(); c.restore();
    }
    if (settings.effects.floatingPetals) for (let i = 0; i < (['greeting', 'haldi', 'farewell'].includes(page.id) ? 9 : 5); i++) {
      const x = 90 + ((i * 137 + time * (i % 2 ? 12 : -10)) % 900 + 900) % 900 + 25 * Math.sin(time * .7 + i * 1.93);
      const y = 280 + ((i * 179 - time * (24 + i * 2)) % 1290 + 1290) % 1290;
      c.save(); c.globalAlpha = x < 170 || x > 910 ? .47 : .19; c.translate(x, y); c.rotate((time * 20 + i * 41) * Math.PI / 180); c.fillStyle = page.id === 'haldi' ? '#ffd554' : '#fff7de'; c.beginPath(); c.ellipse(0, 0, 5.5, 10.5, 0, 0, Math.PI * 2); c.fill(); c.restore();
    }
    if (settings.effects.pastelPetals && ['greeting', 'blessings', 'family', 'save-dates', 'farewell'].includes(page.id)) for (const petal of pastelPetals) {
      const p = pastelAt(petal, time); c.save(); c.globalAlpha = p.opacity; c.translate(p.x, p.y); c.rotate(p.angle * Math.PI / 180); const img = images.get(petal.pink ? assets.blushPetal : assets.ivoryPetal); c.drawImage(img, 0, 0, petal.size, petal.size * img.height / img.width); c.restore();
    }
  }
  function heart(c, cx, cy, age) {
    const config = settings.calendarHearts, progress = clamp(age / config.drawSeconds); if (!progress) return;
    const pulse = .5 + .5 * Math.sin(age * Math.PI * 2 / config.pulseSeconds - .6);
    const path = new Path2D();
    for (let i = 0; i <= Math.round(240 * progress); i++) { const p = heartPoint(i / 240); i ? path.lineTo(p.x, p.y) : path.moveTo(p.x, p.y); }
    c.save(); c.translate(cx, cy); c.lineCap = 'round'; c.lineJoin = 'round';
    c.shadowColor = '#ffb7cf'; c.shadowBlur = 9 + 5 * pulse; c.strokeStyle = '#ffb7cf'; c.lineWidth = 8 + 2 * pulse; c.globalAlpha = .4 + .3 * pulse; c.stroke(path);
    c.globalAlpha = 1; c.shadowBlur = 0; c.strokeStyle = `rgb(${168 + 48 * pulse},${28 + 45 * pulse},${64 + 36 * pulse})`; c.lineWidth = 4.2; c.stroke(path);
    const tip = progress < 1 ? progress : ((age - config.drawSeconds) / config.shimmerSeconds) % 1;
    c.beginPath(); for (let i = 0; i <= 9; i++) { const p = heartPoint(Math.max(0, tip - (9 - i) / 240)); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); } c.strokeStyle = '#ffe9b6'; c.lineWidth = 3; c.stroke();
    const p = heartPoint(tip); c.translate(p.x, p.y); const radius = 4.5 + 2 * pulse; c.fillStyle = '#fff7d8'; c.beginPath(); c.moveTo(0, -radius); c.lineTo(radius * .24, -radius * .24); c.lineTo(radius, 0); c.lineTo(radius * .24, radius * .24); c.lineTo(0, radius); c.lineTo(-radius * .24, radius * .24); c.lineTo(-radius, 0); c.lineTo(-radius * .24, -radius * .24); c.closePath(); c.fill(); c.restore();
  }
  function calendar(c, block, page, time, theme) {
    const month = parseLocalDate(block.month), first = new Date(month.getFullYear(), month.getMonth(), 1, 12).getDay();
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0, 12).getDate(), parts = dateParts(block.month);
    text(c, { value: parts.month.toUpperCase() + ' ' + parts.year, y: block.y, size: 44, font: 'body', weight: 600 }, theme, fadeFor(page, block.y, time));
    block.weekdays.forEach((day, i) => text(c, { value: day, x: 270 + i * 90, y: 648, size: 30, font: 'body', color: 'accent', weight: 600 }, theme, fadeFor(page, 648, time)));
    for (let day = 1; day <= count; day++) { const slot = day - 1 + first, y = 740 + Math.floor(slot / 7) * 94; text(c, { value: day, x: 270 + slot % 7 * 90, y, size: 36, font: 'body' }, theme, fadeFor(page, y, time)); }
    block.eventIds.forEach((id, i) => { const event = Object.values(weddingDetails.events).find(e => e.id === id), date = parseLocalDate(event.date); if (date.getFullYear() !== month.getFullYear() || date.getMonth() !== month.getMonth()) return; const slot = date.getDate() - 1 + first; heart(c, 270 + slot % 7 * 90, 740 + Math.floor(slot / 7) * 94 + 26, time - settings.calendarHearts.drawStart - i * settings.calendarHearts.stagger); });
  }
  function renderScene(targetCanvas, page, time) {
    const c = targetCanvas.getContext('2d'); c.clearRect(0, 0, W, H);
    if (page.kind === 'opening') {
      renderScene(targetCanvas, layoutPage(page.greeting, 'mobile'), time);
      const config = settings.opening; let progress = clamp((time - config.holdSeconds) / config.slideSeconds); progress = progress * progress * (3 - 2 * progress);
      const shift = W / 2 * progress;
      for (const left of [true, false]) { c.save(); c.beginPath(); c.rect(left ? -shift : W / 2 + shift, 0, W / 2, H); c.clip(); c.translate(left ? -shift : shift, 0); background(c, assets.envelope); c.restore(); }
      image(c, assets.crest, 540, config.crestCenterY, config.crestWidth, Infinity, 1 - ease((time - config.crestFadeStart) / config.crestFadeSeconds), true); return;
    }
    const theme = themes[page.theme]; background(c, theme.background, page.zoom); effects(c, page, time);
    if (page.kind === 'nikaah') {
      const config = settings.couple, move = smooth((time - config.moveStart) / config.moveSeconds);
      const width = config.introWidth * (1 - move) + config.restingWidth * move, img = images.get(assets.couple), height = width * img.height / img.width;
      const x = (W - width) / 2 * (1 - move) + (W - width - config.rightMargin) * move;
      const y = (H - height) / 2 * (1 - move) + config.restingTop * move;
      image(c, assets.couple, x + width / 2, y, width, Infinity, ease(time / .85));
      if (settings.effects.nikaahRosePetals) for (const petal of rosePetals) { const p = roseAt(petal, time); if (!p) continue; const sprite = images.get(assets.rosePetal), h = petal.size * sprite.height / sprite.width; c.save(); c.globalAlpha = p.opacity; c.translate(p.x, p.y); c.rotate(p.angle * Math.PI / 180); c.scale(p.fold, 1); c.drawImage(sprite, -petal.size / 2, -h / 2, petal.size, h); c.restore(); }
    }
    for (const block of page.blocks) {
      const opacity = fadeFor(page, block.y, time);
      if (block.type === 'text') text(c, block, theme, opacity);
      else if (block.type === 'image') image(c, block.asset, block.x || 540, block.y, block.width, block.maxHeight, opacity);
      else if (block.type === 'divider') divider(c, block.y, theme.accent, opacity);
      else if (block.type === 'directions') pin(c, block, theme.accent, opacity);
      else if (block.type === 'calendar') calendar(c, block, page, time, theme);
    }
    if (page.footer) { const y = page.footerY ?? 1755; text(c, { value: page.footer, y, size: 23, font: 'body', color: 'accent', weight: 600, width: 760 }, theme, fadeFor(page, y, time)); if (page.smallCrest !== false) image(c, assets.crest, 540, 1800, 72, Infinity, fadeFor(page, 1800, time)); }
  }
  return {
    draw(time) {
      signal.throwIfAborted();
      const page = [...pages].reverse().find(p => time >= p.start) || pages[0];
      const mix = page.index ? clamp((time - page.start) / settings.transitionSeconds) : 1;
      ctx.save(); ctx.scale(target.width / W, target.height / H); ctx.fillStyle = '#f4e7dd'; ctx.fillRect(0, 0, W, H);
      if (mix < 1) { const previous = pages[page.index - 1]; renderScene(a, previous, time - previous.start); ctx.drawImage(a, 0, 0); }
      renderScene(b, page, time - page.start); ctx.globalAlpha = mix; ctx.drawImage(b, 0, 0); ctx.restore();
    },
    dispose() { a.width = b.width = 1; images.clear(); textCache.clear(); },
  };
}
