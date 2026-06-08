import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="home-outline" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="receipt-outline" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="analytics">
        <NativeTabs.Trigger.Label>Analytics</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="bar-chart-outline" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="settings-outline" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
