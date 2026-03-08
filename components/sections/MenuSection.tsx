"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import type { Product } from "@/lib/products";

const categoryKeys = ["all", "cakes", "cupcakes", "cookies", "pastries"] as const;

interface Props {
  products: Product[];
}

export default function MenuSection({ products }: Props) {
  const t = useTranslations("categories");
  const tp = useTranslations("products");
  const locale = useLocale();
  const [active, setActive] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <section id="menu" className="py-20 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-salmon-500 mb-2">{tp("title")}</h2>
          <p className="text-gray-400">{tp("subtitle")}</p>
        </motion.div>

        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                active === key
                  ? "bg-salmon-500 text-white shadow-md shadow-cream-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-cream-300"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              <ProductCard product={product} onOpen={() => setSelectedProduct(product)} />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-20 text-lg">
            {locale === "uz" ? "Mahsulotlar topilmadi" : "Продукты не найдены"}
          </p>
        )}
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}
