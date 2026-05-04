import { useEffect, useState } from 'react';
import './ProductDetail.css';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { formatMxn } from '../utils/format';
import { BackButton } from '../components/BackButton';

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        if (!cancelled) setProduct(data);
      } catch {
        if (!cancelled) setErr('No se encontró el producto');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (err) {
    return (
      <div className="page">
        <div className="page-back">
          <BackButton />
        </div>
        <p>{err}</p>
        <Link to="/">Volver al inicio</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <div className="page-back">
          <BackButton />
        </div>
        <p>Cargando…</p>
      </div>
    );
  }

  const maxQty = Math.max(1, product.stock || 1);

  return (
    <div className="page product-detail">
      <div className="page-back">
        <BackButton />
      </div>
      <div className="detail-grid">
        <div className="detail-media">
          <img src={product.image} alt="" />
        </div>
        <div className="detail-info">
          <h1>{product.name}</h1>
          <p className="muted">
            {product.brand} · {product.category}
          </p>
          <p className="detail-desc">{product.description}</p>
          <p>
            <strong>Stock disponible:</strong> {product.stock}
          </p>
          <p className="price big">{formatMxn(product.price)}</p>
          <div className="detail-buy">
            <label className="qty-field">
              Cantidad
              <input
                type="number"
                min={1}
                max={maxQty}
                value={qty}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (Number.isFinite(n)) setQty(Math.min(maxQty, Math.max(1, n)));
                }}
              />
            </label>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => addItem(product, qty)}
            >
              Agregar al carrito
            </button>
          </div>
          <Link to="/" className="btn btn-ghost">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
