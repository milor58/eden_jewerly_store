/* © 2026 Eden Jewelry. All rights reserved. */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RingPlaceholder from '../components/RingPlaceholder.jsx';
import Reveal from '../components/Reveal.jsx';
import { Empty } from '../components/StateViews.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { toOrderItems } from '../cart/cartLogic.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api/client.js';
import { formatPrice, stoneLabel } from '../utils/format.js';
import { downloadCartPdf } from '../utils/cartPdf.js';
import { sized } from '../utils/image.js';
import { WHATSAPP_NUMBER, whatsappLink } from '../config.js';

// Plain-text cart for the WhatsApp message.
const cartText = (lines, total) =>
  [
    'Hello Eden Jewelry, I am interested in:',
    ...lines.map((l) => `- ${l.code} ${l.name}${l.size ? ` (size ${l.size})` : ''} x${l.quantity} = ${formatPrice(l.price * l.quantity)}`),
    `Total: ${formatPrice(total)}`,
  ].join('\n');

function validate(form) {
  const errors = {};
  if (!/^[+\d][\d\s()-]{5,19}$/.test(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  if (form.address.trim().length < 5) errors.address = 'Enter your delivery address';
  if (form.note.length > 500) errors.note = 'Keep the note under 500 characters';
  return errors;
}

export default function CartPage() {
  const cart = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: user?.phone || '', address: '', note: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);

  const onPdf = async () => {
    setPdfBusy(true);
    setServerError('');
    try {
      await downloadCartPdf(cart.lines, cart.total);
    } catch {
      setServerError('Could not create the PDF. Try again.');
    } finally {
      setPdfBusy(false);
    }
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSending(true);
    setServerError('');
    try {
      await api.post('/api/orders', { items: toOrderItems(cart.lines), contact: form });
      cart.clear();
      navigate('/account', { state: { justOrdered: true } });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (!cart.lines.length) {
    return (
      <main className="page container">
        <h1 className="page-title">Your cart</h1>
        <Empty title="Your cart is empty">
          <p className="muted">Find a ring you love and add it here.</p>
          <Link to="/shop" className="btn btn-primary">
            Browse the collection
          </Link>
        </Empty>
      </main>
    );
  }

  return (
    <main className="page container">
      <h1 className="page-title">Your cart</h1>

      <div className="cart-layout">
        <ul className="cart-lines">
          {cart.lines.map((line) => (
            <Reveal as="li" key={line.key} className="cart-line" y={16}>
              <Link to={`/shop/${line.productId}`} className="cart-thumb">
                {line.image ? <img src={sized(line.image, 160)} alt="" /> : <RingPlaceholder stone={line.stone} color={line.color} />}
              </Link>
              <div className="cart-line-info">
                <Link to={`/shop/${line.productId}`}>
                  <strong>{line.name}</strong>
                </Link>
                <span className="muted">
                  {line.code} · {stoneLabel(line.stone)}
                  {line.size ? ` · Size ${line.size}` : ''}
                </span>
                <span>{formatPrice(line.price)}</span>
              </div>
              <label className="field-qty">
                <span className="sr-only">Quantity for {line.name}</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={line.quantity}
                  onChange={(e) => cart.setQty(line.key, e.target.value)}
                />
              </label>
              <button type="button" className="icon-btn" onClick={() => cart.remove(line.key)} aria-label={`Remove ${line.name}`}>
                ✕
              </button>
            </Reveal>
          ))}
        </ul>

        <aside className="checkout">
          <div className="summary">
            <span>Total</span>
            <strong>{formatPrice(cart.total)}</strong>
          </div>
          <p className="muted small">
            This is an order request. The workshop calls you to confirm before anything is made or sent. You pay on
            delivery.
          </p>

          <div className="cart-tools">
            <button type="button" className="btn btn-ghost btn-block" onClick={onPdf} disabled={pdfBusy}>
              {pdfBusy ? 'Preparing PDF…' : 'Download cart as PDF'}
            </button>
            {WHATSAPP_NUMBER && (
              <a
                className="btn btn-whatsapp btn-block"
                href={whatsappLink(cartText(cart.lines, cart.total))}
                target="_blank"
                rel="noreferrer"
              >
                Send this cart on WhatsApp
              </a>
            )}
          </div>

          {token ? (
            <form onSubmit={onSubmit} noValidate>
              <label className="field">
                <span>Phone</span>
                <input name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="+961 70 123 456" />
                {errors.phone && <small className="field-error">{errors.phone}</small>}
              </label>
              <label className="field">
                <span>Delivery address</span>
                <textarea name="address" rows="3" value={form.address} onChange={onChange} placeholder="Town, street, building" />
                {errors.address && <small className="field-error">{errors.address}</small>}
              </label>
              <label className="field">
                <span>Note (optional)</span>
                <textarea name="note" rows="2" value={form.note} onChange={onChange} placeholder="Engraving, gift wrap, best time to call…" />
                {errors.note && <small className="field-error">{errors.note}</small>}
              </label>
              {serverError && <p className="notice notice-warn">{serverError}</p>}
              <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
                {sending ? 'Sending…' : 'Send order request'}
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>Log in or create an account to send your order request.</p>
              <Link to="/login" state={{ from: '/cart' }} className="btn btn-primary btn-block">
                Log in
              </Link>
              <Link to="/signup" state={{ from: '/cart' }} className="btn btn-ghost btn-block">
                Create an account
              </Link>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
