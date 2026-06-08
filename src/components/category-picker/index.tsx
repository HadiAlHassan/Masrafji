import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ThemedView type="backgroundElement" style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Expense category
              </ThemedText>
              <ThemedText type="subtitle">Choose category</ThemedText>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close category picker"
              style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

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
        </ThemedView>
      </View>
    </Modal>
  );
}
