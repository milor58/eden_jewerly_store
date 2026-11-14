import { useState } from 'react';
import AdminProducts from './AdminProducts.jsx';
import AdminOrders from './AdminOrders.jsx';

// Owner dashboard: manage rings and order requests. Admin only (checked by the API too).
export default function AdminPage() {
  const [tab, setTab] = useState('products');

  return (
    <main className="page container admin">
      <p className="eyebrow">Workshop dashboard</p>
      <h1 className="page-title">Manage Eden</h1>

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'products'} className={tab === 'products' ? 'is-active' : ''} onClick={() => setTab('products')}>
          Rings
        </button>
        <button type="button" role="tab" aria-selected={tab === 'orders'} className={tab === 'orders' ? 'is-active' : ''} onClick={() => setTab('orders')}>
          Order requests
        </button>
      </div>

      <section role="tabpanel">{tab === 'products' ? <AdminProducts /> : <AdminOrders />}</section>
    </main>
  );
}
