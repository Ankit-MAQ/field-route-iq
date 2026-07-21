// Order persistence. Saved orders carry the full PricedOrder breakdown
// (see SPEC.md §2) plus the account and date they were captured for.

export interface PricedLine {
  productId: string
  qty: number
  unitPrice: number
  gross: number
  appliedPromoId: string | null
  discount: number
  net: number
}

export interface PricedOrder {
  lines: PricedLine[]
  orderLevel: { appliedPromoId: string | null; discount: number }
  subtotal: number
  total: number
}

export interface SavedOrder extends PricedOrder {
  accountId: string
  date: string // ISO date
}

const STORAGE_KEY = 'friq.orders'

export function getOrders(): SavedOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedOrder[]) : []
  } catch {
    return []
  }
}

export function saveOrder(order: SavedOrder): void {
  const orders = getOrders()
  orders.push(order)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}
