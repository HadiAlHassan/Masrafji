import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { styles } from "./settings-card.styles";

type SettingsCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  description: string;
};

export function SettingsCard({
  icon,
  iconColor = "#208AEF",
  title,
  description,
}: SettingsCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.cardText}>
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {description}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}
