import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setBaseUrl } from '@workspace/api-client-react';
import { AppProvider } from '@/context/AppContext';
import { ChatProvider } from '@/context/ChatContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Set absolute base URL so Expo can reach the API outside the shared proxy
if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// ── AuthGate: redirect based on auth state & role ─────────────────────────────

function AuthGate() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup    = segments[0] === '(auth)';
    const inAdminGroup   = segments[0] === '(admin)';
    const inProviderGroup = segments[0] === '(provider)';
    const inTabsGroup    = segments[0] === '(tabs)';

    if (!user) {
      // Not logged in — send to welcome unless already in auth group
      if (!inAuthGroup) router.replace('/(auth)/welcome');
      return;
    }

    // Logged in — route to appropriate area
    if (user.role === 'superadmin') {
      if (!inAdminGroup) router.replace('/(admin)');
    } else if (user.role === 'customer') {
      if (!inTabsGroup) router.replace('/(tabs)');
    } else {
      // hospital / pharmacy / supplier / doctor / institution
      if (!inProviderGroup) router.replace('/(provider)');
    }
  }, [user, isLoading, segments]);

  return null;
}

// ── Navigation stack ──────────────────────────────────────────────────────────

function RootLayoutNav() {
  return (
    <>
      <AuthGate />
      <Stack>
        <Stack.Screen name="(auth)"     options={{ headerShown: false }} />
        <Stack.Screen name="(admin)"    options={{ headerShown: false }} />
        <Stack.Screen name="(provider)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
        <Stack.Screen
          name="medicine/[id]"
          options={{ title: 'Medicine Details', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="pharmacy/[id]"
          options={{ title: 'Pharmacy', headerBackTitle: 'Back' }}
        />
        <Stack.Screen name="emergency"  options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <AuthProvider>
                <AppProvider>
                  <ChatProvider>
                    <RootLayoutNav />
                  </ChatProvider>
                </AppProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
