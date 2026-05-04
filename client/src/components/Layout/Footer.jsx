import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h3>MusicStore</h3>
          <p>Tu tienda de instrumentos y equipo musical en México.</p>
        </div>
        <div>
          <h4>Contacto</h4>
          <p>Correo: hola@musicstore.demo</p>
          <p>Teléfono: +52 55 1234 5678</p>
          <p>CDMX, México</p>
        </div>
        <div>
          <h4>Enlaces</h4>
          <ul className="footer-links">
            <li>
              <Link to="/categorias">Categorías</Link>
            </li>
            <li>
              <Link to="/marcas">Marcas</Link>
            </li>
            <li>
              <Link to="/contacto">Contáctanos</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <p>Aviso de privacidad · Términos · Envíos</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MusicStore. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}
