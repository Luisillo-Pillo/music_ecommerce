import { useState } from 'react';
import './Contact.css';
import { api } from '../api/client';
import { BackButton } from '../components/BackButton';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      await api.post('/contact', form);
      setStatus({ ok: true, text: '¡Gracias! Tu mensaje fue enviado.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({
        ok: false,
        text: err.response?.data?.message || 'No se pudo enviar. Intenta de nuevo.',
      });
    }
  };

  return (
    <div className="page contact-page">
      <div className="page-back">
        <BackButton />
      </div>
      <div className="contact-hero">
        <div className="contact-hero-text">
          <h1>Hablemos de música</h1>
          <p>
            Cuéntanos qué equipo buscas, armamos pedidos especiales y te asesoramos sin compromiso.
          </p>
          <ul className="contact-highlights">
            <li>Respuesta en menos de 24 horas hábiles</li>
            <li>Soporte para escuelas y agrupaciones</li>
            <li>Cotizaciones para equipar tu estudio</li>
          </ul>
        </div>
        <div className="contact-card">
          <h2>Enviar mensaje</h2>
          <form onSubmit={submit} className="contact-form">
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
              Asunto
              <input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </label>
            <label>
              Mensaje
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </label>
            {status && (
              <p className={status.ok ? 'form-ok' : 'form-err'}>{status.text}</p>
            )}
            <button type="submit" className="btn btn-primary btn-block">
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
