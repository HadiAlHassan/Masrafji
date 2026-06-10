import type { ReactNode } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";

import { styles } from "./selectable-pill.styles";

type SelectablePillProps = {
  children: ReactNode;
  selected: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "radio";
  style?: StyleProp<ViewStyle>;
  unselectedBackground?: string;
  onPress: () => void;
};

export function SelectablePill({
  children,
  selected,
  accessibilityLabel,
  accessibilityRole = "button",
  style,
  unselectedBackground,
  onPress,
}: SelectablePillProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.pill,
        {
          backgroundColor: selected
            ? theme.text
            : (unselectedBackground ?? theme.backgroundSelected),
        },
        style,
      ]}
    >
      <ThemedText
        type="smallBold"
        style={{ color: selected ? theme.background : theme.text }}
      >
        {children}
      </ThemedText>
    </Pressable>
  );
}
