import { StyleSheet } from "react-native";

import { MaxContentWidth, Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  card: {
    borderRadius: Spacing.four,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  signOutButton: {
    minHeight: 48,
    borderRadius: Spacing.three,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    color: "#ffffff",
  },
});
