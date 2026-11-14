import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MediaGallery from '../components/MediaGallery.jsx';
import Reveal from '../components/Reveal.jsx';
import { Loader, ErrorBox } from '../components/StateViews.jsx';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { formatPrice, stoneLabel, capitalize } from '../utils/format.js';
import { WHATSAPP_NUMBER as WHATSAPP } from '../config.js';

// Inner circumference in mm for each US ring size (approximate).
const SIZE_GUIDE = [
  [5, 49.3],
  [6, 51.9],
  [7, 54.4],
  [8, 57.0],
  [9, 59.5],
  [10, 62.1],
  [11, 64.6],
  [12, 67.2],
];

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, error, loading, reload } = useApi(`/api/products/${id}`);
  const { token, user, toggleFavorite } = useAuth();
  const cart = useCart();
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [favError, setFavError] = useState('');

  if (loading) {
    return (
      <main className="page container">
        <Loader label="Loading ring" />
      </main>
    );
  }
  if (error || !product) {
    return (
      <main className="page container">
        <ErrorBox error={error || new Error('Ring not found')} onRetry={error?.status === 404 ? undefined : reload} />
        <Link to="/shop" className="btn btn-ghost">
          ← Back to the collection
        </Link>
      </main>
    );
  }

  const isRing = product.type === 'ring';
  const isFav = user?.favorites?.includes(product._id);

  const addToCart = () => {
    if (isRing && !size) {
      setMessage('Choose your ring size first.');
      return;
    }
    cart.add({
      productId: product._id,
      code: product.code,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      stone: product.stone,
      color: product.color,
      size: isRing ? Number(size) : null,
      quantity,
    });
    setMessage('added');
  };

  const onFavorite = async () => {
    if (!token) {
      navigate('/login', { state: { from: `/shop/${product._id}` } });
      return;
    }
    setFavError('');
    try {
      await toggleFavorite(product._id);
    } catch (err) {
      setFavError(err.message);
    }
  };

  const waText = encodeURIComponent(`Hello Eden Jewelry, I'm interested in ${product.name} (${product.code}).`);

  return (
    <main className="page container">
      <Link to="/shop" className="back-link">
        ← Collection
      </Link>

      <div className="product-layout">
        <Reveal y={20}>
          <MediaGallery product={product} />
        </Reveal>

        <Reveal className="product-details" delay={0.1} y={20}>
          <span className="product-code">{product.code}</span>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price-lg">{formatPrice(product.price)}</p>

          <dl className="specs">
            <div>
              <dt>Stone</dt>
              <dd>{stoneLabel(product.stone)}</dd>
            </div>
            <div>
              <dt>Colour</dt>
              <dd>{capitalize(product.color)}</dd>
            </div>
            <div>
              <dt>Metal</dt>
              <dd>925 silver</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd className={product.inStock ? 'ok' : 'warn'}>{product.inStock ? 'Available' : 'Sold out'}</dd>
            </div>
          </dl>

          {product.description && <p className="product-description">{product.description}</p>}

          {product.inStock ? (
            <div className="buy-box">
              {isRing && (
                <label className="field">
                  <span>Ring size (US)</span>
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(e.target.value);
                      setMessage('');
                    }}
                  >
                    <option value="">Choose a size</option>
                    {product.sizes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="field field-qty">
                <span>Quantity</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                />
              </label>
              <div className="buy-actions">
                <button type="button" className="btn btn-primary" onClick={addToCart}>
                  Add to cart
                </button>
                <button
                  type="button"
                  className={`btn btn-ghost fav-btn ${isFav ? 'is-fav' : ''}`}
                  onClick={onFavorite}
                  aria-pressed={Boolean(isFav)}
                >
                  {isFav ? '♥ Saved' : '♡ Save'}
                </button>
              </div>
              {message === 'added' ? (
                <p className="notice notice-ok">
                  Added to your cart. <Link to="/cart">Go to cart →</Link>
                </p>
              ) : (
                message && <p className="notice notice-warn">{message}</p>
              )}
              {favError && <p className="notice notice-warn">{favError}</p>}
            </div>
          ) : (
            <p className="notice notice-warn">This ring is sold out. Save it and we can tell you when it is back.</p>
          )}

          {WHATSAPP && (
            <a className="btn btn-whatsapp" href={`https://wa.me/${WHATSAPP}?text=${waText}`} target="_blank" rel="noreferrer">
              Ask about this ring on WhatsApp
            </a>
          )}

          {isRing && (
            <details className="size-guide">
              <summary>Ring size guide</summary>
              <p className="muted">
                Wrap a thin strip of paper around your finger, mark where it meets, and measure the length in mm.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>US size</th>
                    <th>Inside circumference</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE.map(([s, mm]) => (
                    <tr key={s}>
                      <td>{s}</td>
                      <td>{mm} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
        </Reveal>
      </div>
    </main>
  );
}
