import { clamp, ease } from './animation.js';

// Unwrapped trajectories keep petals continuous; spent petals leave the frame.
export function roseAt(petal, time) {
  const age = time - petal.birth;
  if (age < 0) return null;
  const y = -70 + petal.speed * (age - 0.45 * (1 - Math.exp(-age / 0.45)));
  if (y > 2000) return null;
  const x = petal.x + 2 * age + 15 * (Math.sin(age * 0.85 + petal.phase) - Math.sin(petal.phase)) + 7 * Math.sin(time * 0.35);
  const center = clamp((x - 190) / 100) * clamp((890 - x) / 100);
  const textZone = clamp((y - 350) / 120) * clamp((1700 - y) / 120);
  return { x, y, opacity: petal.opacity * (1 - 0.64 * center * textZone),
    fold: 0.76 + 0.24 * Math.cos(age * 1.1 + petal.phase),
    angle: petal.rot + age * petal.spin + 12 * Math.sin(age * 0.7 + petal.phase) };
}

export function pastelAt(petal, time) {
  return { x: petal.x + 24 * Math.sin(time * 0.35 + petal.phase),
    y: ((petal.y + time * petal.speed + 150) % 2220 + 2220) % 2220 - 150,
    angle: petal.phase * 55 + time * petal.spin, opacity: ease((time - 0.45) / 1.8) };
}

export function heartPoint(fraction) {
  const t = fraction * Math.PI * 2, dx = 16 * Math.pow(Math.sin(t), 3) * 2.8;
  const dy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.5) * 2.8;
  return { x: dx * Math.cos(-0.09) - dy * Math.sin(-0.09), y: dx * Math.sin(-0.09) + dy * Math.cos(-0.09) };
}
