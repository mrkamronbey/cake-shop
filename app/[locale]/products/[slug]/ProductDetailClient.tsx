"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";

interface Labels {
  back: string;
  quantity: string;
  order: string;
  total: string;
  popular: string;
  newLabel: string;
}

interface Props {
  product: Product;
  name: string;
  desc: string;
  price: string;
  emoji: string;
  locale: string;
  labels: Labels;
}

const deliveryInfo = [
  { icon: "🚀", uz: "2–3 soat yetkazib berish", ru: "Доставка за 2–3 часа" },
  { icon: "🌿", uz: "100% tabiiy ingredientlar", ru: "100% натуральные ингредиенты" },
  { icon: "✨", uz: "Har kuni yangi pishiriladi", ru: "Выпекается каждый день" },
];

export default function ProductDetailClient({
  product,
  name,
  desc,
  price,
  emoji,
  locale,
  labels,
}: Props) {
  const [count, setCount] = useState(1);
  const isUz = locale === "uz";

  const total = (product.price * count)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const handleOrder = () => {
    sessionStorage.setItem(
      "orderPrefill",
      JSON.stringify({ product: product.slug, quantity: count })
    );
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Decorative top blob */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-br from-amber-50 via-cream-50 to-orange-50 -z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-100/70 blur-3xl" />
        <div className="absolute top-10 -left-16 w-60 h-60 rounded-full bg-orange-100/60 blur-3xl" />
      </div>

      {/* Back button */}
      <div className="relative max-w-7xl mx-auto px-6 pt-8 mb-4">
        <Link
          href={`/${locale}#menu`}
          className="inline-flex items-center gap-2 text-salmon-500 font-semibold hover:text-salmon-600 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 10H5M10 5l-5 5 5 5" />
          </svg>
          {labels.back}
        </Link>
      </div>

      {/* Main two-column card — full width */}
      <div className="relative max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-[1fr_1.1fr]">

            {/* LEFT — Image */}
            <div className="relative flex items-center justify-center min-h-80 md:min-h-[560px] bg-gradient-to-br from-amber-50 via-orange-50 to-cream-50 p-10">
              {/* Soft glow behind emoji */}
              <div className="absolute w-56 h-56 rounded-full bg-amber-200/40 blur-3xl" />

              {/* Badge */}
              {product.badge && (
                <span
                  className={`absolute top-5 left-5 text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10 ${
                    product.badge === "popular"
                      ? "bg-salmon-500 text-white"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {product.badge === "popular" ? labels.popular : labels.newLabel}
                </span>
              )}

              {/* Emoji in circle */}
              <div className="relative w-52 h-52 rounded-full bg-white/70 backdrop-blur-sm shadow-2xl border border-white flex items-center justify-center">
                <span className="text-9xl drop-shadow">{emoji}</span>
              </div>

              {/* Price chip — bottom of image area */}
              <div className="absolute bottom-5 right-5 bg-white rounded-2xl shadow-md px-4 py-2 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">Narx</p>
                <p className="text-salmon-500 font-extrabold text-lg leading-none">
                  {price} <span className="text-xs font-semibold">so'm</span>
                </p>
              </div>
            </div>

            {/* RIGHT — Info */}
            <div className="flex flex-col p-8 md:p-12">
              {/* Name + desc */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-3 leading-tight">
                  {name}
                </h1>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-6" />

              {/* Count selector */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
                  {labels.quantity}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setCount((c) => Math.max(1, c - 1))}
                      className="w-12 h-12 text-gray-500 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center text-2xl cursor-pointer"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-extrabold text-gray-800 text-xl border-x border-gray-200">
                      {count}
                    </span>
                    <button
                      onClick={() => setCount((c) => c + 1)}
                      className="w-12 h-12 text-gray-500 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center text-2xl cursor-pointer"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>

                  {/* Total */}
                  {count > 1 && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium">{labels.total}</span>
                      <span className="text-salmon-500 font-extrabold text-lg leading-tight">
                        {total} so'm
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order button */}
              <a
                href={`/${locale}#order`}
                onClick={handleOrder}
                className="flex items-center justify-center gap-2 w-full bg-salmon-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-salmon-600 active:scale-95 transition-all shadow-lg shadow-salmon-100 mb-6"
              >
                <span>🛍️</span>
                {labels.order}
              </a>

              {/* Trust badges */}
              <div className="grid grid-cols-1 gap-2 mt-auto">
                {deliveryInfo.map((item) => (
                  <div
                    key={item.icon}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs text-gray-600 font-medium">
                      {isUz ? item.uz : item.ru}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
