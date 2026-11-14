import { useState } from 'react';
import ProductForm from './ProductForm.jsx';
import RingPlaceholder from '../../components/RingPlaceholder.jsx';
import { Loader, ErrorBox } from '../../components/StateViews.jsx';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import { formatPrice, stoneLabel } from '../../utils/format.js';
import { scrollToTop } from '../../lib/smooth.js';

export default function AdminProducts() {
  const { data, error, loading, reload } = useApi('/api/products?limit=50&sort=name');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, product = edit
  const [actionError, setActionError] = useState('');

  const open = (product) => {
    setEditing(product);
    scrollToTop();
  };

  const quickToggle = async (product, field) => {
    setActionError('');
    try {
      await api.patch(`/api/products/${product._id}`, { [field]: !product[field] });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}" (${product.code})? This cannot be undone.`)) return;
    setActionError('');
    try {
      await api.del(`/api/products/${product._id}`);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (editing) {
    return (
      <ProductForm
        product={editing._id ? editing : null}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <p className="muted">{data ? `${data.total} pieces` : ' '}</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => open({})}>
          + New ring
        </button>
      </div>
      {actionError && <p className="notice notice-warn">{actionError}</p>}
      {loading && !data && <Loader label="Loading rings" />}
      <ErrorBox error={error} onRetry={reload} />

      {data && (
        <div className="table-wrap" data-lenis-prevent>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Piece</th>
                <th>Stone</th>
                <th>Price</th>
                <th>Media</th>
                <th>In stock</th>
                <th>Featured</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="admin-piece">
                      <span className="admin-thumb">
                        {p.images[0] ? <img src={p.images[0]} alt="" /> : <RingPlaceholder stone={p.stone} color={p.color} />}
                      </span>
                      <span>
                        <strong>{p.name}</strong>
                        <small className="muted">{p.code}</small>
                      </span>
                    </div>
                  </td>
                  <td>{stoneLabel(p.stone)}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td className={p.images.length ? '' : 'muted'}>
                    {p.images.length} 📷 · {p.videos.length} 🎬
                  </td>
                  <td>
                    <input type="checkbox" checked={p.inStock} onChange={() => quickToggle(p, 'inStock')} aria-label={`${p.name} in stock`} />
                  </td>
                  <td>
                    <input type="checkbox" checked={p.featured} onChange={() => quickToggle(p, 'featured')} aria-label={`${p.name} featured`} />
                  </td>
                  <td className="admin-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => open(p)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
