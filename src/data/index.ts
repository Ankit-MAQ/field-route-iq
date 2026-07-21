// Typed loaders for the static catalog data. All app code (and the pricing
// engine, per SPEC.md) should read data through these helpers, not fetch.
import productsJson from './products.json'
import accountsJson from './accounts.json'
import promotionsJson from './promotions.json'
import routesJson from './routes.json'
import visitsJson from './visits.json'

export interface Product {
  id: string
  name: string
  category: string
  unitPrice: number
}

export interface Account {
  id: string
  name: string
  segment: string
  region: string
  address: string
}

interface PromotionBase {
  id: string
  name: string
  validFrom: string // ISO date, inclusive
  validTo: string // ISO date, inclusive
  eligibleSegments?: string[] // absent = all segments eligible
}

export interface PercentOffPromotion extends PromotionBase {
  type: 'percent_off'
  percent: number
  scope: { category?: string; productIds?: string[] }
}

export interface BogoPromotion extends PromotionBase {
  type: 'bogo'
  productId: string
  buyQty: number
  getQty: number
}

export interface ThresholdPromotion extends PromotionBase {
  type: 'threshold'
  category: string
  minSubtotal: number
  amountOff: number
}

export type Promotion = PercentOffPromotion | BogoPromotion | ThresholdPromotion

export interface RouteStop {
  accountId: string
  plannedTime: string // "HH:MM"
}

export interface RouteDef {
  id: string
  name: string
  day: string // weekday name, e.g. "Monday"
  stops: RouteStop[]
}

export interface Visit {
  id: string
  accountId: string
  date: string // ISO date
  notes: string
  shelfScore: number // 1-5
}

const products = productsJson as Product[]
const accounts = accountsJson as Account[]
const promotions = promotionsJson as Promotion[]
const routes = routesJson as RouteDef[]
const visits = visitsJson as Visit[]

export function getProducts(): Product[] {
  return products
}

export function getAccounts(): Account[] {
  return accounts
}

export function getPromotions(): Promotion[] {
  return promotions
}

export function getRoutes(): RouteDef[] {
  return routes
}

export function getVisits(): Visit[] {
  return visits
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getAccount(id: string): Account | undefined {
  return accounts.find((a) => a.id === id)
}
