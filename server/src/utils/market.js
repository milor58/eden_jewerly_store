/* © 2026 Eden Jewelry. All rights reserved. */
// Free third-party API, no account and no API key (works from Lebanon):
//   gold-api.com  -> live gold (XAU) and silver (XAG) price in USD per troy ounce
//   xaus.com      -> backup if gold-api.com is down
// The server calls them (not the browser) and keeps the answer for 30 minutes,
// so we stay far below their limits and the site still works if they are down.
import { HttpError } from './httpError.js';

const TTL_MS = 30 * 60 * 1000;
const GRAMS_PER_OUNCE = 31.1035;
let cache = null; // { at, data }

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

const positive = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0;

async function fromGoldApi(symbol) {
  const d = await getJson(`https://api.gold-api.com/price/${symbol}`);
  if (!positive(d?.price)) throw new Error(`No ${symbol} price`);
  return d.price;
}

async function fetchPrices() {
  const [gold, silver] = await Promise.allSettled([fromGoldApi('XAU'), fromGoldApi('XAG')]);
  let goldOz = gold.status === 'fulfilled' ? gold.value : null;
  let silverOz = silver.status === 'fulfilled' ? silver.value : null;

  if (goldOz === null || silverOz === null) {
    try {
      const d = await getJson('https://xaus.com/api/v1/spot');
      if (goldOz === null && positive(d?.spot_usd_oz)) goldOz = d.spot_usd_oz;
      if (silverOz === null && positive(d?.silver_usd_oz)) silverOz = d.silver_usd_oz;
    } catch {
      /* backup failed too */
    }
  }
  return { goldOz, silverOz };
}

const perGram = (oz) => (oz === null ? null : Math.round((oz / GRAMS_PER_OUNCE) * 100) / 100);

export async function getMarket(now = Date.now()) {
  if (cache && now - cache.at < TTL_MS) return cache.data;

  const { goldOz, silverOz } = await fetchPrices();
  if (goldOz === null && silverOz === null) {
    if (cache) return { ...cache.data, stale: true }; // old prices are better than nothing
    throw new HttpError(503, 'Metal prices are not available right now');
  }

  const data = {
    currency: 'USD',
    gold: { perOunce: goldOz, perGram: perGram(goldOz) },
    silver: { perOunce: silverOz, perGram: perGram(silverOz) },
    updatedAt: new Date(now).toISOString(),
    stale: false,
    source: 'gold-api.com',
  };
  cache = { at: now, data };
  return data;
}

export function resetMarketCache() {
  cache = null;
}
