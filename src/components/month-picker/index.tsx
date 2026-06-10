import { Pressable, ScrollView } from 'react-native';

import { PickerSheet } from '@/components/picker-sheet';
import { ThemedText } from '@/components/themed-text';
import { formatMonthLabel } from '@/lib/transaction-helpers';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './month-picker.styles';

type MonthPickerProps = {
  visible: boolean;
  selectedMonth: string;
  availableMonths: string[];
  onSelect: (monthKey: string) => void;
  onClose: () => void;
};

export function MonthPicker({
  visible,
  selectedMonth,
  availableMonths,
  onSelect,
  onClose,
}: MonthPickerProps) {
  const theme = useTheme();

  return (
    <PickerSheet
      visible={visible}
      eyebrow="Filter month"
      title="Choose month"
      closeAccessibilityLabel="Close month picker"
      onClose={onClose}>
      <ScrollView contentContainerStyle={styles.monthList}>
        {availableMonths.map((monthKey) => {
          const selected = monthKey === selectedMonth;

          return (
            <Pressable
              key={monthKey}
              onPress={() => {
                onSelect(monthKey);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Select ${formatMonthLabel(monthKey)}`}
              style={[
                styles.monthOption,
                { backgroundColor: selected ? theme.text : theme.backgroundSelected },
              ]}>
              <ThemedText
                type="smallBold"
                style={{ color: selected ? theme.background : theme.text }}>
                {formatMonthLabel(monthKey)}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </PickerSheet>
  );
}
