import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-brand">
            Eden <em>Jewelry</em>
          </p>
          <p className="muted">Handmade 925 silver rings from a family workshop near Tyre, south Lebanon.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/shop">Collection</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/account">My orders</Link>
        </nav>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Eden Jewelry. All rights reserved. Handmade in south Lebanon.</p>
      </div>
    </footer>
  );
}
