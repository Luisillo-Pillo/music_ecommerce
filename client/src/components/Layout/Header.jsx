import { useState } from 'react';
import './Header.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { totalQty, persistCurrentAsGuest } = useCart();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/?search=${encodeURIComponent(term)}` : '/');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">
          MusicStore
        </Link>
        <form className="header-search" onSubmit={submitSearch}>
          <input
            type="search"
            placeholder="Buscar instrumentos, marcas..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Búsqueda"
          />
          <button type="submit">Buscar</button>
        </form>
        <nav className="header-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Inicio
          </NavLink>
          <NavLink to="/categorias" className={({ isActive }) => (isActive ? 'active' : '')}>
            Categorías
          </NavLink>
          <NavLink to="/marcas" className={({ isActive }) => (isActive ? 'active' : '')}>
            Marcas
          </NavLink>
          <NavLink to="/contacto" className={({ isActive }) => (isActive ? 'active' : '')}>
            Contáctanos
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/productos" className={({ isActive }) => (isActive ? 'active' : '')}>
              Admin
            </NavLink>
          )}
        
        <div className="header-actions">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn btn-primary">
                Registrarse
              </Link>
            </>
          ) : (
            <>
              <Link to="/carrito" className="cart-link" title="Carrito">
                <span className="cart-icon">🛒</span>
                {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
              </Link>
              <div className="user-menu-wrap">
                <button
                  type="button"
                  className="user-trigger"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                >
                  <span className="user-name">{user.name}</span>
                  <span className="caret">▾</span>
                </button>
                {open && (
                  <div className="user-dropdown">
                    <Link to="/perfil" onClick={() => setOpen(false)}>
                      Ver perfil
                    </Link>
                    <Link to="/carrito" onClick={() => setOpen(false)}>
                      Ver carrito
                    </Link>
                    <Link to="/pedidos" onClick={() => setOpen(false)}>
                      Historial de compras
                    </Link>
                    <button
                      type="button"
                      className="dropdown-danger"
                      onClick={() => {
                        setOpen(false);
                        persistCurrentAsGuest();
                        logout();
                        navigate('/');
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          
        </div>
        </nav>
      </div>
    </header>
  );
}
