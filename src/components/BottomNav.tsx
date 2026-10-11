import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Mono } from '../ui/components';
import { colors, space } from '../ui/theme';

export type TabKey = 'query' | 'archive' | 'node' | 'account';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ITEMS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'query', label: 'Запит', icon: 'search-outline' },
  { key: 'archive', label: 'Архів', icon: 'folder-outline' },
  { key: 'node', label: 'Вузол', icon: 'hardware-chip-outline' },
  { key: 'account', label: 'Профіль', icon: 'person-outline' },
];

type Props = { tab: TabKey; onChange: (tab: TabKey) => void; bottomInset: number };

export function BottomNav({ tab, onChange, bottomInset }: Props) {
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(bottomInset, space.sm) }]}>
      {ITEMS.map((item) => {
        const active = tab === item.key;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)} style={styles.item}>
            <View style={[styles.indicator, active && styles.indicatorOn]} />
            <Ionicons name={item.icon} size={22} color={active ? colors.text : colors.textFaint} />
            <Mono style={[styles.label, active && styles.labelOn]}>{item.label}</Mono>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: { flex: 1, alignItems: 'center', paddingBottom: 2, gap: 4 },
  indicator: { alignSelf: 'stretch', height: 2, marginBottom: 8, backgroundColor: 'transparent' },
  indicatorOn: { backgroundColor: colors.accent },
  label: { color: colors.textFaint, fontSize: 11 },
  labelOn: { color: colors.text },
});
