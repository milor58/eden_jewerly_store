import { useState } from 'react';
import { Loader, ErrorBox, Empty } from '../../components/StateViews.jsx';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import { formatDate, formatPrice, capitalize } from '../../utils/format.js';

// Same flow as the server: which status can come next.
const NEXT = {
  requested: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export default function AdminOrders() {
  const { data, error, loading, reload, setData } = useApi('/api/orders');
  const [filter, setFilter] = useState('all');
  const [actionError, setActionError] = useState('');

  const changeStatus = async (order, status) => {
    setActionError('');
    try {
      const updated = await api.patch(`/api/orders/${order._id}/status`, { status });
      setData((d) => ({ ...d, items: d.items.map((o) => (o._id === updated._id ? updated : o)) }));
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading && !data) return <Loader label="Loading orders" />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (!data?.items.length) return <Empty title="No order requests yet" />;

  const shown = filter === 'all' ? data.items : data.items.filter((o) => o.status === filter);

  return (
    <div>
      <div className="admin-toolbar">
        <label className="field field-inline">
          <span>Show</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All ({data.items.length})</option>
            {Object.keys(NEXT).map((s) => (
              <option key={s} value={s}>
                {capitalize(s)} ({data.items.filter((o) => o.status === s).length})
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reload}>
          Refresh
        </button>
      </div>
      {actionError && <p className="notice notice-warn">{actionError}</p>}

      <div className="orders">
        {shown.map((order) => (
          <article key={order._id} className="order-card">
            <header className="order-head">
              <div>
                <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                <span className="muted"> · {formatDate(order.createdAt)}</span>
              </div>
              <span className={`status status-${order.status}`}>{order.status}</span>
            </header>

            <div className="order-customer">
              <p>
                <strong>{order.user?.name || 'Deleted account'}</strong> {order.user?.email && <span className="muted">· {order.user.email}</span>}
              </p>
              <p>
                📞 <a href={`tel:${order.contact.phone}`}>{order.contact.phone}</a>
              </p>
              <p>📍 {order.contact.address}</p>
              {order.contact.note && <p className="muted">“{order.contact.note}”</p>}
            </div>

            <ul className="order-items">
              {order.items.map((item) => (
                <li key={`${item.product}-${item.size}`}>
                  <span>
                    {item.quantity} × {item.name} <span className="muted">({item.code}{item.size ? `, size ${item.size}` : ''})</span>
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <footer className="order-foot">
              <span>
                Total <strong>{formatPrice(order.total)}</strong>
              </span>
              {NEXT[order.status].length > 0 ? (
                <div className="status-actions">
                  {NEXT[order.status].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`btn btn-sm ${s === 'cancelled' ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => changeStatus(order, s)}
                    >
                      Mark {s}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="muted small">Closed</span>
              )}
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
