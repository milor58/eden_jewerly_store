import { Link } from 'react-router-dom';
import RingPlaceholder from '../components/RingPlaceholder.jsx';

export default function NotFoundPage() {
  return (
    <main className="page container not-found">
      <div className="not-found-art">
        <RingPlaceholder stone="none" label="Empty ring" />
      </div>
      <h1 className="page-title">Page not found</h1>
      <p className="muted">This page melted away. Let’s get you back to the rings.</p>
      <Link to="/shop" className="btn btn-primary">
        Go to the collection
      </Link>
    </main>
  );
}
