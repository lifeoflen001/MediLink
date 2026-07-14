import { Stack } from 'expo-router';

export default function ProviderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
