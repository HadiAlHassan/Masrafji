import { useMemo } from "react";
import { View } from "react-native";

import { withAuthGuard } from "@/components/auth-guard";
import { MetricGroup } from "@/components/metric-group";
import { MonthPicker } from "@/components/month-picker";
import { MonthSelector } from "@/components/month-selector";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ScreenState } from "@/components/screen-state";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TransactionList } from "@/components/transaction-list";
import { TransactionModal } from "@/components/transaction-modal";
import { WalletProgress } from "@/components/wallet-progress";
import { useMonthFilter } from "@/hooks/use-month-filter";
import { useTransactionModal } from "@/hooks/use-transaction-modal";
import { useTransactions } from "@/hooks/use-transactions";
import type {
  TransactionMutationProps,
  TransactionScreenContentProps,
} from "@/lib/screen-props";
import {
  calculateCarriedBalance,
  calculateSpendingTotals,
  calculateTotals,
  formatMoney,
} from "@/lib/transaction-helpers";
import { styles } from "@/screens/home/home-screen.styles";

export default function HomeScreen() {
  const {
    authLoading,
    session,
    transactions,
    loading,
    refreshing,
    errorMessage,
    refresh,
    addTransaction,
    replaceTransaction,
    removeTransaction,
  } = useTransactions();

  return (
    <GuardedHomeScreen
      authLoading={authLoading}
      session={session}
      transactions={transactions}
      loading={loading}
      refreshing={refreshing}
      errorMessage={errorMessage}
      refresh={refresh}
      addTransaction={addTransaction}
      replaceTransaction={replaceTransaction}
      removeTransaction={removeTransaction}
    />
  );
}

interface HomeScreenContentProps
  extends TransactionScreenContentProps, TransactionMutationProps {}

function HomeScreenContent({
  session,
  transactions,
  loading,
  refreshing,
  errorMessage,
  refresh,
  addTransaction,
  replaceTransaction,
  removeTransaction,
}: HomeScreenContentProps) {
  const {
    modalVisible,
    editingTransaction,
    openCreateTransaction,
    openEditTransaction,
    closeTransactionModal,
  } = useTransactionModal();
  const {
    selectedMonth,
    setSelectedMonth,
    monthPickerVisible,
    setMonthPickerVisible,
    availableMonths,
    previousAvailableMonth,
    nextAvailableMonth,
    monthTransactions,
    transactionsUpToMonth,
  } = useMonthFilter(transactions);
  const usdTotals = useMemo(
    () => calculateTotals(monthTransactions, "USD"),
    [monthTransactions],
  );
  const lbpTotals = useMemo(
    () => calculateTotals(monthTransactions, "LBP"),
    [monthTransactions],
  );
  const usdAvailable = useMemo(
    () => calculateTotals(transactionsUpToMonth, "USD").balance,
    [transactionsUpToMonth],
  );
  const lbpAvailable = useMemo(
    () => calculateTotals(transactionsUpToMonth, "LBP").balance,
    [transactionsUpToMonth],
  );
  const usdCarried = useMemo(
    () => calculateCarriedBalance(transactions, selectedMonth, "USD"),
    [selectedMonth, transactions],
  );
  // Savings are excluded here so putting money aside does not read as spending.
  const usdSpending = useMemo(
    () => calculateSpendingTotals(monthTransactions, "USD"),
    [monthTransactions],
  );
  const lbpSpending = useMemo(
    () => calculateSpendingTotals(monthTransactions, "LBP"),
    [monthTransactions],
  );
  const hasLbpDeposits = lbpTotals.deposits > 0;
  const hasLbpAvailable = useMemo(
    () =>
      transactionsUpToMonth.some(
        (transaction) =>
          transaction.currency === "LBP" &&
          transaction.transaction_type === "deposit",
      ),
    [transactionsUpToMonth],
  );
  const recentTransactions = monthTransactions.slice(0, 3);

  return (
    <ThemedView style={styles.screen}>
      <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
        <ScreenHeader
          eyebrow="Masrafji"
          title="Home"
          onAddPress={openCreateTransaction}
        />

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

        <ThemedView type="backgroundElement" style={styles.balanceCard}>
          <ThemedText type="small" themeColor="textSecondary">
            Available balance
          </ThemedText>
          <ThemedText type="subtitle">
            {formatMoney(usdAvailable, "USD")}
          </ThemedText>
          {hasLbpAvailable && (
            <ThemedText type="default">
              {formatMoney(lbpAvailable, "LBP")}
            </ThemedText>
          )}
          {usdCarried !== 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              Includes {formatMoney(usdCarried, "USD")} carried over
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.balanceCard}>
          <ThemedText type="small" themeColor="textSecondary">
            This month
          </ThemedText>
          <ThemedText type="subtitle">
            {formatMoney(usdTotals.balance, "USD")}
          </ThemedText>
          {hasLbpDeposits && (
            <ThemedText type="default">
              {formatMoney(lbpTotals.balance, "LBP")}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.progressCard}>
          <ThemedText type="smallBold">Spent vs deposits</ThemedText>
          <WalletProgress
            label="USD"
            deposits={usdSpending.deposits}
            expenses={usdSpending.expenses}
          />
          {hasLbpDeposits && (
            <WalletProgress
              label="LBP"
              deposits={lbpSpending.deposits}
              expenses={lbpSpending.expenses}
            />
          )}
        </ThemedView>

        <View style={styles.walletGroups}>
          <MetricGroup
            title="USD"
            deposits={formatMoney(usdTotals.deposits, "USD")}
            expenses={formatMoney(usdTotals.expenses, "USD")}
          />
          <MetricGroup
            title="LBP"
            deposits={formatMoney(lbpTotals.deposits, "LBP")}
            expenses={formatMoney(lbpTotals.expenses, "LBP")}
          />
        </View>

        <ScreenState errorMessage={errorMessage} />

        <SectionHeader title="Recent transactions" loading={loading} />
        <ScreenState
          empty={recentTransactions.length === 0}
          emptyTitle="No transactions this month"
          emptyMessage="Use the + button to add your first deposit or expense."
        />
        <TransactionList
          transactions={recentTransactions}
          onSelected={openEditTransaction}
          onDeleted={removeTransaction}
        />
      </ScreenScrollView>

      <TransactionModal
        visible={modalVisible}
        session={session}
        transaction={editingTransaction}
        onClose={closeTransactionModal}
        onCreated={addTransaction}
        onUpdated={replaceTransaction}
      />
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

const GuardedHomeScreen = withAuthGuard(HomeScreenContent);
