/* © 2026 Eden Jewelry. All rights reserved. */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import StatusTimeline from '../components/StatusTimeline.jsx';
import { Loader, ErrorBox, Empty } from '../components/StateViews.jsx';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api/client.js';
import { formatDate, formatPrice } from '../utils/format.js';

function OrdersTab() {
  const { data, error, loading, reload } = useApi('/api/orders/mine');
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState('');

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order request?')) return;
    setBusy(id);
    setActionError('');
    try {
      await api.patch(`/api/orders/${id}/cancel`);
      await reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(null);
    }
  };

  if (loading && !data) return <Loader label="Loading your orders" />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (!data?.items.length) {
    return (
      <Empty title="No orders yet">
        <Link to="/shop" className="btn btn-primary">
          Find your ring
        </Link>
      </Empty>
    );
  }

  return (
    <div className="orders">
      {actionError && <p className="notice notice-warn">{actionError}</p>}
      {data.items.map((order) => (
        <article key={order._id} className="order-card">
          <header className="order-head">
            <div>
              <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
              <span className="muted"> · {formatDate(order.createdAt)}</span>
            </div>
            <span className={`status status-${order.status}`}>{order.status}</span>
          </header>
          <StatusTimeline order={order} />
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={`${item.product}-${item.size}`}>
                <span>
                  {item.quantity} × {item.name}
                  {item.size ? ` (size ${item.size})` : ''}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <footer className="order-foot">
            <span>
              Total <strong>{formatPrice(order.total)}</strong>
            </span>
            {order.status === 'requested' && (
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy === order._id} onClick={() => cancel(order._id)}>
                {busy === order._id ? 'Cancelling…' : 'Cancel request'}
              </button>
            )}
          </footer>
        </article>
      ))}
    </div>
  );
}

function FavoritesTab() {
  const { data, error, loading, reload } = useApi('/api/favorites');
  if (loading && !data) return <Loader label="Loading your favourites" />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (!data?.items.length) {
    return (
      <Empty title="No saved rings yet">
        <p className="muted">Tap “Save” on any ring to keep it here.</p>
      </Empty>
    );
  }
  return (
    <div className="product-grid">
      {data.items.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}

export default function AccountPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState('orders');

  return (
    <main className="page container">
      <p className="eyebrow">My account</p>
      <h1 className="page-title">{user ? `Hello, ${user.name}` : 'My account'}</h1>
      {location.state?.justOrdered && (
        <p className="notice notice-ok">Your order request was sent. The workshop will call you soon to confirm it.</p>
      )}

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'orders'} className={tab === 'orders' ? 'is-active' : ''} onClick={() => setTab('orders')}>
          My orders
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'favorites'}
          className={tab === 'favorites' ? 'is-active' : ''}
          onClick={() => setTab('favorites')}
        >
          Saved rings
        </button>
      </div>

      <section role="tabpanel">{tab === 'orders' ? <OrdersTab /> : <FavoritesTab />}</section>
    </main>
  );
}
