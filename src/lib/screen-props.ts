import type { Session } from "@supabase/supabase-js";

import type { Transaction } from "@/lib/database.types";

export interface TransactionScreenContentProps {
  authLoading: boolean;
  session: Session | null;
  transactions: Transaction[];
  loading: boolean;
  refreshing: boolean;
  errorMessage: string | null;
  refresh: () => void;
}

export interface TransactionMutationProps {
  addTransaction: (transaction: Transaction) => void;
  replaceTransaction: (transaction: Transaction) => void;
  removeTransaction: (transactionId: Transaction["id"]) => void;
}
