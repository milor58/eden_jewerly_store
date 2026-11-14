import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { Loader, ErrorBox, Empty } from '../components/StateViews.jsx';
import { useApi } from '../hooks/useApi.js';
import { stoneLabel, capitalize } from '../utils/format.js';
import { scrollToElement } from '../lib/smooth.js';

const SORTS = [
  { value: 'new', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
];
const FILTER_KEYS = ['q', 'type', 'stone', 'color', 'minPrice', 'maxPrice', 'sort', 'page'];

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const [drawer, setDrawer] = useState(false);
  const filters = useApi('/api/products/filters');

  // Only send known filters to the API.
  const apiParams = new URLSearchParams();
  FILTER_KEYS.forEach((k) => params.get(k) && apiParams.set(k, params.get(k)));
  apiParams.set('limit', '12');
  const { data, error, loading, reload } = useApi(`/api/products?${apiParams}`);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value == null) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  // Debounced search: wait until the user stops typing.
  useEffect(() => {
    const current = params.get('q') || '';
    if (search === current) return;
    const id = setTimeout(() => update('q', search.trim()), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const clearAll = () => {
    setSearch('');
    setParams({}, { replace: true });
  };

  const page = Number(params.get('page')) || 1;
  const activeCount = ['q', 'type', 'stone', 'color', 'minPrice', 'maxPrice'].filter((k) => params.get(k)).length;

  return (
    <main className="page container">
      <Reveal className="page-head">
        <p className="eyebrow">The collection</p>
        <h1 className="page-title">Rings, chains and pendants</h1>
        <p className="muted">Handmade 925 silver. Filter by type, stone, colour and price.</p>
      </Reveal>

      <div className="shop-toolbar">
        <label className="search">
          <span className="sr-only">Search rings</span>
          <input
            type="search"
            placeholder="Search by name, stone or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={60}
          />
        </label>
        <select aria-label="Sort" value={params.get('sort') || 'new'} onChange={(e) => update('sort', e.target.value)}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-ghost btn-sm filters-toggle" onClick={() => setDrawer(true)}>
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>

      <div className="shop-layout">
        <aside className={`filters ${drawer ? 'is-open' : ''}`} data-lenis-prevent>
          <div className="filters-head">
            <h2>Filters</h2>
            <button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close filters">
              ✕
            </button>
          </div>

          <fieldset>
            <legend>Type</legend>
            {[
              ['', 'All'],
              ['ring', 'Rings'],
              ['chain', 'Chains'],
              ['pendant', 'Pendants'],
            ].map(([value, label]) => (
              <label key={label} className="chip-option">
                <input type="radio" name="type" checked={(params.get('type') || '') === value} onChange={() => update('type', value)} />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Stone</legend>
            <label className="chip-option">
              <input type="radio" name="stone" checked={!params.get('stone')} onChange={() => update('stone', '')} />
              <span>All</span>
            </label>
            {filters.data?.stones.map((s) => (
              <label key={s} className="chip-option">
                <input type="radio" name="stone" checked={params.get('stone') === s} onChange={() => update('stone', s)} />
                <span>{stoneLabel(s)}</span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Colour</legend>
            <label className="chip-option">
              <input type="radio" name="color" checked={!params.get('color')} onChange={() => update('color', '')} />
              <span>All</span>
            </label>
            {filters.data?.colors.map((c) => (
              <label key={c} className="chip-option">
                <input type="radio" name="color" checked={params.get('color') === c} onChange={() => update('color', c)} />
                <span>{capitalize(c)}</span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Price (USD)</legend>
            <div className="price-range">
              <input
                type="number"
                min="0"
                placeholder={filters.data ? String(filters.data.minPrice) : 'Min'}
                value={params.get('minPrice') || ''}
                onChange={(e) => update('minPrice', e.target.value)}
                aria-label="Minimum price"
              />
              <span>–</span>
              <input
                type="number"
                min="0"
                placeholder={filters.data ? String(filters.data.maxPrice) : 'Max'}
                value={params.get('maxPrice') || ''}
                onChange={(e) => update('maxPrice', e.target.value)}
                aria-label="Maximum price"
              />
            </div>
          </fieldset>

          <div className="filters-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>
              Clear all
            </button>
            <button type="button" className="btn btn-primary btn-sm filters-done" onClick={() => setDrawer(false)}>
              Show results
            </button>
          </div>
        </aside>
        {drawer && <div className="drawer-backdrop" onClick={() => setDrawer(false)} aria-hidden="true" />}

        <section className="shop-results" aria-live="polite">
          {loading && <Loader label="Loading rings" />}
          <ErrorBox error={error} onRetry={reload} />
          {data && !loading && (
            <>
              <p className="results-count">
                {data.total} {data.total === 1 ? 'ring' : 'rings'}
              </p>
              {data.items.length === 0 ? (
                <Empty title="No rings match these filters">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>
                    Clear filters
                  </button>
                </Empty>
              ) : (
                <div className="product-grid">
                  {data.items.map((p, i) => (
                    <Reveal key={p._id} delay={(i % 3) * 0.06} y={30}>
                      <ProductCard product={p} />
                    </Reveal>
                  ))}
                </div>
              )}
              {data.pages > 1 && (
                <nav className="pagination" aria-label="Pages">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={n === page ? 'is-active' : ''}
                      aria-current={n === page ? 'page' : undefined}
                      onClick={() => {
                        update('page', String(n));
                        scrollToElement(document.querySelector('.shop-toolbar'));
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
