import { Link, useLocation, useNavigate } from 'react-router-dom';
import './OrderComplete.css';
import { formatMxn } from '../utils/format';
import { BackButton } from '../components/BackButton';

export function OrderComplete() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  if (!order) {
    return (
      <div className="page">
        <div className="page-back">
          <BackButton />
        </div>
        <p>No hay información del pedido.</p>
        <Link to="/">Ir al inicio</Link>
      </div>
    );
  }

  return (
    <div className="page order-complete">
      <div className="page-back">
        <BackButton />
      </div>
      <div className="thank-you">
        <h1>¡Gracias por tu compra!</h1>
        <p>
          Tu pedido <strong>{order.orderNumber}</strong> fue registrado correctamente.
        </p>
        <p className="muted">Te enviaremos actualizaciones por correo (simulado).</p>
        <h2>Resumen</h2>
        <ul className="checkout-items">
          {order.items?.map((it, i) => (
            <li key={i}>
              <span>
                {it.name} × {it.quantity}
              </span>
              <span>{formatMxn(it.price * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="checkout-total">
          <span>Total pagado</span>
          <strong>{formatMxn(order.total)}</strong>
        </p>
        <div className="profile-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Volver
          </button>
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
          <Link to="/pedidos" className="btn btn-secondary">
            Ver historial
          </Link>
        </div>
      </div>
    </div>
  );
}
