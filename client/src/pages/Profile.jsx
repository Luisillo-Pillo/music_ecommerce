import { useState } from 'react';
import './Profile.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BackButton } from '../components/BackButton';

const placeholder =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80';

export function Profile() {
  const { user, logout, updateProfile, isAdmin } = useAuth();
  const { persistCurrentAsGuest } = useCart();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', profileImage: '' });
  const [msg, setMsg] = useState(null);

  if (!user) {
    return (
      <div className="page">
        <div className="page-back">
          <BackButton />
        </div>
        <p>Debes iniciar sesión.</p>
        <Link to="/login">Ir a iniciar sesión</Link>
      </div>
    );
  }

  const startEdit = () => {
    setForm({
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || '',
    });
    setEditing(true);
    setMsg(null);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      setEditing(false);
      setMsg('Perfil actualizado');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error al guardar');
    }
  };

  const roleLabel = user.role === 'admin' ? 'Administrador' : 'Usuario';

  return (
    <div className="page profile-page">
      <div className="page-back">
        <BackButton />
      </div>
      <div className="profile-card">
        <img
          className="profile-avatar"
          src={user.profileImage || placeholder}
          alt=""
        />
        {!editing ? (
          <>
            <h1>{user.name}</h1>
            <p className="muted">{user.email}</p>
            <p>
              <span className="badge">{roleLabel}</span>
            </p>
            {isAdmin && (
              <p>
                <Link to="/admin/productos">Ir al panel de administración</Link>
              </p>
            )}
            <p>
              <Link to="/pedidos">Historial de compras</Link>
            </p>
            {msg && <p className="form-ok">{msg}</p>}
            <div className="profile-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                Volver
              </button>
              <button type="button" className="btn btn-secondary" onClick={startEdit}>
                Editar información
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  persistCurrentAsGuest();
                  logout();
                  navigate('/');
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={save} className="profile-form">
            <label>
              Nombre
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              URL de foto de perfil
              <input
                value={form.profileImage}
                onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                placeholder="https://..."
              />
            </label>
            {msg && <p className="form-err">{msg}</p>}
            <div className="profile-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
