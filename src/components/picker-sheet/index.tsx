import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";

import { styles } from "./picker-sheet.styles";

type PickerSheetProps = {
  visible: boolean;
  eyebrow: string;
  title: string;
  closeAccessibilityLabel: string;
  children: ReactNode;
  onClose: () => void;
};

export function PickerSheet({
  visible,
  eyebrow,
  title,
  closeAccessibilityLabel,
  children,
  onClose,
}: PickerSheetProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ThemedView type="backgroundElement" style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                {eyebrow}
              </ThemedText>
              <ThemedText type="subtitle">{title}</ThemedText>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={closeAccessibilityLabel}
              style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          {children}
        </ThemedView>
      </View>
    </Modal>
  );
}
