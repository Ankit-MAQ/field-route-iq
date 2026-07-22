import { getProducts, getAccounts, getPromotions, getProduct } from '../data/index'
import type { Product, Promotion } from '../data/index'

export interface CartLine { productId: string; qty: number }

export interface PriceOrderInput {
  lines: CartLine[]
  accountId: string
  date: string
}

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

function round2(n: number): number {
  return Number(Math.round(parseFloat(n + 'e2')) + 'e-2')
}

function isInteger(n: number): boolean {
  return Number.isInteger(n)
}

export function priceOrder(input: PriceOrderInput): PricedOrder {
  const { lines, accountId, date } = input

  const account = getAccounts().find((a) => a.id === accountId)
  if (!account) throw new Error(`Unknown account: ${accountId}`)

  const products = getProducts()
  const promos = getPromotions()

  // Validate lines
  for (const l of lines) {
    const p = getProduct(l.productId)
    if (!p) throw new Error(`Unknown product: ${l.productId}`)
    if (!isInteger(l.qty) || l.qty <= 0) throw new Error(`Invalid qty for ${l.productId}`)
  }

  // Precompute product map
  const productMap = new Map<string, Product>()
  for (const p of products) productMap.set(p.id, p)

  // Filter active & eligible promotions for date/account
  const activePromos = promos.filter((promo) => {
    if (promo.validFrom > date) return false
    if (promo.validTo < date) return false
    if ((promo as any).eligibleSegments && (promo as any).eligibleSegments.length > 0) {
      const segs = (promo as any).eligibleSegments as string[]
      return segs.includes(account.segment)
    }
    return true
  })

  const pricedLines: PricedLine[] = []

  // For each line, compute gross and best applicable line-level promo
  for (const l of lines) {
    const prod = productMap.get(l.productId) as Product
    const unitPrice = prod.unitPrice
    const grossRaw = unitPrice * l.qty
    const gross = round2(grossRaw)

    // find applicable line promos
    const lineCandidates: Array<{
      promo: Promotion
      discount: number
    }> = []

    for (const promo of activePromos) {
      if (promo.type === 'percent_off') {
        const scope = (promo as any).scope || {}
        let matches = false
        if (scope.category && scope.category === prod.category) matches = true
        if (scope.productIds && Array.isArray(scope.productIds) && scope.productIds.includes(prod.id)) matches = true
        if (!matches) continue
        const percent = (promo as any).percent as number
        const disc = round2(gross * (percent / 100))
        // percent_off with zero discount is possible when gross 0 (but qty>=1 and price>=0 so unlikely). Respect rules.
        if (disc > 0) lineCandidates.push({ promo, discount: disc })
      } else if (promo.type === 'bogo') {
        const bp = promo as any
        if (bp.productId !== prod.id) continue
        const group = Math.floor(l.qty / (bp.buyQty + bp.getQty))
        const freeUnits = group * bp.getQty
        const disc = round2(freeUnits * unitPrice)
        if (disc > 0) lineCandidates.push({ promo, discount: disc })
      }
    }

    let appliedPromoId: string | null = null
    let discount = 0

    if (lineCandidates.length > 0) {
      // choose best: max discount, tie-breaker earlier validFrom, then id lexicographically
      lineCandidates.sort((a, b) => {
        if (b.discount !== a.discount) return b.discount - a.discount
        if (a.promo.validFrom !== b.promo.validFrom) return a.promo.validFrom < b.promo.validFrom ? -1 : 1
        return a.promo.id < b.promo.id ? -1 : 1
      })
      appliedPromoId = lineCandidates[0].promo.id
      discount = round2(lineCandidates[0].discount)
    }

    const netRaw = gross - discount
    const net = Math.max(0, round2(netRaw))

    pricedLines.push({
      productId: l.productId,
      qty: l.qty,
      unitPrice,
      gross,
      appliedPromoId,
      discount,
      net,
    })
  }

  // Order-level threshold promos evaluated after line nets
  const thresholdPromos = activePromos.filter((p) => p.type === 'threshold')

  let appliedOrderPromoId: string | null = null
  let orderLevelDiscount = 0

  if (thresholdPromos.length > 0) {
    const qualifying: Array<{ promo: Promotion; amountOff: number }> = []
    for (const promo of thresholdPromos) {
      const tp = promo as any
      const category = tp.category as string
      const minSubtotal = tp.minSubtotal as number
      const amountOff = tp.amountOff as number
      // sum nets for lines in that category
      const sumNets = pricedLines.reduce((acc, ln) => {
        const prod = productMap.get(ln.productId) as Product
        if (prod.category === category) return acc + ln.net
        return acc
      }, 0)
      const sumRounded = round2(sumNets)
      if (sumRounded >= minSubtotal) {
        qualifying.push({ promo, amountOff })
      }
    }

    if (qualifying.length > 0) {
      qualifying.sort((a, b) => {
        if (b.amountOff !== a.amountOff) return b.amountOff - a.amountOff
        if (a.promo.validFrom !== b.promo.validFrom) return a.promo.validFrom < b.promo.validFrom ? -1 : 1
        return a.promo.id < b.promo.id ? -1 : 1
      })
      appliedOrderPromoId = qualifying[0].promo.id
      orderLevelDiscount = round2(qualifying[0].amountOff)
    }
  }

  const subtotal = round2(pricedLines.reduce((s, ln) => s + ln.net, 0))
  let total = round2(subtotal - orderLevelDiscount)
  if (total < 0) total = 0

  return {
    lines: pricedLines,
    orderLevel: { appliedPromoId: appliedOrderPromoId, discount: orderLevelDiscount },
    subtotal,
    total,
  }
}
