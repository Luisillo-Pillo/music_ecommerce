import { useState } from 'react';
import './Checkout.css';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatMxn } from '../utils/format';
import { BackButton } from '../components/BackButton';

export function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'México',
  });
  const [payment, setPayment] = useState({
    label: 'Tarjeta terminación 4242',
    type: 'tarjeta',
    last4: '4242',
    brand: 'Visa',
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [savePayment, setSavePayment] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />;
  }

  if (!items.length) {
    return <Navigate to="/carrito" replace />;
  }

  const finalize = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map((l) => ({ productId: l.product._id, quantity: l.quantity })),
        shippingAddress: shipping,
        paymentSummary: payment,
        saveAddressToProfile: saveAddress,
        savePaymentToProfile: savePayment,
      });
      await clearCart();
      navigate('/pedido-completado', { state: { order: data } });
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo completar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page checkout-page">
      <div className="page-back">
        <BackButton />
      </div>
      <h1>Checkout</h1>
      <form className="checkout-grid" onSubmit={finalize}>
        <div className="checkout-panel">
          <h2>Resumen de compra</h2>
          <ul className="checkout-items">
            {items.map((l) => (
              <li key={l.product._id}>
                <span>
                  {l.product.name} × {l.quantity}
                </span>
                <span>{formatMxn(l.quantity * l.product.price)}</span>
              </li>
            ))}
          </ul>
          <p className="checkout-total">
            <span>Total</span>
            <strong>{formatMxn(totalPrice)}</strong>
          </p>
        </div>
        <div className="checkout-panel">
          <h2>Dirección de envío</h2>
          <label>
            Calle y número
            <input
              required
              value={shipping.street}
              onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
            />
          </label>
          <label>
            Ciudad
            <input
              required
              value={shipping.city}
              onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
            />
          </label>
          <label>
            Estado
            <input
              required
              value={shipping.state}
              onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
            />
          </label>
          <label>
            Código postal
            <input
              required
              value={shipping.zip}
              onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
            />
          </label>
          <label>
            País
            <input
              value={shipping.country}
              onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
            />
            Guardar dirección en mi perfil
          </label>
        </div>
        <div className="checkout-panel">
          <h2>Método de pago (demostración)</h2>
          <p className="muted small">
            No se procesa ningún cobro real. Elige una opción simulada.
          </p>
          <label>
            Etiqueta
            <input
              value={payment.label}
              onChange={(e) => setPayment({ ...payment, label: e.target.value })}
            />
          </label>
          <label>
            Tipo
            <select
              value={payment.type}
              onChange={(e) => setPayment({ ...payment, type: e.target.value })}
            >
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo contra entrega</option>
            </select>
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={savePayment}
              onChange={(e) => setSavePayment(e.target.checked)}
            />
            Guardar método en mi perfil
          </label>
        </div>
        {error && <p className="form-err full-width">{error}</p>}
        <div className="checkout-actions full-width">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Volver
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Procesando…' : 'Finalizar compra'}
          </button>
        </div>
      </form>
    </div>
  );
}
