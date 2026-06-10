import { ActivityIndicator, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";

import { styles } from "./section-header.styles";

type SectionHeaderProps = {
  title: string;
  loading?: boolean;
};

export function SectionHeader({ title, loading = false }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {loading && <ActivityIndicator color={theme.text} />}
    </View>
  );
}
