"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/lib/products";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface Props {
  product: Product;
  onOpen: () => void;
}

export default function ProductCard({ product, onOpen }: Props) {
  const locale = useLocale();
  const t = useTranslations("products");
  const [count, setCount] = useState(1);
  const { addToCart } = useCart();

  const name = locale === "uz" ? product.nameUz : product.nameRu;
  const desc = locale === "uz" ? product.descUz : product.descRu;
  const price = product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const emojiMap: Record<string, string> = {
    cakes: "🎂",
    cupcakes: "🧁",
    cookies: "🍪",
    pastries: "🥐",
  };

  const handleAddToCart = () => {
    addToCart(product, count);
    toast.success(locale === "uz" ? `${name} korzinkaga qo'shildi` : `${name} добавлен в корзину`, {
      duration: 2000,
    });
    setCount(1);
  };

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm group border border-gray-100 flex flex-col"
    >
      {/* Image area */}
      <div className="relative h-64 bg-gradient-to-br from-cream-50 via-amber-50 to-amber-100 flex items-center justify-center">
        <span className="text-8xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
          {emojiMap[product.category] || "🍰"}
        </span>

        {product.badge && (
          <span
            className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
              product.badge === "popular"
                ? "bg-salmon-500 text-white"
                : "bg-emerald-500 text-white"
            }`}
          >
            {product.badge === "popular" ? t("popular") : t("new")}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-base mb-1 leading-snug">{name}</h3>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{desc}</p>

        {/* Price */}
        <p className="text-salmon-600 font-extrabold text-xl mb-4">
          {price} <span className="text-sm font-semibold">so'm</span>
        </p>

        {/* Count selector */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 font-medium">{t("quantity")}:</span>
          <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="w-9 h-9 text-gray-500 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center text-xl cursor-pointer"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="w-9 text-center font-extrabold text-gray-800 text-base border-x border-gray-200">
              {count}
            </span>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="w-9 h-9 text-gray-500 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center text-xl cursor-pointer"
              aria-label="Increase"
            >
              +
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onOpen}
            className="flex-1 border border-salmon-400 text-salmon-500 text-sm py-2.5 rounded-xl hover:bg-salmon-50 transition-colors font-semibold text-center cursor-pointer"
          >
            {t("detail")}
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-salmon-500 text-white text-sm py-2.5 rounded-xl hover:bg-salmon-600 transition-colors font-semibold text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            {t("order")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
