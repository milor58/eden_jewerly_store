/* © 2026 Eden Jewelry. All rights reserved. */
import { useApi } from '../hooks/useApi.js';

const usd = (n) =>
  n == null ? '—' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function MetalCard({ name, metal, tone }) {
  return (
    <div className={`metal-card metal-${tone}`}>
      <p className="metal-name">{name}</p>
      <p className="metal-price">
        {usd(metal?.perGram)} <span>/ gram</span>
      </p>
      <p className="metal-sub">{usd(metal?.perOunce)} / troy ounce</p>
    </div>
  );
}

// Live gold and silver prices in USD from /api/market (gold-api.com through our server).
export default function MarketStrip() {
  const { data, error, loading, reload } = useApi('/api/market');

  return (
    <section className="market container" aria-label="Gold and silver price today">
      <div className="market-head">
        <p className="eyebrow">Live metal prices</p>
        <h2>Silver and gold today</h2>
      </div>

      {loading && <p className="muted">Loading today's prices…</p>}

      {!loading && (error || !data) && (
        <p className="muted">
          Prices are not available right now.{' '}
          <button type="button" className="link-btn" onClick={reload}>
            Try again
          </button>
        </p>
      )}

      {!loading && data && (
        <>
          <div className="metal-grid">
            <MetalCard name="Silver 999" metal={data.silver} tone="silver" />
            <MetalCard name="Gold 24K" metal={data.gold} tone="gold" />
          </div>
          <p className="market-credit">
            Prices in USD, updated {new Date(data.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            {data.stale ? ' (last known price)' : ''} · source gold-api.com
          </p>
        </>
      )}
    </section>
  );
}
