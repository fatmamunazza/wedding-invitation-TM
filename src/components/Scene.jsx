import { assets, assetUrl, settings, themes } from '../data/index.js';
import { layoutPage, responsive } from '../data/responsive.js';
import { Calendar, Directions, Divider, Footer, ImageBlock, TextBlock } from './Content.jsx';
import { Effects, RosePetals } from './Effects.jsx';
import { ease, smooth, fadeFor } from '../lib/animation.js';

function Couple({ time, page }) {
  const { width: w, height: h } = page.canvas;
  const config = page.layout === 'desktop' ? { ...settings.couple, ...responsive.desktop.couple } : settings.couple;
  const move = smooth((time - config.moveStart) / config.moveSeconds);
  const width = config.introWidth * (1 - move) + config.restingWidth * move;
  const height = width * 1.22;
  const left = (w - width) / 2 * (1 - move) + (w - width - config.rightMargin) * move;
  const top = (h - height) / 2 * (1 - move) + config.restingTop * move;
  return <img className="couple" src={assetUrl(assets.couple)} alt="" aria-hidden="true" draggable="false"
    style={{ width, left, top, opacity: ease(time / 0.85) }} />;
}

function Envelope({ time, page }) {
  const greeting = layoutPage(page.greeting, page.layout);
  const { width: w, height: h } = page.canvas;
  const desktop = page.layout === 'desktop';
  const config = settings.opening;
  const placement = desktop ? responsive.desktop.opening : { centerY: config.crestCenterY, crestWidth: config.crestWidth };
  const envelope = desktop ? assets.envelopeDesktop : assets.envelope;
  let progress = Math.max(0, Math.min(1, (time - config.holdSeconds) / config.slideSeconds));
  progress = progress * progress * (3 - 2 * progress);
  const shift = w / 2 * progress;
  const crestOpacity = 1 - ease((time - config.crestFadeStart) / config.crestFadeSeconds);
  return <div className="scene envelope-scene" aria-label="Envelope opening">
    <Scene page={greeting} time={time} />
    <div className="door left-door" style={{ width: w / 2, height: h, transform: 'translateX(' + -shift + 'px)' }}>
      <img src={assetUrl(envelope)} alt="" draggable="false" style={{ width: w, height: h }} />
    </div>
    <div className="door right-door" style={{ width: w / 2, height: h, transform: 'translateX(' + shift + 'px)' }}>
      <img src={assetUrl(envelope)} alt="" draggable="false" style={{ width: w, height: h }} />
    </div>
    <ImageBlock block={{ asset: assets.crest, x: w / 2, y: placement.centerY, width: placement.crestWidth, alt: 'MT wedding crest', centerY: true }} opacity={crestOpacity} />
  </div>;
}

export function Scene({ page, time }) {
  if (page.kind === 'opening') return <Envelope time={time} page={page} />;
  const theme = themes[page.theme];
  const background = page.layout === 'desktop' ? theme.desktopBackground : theme.background;
  return <section className={'scene theme-' + page.theme} aria-label={page.label}
    style={{ '--accent': theme.accent, '--ink': theme.ink }}>
    <img className="scene-background" src={assetUrl(background)} alt="" draggable="false" style={{ transform: 'scale(' + page.zoom + ')' }} />
    <Effects page={page} time={time} />
    {page.kind === 'nikaah' && <Couple time={time} page={page} />}
    {page.kind === 'nikaah' && <RosePetals time={time} canvas={page.canvas} />}
    {page.blocks.map((block, i) => {
      const opacity = fadeFor(page, block.revealY ?? block.y, time);
      if (block.type === 'text') return <TextBlock key={i} block={block} opacity={opacity} theme={theme} />;
      if (block.type === 'image') return <ImageBlock key={i} block={block} opacity={opacity} />;
      if (block.type === 'divider') return <Divider key={i} y={block.y} center={page.canvas.width / 2} opacity={opacity} />;
      if (block.type === 'directions') return <Directions key={i} block={block} opacity={opacity} theme={theme} />;
      if (block.type === 'calendar') return <Calendar key={i} block={block} page={page} time={time} theme={theme} />;
      return null;
    })}
    <Footer page={page} time={time} theme={theme} />
  </section>;
}
