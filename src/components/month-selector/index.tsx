import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { formatMonthLabel } from "@/lib/transaction-helpers";
import { useTheme } from "@/hooks/use-theme";

import { styles } from "./month-selector.styles";

type MonthSelectorProps = {
  selectedMonth: string;
  previousMonth: string | null;
  nextMonth: string | null;
  onSelectPrevious: () => void;
  onSelectNext: () => void;
  onOpenPicker: () => void;
};

export function MonthSelector({
  selectedMonth,
  previousMonth,
  nextMonth,
  onSelectPrevious,
  onSelectNext,
  onOpenPicker,
}: MonthSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onSelectPrevious}
        disabled={!previousMonth}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        accessibilityState={{ disabled: !previousMonth }}
        style={[
          styles.arrowButton,
          {
            backgroundColor: theme.backgroundElement,
            opacity: previousMonth ? 1 : 0.35,
          },
        ]}
      >
        <Ionicons name="chevron-back" size={20} color={theme.text} />
      </Pressable>

      <Pressable
        onPress={onOpenPicker}
        accessibilityRole="button"
        accessibilityLabel="Open month picker"
        style={[
          styles.labelButton,
          { backgroundColor: theme.backgroundElement },
        ]}
      >
        <ThemedText type="smallBold">{formatMonthLabel(selectedMonth)}</ThemedText>
      </Pressable>

      <Pressable
        onPress={onSelectNext}
        disabled={!nextMonth}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        accessibilityState={{ disabled: !nextMonth }}
        style={[
          styles.arrowButton,
          {
            backgroundColor: theme.backgroundElement,
            opacity: nextMonth ? 1 : 0.35,
          },
        ]}
      >
        <Ionicons name="chevron-forward" size={20} color={theme.text} />
      </Pressable>
    </View>
  );
}
