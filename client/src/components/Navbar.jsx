import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';

export default function Navbar() {
  const { token, user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the mobile menu after navigating
  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled || location.pathname !== '/' ? 'is-solid' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="Eden Jewelry home">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="19" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M11.5 7.5 L13.5 4.5 H18.5 L20.5 7.5 L16 12.5 Z" fill="#1fa37a" />
          </svg>
          <span>
            Eden <em>Jewelry</em>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <nav id="main-nav" className={`nav-links ${open ? 'is-open' : ''}`}>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/shop">Collection</NavLink>
          {token && <NavLink to="/account">{user ? `Hi, ${user.name.split(' ')[0]}` : 'My account'}</NavLink>}
          {isAdmin && <NavLink to="/admin">Dashboard</NavLink>}
          <NavLink to="/cart" className="nav-cart">
            Cart {count > 0 && <span className="cart-count">{count}</span>}
          </NavLink>
          {token ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
