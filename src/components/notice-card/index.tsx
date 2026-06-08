import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { styles } from "./notice-card.styles";

type NoticeCardProps = {
  title?: string;
  message: string;
};

export function NoticeCard({ title = "Action needed", message }: NoticeCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {message}
      </ThemedText>
    </ThemedView>
  );
}
