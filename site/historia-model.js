import { missions } from './historia-missions.js';
export const chapters = [...missions.map(m => ({x:m.x,label:m.label})), {x:100,label:'A história continua'}];
export function clampPosition(value) {
  return Number.isFinite(value) ? Math.max(chapters[0].x, Math.min(chapters.at(-1).x, value)) : 0;
}
export function chapterAt(position) {
  const value = clampPosition(position);
  return chapters.reduce((best, chapter, index) => Math.abs(chapter.x - value) < Math.abs(chapters[best].x - value) ? index : best, 0);
}
export function moveTowards(position, target, delta, speed = 6) {
  const from = clampPosition(position), to = clampPosition(target);
  const distance = Math.max(0, Math.min(Number.isFinite(delta) ? delta : 0, .05)) * speed;
  return from + Math.sign(to - from) * Math.min(Math.abs(to - from), distance);
}
