
export interface AccountLine {
  account: string
  label: string
  debit: number
  credit: number
}

export interface LedgerEntry {
  id: string
  tenantId: string
  reference: string
  description: string
  sourceInvoiceId?: string
  ownerUserId?: string | null
  createdAt: string
  lines: AccountLine[]
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
