import { useNavigate } from 'react-router-dom';
import './BackButton.css';

export function BackButton({ label = 'Atrás' }) {
  const navigate = useNavigate();
  return (
    <button type="button" className="back-btn" onClick={() => navigate(-1)} title={label}>
      <span aria-hidden>←</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
