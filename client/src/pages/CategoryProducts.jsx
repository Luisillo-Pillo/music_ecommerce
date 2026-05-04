import { useEffect, useState } from 'react';
import './CategoryProducts.css';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { formatMxn } from '../utils/format';
import { BackButton } from '../components/BackButton';

export function CategoryProducts() {
  const { name } = useParams();
  const category = decodeURIComponent(name || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/products', {
          params: { category, limit: 100 },
        });
        if (!cancelled) setItems(data.items || []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div className="page">
      <div className="page-back">
        <BackButton />
      </div>
      <h1>{category}</h1>
      <p className="muted">{items.length} productos</p>
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <div className="product-grid">
          {items.map((p) => (
            <article key={p._id} className="product-card">
              <Link to={`/producto/${p._id}`}>
                <img src={p.image} alt="" loading="lazy" />
              </Link>
              <div className="product-body">
                <h3>{p.name}</h3>
                <p className="price">{formatMxn(p.price)}</p>
                <div className="product-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => addItem(p, 1)}>
                    Agregar al carrito
                  </button>
                  <Link to={`/producto/${p._id}`} className="btn btn-ghost">
                    Ver detalles
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
