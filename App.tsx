import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import MainShell from './src/navigation/MainShell';
import { NavProvider } from './src/navigation/NavContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import { colors } from './src/theme/colors';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function Root() {
  const { user, authReady } = useApp();
  useTheme(); // tema değişince bu ağacı yeniden çizer
  if (!authReady) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <NavProvider enabled={!!user}>
      {user ? <MainShell /> : <LoginScreen />}
    </NavProvider>
  );
}

function Themed() {
  const { scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      <Root />
    </>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
  });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <Themed />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
