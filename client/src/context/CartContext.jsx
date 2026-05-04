import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import './CartContext.css';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'music_guest_cart';

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { token, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  const normalizeLines = useCallback((lines) => {
    const map = new Map();
    for (const line of lines) {
      const p = line.product;
      const id = typeof p === 'object' && p ? p._id || p.id : p;
      if (!id) continue;
      const qty = Math.max(1, Number(line.quantity) || 1);
      map.set(String(id), { product: typeof p === 'object' ? p : { _id: id }, quantity: qty });
    }
    return Array.from(map.values()).map((row) => {
      const prod = row.product;
      const id = prod._id || prod.id;
      return {
        product: { ...prod, _id: id },
        quantity: row.quantity,
      };
    });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      if (token) {
        try {
          const { data } = await api.get('/cart');
          const guest = readGuestCart();
          if (guest.length) {
            const payload = guest.map((g) => ({
              productId: g.productId,
              quantity: g.quantity,
            }));
            writeGuestCart([]);
            await api.post('/cart/merge', { items: payload });
            const after = await api.get('/cart');
            if (!cancelled) setItems(normalizeLines(after.data.items));
          } else {
            if (!cancelled) setItems(normalizeLines(data.items));
          }
        } catch {
          if (!cancelled) setItems([]);
        }
      } else {
        const guest = readGuestCart();
        if (!cancelled) {
          setItems(
            guest.map((g) => ({
              product: {
                _id: g.productId,
                name: g.name,
                price: g.price,
                image: g.image,
                stock: g.stock,
              },
              quantity: g.quantity,
            }))
          );
        }
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, authLoading, normalizeLines]);

  const persistGuest = useCallback(
    (next) => {
      writeGuestCart(
        next.map((l) => ({
          productId: l.product._id,
          quantity: l.quantity,
          name: l.product.name,
          price: l.product.price,
          image: l.product.image,
          stock: l.product.stock,
        }))
      );
    },
    []
  );

  const pushToServer = useCallback(
    async (next) => {
      if (!token) return;
      await api.put('/cart', {
        items: next.map((l) => ({ productId: l.product._id, quantity: l.quantity })),
      });
    },
    [token]
  );

  const setCart = useCallback(
    async (next) => {
      const norm = normalizeLines(next);
      setItems(norm);
      if (token) {
        await pushToServer(norm);
      } else {
        persistGuest(norm);
      }
    },
    [normalizeLines, token, pushToServer, persistGuest]
  );

  const addItem = useCallback(
    async (product, qty = 1) => {
      const id = product._id || product.id;
      const add = Math.max(1, Number(qty) || 1);
      const next = [...items];
      const idx = next.findIndex((l) => String(l.product._id) === String(id));
      if (idx >= 0) {
        next[idx] = { ...next[idx], quantity: next[idx].quantity + add };
      } else {
        next.push({ product: { ...product, _id: id }, quantity: add });
      }
      await setCart(next);
    },
    [items, setCart]
  );

  const updateQuantity = useCallback(
    async (productId, qty) => {
      const q = Number(qty);
      if (!Number.isFinite(q)) return;
      if (q <= 0) {
        const next = items.filter((l) => String(l.product._id) !== String(productId));
        await setCart(next);
        return;
      }
      const next = items.map((l) =>
        String(l.product._id) === String(productId) ? { ...l, quantity: q } : l
      );
      await setCart(next);
    },
    [items, setCart]
  );

  const removeItem = useCallback(
    async (productId) => {
      const next = items.filter((l) => String(l.product._id) !== String(productId));
      await setCart(next);
    },
    [items, setCart]
  );

  const clearCart = useCallback(async () => {
    setItems([]);
    if (token) {
      await api.put('/cart', { items: [] });
    } else {
      writeGuestCart([]);
    }
  }, [token]);

  const persistCurrentAsGuest = useCallback(() => {
    persistGuest(items);
  }, [items, persistGuest]);

  const totalQty = items.reduce((a, l) => a + l.quantity, 0);
  const totalPrice = items.reduce((a, l) => a + l.quantity * (l.product.price || 0), 0);

  const value = useMemo(
    () => ({
      items,
      ready,
      totalQty,
      totalPrice,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setCart,
      persistCurrentAsGuest,
    }),
    [
      items,
      ready,
      totalQty,
      totalPrice,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setCart,
      persistCurrentAsGuest,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart fuera de CartProvider');
  }
  return ctx;
}
