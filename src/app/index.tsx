import type { Session } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { withAuthGuard } from "@/components/auth-guard";
import { MetricGroup } from "@/components/metric-group";
import { MonthPicker } from "@/components/month-picker";
import { MonthSelector } from "@/components/month-selector";
import { NoticeCard } from "@/components/notice-card";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TransactionList } from "@/components/transaction-list";
import { TransactionModal } from "@/components/transaction-modal";
import { WalletProgress } from "@/components/wallet-progress";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTransactions } from "@/hooks/use-transactions";
import type { Transaction } from "@/lib/database.types";
import {
  calculateTotals,
  filterTransactionsByMonth,
  formatMoney,
  getAdjacentAvailableMonth,
  getAvailableMonthKeys,
  getMonthKey,
} from "@/lib/transaction-helpers";

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

type HomeScreenContentProps = {
  authLoading: boolean;
  session: Session | null;
  transactions: Transaction[];
  loading: boolean;
  refreshing: boolean;
  errorMessage: string | null;
  refresh: () => void;
  addTransaction: (transaction: Transaction) => void;
  replaceTransaction: (transaction: Transaction) => void;
  removeTransaction: (transactionId: Transaction["id"]) => void;
};

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
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  const availableMonths = useMemo(
    () => getAvailableMonthKeys(transactions),
    [transactions],
  );
  const previousAvailableMonth = useMemo(
    () => getAdjacentAvailableMonth(selectedMonth, availableMonths, "previous"),
    [availableMonths, selectedMonth],
  );
  const nextAvailableMonth = useMemo(
    () => getAdjacentAvailableMonth(selectedMonth, availableMonths, "next"),
    [availableMonths, selectedMonth],
  );
  const monthTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [selectedMonth, transactions],
  );
  const usdTotals = useMemo(
    () => calculateTotals(monthTransactions, "USD"),
    [monthTransactions],
  );
  const lbpTotals = useMemo(
    () => calculateTotals(monthTransactions, "LBP"),
    [monthTransactions],
  );
  const recentTransactions = monthTransactions.slice(0, 3);

  return (
    <ThemedView style={styles.screen}>
      <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
        <ScreenHeader
          eyebrow="Masrafji"
          title="Home"
          onAddPress={() => {
            setEditingTransaction(null);
            setModalVisible(true);
          }}
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
            Month balance
          </ThemedText>
          <ThemedText type="subtitle">
            {formatMoney(usdTotals.balance, "USD")}
          </ThemedText>
          <ThemedText type="default">
            {formatMoney(lbpTotals.balance, "LBP")}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.progressCard}>
          <ThemedText type="smallBold">Spent vs deposits</ThemedText>
          <WalletProgress
            label="USD"
            deposits={usdTotals.deposits}
            expenses={usdTotals.expenses}
          />
          <WalletProgress
            label="LBP"
            deposits={lbpTotals.deposits}
            expenses={lbpTotals.expenses}
          />
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

        {errorMessage && <NoticeCard message={errorMessage} />}

        <View style={styles.sectionHeader}>
          <ThemedText type="smallBold">Recent transactions</ThemedText>
          {loading && <ActivityIndicator color={theme.text} />}
        </View>
        <TransactionList
          transactions={recentTransactions}
          onSelected={(transaction) => {
            setEditingTransaction(transaction);
            setModalVisible(true);
          }}
          onDeleted={removeTransaction}
        />
      </ScreenScrollView>

      <TransactionModal
        visible={modalVisible}
        session={session}
        transaction={editingTransaction}
        onClose={() => {
          setModalVisible(false);
          setEditingTransaction(null);
        }}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  balanceCard: {
    borderRadius: Spacing.four,
    gap: Spacing.one,
    padding: Spacing.four,
  },
  progressCard: {
    borderRadius: Spacing.four,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  walletGroups: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
