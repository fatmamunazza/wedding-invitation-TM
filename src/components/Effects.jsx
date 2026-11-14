import { assets, assetUrl, settings } from '../data/index.js';
import { lights, rosePetals, pastelPetals } from '../data/motion.js';
import { roseAt, pastelAt } from '../lib/motion.js';

export function Effects({ page, time }) {
  const sx = page.canvas.width / 1080, sy = page.canvas.height / 1920;
  const factor = page.layout === 'desktop' ? 0.7 : 1;
  return <div className="effects" aria-hidden="true">
    {settings.effects.sparkles && lights.map((light, i) => {
      const x = light.x + 60 * Math.sin(time * 0.28 + light.phase + page.index * 0.3);
      const y = 240 + ((light.y - time * (19 + i % 5 * 3)) % 1430 + 1430) % 1430;
      const edge = x < 190 || x > 890;
      const opacity = (page.id === 'greeting' ? 0.95 : edge ? 0.88 : 0.34) *
        (0.45 + 0.55 * Math.pow(Math.sin(time * 0.8 + light.phase), 2));
      return <i key={'light-' + i} className="sparkle" style={{ left: x * sx, top: y * sy, width: light.size * factor, height: light.size * factor, opacity }} />;
    })}
    {settings.effects.floatingPetals && Array.from({ length: ['greeting', 'haldi', 'farewell'].includes(page.id) ? 9 : 5 }, (_, i) => {
      const x = 90 + ((i * 137 + time * (i % 2 ? 12 : -10)) % 900 + 900) % 900 + 25 * Math.sin(time * 0.7 + i * 1.93);
      const y = 280 + ((i * 179 - time * (24 + i * 2)) % 1290 + 1290) % 1290;
      return <i key={'glow-' + i} className={'luminous-petal ' + (page.id === 'haldi' ? 'golden' : '')}
        style={{ left: x * sx, top: y * sy, opacity: x < 170 || x > 910 ? 0.47 : 0.19, transform: 'rotate(' + (time * 20 + i * 41) + 'deg)' }} />;
    })}
    {settings.effects.pastelPetals && ['greeting', 'blessings', 'family', 'save-dates', 'farewell'].includes(page.id) && pastelPetals.map((petal, i) => {
      const p = pastelAt(petal, time);
      return <img key={'pastel-' + i} className="falling-petal" alt="" src={assetUrl(petal.pink ? assets.blushPetal : assets.ivoryPetal)}
        style={{ left: p.x * sx, top: p.y * sy, width: petal.size * factor, opacity: p.opacity, transform: 'rotate(' + p.angle + 'deg)' }} />;
    })}
  </div>;
}

export function RosePetals({ time, canvas = settings.canvas }) {
  const sx = canvas.width / 1080, sy = canvas.height / 1920;
  const factor = canvas.width > 1080 ? 0.72 : 1;
  if (!settings.effects.nikaahRosePetals) return null;
  return <div className="effects rose-shower" aria-hidden="true">
    {rosePetals.map((petal, i) => {
      const p = roseAt(petal, time);
      if (!p) return null;
      return <img className="falling-petal" key={i} src={assetUrl(assets.rosePetal)} alt="" style={{ left: p.x * sx, top: p.y * sy,
        width: petal.size * factor, opacity: p.opacity,
        transform: 'translate(-50%, -50%) rotate(' + p.angle + 'deg) scaleX(' + p.fold + ')' }} />;
    })}
  </div>;
}
