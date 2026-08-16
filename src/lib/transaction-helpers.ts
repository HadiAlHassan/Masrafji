import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { ExpenseCategory, Transaction, TransactionCurrency } from '@/lib/database.types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export const transactionCategories = [
  'food',
  'transport',
  'shopping',
  'bills',
  'health',
  'entertainment',
  'home',
  'saving',
  'other',
] as const;

/**
 * Money moved into savings leaves the available balance but is not consumption, so it is
 * kept out of spending comparisons and category breakdowns.
 */
export const SavingCategory = 'saving' satisfies ExpenseCategory;

export const transactionCategoryDetails: Record<
  ExpenseCategory,
  { label: string; icon: IoniconName }
> = {
  food: { label: 'Food', icon: 'fast-food-outline' },
  transport: { label: 'Transport', icon: 'car-outline' },
  shopping: { label: 'Shopping', icon: 'bag-outline' },
  bills: { label: 'Bills', icon: 'receipt-outline' },
  health: { label: 'Health', icon: 'medkit-outline' },
  entertainment: { label: 'Entertainment', icon: 'game-controller-outline' },
  home: { label: 'Home', icon: 'home-outline' },
  saving: { label: 'Saving', icon: 'wallet-outline' },
  other: { label: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
};

export const transactionCurrencies: TransactionCurrency[] = ['USD', 'LBP'];

const currencyFormatters: Record<TransactionCurrency, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }),
  LBP: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LBP',
    maximumFractionDigits: 0,
  }),
};

export const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

export function formatMoney(amount: number, currency: TransactionCurrency) {
  return currencyFormatters[currency].format(amount);
}

export function calculateTotals(transactions: Transaction[], currency: TransactionCurrency) {
  const scopedTransactions = transactions.filter((transaction) => transaction.currency === currency);
  const deposits = scopedTransactions
    .filter((transaction) => transaction.transaction_type === 'deposit')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const expenses = scopedTransactions
    .filter((transaction) => transaction.transaction_type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  return {
    deposits,
    expenses,
    balance: deposits - expenses,
  };
}

/**
 * Totals with savings contributions removed from the expense side, for the spending
 * comparisons where moving money into savings should not read as consumption.
 */
export function calculateSpendingTotals(
  transactions: Transaction[],
  currency: TransactionCurrency,
) {
  return calculateTotals(
    transactions.filter((transaction) => transaction.category !== SavingCategory),
    currency,
  );
}

/** Everything put aside as savings, across all time. */
export function calculateSavedTotal(
  transactions: Transaction[],
  currency: TransactionCurrency,
) {
  return transactions
    .filter(
      (transaction) =>
        transaction.currency === currency &&
        transaction.transaction_type === 'expense' &&
        transaction.category === SavingCategory,
    )
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
}

export function countSavingContributions(
  transactions: Transaction[],
  currency: TransactionCurrency,
) {
  return transactions.filter(
    (transaction) =>
      transaction.currency === currency &&
      transaction.transaction_type === 'expense' &&
      transaction.category === SavingCategory,
  ).length;
}

export function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

export function shiftMonth(monthKey: string, monthOffset: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const nextDate = new Date(year, month - 1 + monthOffset, 1);

  return getMonthKey(nextDate);
}

export function filterTransactionsByMonth(transactions: Transaction[], monthKey: string) {
  return transactions.filter((transaction) => transaction.spent_at.startsWith(monthKey));
}

/**
 * Transactions from every month up to and including the selected one, so a balance can
 * account for money that was deposited before the selected month.
 */
export function filterTransactionsUpToMonth(transactions: Transaction[], monthKey: string) {
  return transactions.filter((transaction) => transaction.spent_at.slice(0, 7) <= monthKey);
}

/**
 * The balance carried into the selected month, meaning everything that happened strictly
 * before it.
 */
export function calculateCarriedBalance(
  transactions: Transaction[],
  monthKey: string,
  currency: TransactionCurrency,
) {
  const earlierTransactions = transactions.filter(
    (transaction) => transaction.spent_at.slice(0, 7) < monthKey,
  );

  return calculateTotals(earlierTransactions, currency).balance;
}

export function getAvailableMonthKeys(transactions: Transaction[]) {
  return Array.from(
    new Set([getMonthKey(), ...transactions.map((transaction) => transaction.spent_at.slice(0, 7))]),
  ).sort((firstMonth, secondMonth) => secondMonth.localeCompare(firstMonth));
}

export function getAdjacentAvailableMonth(
  selectedMonth: string,
  availableMonths: string[],
  direction: 'next' | 'previous',
) {
  const sortedMonths = [...availableMonths].sort((firstMonth, secondMonth) =>
    firstMonth.localeCompare(secondMonth),
  );
  const currentIndex = sortedMonths.indexOf(selectedMonth);

  if (currentIndex === -1) {
    return null;
  }

  const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

  return sortedMonths[nextIndex] ?? null;
}

export function todayIsoDate() {
  return dateToIsoDate(new Date());
}

export function dateToIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isoDateToLocalDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Date(year, month - 1, day);
}
