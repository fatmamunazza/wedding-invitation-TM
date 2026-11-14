import { useId, useLayoutEffect, useRef, useState } from 'react';
import { assets, assetUrl, settings, weddingDetails } from '../data/index.js';
import { dateParts, parseLocalDate } from '../data/pages.js';
import { heartPoint } from '../lib/motion.js';
import { clamp, fadeFor } from '../lib/animation.js';


export function TextBlock({ block, opacity = 1, theme }) {
  const element = useRef(null);
  const [size, setSize] = useState(block.size);
  const lines = Array.isArray(block.value) ? block.value : String(block.value).split('\n');
  const family = settings.typography[block.font || 'body'];
  useLayoutEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let next = block.size;
    const measure = () => {
      ctx.font = (block.italic ? 'italic ' : '') + (block.weight || 400) + ' ' + next + 'px ' + family;
      return Math.max(...lines.map(line => ctx.measureText(line).width));
    };
    while (measure() > (block.width || 620) && next > 25) next--;
    setSize(next);
  }, [block.value, block.size, block.width, block.italic, block.weight, family]);
  const color = theme[block.color] || block.color || theme.ink;
  return <div ref={element} className={'text-block ' + (block.font === 'arabic' ? 'arabic' : '')}
    lang={block.lang} dir={block.lang === 'ar' ? 'rtl' : undefined}
    style={{ left: (block.x || 540) - (block.width || 620) / 2, top: block.y,
      width: block.width || 620, fontSize: size, fontFamily: family, fontWeight: block.weight || 400,
      fontStyle: block.italic ? 'italic' : 'normal', color, opacity }}>
    {lines.map((line, i) => <span key={i}>{line}</span>)}
  </div>;
}

export function Divider({ y, center = 540, opacity = 1 }) {
  return <div className="divider" aria-hidden="true" style={{ top: y, left: center - 150, opacity }}><i /><b /><i /></div>;
}

export function ImageBlock({ block, opacity = 1 }) {
  return <img className="image-block" src={assetUrl(block.asset)} alt={block.alt || ''} lang={block.lang}
    draggable="false" style={{ left: block.x || 540, top: block.y, width: block.width,
      maxHeight: block.maxHeight || 'none', opacity }} />;
}

export function Directions({ block, opacity, theme }) {
  const event = Object.values(weddingDetails.events).find(item => item.id === block.eventId);
  return <a className="directions" href={event.mapLink} target="_blank" rel="noopener noreferrer"
    tabIndex={opacity > 0.9 ? 0 : -1}
    aria-label={event.title + ': open directions to ' + event.venue} style={{ top: block.y, left: block.x || 540, opacity, color: theme.accent }}>
    <svg width={block.size} height={block.size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="currentColor" fillOpacity="0.08" />
      <path d="M35 20c0 8-11 18-11 18S13 28 13 20a11 11 0 1 1 22 0Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="20" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  </a>;
}

function heartPath() {
  const points = [];
  for (let i = 0; i <= 240; i++) {
    const t = i / 240 * Math.PI * 2;
    const dx = 16 * Math.pow(Math.sin(t), 3) * 2.8;
    const dy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t) + 2.5) * 2.8;
    points.push((i ? 'L' : 'M') + (dx * Math.cos(-0.09) - dy * Math.sin(-0.09)) + ',' + (dx * Math.sin(-0.09) + dy * Math.cos(-0.09)));
  }
  return points.join(' ');
}
const HEART = heartPath();

