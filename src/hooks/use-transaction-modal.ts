import { useState } from "react";

import type { Transaction } from "@/lib/database.types";

export function useTransactionModal() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  function openCreateTransaction() {
    setEditingTransaction(null);
    setModalVisible(true);
  }

  function openEditTransaction(transaction: Transaction) {
    setEditingTransaction(transaction);
    setModalVisible(true);
  }

  function closeTransactionModal() {
    setModalVisible(false);
    setEditingTransaction(null);
  }

  return {
    modalVisible,
    editingTransaction,
    openCreateTransaction,
    openEditTransaction,
    closeTransactionModal,
  };
}
