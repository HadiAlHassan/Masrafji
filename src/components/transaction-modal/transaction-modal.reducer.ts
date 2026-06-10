import type {
  ExpenseCategory,
  Transaction,
  TransactionCurrency,
  TransactionType,
} from "@/lib/database.types";
import { todayIsoDate } from "@/lib/transaction-helpers";

export type TransactionModalState = {
  transactionType: TransactionType;
  title: string;
  amount: string;
  currency: TransactionCurrency;
  category: ExpenseCategory;
  spentAt: string;
  note: string;
  saving: boolean;
  message: string | null;
  categoryPickerVisible: boolean;
  datePickerVisible: boolean;
};

export type TransactionModalAction =
  | { type: "reset" }
  | { type: "loadTransaction"; transaction: Transaction }
  | { type: "setTransactionType"; transactionType: TransactionType }
  | { type: "setTitle"; title: string }
  | { type: "setAmount"; amount: string }
  | { type: "setCurrency"; currency: TransactionCurrency }
  | { type: "setCategory"; category: ExpenseCategory }
  | { type: "setSpentAt"; spentAt: string }
  | { type: "setNote"; note: string }
  | { type: "setSaving"; saving: boolean }
  | { type: "setMessage"; message: string | null }
  | { type: "setCategoryPickerVisible"; visible: boolean }
  | { type: "setDatePickerVisible"; visible: boolean };

export function getInitialTransactionModalState(): TransactionModalState {
  return {
    transactionType: "expense",
    title: "",
    amount: "",
    currency: "USD",
    category: "food",
    spentAt: todayIsoDate(),
    note: "",
    saving: false,
    message: null,
    categoryPickerVisible: false,
    datePickerVisible: false,
  };
}

export function transactionModalReducer(
  state: TransactionModalState,
  action: TransactionModalAction,
): TransactionModalState {
  switch (action.type) {
    case "reset":
      return getInitialTransactionModalState();
    case "loadTransaction":
      return {
        ...state,
        transactionType: action.transaction.transaction_type,
        title: action.transaction.title,
        amount: String(Number(action.transaction.amount)),
        currency: action.transaction.currency,
        category: action.transaction.category,
        spentAt: action.transaction.spent_at,
        note: action.transaction.note ?? "",
        message: null,
      };
    case "setTransactionType":
      return { ...state, transactionType: action.transactionType };
    case "setTitle":
      return { ...state, title: action.title };
    case "setAmount":
      return { ...state, amount: action.amount };
    case "setCurrency":
      return { ...state, currency: action.currency };
    case "setCategory":
      return { ...state, category: action.category };
    case "setSpentAt":
      return { ...state, spentAt: action.spentAt };
    case "setNote":
      return { ...state, note: action.note };
    case "setSaving":
      return { ...state, saving: action.saving };
    case "setMessage":
      return { ...state, message: action.message };
    case "setCategoryPickerVisible":
      return { ...state, categoryPickerVisible: action.visible };
    case "setDatePickerVisible":
      return { ...state, datePickerVisible: action.visible };
  }
}