export function Calendar({ block, page, time, theme }) {
  const glowId = useId();
  const heart = settings.calendarHearts;
  const layout = block.calendarLayout || { centerStart: 270, columnWidth: 90, monthY: block.y, monthSize: 44, weekdayY: 648, weekdaySize: 30, gridY: 740, rowHeight: 94, daySize: 36, heartScale: 1 };
  const center = page.canvas.width / 2;
  const month = parseLocalDate(block.month);
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12).getDay();
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0, 12).getDate();
  const parts = dateParts(block.month);
  const events = block.eventIds.map(id => Object.values(weddingDetails.events).find(e => e.id === id));
  return <div className="calendar">
    <TextBlock block={{ type: 'text', value: parts.month.toUpperCase() + ' ' + parts.year, x: center, y: layout.monthY, size: layout.monthSize, font: 'body', weight: 600 }}
      theme={theme} opacity={fadeFor(page, block.revealY ?? block.y, time)} />
    {block.weekdays.map((day, i) => <span className="calendar-day-name" key={i}
      style={{ left: layout.centerStart + i * layout.columnWidth, top: layout.weekdayY, fontSize: layout.weekdaySize, opacity: fadeFor(page, 648, time), color: theme.accent }}>{day}</span>)}
    {Array.from({ length: count }, (_, index) => {
      const day = index + 1, slot = index + first;
      return <span className="calendar-day" key={day} style={{ left: layout.centerStart + slot % 7 * layout.columnWidth,
        top: layout.gridY + Math.floor(slot / 7) * layout.rowHeight, fontSize: layout.daySize, opacity: fadeFor(page, 740 + Math.floor(slot / 7) * 94, time) }}>{day}</span>;
    })}
    <svg className="calendar-hearts" viewBox={'0 0 ' + page.canvas.width + ' ' + page.canvas.height} aria-hidden="true">
      <defs><filter id={glowId} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter></defs>
      {events.map((event, i) => {
        const date = parseLocalDate(event.date);
        if (date.getFullYear() !== month.getFullYear() || date.getMonth() !== month.getMonth()) return null;
        const slot = date.getDate() - 1 + first;
        const age = time - (heart.drawStart + i * heart.stagger);
        const progress = clamp(age / heart.drawSeconds);
        const pulse = 0.5 + 0.5 * Math.sin(age * Math.PI * 2 / heart.pulseSeconds - 0.6);
        const tip = progress < 1 ? progress : ((age - heart.drawSeconds) / heart.shimmerSeconds) % 1;
        const point = heartPoint(tip);
        const color = 'rgb(' + Math.round(168 + 48 * pulse) + ',' + Math.round(28 + 45 * pulse) + ',' + Math.round(64 + 36 * pulse) + ')';
        return <g key={event.id} className="heart-effect" opacity={progress > 0 ? 1 : 0}
          transform={'translate(' + (layout.centerStart + slot % 7 * layout.columnWidth) + ',' + (layout.gridY + Math.floor(slot / 7) * layout.rowHeight + 26 * layout.heartScale) + ') scale(' + layout.heartScale + ')'}>
          <path d={HEART} pathLength="1" fill="none" stroke="#ffb7cf" strokeWidth={8 + 2 * pulse} filter={'url(#' + glowId + ')'} opacity={0.4 + 0.3 * pulse} strokeDasharray="1" strokeDashoffset={1 - progress} />
          <path d={HEART} pathLength="1" fill="none" stroke={color} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" strokeDashoffset={1 - progress} />
          {progress > 0.04 && <path d={HEART} pathLength="1" fill="none" stroke="#ffe9b6" strokeWidth="3" strokeLinecap="round" strokeDasharray="0.035 0.965" strokeDashoffset={-Math.max(0, tip - 0.035)} />}
          <path d="M0-7 1.6-1.6 7 0 1.6 1.6 0 7-1.6 1.6-7 0-1.6-1.6Z" fill="#fff7d8" transform={'translate(' + point.x + ',' + point.y + ') scale(' + (0.7 + 0.3 * pulse) + ')'} />
        </g>;
      })}
    </svg>
  </div>;
}

export function Footer({ page, time, theme }) {
  if (!page.footer) return null;
  const y = page.footerY ?? 1755;
  const center = page.canvas.width / 2;
  return <>
    <TextBlock block={{ value: page.footer, x: center, y, size: page.footerSize || 23, font: 'body', color: 'accent', weight: 600, width: 760 }}
      opacity={fadeFor(page, page.footerRevealY ?? y, time)} theme={theme} />
    {page.smallCrest !== false && <ImageBlock block={{ asset: assets.crest, x: center, y: page.crestY || 1800, width: page.crestWidth || 72, alt: '' }}
      opacity={fadeFor(page, 1800, time)} />}
  </>;
}
