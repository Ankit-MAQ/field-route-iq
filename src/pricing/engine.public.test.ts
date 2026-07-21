// Public sanity tests for the pricing engine (SPEC.md). These ship with the
// participant repo at src/pricing/engine.public.test.ts — the judging suite is
// a superset written from the same spec.
import { describe, expect, it } from 'vitest'
import { priceOrder } from './engine'

describe('pricing engine — public tests', () => {
  it('applies a percent_off promo to a matching beverage line', () => {
    // 2026-07-25: "July Beverage Blitz 15%" is the only promo matching water.
    // gross 4 × 5.49 = 21.96; 15% → 3.294 → 3.29; net 21.96 − 3.29 = 18.67
    const r = priceOrder({ lines: [{ productId: 'p-water-24', qty: 4 }], accountId: 'a-101', date: '2026-07-25' })
    expect(r.lines[0].gross).toBe(21.96)
    expect(r.lines[0].appliedPromoId).toBe('promo-bev15')
    expect(r.lines[0].discount).toBe(3.29)
    expect(r.lines[0].net).toBe(18.67)
  })

  it('applies a simple bogo: chocolate buy 3 get 2 at qty 5 → 2 free', () => {
    // gross 5 × 1.99 = 9.95; one complete group of 5 → 2 free → 2 × 1.99 = 3.98
    // net 9.95 − 3.98 = 5.97
    const r = priceOrder({ lines: [{ productId: 'p-choc-bar', qty: 5 }], accountId: 'a-101', date: '2026-07-20' })
    expect(r.lines[0].appliedPromoId).toBe('promo-choc-bogo')
    expect(r.lines[0].discount).toBe(3.98)
    expect(r.lines[0].net).toBe(5.97)
  })

  it('ignores an expired promotion', () => {
    // "June Snack Sale 25%" ended 2026-06-30 → chips get no promo on 07-20.
    // gross 2 × 4.79 = 9.58 = net
    const r = priceOrder({ lines: [{ productId: 'p-chips-lg', qty: 2 }], accountId: 'a-101', date: '2026-07-20' })
    expect(r.lines[0].appliedPromoId).toBeNull()
    expect(r.lines[0].discount).toBe(0)
    expect(r.lines[0].net).toBe(9.58)
  })

  it('prices an empty cart to zero', () => {
    const r = priceOrder({ lines: [], accountId: 'a-101', date: '2026-07-20' })
    expect(r.lines).toEqual([])
    expect(r.subtotal).toBe(0)
    expect(r.total).toBe(0)
  })

  it('throws for an unknown product', () => {
    expect(() =>
      priceOrder({ lines: [{ productId: 'p-nope', qty: 1 }], accountId: 'a-101', date: '2026-07-20' }),
    ).toThrow('Unknown product: p-nope')
  })

  it('returns the documented result shape with subtotal and total', () => {
    // trailmix 2 × 6.10 = 12.20; no promos match → subtotal = total = 12.20
    const r = priceOrder({ lines: [{ productId: 'p-trailmix', qty: 2 }], accountId: 'a-101', date: '2026-07-20' })
    expect(r.lines[0]).toEqual({
      productId: 'p-trailmix',
      qty: 2,
      unitPrice: 6.1,
      gross: 12.2,
      appliedPromoId: null,
      discount: 0,
      net: 12.2,
    })
    expect(r.orderLevel).toEqual({ appliedPromoId: null, discount: 0 })
    expect(r.subtotal).toBe(12.2)
    expect(r.total).toBe(12.2)
  })
})
