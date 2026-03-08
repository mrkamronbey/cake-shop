"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { Product } from "@/lib/products";

export interface CartItem {
  product: Product;
  count: number;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  addToCart: (product: Product, count?: number) => void;
  removeFromCart: (slug: string) => void;
  updateCount: (slug: string, count: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((product: Product, count = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.slug === product.slug);
      if (existing) {
        return prev.map((i) =>
          i.product.slug === product.slug
            ? { ...i, count: i.count + count }
            : i
        );
      }
      return [...prev, { product, count }];
    });
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.product.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const updateCount = useCallback((slug: string, count: number) => {
    if (count <= 0) {
      setItems((prev) => prev.filter((i) => i.product.slug !== slug));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.slug === slug ? { ...i, count } : i))
      );
    }
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        addToCart,
        removeFromCart,
        updateCount,
        clearCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
