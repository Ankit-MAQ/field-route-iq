import type { Promotion } from '../data'
import { getPromotions, getProduct } from '../data'

function promoDetail(promo: Promotion): string {
  switch (promo.type) {
    case 'percent_off': {
      const scope = promo.scope.category
        ? `all ${promo.scope.category}`
        : (promo.scope.productIds ?? [])
            .map((id) => getProduct(id)?.name ?? id)
            .join(', ')
      return `${promo.percent}% off ${scope}`
    }
    case 'bogo': {
      const product = getProduct(promo.productId)
      return `Buy ${promo.buyQty} get ${promo.getQty} free — ${product?.name ?? promo.productId}`
    }
    case 'threshold':
      return `$${promo.amountOff} off orders with ${promo.category} subtotal ≥ $${promo.minSubtotal}`
  }
}

function PromotionsPage() {
  return (
    <div>
      <h1>Promotions</h1>
      <div className="card-grid">
        {getPromotions().map((promo) => (
          <div className="card" key={promo.id}>
            <div className="card-title">{promo.name}</div>
            <p>{promoDetail(promo)}</p>
            <p className="muted">
              {promo.validFrom} → {promo.validTo}
            </p>
            <div className="badge-row">
              <span className="badge badge-type">{promo.type}</span>
              {promo.eligibleSegments ? (
                promo.eligibleSegments.map((segment) => (
                  <span className={`badge badge-${segment}`} key={segment}>
                    {segment}
                  </span>
                ))
              ) : (
                <span className="badge">all segments</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PromotionsPage
