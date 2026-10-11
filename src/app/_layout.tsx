import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  useFonts,
} from '@expo-google-fonts/jetbrains-mono';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { colors } from '../ui/theme';

export default function RootLayout() {
  const [loaded, error] = useFonts({ JetBrainsMono_400Regular, JetBrainsMono_700Bold });

  // Поки шрифти вантажаться, показуємо порожній темний екран (без білого спалаху)
  if (!loaded && !error) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="registration" />
        <Stack.Screen name="home" />
      </Stack>
    </>
  );
}
