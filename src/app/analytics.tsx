import { StyleSheet, View } from "react-native";

import { withAuthGuard } from "@/components/auth-guard";
import { CategoryBreakdownCard } from "@/components/category-breakdown-card";
import { MonthPicker } from "@/components/month-picker";
import { MonthSelector } from "@/components/month-selector";
import { NoticeCard } from "@/components/notice-card";
import { SavingsCard } from "@/components/savings-card";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useMonthFilter } from "@/hooks/use-month-filter";
import { useTransactions } from "@/hooks/use-transactions";
import type { TransactionScreenContentProps } from "@/lib/screen-props";
import {
  calculateTotals,
  transactionCurrencies,
} from "@/lib/transaction-helpers";

export default function AnalyticsScreen() {
  const {
    authLoading,
    session,
    transactions,
    loading,
    refreshing,
    errorMessage,
    refresh,
  } = useTransactions();

  return (
    <GuardedAnalyticsScreen
      authLoading={authLoading}
      session={session}
      transactions={transactions}
      loading={loading}
      refreshing={refreshing}
      errorMessage={errorMessage}
      refresh={refresh}
    />
  );
}

function AnalyticsScreenContent({
  transactions,
  loading,
  refreshing,
  errorMessage,
  refresh,
}: TransactionScreenContentProps) {
  const {
    selectedMonth,
    setSelectedMonth,
    monthPickerVisible,
    setMonthPickerVisible,
    availableMonths,
    previousAvailableMonth,
    nextAvailableMonth,
    monthTransactions,
  } = useMonthFilter(transactions);

  return (
    <ThemedView style={styles.screen}>
      <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
        <ScreenHeader eyebrow="Analytics" title="Spending overview" />

        <MonthSelector
          selectedMonth={selectedMonth}
          previousMonth={previousAvailableMonth}
          nextMonth={nextAvailableMonth}
          onSelectPrevious={() =>
            previousAvailableMonth && setSelectedMonth(previousAvailableMonth)
          }
          onSelectNext={() =>
            nextAvailableMonth && setSelectedMonth(nextAvailableMonth)
          }
          onOpenPicker={() => setMonthPickerVisible(true)}
        />

        <View style={styles.currencyGrid}>
          {transactionCurrencies.map((currency) => (
            <SavingsCard
              key={currency}
              currency={currency}
              totals={calculateTotals(monthTransactions, currency)}
            />
          ))}
        </View>

        {errorMessage && <NoticeCard message={errorMessage} />}

        {transactionCurrencies.map((currency) => (
          <CategoryBreakdownCard
            key={currency}
            currency={currency}
            transactions={monthTransactions}
            loading={loading}
          />
        ))}
      </ScreenScrollView>
      <MonthPicker
        visible={monthPickerVisible}
        selectedMonth={selectedMonth}
        availableMonths={availableMonths}
        onSelect={setSelectedMonth}
        onClose={() => setMonthPickerVisible(false)}
      />
    </ThemedView>
  );
}

const GuardedAnalyticsScreen = withAuthGuard(AnalyticsScreenContent);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  currencyGrid: {
    gap: Spacing.two,
  },
});
