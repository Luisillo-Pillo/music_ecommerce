import { useEffect, useState } from 'react';
import './AdminMessages.css';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { BackButton } from '../../components/BackButton';

export function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/contact/admin');
        setMessages(data);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page admin-page">
      <div className="page-back">
        <BackButton />
      </div>
      <div className="admin-head">
        <h1>Mensajes de contacto</h1>
        <div className="admin-links">
          <Link to="/admin/productos">Productos</Link>
          <Link to="/admin/usuarios">Usuarios</Link>
        </div>
      </div>
      {loading ? (
        <p>Cargando…</p>
      ) : !messages.length ? (
        <p>No hay mensajes.</p>
      ) : (
        <ul className="message-list">
          {messages.map((m) => (
            <li key={m._id} className="message-card">
              <div className="message-head">
                <strong>{m.subject}</strong>
                <span className="muted">
                  {new Date(m.createdAt).toLocaleString('es-MX')}
                </span>
              </div>
              <p>
                {m.name} &lt;{m.email}&gt;
              </p>
              <p>{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
