import { useEffect, useState } from 'react';
import './AdminProducts.css';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { formatMxn } from '../../utils/format';
import { BackButton } from '../../components/BackButton';

const empty = {
  name: '',
  price: '',
  stock: '',
  description: '',
  category: '',
  brand: '',
  image: '',
  featured: false,
};

export function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const { data } = await api.get('/products', { params: { limit: 200 } });
    setItems(data.items || []);
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

  const startCreate = () => {
    setEditing('new');
    setForm(empty);
    setMsg(null);
  };

  const startEdit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      description: p.description,
      category: p.category,
      brand: p.brand,
      image: p.image,
      featured: !!p.featured,
    });
    setMsg(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg(null);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      featured: !!form.featured,
    };
    try {
      if (editing === 'new') {
        await api.post('/products', payload);
        setMsg('Producto creado');
      } else {
        await api.put(`/products/${editing}`, payload);
        setMsg('Producto actualizado');
      }
      setEditing(null);
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error al guardar');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-back">
        <BackButton />
      </div>
      <div className="admin-head">
        <h1>Productos</h1>
        <div className="admin-links">
          <Link to="/admin/usuarios">Usuarios</Link>
          <Link to="/admin/mensajes">Mensajes</Link>
        </div>
        <button type="button" className="btn btn-primary" onClick={startCreate}>
          Nuevo producto
        </button>
      </div>
      {msg && <p className="form-ok">{msg}</p>}
      {editing && (
        <form className="admin-form" onSubmit={save}>
          <h2>{editing === 'new' ? 'Crear' : 'Editar'} producto</h2>
          <label>
            Nombre
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Precio (MXN)
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
          <label>
            Stock
            <input
              required
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </label>
          <label>
            Descripción
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label>
            Categoría
            <input
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </label>
          <label>
            Marca
            <input
              required
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </label>
          <label>
            URL imagen
            <input
              required
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Destacado (carrusel)
          </label>
          <div className="profile-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Destacado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{formatMxn(p.price)}</td>
                <td>{p.stock}</td>
                <td>{p.featured ? 'Sí' : 'No'}</td>
                <td>
                  <button type="button" className="btn btn-ghost" onClick={() => startEdit(p)}>
                    Editar
                  </button>
                  <button type="button" className="link-danger" onClick={() => remove(p._id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
