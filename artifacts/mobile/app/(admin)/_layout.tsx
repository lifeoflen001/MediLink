import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="user-detail" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
