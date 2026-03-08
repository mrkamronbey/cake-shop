"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

interface Props {
  product: Product | null;
  onClose: () => void;
}

const emojiMap: Record<string, string> = {
  cakes: "🎂",
  cupcakes: "🧁",
  cookies: "🍪",
  pastries: "🥐",
};


export default function ProductModal({ product, onClose }: Props) {
  const locale = useLocale();
  const t = useTranslations("products");
  const [count, setCount] = useState(1);
  const { addToCart } = useCart();
  // Reset count when product changes
  useEffect(() => {
    setCount(1);
  }, [product?.slug]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, count);
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2">

                {/* LEFT — visual */}
                <div className="relative flex items-center justify-center min-h-72 md:min-h-full bg-gradient-to-br from-amber-50 via-orange-50 to-cream-50 p-10 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
                  {/* Glow */}
                  <div className="absolute w-48 h-48 rounded-full bg-amber-200/40 blur-3xl" />

                  {/* Badge */}
                  {product.badge && (
                    <span
                      className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm z-10 ${
                        product.badge === "popular"
                          ? "bg-salmon-500 text-white"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {product.badge === "popular" ? t("popular") : t("new")}
                    </span>
                  )}

                  {/* Close button (visible on mobile top-right of image) */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:hidden w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:bg-white transition-colors shadow-sm cursor-pointer"
                    aria-label="Close"
                  >
                    ✕
                  </button>

                  {/* Emoji */}
                  <div className="relative w-44 h-44 rounded-full bg-white/70 backdrop-blur-sm shadow-xl border border-white flex items-center justify-center">
                    <span className="text-8xl drop-shadow">{emojiMap[product.category] || "🍰"}</span>
                  </div>

                </div>

                {/* RIGHT — info */}
                <div className="flex flex-col relative">
                  {/* Close button desktop */}
                  <button
                    onClick={onClose}
                    className="hidden md:flex absolute top-5 right-5 w-8 h-8 bg-gray-100 rounded-full items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer text-sm z-10"
                    aria-label="Close"
                  >
                    ✕
                  </button>

                  {/* Scrollable description area */}
                  <div className="flex-1 overflow-y-auto p-8 pr-14 space-y-5">
                    {/* Name */}
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 leading-tight">
                      {locale === "uz" ? product.nameUz : product.nameRu}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-500 leading-relaxed text-sm">
                      {locale === "uz" ? product.longDescUz : product.longDescRu}
                    </p>
                  </div>

                  {/* Sticky bottom — count + order */}
                  <div className="border-t border-gray-100 p-6 space-y-4">
                    {/* Count row */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-semibold text-gray-600">{t("quantity")}</p>
                        <p className="text-salmon-500 font-extrabold text-xl leading-none">
                          {(product.price * count)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                          <span className="text-xs font-semibold ml-1">so'm</span>
                        </p>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => setCount((c) => Math.max(1, c - 1))}
                          className="w-10 h-10 text-gray-500 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center text-xl cursor-pointer"
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-extrabold text-gray-800 text-lg border-x border-gray-200">
                          {count}
                        </span>
                        <button
                          onClick={() => setCount((c) => c + 1)}
                          className="w-10 h-10 text-gray-500 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center text-xl cursor-pointer"
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Order button */}
                    <button
                      onClick={handleAddToCart}
                      className="flex items-center justify-center gap-2 w-full bg-salmon-500 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-salmon-600 active:scale-95 transition-all shadow-lg shadow-salmon-100 cursor-pointer"
                    >
                      🛒 {t("order")}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
