import type { ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";

import { styles } from "./screen-scroll-view.styles";

type ScreenScrollViewProps = {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function ScreenScrollView({
  children,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
}: ScreenScrollViewProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
            ) : undefined
          }
          contentContainerStyle={[styles.content, contentContainerStyle]}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
