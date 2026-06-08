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
  'other',
] as const;

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
