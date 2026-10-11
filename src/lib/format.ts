const pad = (n: number, len = 2) => String(n).padStart(len, '0');

export const hhmmss = (d: Date = new Date()) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

export const ddmmyyyy = (d: Date = new Date()) =>
  `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

export const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

export const hexBlock = (len = 4) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');

export const formatCoord = (v: number) => v.toFixed(6);

// Текстовий прогрес-бар: ████████░░░░░░░░
export const asciiBar = (percent: number, length = 24) => {
  const filled = Math.round((Math.max(0, Math.min(100, percent)) / 100) * length);
  return '█'.repeat(filled) + '░'.repeat(length - filled);
};
