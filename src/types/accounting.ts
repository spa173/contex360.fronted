
export interface AccountLine {
  id?: string
  ledgerEntryId?: string
  account: string
  label: string
  debit: number
  credit: number
  createdAt?: string
  updatedAt?: string
}

export interface LedgerEntry {
  id: string
  tenantId: string
  referenceType: string
  referenceId?: string | null
  description: string
  amount: number
  entryAt: string
  createdAt: string
  updatedAt?: string
  lines: AccountLine[]
  [key: string]: unknown
}

export interface AccountNode {
  code: string
  name: string
  balance: number
  children: AccountNode[]
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cost'
}

export interface BalanceSheet {
  at: string
  assets: AccountNode[]
  liabilities: AccountNode[]
  equity: AccountNode[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
}

export interface ProfitAndLoss {
  from: string
  to: string
  revenue: AccountNode[]
  expenses: AccountNode[]
  costs: AccountNode[]
  grossProfit: number
  operatingProfit: number
  netProfit: number
}
