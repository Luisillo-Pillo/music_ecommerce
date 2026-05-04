import { useEffect, useState } from 'react';
import './OrderHistory.css';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatMxn } from '../utils/format';
import { BackButton } from '../components/BackButton';

export function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/orders/mine');
        if (!cancelled) setOrders(data);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="page">
        <div className="page-back">
          <BackButton />
        </div>
        <p>Inicia sesión para ver tu historial.</p>
        <Link to="/login">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-back">
        <BackButton />
      </div>
      <h1>Historial de compras</h1>
      <p className="muted">Pedidos registrados en tu cuenta.</p>
      {loading ? (
        <p>Cargando…</p>
      ) : !orders.length ? (
        <p>Aún no tienes pedidos.</p>
      ) : (
        <ul className="order-history">
          {orders.map((o) => (
            <li key={o._id} className="order-card">
              <div className="order-head">
                <strong>{o.orderNumber}</strong>
                <span className="muted">
                  {new Date(o.createdAt).toLocaleString('es-MX')}
                </span>
              </div>
              <p>Total: {formatMxn(o.total)}</p>
              <ul className="order-mini-items">
                {o.items?.map((it, i) => (
                  <li key={i}>
                    {it.name} × {it.quantity}
                  </li>
                ))}
              </ul>
              {o.shippingAddress && (
                <p className="small muted">
                  Envío: {o.shippingAddress.street}, {o.shippingAddress.city}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
