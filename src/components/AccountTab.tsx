import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, ImageBackground, ScrollView, StyleSheet, View } from 'react-native';

import { daysFromNow, ddmmyyyy } from '../lib/format';
import { endSession, type Session } from '../lib/session';
import { Btn, Mono, Row } from '../ui/components';
import { colors, radius, space } from '../ui/theme';

type Props = { session: Session; viewed: number };

export function AccountTab({ session, viewed }: Props) {
  const router = useRouter();
  const keyUntil = useMemo(() => ddmmyyyy(daysFromNow(30)), []);

  const logout = () => {
    Alert.alert('Завершити сеанс?', 'Дані сеансу буде очищено, вхід доведеться пройти знову.', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Завершити',
        style: 'destructive',
        onPress: () => {
          endSession();
          router.replace('/registration');
        },
      },
    ]);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/no_bg.png')}
      style={styles.background}
      imageStyle={styles.bgImage}
      resizeMode="contain"
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Mono bold style={styles.avatarText}>
              {session.callsign.charAt(0).toUpperCase()}
            </Mono>
          </View>
          <View style={styles.headText}>
            <Mono bold style={styles.name}>
              {session.callsign}
            </Mono>
            <Mono style={styles.level}>Рівень доступу 1, обмежений</Mono>
          </View>
        </View>

        <View style={styles.table}>
          <Row label="Позивний" value={session.callsign} />
          <Row label="Вік" value={session.age} />
          <Row
            label="Категорії"
            value={session.categories.length ? session.categories.join(', ') : 'усі'}
          />
          <Row label="ID сеансу" value={session.sessionId} />
          <Row label="Ключ діє до" value={keyUntil} />
          <Row label="Записів відкрито" value={String(viewed)} />
        </View>

        <Btn label="Завершити сеанс" variant="outline" onPress={logout} style={styles.logout} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.bg },
  bgImage: { opacity: 0.05, resizeMode: 'center' },
  scroll: { padding: space.lg, paddingBottom: space.xxl },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginTop: space.md },
  avatar: {
    width: 72,
    height: 72,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.accent, fontSize: 32 },
  headText: { flex: 1, gap: 4 },
  name: { fontSize: 20 },
  level: { color: colors.textFaint, fontSize: 12 },
  table: { marginTop: space.xl },
  logout: { marginTop: space.xl },
});