import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Platform, Pressable, View } from "react-native";

import { SelectablePill } from "@/components/selectable-pill";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { dateToIsoDate, isoDateToLocalDate, todayIsoDate } from "@/lib/transaction-helpers";

import { styles } from "./transaction-modal.styles";

type TransactionDateFieldProps = {
  spentAt: string;
  datePickerVisible: boolean;
  onQuickDate: (dayOffset: number) => void;
  onOpenDatePicker: () => void;
  onDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
};

export function TransactionDateField({
  spentAt,
  datePickerVisible,
  onQuickDate,
  onOpenDatePicker,
  onDateChange,
}: TransactionDateFieldProps) {
  const theme = useTheme();
  const today = todayIsoDate();
  const yesterday = dateToIsoDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

  return (
    <View style={styles.dateSection}>
      <View style={styles.quickDateRow}>
        <SelectablePill
          onPress={() => onQuickDate(0)}
          accessibilityLabel="Set date to today"
          selected={spentAt === today}
          style={styles.quickDateButton}
        >
          Today
        </SelectablePill>
        <SelectablePill
          onPress={() => onQuickDate(-1)}
          accessibilityLabel="Set date to yesterday"
          selected={spentAt === yesterday}
          style={styles.quickDateButton}
        >
          Yesterday
        </SelectablePill>
      </View>

      <Pressable
        onPress={onOpenDatePicker}
        accessibilityRole="button"
        accessibilityLabel={`Transaction date ${spentAt}`}
        style={[styles.dateSelector, { borderColor: theme.backgroundSelected }]}
      >
        <View style={styles.categorySelectorContent}>
          <Ionicons name="calendar-outline" size={22} color={theme.text} />
          <View>
            <ThemedText type="small" themeColor="textSecondary">
              Date
            </ThemedText>
            <ThemedText type="smallBold">{spentAt}</ThemedText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </Pressable>

      {datePickerVisible && (
        <DateTimePicker
          value={isoDateToLocalDate(spentAt)}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={onDateChange}
        />
      )}
    </View>
  );
}
