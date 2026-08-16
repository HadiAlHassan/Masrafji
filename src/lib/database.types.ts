export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'health'
  | 'entertainment'
  | 'home'
  | 'saving'
  | 'other';

export type TransactionType = 'deposit' | 'expense';
export type TransactionCurrency = 'USD' | 'LBP';

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          user_id: string;
          transaction_type: TransactionType;
          title: string;
          amount: number;
          currency: TransactionCurrency;
          category: ExpenseCategory;
          note: string | null;
          spent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_type: TransactionType;
          title: string;
          amount: number;
          currency: TransactionCurrency;
          category: ExpenseCategory;
          note?: string | null;
          spent_at?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          amount?: number;
          currency?: TransactionCurrency;
          category?: ExpenseCategory;
          note?: string | null;
          spent_at?: string;
          transaction_type?: TransactionType;
          user_id?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target_amount: number;
          currency: TransactionCurrency;
          note: string | null;
          achieved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          target_amount: number;
          currency: TransactionCurrency;
          note?: string | null;
          achieved_at?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          target_amount?: number;
          currency?: TransactionCurrency;
          note?: string | null;
          achieved_at?: string | null;
        };
        Relationships: [];
      };
      transaction_triggers: {
        Row: {
          id: string;
          user_id: string;
          transaction_type: TransactionType;
          title: string;
          amount: number;
          currency: TransactionCurrency;
          category: ExpenseCategory;
          note: string | null;
          day_of_month: number | null;
          last_triggered_on: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_type: TransactionType;
          title: string;
          amount: number;
          currency: TransactionCurrency;
          category: ExpenseCategory;
          note?: string | null;
          day_of_month?: number | null;
          last_triggered_on?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          transaction_type?: TransactionType;
          title?: string;
          amount?: number;
          currency?: TransactionCurrency;
          category?: ExpenseCategory;
          note?: string | null;
          day_of_month?: number | null;
          last_triggered_on?: string | null;
          active?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Transaction = Database['public']['Tables']['expenses']['Row'];
export type NewTransaction = Database['public']['Tables']['expenses']['Insert'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type NewGoal = Database['public']['Tables']['goals']['Insert'];
export type GoalUpdate = Database['public']['Tables']['goals']['Update'];
export type TransactionTrigger = Database['public']['Tables']['transaction_triggers']['Row'];
export type NewTransactionTrigger =
  Database['public']['Tables']['transaction_triggers']['Insert'];
export type TransactionTriggerUpdate =
  Database['public']['Tables']['transaction_triggers']['Update'];
export type Expense = Transaction;
export type NewExpense = NewTransaction;
