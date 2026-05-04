import { useEffect, useState } from 'react';
import './AdminUsers.css';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { BackButton } from '../../components/BackButton';

export function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setRole = async (id, role) => {
    setMsg(null);
    try {
      await api.patch(`/users/${id}/role`, { role });
      setMsg('Rol actualizado');
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-back">
        <BackButton />
      </div>
      <div className="admin-head">
        <h1>Usuarios</h1>
        <div className="admin-links">
          <Link to="/admin/productos">Productos</Link>
          <Link to="/admin/mensajes">Mensajes</Link>
        </div>
      </div>
      {msg && <p className="form-ok">{msg}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role === 'admin' ? 'Administrador' : 'Usuario'}</td>
                <td>
                  {u.role === 'admin' ? (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={String(u._id) === String(me.id)}
                      onClick={() => setRole(u._id, 'user')}
                    >
                      Quitar admin
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setRole(u._id, 'admin')}
                    >
                      Hacer admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
