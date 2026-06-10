import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  monthList: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  monthOption: {
    minHeight: 48,
    borderRadius: Spacing.three,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },
});
