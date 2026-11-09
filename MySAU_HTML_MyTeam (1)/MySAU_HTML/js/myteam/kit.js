// Komponen kecil yang dipakai bersama oleh halaman aplikasi My Team
import { icon } from '../icons.js';
import { esc } from '../utils.js';
import { PEOPLE } from '../data.js';
import { avatar } from '../ui.js';
import { ATT } from '../teamModel.js';

export const STATUS = {
  ...ATT,
  nanti: { label: 'Belum berjalan', color: '#DCE4EE' },
};

export function pageHead(title, sub, actions = '') {
  return `<div class="mt-head"><div><h1>${esc(title)}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}</div><div class="mt-actions">${actions}</div></div>`;
}

export function kpi(label, value, note = '', tone = '') {
  return `<div class="mt-kpi glass ${tone}"><small>${esc(label)}</small><b>${value}</b>${note ? `<span>${note}</span>` : ''}</div>`;
}

export function statusPill(status, time) {
  const s = STATUS[status] || STATUS.belum;
  return `<span class="mt-status" style="--c:${s.color}"><i></i>${esc(s.label)}${time ? ` · ${esc(time)}` : ''}</span>`;
}

export function person(code, sub = '', size = 32) {
  return `<span class="mt-person">${avatar(code, size)}<span><b>${esc(PEOPLE[code]?.name || code)}</b>${sub ? `<small>${sub}</small>` : ''}</span></span>`;
}

export function delta(n) {
  if (!n) return '<span class="mt-delta">0</span>';
  return `<span class="mt-delta ${n > 0 ? 'up' : 'down'}">${n > 0 ? '▲' : '▼'} ${Math.abs(n)}</span>`;
}

export function bar(value, color = '#5B9BE0') {
  return `<span class="mt-bar" style="--w:${Math.max(0, Math.min(100, value))}%;--c:${color}"><i></i></span>`;
}

/** Garis tren kecil. labels opsional ditaruh di bawah. */
export function spark(series, { w = 120, h = 32, labels = null, dot = true } = {}) {
  const min = Math.min(...series) - 2, max = Math.max(...series) + 2;
  const pts = series.map((v, i) => [(i / Math.max(1, series.length - 1)) * w, h - ((v - min) / (max - min || 1)) * h]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts.at(-1);
  const extra = labels ? 16 : 4;
  return `<svg class="mt-spark" viewBox="-10 -6 ${w + 20} ${h + 6 + extra}" width="${w + 20}" role="img" aria-label="Tren: ${series.join(', ')}">
    <path d="${d}" fill="none" stroke="#5B9BE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${dot ? `<circle cx="${lx}" cy="${ly}" r="3.2" fill="#1D49A3" stroke="#fff" stroke-width="1.5"/>` : ''}
    ${labels ? pts.map(([x], i) => `<text x="${x}" y="${h + 14}" text-anchor="middle">${esc(labels[i])}</text>`).join('') : ''}
  </svg>`;
}

export const empty = (text) => `<p class="mt-empty">${icon('checkCircle', 18, 2)}${esc(text)}</p>`;
