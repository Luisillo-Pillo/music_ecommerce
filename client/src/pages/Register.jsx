import { useState } from 'react';
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    profileImage: '',
  });
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      await register(form);
      navigate('/');
    } catch (ex) {
      setErr(ex.response?.data?.message || 'No se pudo registrar');
    }
  };

  return (
    <div className="page auth-page">
      <div className="page-back">
        <BackButton />
      </div>
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        <form onSubmit={submit}>
          <label>
            Nombre
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Correo
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <label>
            URL foto de perfil (opcional)
            <input
              value={form.profileImage}
              onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
              placeholder="https://..."
            />
          </label>
          {err && <p className="form-err">{err}</p>}
          <button type="submit" className="btn btn-primary btn-block">
            Registrarse
          </button>
        </form>
        <p className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
