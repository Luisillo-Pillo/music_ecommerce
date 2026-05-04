import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './components/Layout/MainLayout';
import { RequireAuth } from './components/RequireAuth';
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { CategoryProducts } from './pages/CategoryProducts';
import { Brands } from './pages/Brands';
import { BrandProducts } from './pages/BrandProducts';
import { Contact } from './pages/Contact';
import { ProductDetail } from './pages/ProductDetail';
import { Profile } from './pages/Profile';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderComplete } from './pages/OrderComplete';
import { OrderHistory } from './pages/OrderHistory';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminMessages } from './pages/admin/AdminMessages';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/categorias" element={<Categories />} />
              <Route path="/categorias/:name" element={<CategoryProducts />} />
              <Route path="/marcas" element={<Brands />} />
              <Route path="/marcas/:name" element={<BrandProducts />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/carrito" element={<Cart />} />
              <Route
                path="/checkout"
                element={
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                }
              />
              <Route path="/pedido-completado" element={<OrderComplete />} />
              <Route path="/pedidos" element={<OrderHistory />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route
                path="/admin/productos"
                element={
                  <RequireAuth admin>
                    <AdminProducts />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <RequireAuth admin>
                    <AdminUsers />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/mensajes"
                element={
                  <RequireAuth admin>
                    <AdminMessages />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
