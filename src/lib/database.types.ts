export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'health'
  | 'entertainment'
  | 'home'
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Transaction = Database['public']['Tables']['expenses']['Row'];
export type NewTransaction = Database['public']['Tables']['expenses']['Insert'];
export type Expense = Transaction;
export type NewExpense = NewTransaction;
