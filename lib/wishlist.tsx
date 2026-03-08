"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface WishlistContextValue {
  slugs: Set<string>;
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }, []);

  const has = useCallback((slug: string) => slugs.has(slug), [slugs]);
  const openWishlist = useCallback(() => setIsOpen(true), []);
  const closeWishlist = useCallback(() => setIsOpen(false), []);

  return (
    <WishlistContext.Provider value={{ slugs, toggle, has, isOpen, openWishlist, closeWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
