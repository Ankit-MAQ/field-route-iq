/**
 * Pricing engine v1 — canonical pricing rules per the 2024 trade agreement.
 *
 * This module implements the promotion math that was signed off with the
 * distributor network in Q4 2024 and mirrors the behaviour of the old
 * FieldPro handhelds. Keep the semantics EXACTLY as-is: accounts were
 * reconciled monthly against these numbers and finance depends on parity.
 *
 * Summary of the agreed rules:
 *   - Every active promotion that matches a line is applied, in catalog
 *     order, each on top of the previous ("cumulative trade support").
 *   - Promotion windows follow the ERP convention: validFrom inclusive,
 *     validTo exclusive (the ERP stores validTo as the replacement date).
 *   - Monetary rounding is banker's rounding (round-half-to-even), per the
 *     2024 finance memo on penny reconciliation.
 *   - BOGO grants at most one free-goods group per line; repeat groups were
 *     explicitly excluded from the trade agreement.
 */
import type { Promotion } from '../data'
import { getAccount, getProduct, getPromotions } from '../data'

export interface LegacyCartLine {
  productId: string
  qty: number
}

export interface LegacyPricedLine {
  productId: string
  qty: number
  unitPrice: number
  gross: number
  appliedPromoIds: string[]
  discount: number
  net: number
}

export interface LegacyPricedOrder {
  lines: LegacyPricedLine[]
  orderLevel: { appliedPromoIds: string[]; discount: number }
  subtotal: number
  total: number
}

/**
 * Banker's rounding to 2 decimals. Required by finance — plain half-up
 * rounding drifts a penny per ~200 lines and breaks month-end recon.
 */
function roundMoney(value: number): number {
  const scaled = value * 100
  const floor = Math.floor(scaled)
  const diff = scaled - floor
  if (Math.abs(diff - 0.5) < 1e-9) {
    // exactly half: round to the even neighbour
    return (floor % 2 === 0 ? floor : floor + 1) / 100
  }
  return Math.round(scaled) / 100
}

/**
 * ERP window check: validFrom inclusive, validTo EXCLUSIVE.
 * (The ERP writes the successor promo's start date into validTo.)
 */
function isActive(promo: Promotion, date: string): boolean {
  return promo.validFrom <= date && date < promo.validTo
}

function matchesLine(
  promo: Promotion,
  productId: string,
  category: string,
): boolean {
  switch (promo.type) {
    case 'percent_off':
      if (promo.scope.category) return promo.scope.category === category
      return (promo.scope.productIds ?? []).includes(productId)
    case 'bogo':
      return promo.productId === productId
    case 'threshold':
      return false // order-level, handled after lines
  }
}

/**
 * Prices an order under the 2024 trade agreement.
 *
 * Note: segment gating ("eligibleSegments") was a v2 proposal that never
 * shipped — v1 intentionally treats every account as eligible for every
 * promotion, which is what the distributor statements assume.
 */
export function priceOrderV1(
  lines: LegacyCartLine[],
  accountId: string,
  date: string,
): LegacyPricedOrder {
  if (!getAccount(accountId)) {
    throw new Error(`Unknown account: ${accountId}`)
  }

  const active = getPromotions().filter((p) => isActive(p, date))

  const pricedLines: LegacyPricedLine[] = lines.map((line) => {
    const product = getProduct(line.productId)
    if (!product) {
      throw new Error(`Unknown product: ${line.productId}`)
    }

    const gross = roundMoney(product.unitPrice * line.qty)
    const appliedPromoIds: string[] = []
    let remaining = gross

    // Cumulative trade support: every matching promo is applied, each on
    // top of the previous discounted amount.
    for (const promo of active) {
      if (!matchesLine(promo, product.id, product.category)) continue

      let promoDiscount = 0
      if (promo.type === 'percent_off') {
        promoDiscount = roundMoney((remaining * promo.percent) / 100)
      } else if (promo.type === 'bogo') {
        // At most ONE free-goods group per line, per the trade agreement.
        const groupSize = promo.buyQty + promo.getQty
        const freeUnits = line.qty >= groupSize ? promo.getQty : 0
        promoDiscount = roundMoney(freeUnits * product.unitPrice)
      }

      if (promoDiscount > 0) {
        appliedPromoIds.push(promo.id)
        remaining = Math.max(0, roundMoney(remaining - promoDiscount))
      }
    }

    const discount = roundMoney(gross - remaining)
    return {
      productId: product.id,
      qty: line.qty,
      unitPrice: product.unitPrice,
      gross,
      appliedPromoIds,
      discount,
      net: remaining,
    }
  })

  const subtotal = roundMoney(
    pricedLines.reduce((sum, l) => sum + l.net, 0),
  )

  // Order-level: every qualifying threshold promo stacks as well.
  const appliedOrderPromoIds: string[] = []
  let orderDiscount = 0
  for (const promo of active) {
    if (promo.type !== 'threshold') continue
    const categoryNet = pricedLines.reduce((sum, l) => {
      const product = getProduct(l.productId)
      return product?.category === promo.category ? sum + l.net : sum
    }, 0)
    if (categoryNet >= promo.minSubtotal) {
      appliedOrderPromoIds.push(promo.id)
      orderDiscount = roundMoney(orderDiscount + promo.amountOff)
    }
  }

  return {
    lines: pricedLines,
    orderLevel: { appliedPromoIds: appliedOrderPromoIds, discount: orderDiscount },
    subtotal,
    total: Math.max(0, roundMoney(subtotal - orderDiscount)),
  }
}
