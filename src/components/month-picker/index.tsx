import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ThemedView type="backgroundElement" style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Filter month
              </ThemedText>
              <ThemedText type="subtitle">Choose month</ThemedText>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close month picker"
              style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

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
        </ThemedView>
      </View>
    </Modal>
  );
}
