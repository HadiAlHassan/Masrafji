import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView } from 'react-native';

import { PickerSheet } from '@/components/picker-sheet';
import { ThemedText } from '@/components/themed-text';
import type { ExpenseCategory } from '@/lib/database.types';
import { transactionCategories, transactionCategoryDetails } from '@/lib/transaction-helpers';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './category-picker.styles';

type CategoryPickerProps = {
  visible: boolean;
  selectedCategory: ExpenseCategory;
  onSelect: (category: ExpenseCategory) => void;
  onClose: () => void;
};

export function CategoryPicker({
  visible,
  selectedCategory,
  onSelect,
  onClose,
}: CategoryPickerProps) {
  const theme = useTheme();

  return (
    <PickerSheet
      visible={visible}
      eyebrow="Expense category"
      title="Choose category"
      closeAccessibilityLabel="Close category picker"
      onClose={onClose}>
      <ScrollView contentContainerStyle={styles.grid}>
        {transactionCategories.map((category) => {
          const categoryDetails = transactionCategoryDetails[category];
          const selected = category === selectedCategory;

          return (
            <Pressable
              key={category}
              onPress={() => {
                onSelect(category);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Select ${categoryDetails.label}`}
              style={[
                styles.categoryOption,
                { backgroundColor: selected ? theme.text : theme.backgroundSelected },
              ]}>
              <Ionicons
                name={categoryDetails.icon}
                size={24}
                color={selected ? theme.background : theme.text}
              />
              <ThemedText
                type="smallBold"
                style={{ color: selected ? theme.background : theme.text }}>
                {categoryDetails.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </PickerSheet>
  );
}
