import { useEffect, useState } from 'react';
import './Categories.css';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { BackButton } from '../components/BackButton';

export function Categories() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/products/meta/categories');
        setList(data);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page">
      <div className="page-back">
        <BackButton />
      </div>
      <h1>Categorías</h1>
      <p className="muted">Explora por tipo de producto.</p>
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <ul className="link-grid">
          {list.map((c) => (
            <li key={c}>
              <Link to={`/categorias/${encodeURIComponent(c)}`} className="tile-link">
                {c}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
