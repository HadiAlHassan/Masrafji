import type { Session } from "@supabase/supabase-js";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { withAuthGuard } from "@/components/auth-guard";
import { NoticeCard } from "@/components/notice-card";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TransactionList } from "@/components/transaction-list";
import { TransactionModal } from "@/components/transaction-modal";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTransactions } from "@/hooks/use-transactions";
import type { Transaction, TransactionType } from "@/lib/database.types";

type HistoryFilter = "all" | TransactionType;

export default function HistoryScreen() {
  const [filter, setFilter] = useState<HistoryFilter>("all");
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
  } = useTransactions(filter === "all" ? undefined : filter);

  return (
    <GuardedHistoryScreen
      authLoading={authLoading}
      session={session}
      filter={filter}
      onFilterChange={setFilter}
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

type HistoryScreenContentProps = {
  authLoading: boolean;
  session: Session | null;
  filter: HistoryFilter;
  onFilterChange: (filter: HistoryFilter) => void;
  transactions: Transaction[];
  loading: boolean;
  refreshing: boolean;
  errorMessage: string | null;
  refresh: () => void;
  addTransaction: (transaction: Transaction) => void;
  replaceTransaction: (transaction: Transaction) => void;
  removeTransaction: (transactionId: Transaction["id"]) => void;
};

function HistoryScreenContent({
  session,
  filter,
  onFilterChange,
  transactions,
  loading,
  refreshing,
  errorMessage,
  refresh,
  addTransaction,
  replaceTransaction,
  removeTransaction,
}: HistoryScreenContentProps) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  return (
    <ThemedView style={styles.screen}>
      <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
        <ScreenHeader
          eyebrow="Transaction history"
          title="Cashflow"
          onAddPress={() => {
            setEditingTransaction(null);
            setModalVisible(true);
          }}
        />

          <View style={styles.filterRow}>
            {(["all", "deposit", "expense"] as const).map((filterOption) => {
              const selected = filterOption === filter;

              return (
                <Pressable
                  key={filterOption}
                  onPress={() => onFilterChange(filterOption)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: selected
                        ? theme.text
                        : theme.backgroundElement,
                    },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={{ color: selected ? theme.background : theme.text }}
                  >
                    {filterOption === "all"
                      ? "All"
                      : filterOption === "deposit"
                        ? "Deposits"
                        : "Expenses"}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {errorMessage && <NoticeCard message={errorMessage} />}

          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">
              {transactions.length} transactions
            </ThemedText>
            {loading && <ActivityIndicator color={theme.text} />}
          </View>
          <TransactionList
            transactions={transactions}
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
    </ThemedView>
  );
}

const GuardedHistoryScreen = withAuthGuard(HistoryScreenContent);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  filterButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
