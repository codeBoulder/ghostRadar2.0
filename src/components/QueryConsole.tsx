import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RECORD } from '../data/content';
import { asciiBar, hhmmss } from '../lib/format';
import type { Session } from '../lib/session';
import { Cursor, Mono } from '../ui/components';
import { colors, space } from '../ui/theme';

type Tone = 'plain' | 'warn' | 'ok';
type Step = { text: string; delay: number; tone?: Tone };
type Line = { stamp: string; text: string; tone: Tone };

type Props = { session: Session; queryId: string; onDone: () => void };

/** Вікно виконання запиту: рядки з'являються по одному, як у справжньому журналі. */
export function QueryConsole({ session, queryId, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const script = useMemo<Step[]>(() => {
    const cats = session.categories.length ? session.categories.join(', ') : 'усі';
    return [
      { text: `сеанс ${session.sessionId}, ініціалізація`, delay: 500 },
      { text: 'з’єднання з вузлом 04 ............ ok', delay: 800, tone: 'ok' },
      { text: 'маршрут через проксі, 3 стрибки .. ok', delay: 850, tone: 'ok' },
      { text: 'Ідентифікація особи: знайдено особу -> Horobets Arsen, 19', delay: 1500, tone: 'ok' },
      { text: 'автентифікація ключем ............ ok', delay: 700, tone: 'ok' },
      { text: `профіль: ${session.callsign}, ${session.age} р., ${cats}`, delay: 900 },
      { text: 'пошук у сховищі, 1 847 записів ...', delay: 1100 },
      { text: 'кандидатів за категоріями: 14', delay: 900 },
      { text: 'рівень доступу запису: 2, ваш: 1', delay: 900, tone: 'warn' },
      { text: 'перевірку прав пропущено (обмежений режим)', delay: 800, tone: 'warn' },
      { text: 'знайдено записів: 1', delay: 800, tone: 'ok' },
      { text: `відкриття запису ${RECORD.id}`, delay: 2000 },
    ];
  }, [session]);

  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    script.forEach((step) => {
      elapsed += step.delay;
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setLines((prev) => [
            ...prev,
            { stamp: hhmmss(), text: step.text, tone: step.tone ?? 'plain' },
          ]);
        }, elapsed),
      );
    });
    timers.push(setTimeout(() => !cancelled && doneRef.current(), elapsed + 900));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [script]);

  const percent = Math.round((lines.length / script.length) * 100);

  const toneColor = (tone: Tone) =>
    tone === 'warn' ? colors.warn : tone === 'ok' ? colors.textDim : colors.text;

  return (
    <ImageBackground
      source={require('../../assets/images/no_bg.png')} // Виправив шлях (перевір, чи файл називається саме так)
      style={[
        styles.root,
        { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.lg },
      ]}
      imageStyle={styles.bgImage}
      resizeMode="center"
    >
      <View style={styles.header}>
        <Mono bold style={styles.title}>
          Запит {queryId}
        </Mono>
        <Mono style={styles.sub}>Сховище, вузол 04</Mono>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.log}
        contentContainerStyle={styles.logContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
        {lines.map((line, i) => (
          <View key={i} style={styles.line}>
            <Mono style={styles.stamp}>{line.stamp}</Mono>
            <Mono style={[styles.lineText, { color: toneColor(line.tone) }]}>{line.text}</Mono>
          </View>
        ))}
        <View style={styles.line}>
          <Cursor />
        </View>
      </ScrollView>

      <Mono style={styles.bar}>
        {asciiBar(percent, 26)} {String(percent).padStart(3, ' ')}%
      </Mono>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill, // Краще використовувати absoluteFillObject для стилів
    backgroundColor: 'rgba(11,13,15,0.97)',
    paddingHorizontal: space.xl,
    zIndex: 20,
  },
  bgImage: { opacity: 0.05, transform: [{ scale: 2 }]}, // Додав відсутній стиль для прозорості
  header: { gap: 4, paddingBottom: space.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 16 },
  sub: { color: colors.textFaint, fontSize: 12 },
  log: { flex: 1, marginTop: space.lg },
  logContent: { gap: 8, paddingBottom: space.lg },
  line: { flexDirection: 'row', gap: space.md },
  stamp: { color: colors.textFaint, fontSize: 11, marginTop: 1 },
  lineText: { flex: 1, fontSize: 12, lineHeight: 17 },
  bar: { color: colors.accent, fontSize: 12, letterSpacing: 0.5, paddingTop: space.md },
});