import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, StyleSheet, View } from 'react-native';

import { asciiBar } from '../lib/format';
import { Mono } from '../ui/components';
import { colors, space } from '../ui/theme';

const STAGES: [number, string][] = [
  [0, 'Перевірка цілісності пакета'],
  [22, 'Розпакування ресурсів'],
  [44, 'Перевірка підпису збірки'],
  [64, 'Ініціалізація модулів'],
  [84, 'Підключення до сховища'],
  [100, 'Готово'],
];

// На цьому відсотку показуємо системний діалог про непідписану збірку
const ASK_AT = 46;

export default function SplashScreen() {
  const router = useRouter();

  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [restricted, setRestricted] = useState(false);
  const asked = useRef(false);
  const fade = useRef(new Animated.Value(0)).current;

  const done = progress >= 100;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [fade]);

  // Прогрес рухається нерівномірно, як справжнє розпакування
  useEffect(() => {
    if (paused || done) return;
    const t = setInterval(() => {
      setProgress((p) => Math.min(100, p + 1 + Math.floor(Math.random() * 4)));
    }, 110);
    return () => clearInterval(t);
  }, [paused, done]);

  // Системний діалог: так поводяться збірки, встановлені поза магазином
  useEffect(() => {
    if (progress < ASK_AT || asked.current) return;
    asked.current = true;
    if (Platform.OS === 'web') return;
    setPaused(true);
    Alert.alert(
      'Попередження',
      'Джерело не підтверджено. Продовжити запуск?',
      [
        {
          text: 'Скасувати',
          style: 'cancel',
          onPress: () => {
            setRestricted(true);
            setPaused(false);
          },
        },
        { text: 'Продовжити', onPress: () => setPaused(false) },
      ],
      { cancelable: false },
    );
  }, [progress]);

  // Перехід тільки після того, як бар дійшов до кінця
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.replace('/registration'), 600);
    return () => clearTimeout(t);
  }, [done, router]);

  const stage = [...STAGES].reverse().find(([at]) => progress >= at)?.[1] ?? STAGES[0][1];

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Animated.Image
          source={require('../../assets/images/no_bg.png')}
          style={[styles.logo, { opacity: fade }]}
          resizeMode="contain"
        />

        <View style={styles.progressBlock}>
          <Mono style={styles.bar}>
            {asciiBar(progress)} {String(progress).padStart(3, ' ')}%
          </Mono>
          <Mono style={styles.stage}>{stage}</Mono>
          {restricted ? (
            <Mono style={styles.restricted}>підпис не перевірено, обмежений режим</Mono>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Mono style={styles.footerText}>repack ▒▒▒▒▒▒▒▒</Mono>
        <Mono style={styles.footerText}>v0.9.3-beta, build 2917</Mono>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.xxl },
  logo: { width: 350, height: 350 },
  progressBlock: { alignItems: 'center', gap: space.sm },
  bar: { color: colors.accent, fontSize: 13, letterSpacing: 0.5 },
  stage: { color: colors.textDim, fontSize: 12 },
  restricted: { color: colors.warn, fontSize: 11 },
  footer: { paddingBottom: space.xl, alignItems: 'center', gap: 4 },
  footerText: { color: colors.textFaint, fontSize: 11 },
});
