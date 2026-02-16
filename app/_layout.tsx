import { Stack } from 'expo-router';
import '../styles/global.css';
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const MyDarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000000', // This fixes the swipe-back flash
  },
};

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      try {
        const imageAssets = [
          require('../assets/amit-selection.png'),
          require('../assets/ori-selection.png'),
          require('../assets/chat.png'),
        ];

        const fontAssets = {
          Avigul_400Regular: require('../assets/fonts/avigul-regular-fm.ttf'),
          Avigul_700Bold: require('../assets/fonts/avigul-bold-fm.ttf'),
        };

        await Promise.all([Font.loadAsync(fontAssets), Asset.loadAsync(imageAssets)]);

        setFontsLoaded(true);
      } catch (e) {
        console.warn(e);
      }
    }
    loadAssets();
  }, []);

  if (!fontsLoaded) {
    return null; // or a splash/loading screen
  }

  return (
    <ThemeProvider value={MyDarkTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }} />
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
