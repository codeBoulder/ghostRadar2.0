import { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { NODE_INFO } from '../data/content';
import { hhmmss } from '../lib/format';
import type { Session } from '../lib/session';
import { Mono, Row, Section } from '../ui/components';
import { colors, space } from '../ui/theme';

type Props = { session: Session };

const TOGGLES: { key: string; label: string; initial: boolean }[] = [
  { key: 'proxy', label: 'Маршрутизація через проксі', initial: true },
  { key: 'encrypt', label: 'Шифрування сеансу', initial: true },
  { key: 'wipe', label: 'Очищати журнал при виході', initial: false },
  { key: 'restricted', label: 'Обмежений режим', initial: true },
];

// Набір випадкових фраз для фонового журналу вузла
const BACKGROUND_NODE_LOGS: { text: string; warn?: boolean }[] = [
  { text: 'пінг до шлюзу: 24мс' },
  { text: 'відхилено підозрілий пакет на порті 443', warn: true },
  { text: 'перевірка цілісності кешу ... ok' },
  { text: 'синхронізація NTP ... узгоджено' },
  { text: 'скидання буфера обміну' },
  { text: 'помилка рукостискання з вузлом-02', warn: true },
  { text: 'ротація ключів шифрування сеансу' },
  { text: 'оновлення таблиці DNS-маршрутів' },
];

export function NodeTab({ session }: Props) {
  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.key, t.initial])),
  );

  // Час у журналі відраховується від початку сеансу, тому завжди виглядає узгодженим
  const at = (offsetSec: number) => hhmmss(new Date(session.startedAt + offsetSec * 1000));

  // Перетворюємо журнал на стан, щоб мати змогу додавати нові рядки
  const [logs, setLogs] = useState<{ stamp: string; text: string; warn?: boolean }[]>(() => [
    { stamp: at(-42), text: 'node-04: службу запущено' },
    { stamp: at(-41), text: 'проксі: 3 стрибки, вихід 203.0.113.44' },
    { stamp: at(-38), text: 'TLS 1.3, сертифікат не закріплено' },
    { stamp: at(-31), text: 'сховище підключено, rev 2f9c1a' },
    { stamp: at(-12), text: 'підпис збірки не перевірено', warn: true },
    { stamp: at(-9), text: `сеанс ${session.sessionId} відкрито` },
    { stamp: at(-2), text: 'очікування запитів' },
  ]);

  // Нескінченний генератор нових логів (кожні 5-20 секунд)
  useEffect(() => {
    const scheduleNextLog = () => {
      const randomDelay = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;

      return setTimeout(() => {
        const randomStep = BACKGROUND_NODE_LOGS[
          Math.floor(Math.random() * BACKGROUND_NODE_LOGS.length)
        ];

        setLogs((prev) => [
          ...prev,
          { stamp: hhmmss(new Date()), text: randomStep.text, warn: randomStep.warn },
        ]);

        timer = scheduleNextLog();
      }, randomDelay);
    };

    let timer = scheduleNextLog();
    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/images/no_bg.png')}
      style={styles.background}
      imageStyle={styles.bgImage}
      resizeMode="contain"
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Mono bold style={styles.title}>
          Параметри вузла
        </Mono>

        <Section title="Стан" />
        {NODE_INFO.map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}

        <Section title="З’єднання" />
        {TOGGLES.map((t) => (
          <View key={t.key} style={styles.toggleRow}>
            <Mono style={styles.toggleLabel}>{t.label}</Mono>
            <Switch
              value={values[t.key]}
              onValueChange={(v) => setValues((prev) => ({ ...prev, [t.key]: v }))}
              trackColor={{ false: colors.border, true: colors.accentDim }}
              thumbColor={values[t.key] ? colors.accent : colors.textFaint}
            />
          </View>
        ))}

        <Section title="Журнал" />
        <View style={styles.log}>
          {logs.map((l, i) => (
            <View key={i} style={styles.logLine}>
              <Mono style={styles.logStamp}>{l.stamp}</Mono>
              <Mono style={[styles.logText, l.warn && { color: colors.warn }]}>{l.text}</Mono>
            </View>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.bg },
  bgImage: { opacity: 0.05, resizeMode: 'center' },
  scroll: { padding: space.lg, paddingBottom: space.xxl },
  title: { fontSize: 18, marginTop: space.md },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toggleLabel: { flex: 1, fontSize: 13, paddingRight: space.md },
  log: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: 6,
  },
  logLine: { flexDirection: 'row', gap: space.md },
  logStamp: { color: colors.textFaint, fontSize: 11 },
  logText: { flex: 1, color: colors.textDim, fontSize: 11, lineHeight: 16 },
});