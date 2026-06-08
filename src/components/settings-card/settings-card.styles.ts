import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  cardHeader: {
    flexDirection: "row",
    gap: Spacing.three,
    alignItems: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(32, 138, 239, 0.12)",
  },
  cardText: {
    flex: 1,
    gap: Spacing.half,
  },
});
