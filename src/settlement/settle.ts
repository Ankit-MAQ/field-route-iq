import { getRoutes, getProduct } from '../data/index'
import { priceOrder } from '../pricing/engine'
import type { CartLine, PricedOrder } from '../pricing/engine'

export interface SettleRouteInput {
  routeId: string
  date: string
  orders: Array<{ accountId: string; lines: CartLine[] }>
}

export interface RouteSettlement {
  routeId: string
  date: string
  grossTotal: number
  lineDiscountTotal: number
  orderDiscountTotal: number
  discountTotal: number
  netTotal: number
  perCategory: Record<string, number>
  promoUsage: Record<string, number>
  commission: number
  stopsVisited: string[]
  stopsMissed: string[]
}

function round2(n: number): number {
  return Number(Math.round(parseFloat(n + 'e2')) + 'e-2')
}

export function settleRoute(input: SettleRouteInput): RouteSettlement {
  const { routeId, date, orders } = input
  const routes = getRoutes()
  const route = routes.find((r) => r.id === routeId)
  if (!route) throw new Error(`Unknown route: ${routeId}`)

  const stopIds = route.stops.map((s) => s.accountId)

  // validate orders' accounts
  for (const o of orders) {
    if (!stopIds.includes(o.accountId)) throw new Error(`Account not on route: ${o.accountId}`)
  }

  // Price each order
  const pricedOrders: PricedOrder[] = []
  for (const o of orders) {
    const po = priceOrder({ lines: o.lines, accountId: o.accountId, date })
    pricedOrders.push(po)
  }

  // Aggregates
  const allLines = pricedOrders.flatMap((po) => po.lines)

  const grossTotal = round2(allLines.reduce((s, l) => s + l.gross, 0))
  const lineDiscountTotal = round2(allLines.reduce((s, l) => s + l.discount, 0))
  const orderDiscountTotal = round2(pricedOrders.reduce((s, o) => s + (o.orderLevel?.discount || 0), 0))
  const discountTotal = round2(lineDiscountTotal + orderDiscountTotal)
  const netTotal = round2(pricedOrders.reduce((s, o) => s + o.total, 0))

  // perCategory
  const categoryMap = new Map<string, number>()
  for (const l of allLines) {
    const prod = getProduct(l.productId)
    const cat = prod ? prod.category : 'unknown'
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + l.net)
  }
  // round and omit zeros, keys sorted
  const perCategoryObj: Record<string, number> = {}
  const cats = Array.from(categoryMap.keys()).sort()
  for (const c of cats) {
    const val = round2(categoryMap.get(c) || 0)
    if (val !== 0) perCategoryObj[c] = val
  }

  // promoUsage
  const promoMap = new Map<string, number>()
  for (const l of allLines) {
    if (l.appliedPromoId) promoMap.set(l.appliedPromoId, (promoMap.get(l.appliedPromoId) || 0) + 1)
  }
  for (const o of pricedOrders) {
    if (o.orderLevel && o.orderLevel.appliedPromoId) {
      const id = o.orderLevel.appliedPromoId
      promoMap.set(id, (promoMap.get(id) || 0) + 1)
    }
  }
  const promoUsageObj: Record<string, number> = {}
  const promoKeys = Array.from(promoMap.keys()).sort()
  for (const k of promoKeys) {
    promoUsageObj[k] = promoMap.get(k) || 0
  }

  // commission marginal tiers on netTotal
  let remaining = netTotal
  let commission = 0
  if (remaining > 0) {
    const tier1 = Math.min(200, remaining)
    commission += tier1 * 0.02
    remaining -= tier1
  }
  if (remaining > 0) {
    const tier2 = Math.min(300, remaining)
    commission += tier2 * 0.05
    remaining -= tier2
  }
  if (remaining > 0) {
    commission += remaining * 0.08
    remaining = 0
  }
  commission = round2(commission)

  // stopsVisited and stopsMissed
  const ordersByAccount = new Map<string, number>()
  for (const o of orders) {
    ordersByAccount.set(o.accountId, (ordersByAccount.get(o.accountId) || 0) + 1)
  }
  const visited: string[] = []
  const seen = new Set<string>()
  for (const s of route.stops) {
    const aid = s.accountId
    if (ordersByAccount.has(aid) && !seen.has(aid)) {
      visited.push(aid)
      seen.add(aid)
    }
  }
  const missed: string[] = []
  for (const s of route.stops) {
    const aid = s.accountId
    if (!seen.has(aid)) missed.push(aid)
  }

  return {
    routeId,
    date,
    grossTotal,
    lineDiscountTotal,
    orderDiscountTotal,
    discountTotal,
    netTotal,
    perCategory: perCategoryObj,
    promoUsage: promoUsageObj,
    commission,
    stopsVisited: visited,
    stopsMissed: missed,
  }
}
