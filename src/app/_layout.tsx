import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ResetPasswordGate } from '@/components/reset-password-gate';
import { TransactionsProvider } from '@/components/transactions-provider';
import { usePasswordRecovery } from '@/hooks/use-password-recovery';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { recovering, recoveryError, dismissRecovery } = usePasswordRecovery();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {recovering ? (
        <ResetPasswordGate linkError={recoveryError} onDone={dismissRecovery} />
      ) : (
        <TransactionsProvider>
          <AppTabs />
        </TransactionsProvider>
      )}
    </ThemeProvider>
  );
}
