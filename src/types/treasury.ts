export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionCategory = 'CAJA' | 'BANCO' | 'PETTY_CASH'

export interface Transaction {
  id: string
  tenantId: string
  type: TransactionType
  amount: number
  date: string
  description: string
  category: TransactionCategory
  reference?: string | null
  invoiceId?: string | null
  purchaseId?: string | null
  invoice?: { id: string; number: string } | null
  purchase?: { id: string; number: string } | null
  createdAt?: string
}

export interface TreasuryBalance {
  balance: number
  incomeMonth: number
  expenseMonth: number
}

export interface CreateTransactionPayload {
  type: TransactionType
  amount: number
  description: string
  category: TransactionCategory
  date?: string
  reference?: string
  invoiceId?: string
  purchaseId?: string
}

export interface ProgrammedPayment {
  id: string
  vendorName: string
  dueDate: string
  priority: string
  amount: number
  status: string
}
