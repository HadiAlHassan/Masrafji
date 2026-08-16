import { useCallback, useMemo, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

import { useTransactionsContext } from '@/components/transactions-provider';
import type { TransactionType } from '@/lib/database.types';

/**
 * Reads the shared transaction store. The optional `type` filters the returned list
 * without changing what is fetched, so every screen stays backed by the same data.
 */
export function useTransactions(type?: TransactionType) {
  const {
    authLoading,
    session,
    transactions,
    loading,
    refreshing,
    errorMessage,
    refresh,
    reload,
    addTransaction,
    replaceTransaction,
    removeTransaction,
  } = useTransactionsContext();
  const isFirstFocus = useRef(true);

  // Picks up changes made outside the app, such as edits run directly against the database.
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }

      reload();
    }, [reload]),
  );

  const visibleTransactions = useMemo(
    () =>
      type
        ? transactions.filter((transaction) => transaction.transaction_type === type)
        : transactions,
    [transactions, type],
  );

  return {
    authLoading,
    session,
    transactions: visibleTransactions,
    loading,
    refreshing,
    errorMessage,
    refresh,
    addTransaction,
    replaceTransaction,
    removeTransaction,
  };
}
