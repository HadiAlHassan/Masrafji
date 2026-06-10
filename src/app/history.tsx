import { useState } from "react";
import { View } from "react-native";

import { withAuthGuard } from "@/components/auth-guard";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ScreenState } from "@/components/screen-state";
import { SectionHeader } from "@/components/section-header";
import { SelectablePill } from "@/components/selectable-pill";
import { ThemedView } from "@/components/themed-view";
import { TransactionList } from "@/components/transaction-list";
import { TransactionModal } from "@/components/transaction-modal";
import { useTheme } from "@/hooks/use-theme";
import { useTransactionModal } from "@/hooks/use-transaction-modal";
import { useTransactions } from "@/hooks/use-transactions";
import type { TransactionType } from "@/lib/database.types";
import type {
  TransactionMutationProps,
  TransactionScreenContentProps,
} from "@/lib/screen-props";
import { styles } from "./history.styles";

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

interface HistoryFilterProps {
  filter: HistoryFilter;
  onFilterChange: (filter: HistoryFilter) => void;
}

interface HistoryScreenContentProps
  extends
    TransactionScreenContentProps,
    TransactionMutationProps,
    HistoryFilterProps {}

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
  const {
    modalVisible,
    editingTransaction,
    openCreateTransaction,
    openEditTransaction,
    closeTransactionModal,
  } = useTransactionModal();

  return (
    <ThemedView style={styles.screen}>
      <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
        <ScreenHeader
          eyebrow="Transaction history"
          title="Cashflow"
          onAddPress={openCreateTransaction}
        />

        <View style={styles.filterRow}>
          {(["all", "deposit", "expense"] as const).map((filterOption) => {
            const selected = filterOption === filter;

            return (
              <SelectablePill
                key={filterOption}
                onPress={() => onFilterChange(filterOption)}
                selected={selected}
                unselectedBackground={theme.backgroundElement}
                style={styles.filterButton}
              >
                {filterOption === "all"
                  ? "All"
                  : filterOption === "deposit"
                    ? "Deposits"
                    : "Expenses"}
              </SelectablePill>
            );
          })}
        </View>

        <ScreenState errorMessage={errorMessage} />

        <SectionHeader
          title={`${transactions.length} transactions`}
          loading={loading}
        />
        <ScreenState
          empty={transactions.length === 0}
          emptyTitle="No transactions found"
          emptyMessage={
            filter === "all"
              ? "Use the + button to add your first deposit or expense."
              : `No ${filter}s match this filter yet.`
          }
        />
        <TransactionList
          transactions={transactions}
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
    </ThemedView>
  );
}

const GuardedHistoryScreen = withAuthGuard(HistoryScreenContent);
