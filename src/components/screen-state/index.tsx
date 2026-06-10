import { NoticeCard } from "@/components/notice-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { styles } from "./screen-state.styles";

type ScreenStateProps = {
  errorMessage?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
};

export function ScreenState({
  errorMessage,
  empty = false,
  emptyTitle,
  emptyMessage,
}: ScreenStateProps) {
  return (
    <>
      {errorMessage && <NoticeCard message={errorMessage} />}
      {empty && emptyTitle && emptyMessage && (
        <ThemedView type="backgroundElement" style={styles.emptyState}>
          <ThemedText type="smallBold">{emptyTitle}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {emptyMessage}
          </ThemedText>
        </ThemedView>
      )}
    </>
  );
}
