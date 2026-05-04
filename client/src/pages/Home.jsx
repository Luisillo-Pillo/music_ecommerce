import { useEffect, useState } from 'react';
import './Home.css';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { formatMxn } from '../utils/format';
import { Carousel } from '../components/Carousel';
import { BackButton } from '../components/BackButton';

const COLS = 4;
const INITIAL_ROWS = 3;
const PAGE_CHUNK = COLS * INITIAL_ROWS;

export function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [featured, setFeatured] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(PAGE_CHUNK);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/products', {
          params: { featured: 'true', limit: 12 },
        });
        if (!cancelled) {
          setFeatured(
            (data.items || []).slice(0, 10).map((p) => ({
              ...p,
              tagline: `${p.brand} · ${p.category}`,
            }))
          );
        }
      } catch {
        if (!cancelled) setFeatured([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVisible(PAGE_CHUNK);
    (async () => {
      try {
        const { data } = await api.get('/products', {
          params: { search: search || undefined, limit: 100, page: 1 },
        });
        if (!cancelled) {
          setProducts(data.items || []);
          setTotal(data.total || 0);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search]);

  const shown = products.slice(0, visible);
  const canMore = visible < products.length;

  return (
    <div className="page page-home">
      <div className="page-back">
        <BackButton />
      </div>
      <Carousel slides={featured} />
      <section className="section">
        <div className="section-head">
          <h1>{search ? `Resultados para “${search}”` : 'Catálogo'}</h1>
          <p className="muted">{total} productos</p>
        </div>
        {loading ? (
          <p>Cargando productos…</p>
        ) : (
          <>
            <div className="product-grid">
              {shown.map((p) => (
                <article key={p._id} className="product-card">
                  <Link to={`/producto/${p._id}`} className="product-image-link">
                    <img src={p.image} alt="" loading="lazy" />
                  </Link>
                  <div className="product-body">
                    <h3>{p.name}</h3>
                    <p className="price">{formatMxn(p.price)}</p>
                    <div className="product-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => addItem(p, 1)}
                      >
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
            {canMore && (
              <div className="load-more-wrap">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setVisible((v) => v + PAGE_CHUNK)}
                >
                  Ver más
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
