import { Link } from 'react-router-dom';
import ForgeHero from '../components/forge/ForgeHero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import RingPlaceholder from '../components/RingPlaceholder.jsx';
import Reveal from '../components/Reveal.jsx';
import MarketStrip from '../components/MarketStrip.jsx';
import { Loader, ErrorBox } from '../components/StateViews.jsx';
import { useApi } from '../hooks/useApi.js';

const STONES = [
  { key: 'emerald', name: 'Emerald', text: 'Deep green, the colour of cedar leaves in spring.' },
  { key: 'diamond', name: 'Diamond', text: 'Clear white fire for the rings that mark big moments.' },
  { key: 'moissanite', name: 'Moissanite', text: 'More sparkle than a diamond, at a kinder price.' },
  { key: 'zircon', name: 'Zircon', text: 'Bright and light. Perfect for stacking two or three.' },
];

const HOW = [
  { n: '1', title: 'Choose', text: 'Browse every ring in photos and video, then pick your stone and size.' },
  { n: '2', title: 'Request', text: 'Create an account and send an order request with your phone and address.' },
  { n: '3', title: 'Confirm', text: 'The workshop calls you to confirm the details. No payment online.' },
  { n: '4', title: 'Receive', text: 'Follow your order from confirmed to delivered in your account.' },
];

const MARQUEE = ['925 Silver', 'Handmade', 'Emerald', 'Moissanite', 'Hammered by hand', 'Zircon', 'Diamond', 'South Lebanon'];

export default function HomePage() {
  const { data, error, loading, reload } = useApi('/api/products?featured=true&limit=6');

  return (
    <main>
      <ForgeHero />

      <MarketStrip />

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </div>
      </div>


      <section className="section container">
        <Reveal className="section-head">
          <p className="eyebrow">From the workshop</p>
          <h2 className="section-title">Featured rings</h2>
          <p className="muted">A few favourites. Every piece is one of a small batch, finished by hand.</p>
        </Reveal>
        {loading && <Loader label="Loading rings" />}
        <ErrorBox error={error} onRetry={reload} />
        {data && (
          <div className="product-grid featured-grid">
            {data.items.map((p, i) => (
              <Reveal key={p._id} delay={(i % 3) * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
        <Reveal className="section-cta">
          <Link to="/shop" className="btn btn-primary">
            See all rings
          </Link>
        </Reveal>
      </section>

      <section className="section stones">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Choose your stone</p>
            <h2 className="section-title">Four stones, one silver</h2>
          </Reveal>
          <div className="stone-grid">
            {STONES.map((s, i) => (
              <Reveal key={s.key} delay={i * 0.08}>
                <Link to={`/shop?stone=${s.key}`} className="stone-card">
                  <RingPlaceholder stone={s.key} label={`${s.name} ring`} />
                  <h3>{s.name}</h3>
                  <p>{s.text}</p>
                  <span className="link-arrow">See {s.name.toLowerCase()} rings →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section container" id="how">
        <Reveal className="section-head">
          <p className="eyebrow">No showroom needed</p>
          <h2 className="section-title">How ordering works</h2>
          <p className="muted">
            Our workshop is far from the city, so we brought the showroom online. See every piece from home and order
            without travelling.
          </p>
        </Reveal>
        <ol className="how-grid">
          {HOW.map((step, i) => (
            <Reveal as="li" key={step.n} className="how-step" delay={i * 0.08}>
              <span className="how-num">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="section container">
        <Reveal className="story">
          <div>
            <p className="eyebrow">The workshop</p>
            <h2 className="section-title">Made near Tyre, worn everywhere</h2>
            <p className="muted">
              Each ring starts as a bar of 925 silver. It is melted, poured, hammered, set with its stone and polished by
              the same hands. Stone and colour options mean you can choose the exact ring you want.
            </p>
            <Link to="/signup" className="btn btn-ghost">
              Create your account
            </Link>
          </div>
          <div className="story-art" aria-hidden="true">
            <RingPlaceholder stone="emerald" color="grey" />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
