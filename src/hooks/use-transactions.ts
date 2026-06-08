import { useCallback, useEffect, useState } from 'react';

import { useAuthSession } from '@/hooks/use-auth-session';
import type { Transaction, TransactionType } from '@/lib/database.types';
import { listTransactions } from '@/lib/expenses';

export function useTransactions(type?: TransactionType) {
  const { session, loading: authLoading } = useAuthSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!session) {
      setTransactions([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setErrorMessage(null);
      const nextTransactions = await listTransactions(type);
      setTransactions(nextTransactions);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not load transactions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session, type]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  async function refresh() {
    setRefreshing(true);
    await loadTransactions();
  }

  function addTransaction(transaction: Transaction) {
    setTransactions((currentTransactions) => [transaction, ...currentTransactions]);
  }

  function replaceTransaction(transaction: Transaction) {
    setTransactions((currentTransactions) =>
      currentTransactions
        .map((currentTransaction) =>
          currentTransaction.id === transaction.id ? transaction : currentTransaction,
        )
        .sort((firstTransaction, secondTransaction) => {
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
        }),
    );
  }

  function removeTransaction(transactionId: Transaction['id']) {
    setTransactions((currentTransactions) =>
      currentTransactions.filter((transaction) => transaction.id !== transactionId),
    );
  }

  return {
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
  };
}
