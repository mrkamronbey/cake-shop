"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { products, type Product } from "@/lib/products";

const categoryKeys = ["all", "cakes", "cupcakes", "cookies", "pastries"] as const;

export default function MenuPage() {
  const t = useTranslations("categories");
  const tp = useTranslations("products");
  const locale = useLocale();
  const [active, setActive] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered =
    active === "all"
      ? products
      : products.filter((p) => p.category === active);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-salmon-500 to-salmon-600 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold mb-2">{tp("title")}</h1>
        <p className="opacity-80">{tp("subtitle")}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Category filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                active === key
                  ? "bg-cream-500 text-white shadow-md shadow-cream-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-cream-300"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={() => setSelectedProduct(product)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-20 text-lg">
            {locale === "uz" ? "Mahsulotlar topilmadi" : "Продукты не найдены"}
          </p>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
