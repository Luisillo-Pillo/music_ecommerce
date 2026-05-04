import { useEffect, useState } from 'react';
import './Brands.css';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { BackButton } from '../components/BackButton';

export function Brands() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/products/meta/brands');
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
      <h1>Marcas</h1>
      <p className="muted">Filtra por fabricante favorito.</p>
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <ul className="link-grid">
          {list.map((b) => (
            <li key={b}>
              <Link to={`/marcas/${encodeURIComponent(b)}`} className="tile-link">
                {b}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
