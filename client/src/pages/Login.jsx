import { useState } from 'react';
import './Login.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="page auth-page">
      <div className="page-back">
        <BackButton />
      </div>
      <div className="auth-card">
        <h1>Iniciar sesión</h1>
        <form onSubmit={submit}>
          <div className="login-form-data">
            <label>Correo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="login-form-data">
            <label>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && <p className="form-err">{err}</p>}
          <button type="submit" className="btn btn-primary btn-block">
            Entrar
          </button>
        </form>
        <p className="muted">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
