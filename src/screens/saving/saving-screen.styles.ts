import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  totalCard: {
    borderRadius: Spacing.four,
    gap: Spacing.one,
    padding: Spacing.four,
  },
  list: {
    gap: Spacing.two,
  },
});
