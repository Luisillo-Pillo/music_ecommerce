import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatMxn } from '../utils/format';
import { BackButton } from '../components/BackButton';

function confirmDialog(message) {
  return window.confirm(message);
}

export function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalQty, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const onQtyChange = (productId, raw) => {
    const q = parseInt(raw, 10);
    if (!Number.isFinite(q)) return;
    if (q === 0) {
      if (confirmDialog('¿Eliminar este producto del carrito?')) {
        removeItem(productId);
      }
      return;
    }
    updateQuantity(productId, q);
  };

  const onRemove = (productId) => {
    if (confirmDialog('¿Eliminar este producto del carrito?')) {
      removeItem(productId);
    }
  };

  const onClear = () => {
    if (confirmDialog('¿Vaciar todo el carrito?')) {
      clearCart();
    }
  };

  const checkout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (!items.length) {
    return (
      <div className="page cart-page">
        <div className="page-back">
          <BackButton />
        </div>
        <div className="empty-cart">
          <h1>Tu carrito está vacío</h1>
          <p>Agrega instrumentos desde el catálogo.</p>
          <Link to="/" className="btn btn-primary">
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <div className="page-back">
        <BackButton />
      </div>
      <h1>Carrito</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((line) => {
            const id = line.product._id;
            const sub = line.quantity * line.product.price;
            return (
              <li key={id} className="cart-row">
                <img src={line.product.image} alt="" className="cart-thumb" />
                <div className="cart-row-main">
                  <h3>{line.product.name}</h3>
                  <p className="muted">{formatMxn(line.product.price)} c/u</p>
                  <p className="price">{formatMxn(sub)}</p>
                  <label className="inline-qty">
                    Cantidad
                    <input
                      type="number"
                      min={0}
                      value={line.quantity}
                      onChange={(e) => onQtyChange(id, e.target.value)}
                    />
                  </label>
                  <button type="button" className="link-danger" onClick={() => onRemove(id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <aside className="cart-summary">
          <h2>Resumen</h2>
          <p>
            <span>Total de productos</span>
            <strong>{totalQty}</strong>
          </p>
          <p>
            <span>Total</span>
            <strong>{formatMxn(totalPrice)}</strong>
          </p>
          <button type="button" className="btn btn-primary btn-block" onClick={checkout}>
            Proceder al pago
          </button>
          <button type="button" className="btn btn-ghost btn-block" onClick={onClear}>
            Vaciar carrito
          </button>
          {!user && (
            <p className="muted small">Inicia sesión para completar la compra.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
