import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={32} color="green" />,
        }}
      />
      <Tabs.Screen
        name="Yield"
        options={{
          title: 'Yield',
          tabBarIcon: ({ color }) => <Ionicons name="leaf" size={32} color="green" />,
        }}
      />
      <Tabs.Screen
        name="Weather"
        options={{
          title: 'Weather',
          tabBarIcon: ({ color }) => <Ionicons name="sunny" size={32} color="green" />,
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          title: 'Feedback',
          tabBarIcon: ({ color }) => <Ionicons name="book" size={32} color="green" />,
        }}
      />
    </Tabs>
  );
}
