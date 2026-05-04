import { Outlet } from 'react-router-dom';
import './MainLayout.css';
import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
