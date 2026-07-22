import { getAccounts, getVisits } from '../data/index'

export interface AccountAudit {
  accountId: string
  weightedScore: number | null
  trend: 'up' | 'down' | 'flat' | null
  daysSinceVisit: number | null
  overdue: boolean
  status: 'healthy' | 'watch' | 'critical' | 'unvisited'
}

function round2(n: number): number {
  return Number(Math.round(parseFloat(n + 'e2')) + 'e-2')
}

function isValidDateString(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d)
}

export function auditAccounts(asOf: string): AccountAudit[] {
  if (!isValidDateString(asOf)) throw new Error(`Invalid date: ${asOf}`)

  const accounts = getAccounts()
  const visits = getVisits()

  const results: AccountAudit[] = []

  for (const acc of accounts) {
    const counted = visits
      .filter((v) => v.accountId === acc.id && v.date <= asOf)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date > b.date ? -1 : 1 // date desc
        return a.id > b.id ? -1 : 1 // id desc
      })

    if (counted.length === 0) {
      results.push({
        accountId: acc.id,
        weightedScore: null,
        trend: null,
        daysSinceVisit: null,
        overdue: true,
        status: 'unvisited',
      })
      continue
    }

    // Weighted score
    const top = counted.slice(0, 3)
    const weights = [3, 2, 1]
    let numerator = 0
    let denom = 0
    for (let i = 0; i < top.length; i++) {
      numerator += weights[i] * top[i].shelfScore
      denom += weights[i]
    }
    const weighted = round2(numerator / denom)

    // trend compares latest shelfScore vs previous shelfScore
    let trend: 'up' | 'down' | 'flat' | null = null
    if (counted.length >= 2) {
      const s1 = counted[0].shelfScore
      const s2 = counted[1].shelfScore
      if (s1 > s2) trend = 'up'
      else if (s1 < s2) trend = 'down'
      else trend = 'flat'
    }

    // daysSinceVisit: whole calendar days between latest visit.date and asOf
    const latestDate = new Date(counted[0].date + 'T00:00:00Z')
    const asOfDate = new Date(asOf + 'T00:00:00Z')
    const msPerDay = 24 * 60 * 60 * 1000
    const daysSince = Math.floor((asOfDate.getTime() - latestDate.getTime()) / msPerDay)

    const overdue = daysSince === null ? true : daysSince > 14

    // status based on rounded weightedScore
    let status: 'healthy' | 'watch' | 'critical' | 'unvisited'
    if (weighted === null || typeof weighted !== 'number') {
      status = 'unvisited'
    } else if (weighted < 2.5) {
      status = 'critical'
    } else if (weighted >= 2.5 && weighted < 3.5) {
      status = 'watch'
    } else {
      status = 'healthy'
    }

    results.push({
      accountId: acc.id,
      weightedScore: weighted,
      trend,
      daysSinceVisit: daysSince,
      overdue,
      status,
    })
  }

  // sort by accountId ascending
  results.sort((a, b) => (a.accountId < b.accountId ? -1 : 1))
  return results
}
