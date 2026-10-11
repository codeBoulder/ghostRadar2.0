import { hexBlock } from './format';

export type Session = {
  callsign: string;
  age: string;
  categories: string[];
  sessionId: string;
  startedAt: number;
};

export type Phase = 'idle' | 'running' | 'found';

export type OwnQuery = { id: string; at: number };

// Сеанс живе тільки в пам'яті: після перезапуску застосунку вхід треба пройти знову.
let current: Session | null = null;

export function createSession(input: {
  callsign: string;
  age: string;
  categories: string[];
}): Session {
  current = {
    ...input,
    sessionId: `${hexBlock(4)}-${hexBlock(4)}`,
    startedAt: Date.now(),
  };
  return current;
}

export function getSession(): Session {
  if (!current) {
    // Запасний варіант, якщо екран відкрили напряму (наприклад, при hot reload)
    current = {
      callsign: 'guest',
      age: '—',
      categories: [],
      sessionId: `${hexBlock(4)}-${hexBlock(4)}`,
      startedAt: Date.now(),
    };
  }
  return current;
}

export function endSession() {
  current = null;
}
