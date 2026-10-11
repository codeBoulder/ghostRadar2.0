import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ARCHIVE, type ArchiveEntry } from '../data/content';
import { ddmmyyyy, hhmmss } from '../lib/format';
import type { OwnQuery } from '../lib/session';
import { Mono } from '../ui/components';
import { colors, space } from '../ui/theme';

type Props = { own: OwnQuery[]; onOpenOwn: () => void };

const denialText: Record<ArchiveEntry['status'], string> = {
  'ДОСТУП ОБМЕЖЕНО': 'Матеріали цього запиту недоступні для вашого рівня доступу.',
  ПОРОЖНЬО: 'Запит не повернув жодного запису.',
  ВИДАЛЕНО: 'Матеріали видалено зі сховища.',
};

function dateOf(daysAgo: number, time: string) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${ddmmyyyy(d)} ${time}`;
}

export function ArchiveTab({ own, onOpenOwn }: Props) {
  return (
    <ImageBackground
      source={require('../../assets/images/no_bg.png')}
      style={styles.background}
      imageStyle={styles.bgImage}
      resizeMode="contain"
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Mono bold style={styles.title}>
          Архів запитів
        </Mono>
        <Mono style={styles.sub}>Журнал вузла 04 за останні 30 днів</Mono>

        <View style={styles.list}>
          {own.map((q) => (
            <Pressable key={q.id} onPress={onOpenOwn} style={styles.item}>
              <View style={styles.itemTop}>
                <Mono bold style={styles.itemId}>
                  {q.id}
                </Mono>
                <Mono style={[styles.status, { color: colors.accent }]}>ВАШ СЕАНС</Mono>
              </View>
              <Mono style={styles.itemMeta}>
                {ddmmyyyy(new Date(q.at))} {hhmmss(new Date(q.at))}, 1 запис
              </Mono>
            </Pressable>
          ))}

          {ARCHIVE.map((q) => (
            <Pressable
              key={q.id}
              onPress={() => Alert.alert('Доступ обмежено', denialText[q.status])}
              style={styles.item}>
              <View style={styles.itemTop}>
                <Mono bold style={styles.itemId}>
                  {q.id}
                </Mono>
                <Mono
                  style={[
                    styles.status,
                    { color: q.status === 'ДОСТУП ОБМЕЖЕНО' ? colors.danger : colors.textFaint },
                  ]}>
                  {q.status}
                </Mono>
              </View>
              <Mono style={styles.itemMeta}>
                {dateOf(q.daysAgo, q.time)}, {q.result}
              </Mono>
              <Mono style={styles.itemSession}>сеанс {q.session}</Mono>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.bg },
  // Задаємо приглушеність фону (opacity) та центрування картиночки
  bgImage: { opacity: 0.05, resizeMode: 'center' },
  scroll: { padding: space.lg, paddingBottom: space.xxl },
  title: { fontSize: 18, marginTop: space.md },
  sub: { color: colors.textFaint, fontSize: 12, marginTop: 4 },
  list: { marginTop: space.lg },
  item: {
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 4,
  },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemId: { fontSize: 14 },
  status: { fontSize: 11, letterSpacing: 0.3 },
  itemMeta: { color: colors.textDim, fontSize: 12 },
  itemSession: { color: colors.textFaint, fontSize: 11 },
});