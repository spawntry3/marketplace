'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const FAV_KEY = 'qazmarket-favorites';
const CART_KEY = 'qazmarket-cart';

type CartMap = Record<number, number>;

type MarketplaceContextValue = {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  cart: CartMap;
  addToCart: (id: number, qty?: number) => void;
  removeFromCart: (id: number) => void;
  setCartQty: (id: number, qty: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  favoritesCount: number;
  hydrated: boolean;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

function loadFavorites(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is number => typeof x === 'number')
      : [];
  } catch {
    return [];
  }
}

function loadCart(): CartMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: CartMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const id = Number(k);
      const qty = Number(v);
      if (Number.isFinite(id) && Number.isFinite(qty) && qty > 0) {
        out[id] = Math.min(999, Math.floor(qty));
      }
    }
    return out;
  } catch {
    return {};
  }
}

export default function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<CartMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites],
  );

  const addToCart = useCallback((id: number, qty = 1) => {
    const add = Math.min(999, Math.max(1, Math.floor(qty)));
    setCart((prev) => ({
      ...prev,
      [id]: Math.min(999, (prev[id] ?? 0) + add),
    }));
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const setCartQty = useCallback((id: number, qty: number) => {
    const q = Math.floor(qty);
    if (q < 1) {
      setCart((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    setCart((prev) => ({ ...prev, [id]: Math.min(999, q) }));
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const cartItemCount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart],
  );

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
      cart,
      addToCart,
      removeFromCart,
      setCartQty,
      clearCart,
      cartItemCount,
      favoritesCount: favorites.length,
      hydrated,
    }),
    [
      favorites,
      toggleFavorite,
      isFavorite,
      cart,
      addToCart,
      removeFromCart,
      setCartQty,
      clearCart,
      cartItemCount,
      hydrated,
    ],
  );

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error('useMarketplace must be used within MarketplaceProvider');
  }
  return ctx;
}
