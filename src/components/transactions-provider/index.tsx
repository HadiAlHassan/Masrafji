import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import type { Transaction } from "@/lib/database.types";
import { listTransactions } from "@/lib/expenses";

type TransactionsContextValue = {
  authLoading: boolean;
  session: Session | null;
  transactions: Transaction[];
  loading: boolean;
  refreshing: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  reload: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  replaceTransaction: (transaction: Transaction) => void;
  removeTransaction: (transactionId: Transaction["id"]) => void;
};

const TransactionsContext = createContext<TransactionsContextValue | null>(
  null,
);

function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort((firstTransaction, secondTransaction) => {
    const spentAtComparison =
      new Date(secondTransaction.spent_at).getTime() -
      new Date(firstTransaction.spent_at).getTime();

    if (spentAtComparison !== 0) {
      return spentAtComparison;
    }

    return (
      new Date(secondTransaction.created_at).getTime() -
      new Date(firstTransaction.created_at).getTime()
    );
  });
}

/**
 * Holds the single copy of the user's transactions so every screen reads and writes the
 * same list. Without this each screen kept its own fetch and edits made on one screen
 * were invisible to the others until a manual refresh.
 */
export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuthSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (!session) {
      setTransactions([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (inFlight.current) {
      return;
    }

    try {
      inFlight.current = true;
      setErrorMessage(null);
      const nextTransactions = await listTransactions();
      setTransactions(nextTransactions);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load transactions.",
      );
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
  }, [load]);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((currentTransactions) =>
      sortTransactions([transaction, ...currentTransactions]),
    );
  }, []);

  const replaceTransaction = useCallback((transaction: Transaction) => {
    setTransactions((currentTransactions) =>
      sortTransactions(
        currentTransactions.map((currentTransaction) =>
          currentTransaction.id === transaction.id
            ? transaction
            : currentTransaction,
        ),
      ),
    );
  }, []);

  const removeTransaction = useCallback((transactionId: Transaction["id"]) => {
    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (transaction) => transaction.id !== transactionId,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      authLoading,
      session,
      transactions,
      loading,
      refreshing,
      errorMessage,
      refresh,
      reload: load,
      addTransaction,
      replaceTransaction,
      removeTransaction,
    }),
    [
      addTransaction,
      authLoading,
      errorMessage,
      load,
      loading,
      refresh,
      refreshing,
      removeTransaction,
      replaceTransaction,
      session,
      transactions,
    ],
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactionsContext() {
  const context = useContext(TransactionsContext);

  if (!context) {
    throw new Error(
      "useTransactionsContext must be used inside a TransactionsProvider.",
    );
  }

  return context;
}
