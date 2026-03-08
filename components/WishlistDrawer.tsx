"use client";

import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { products } from "@/lib/products";
import { toast } from "sonner";

const emojiMap: Record<string, string> = {
  cakes: "🎂", cupcakes: "🧁", cookies: "🍪", pastries: "🥐",
};

export default function WishlistDrawer() {
  const locale = useLocale();
  const isUz = locale === "uz";
  const { slugs, toggle, isOpen, closeWishlist } = useWishlist();
  const { addToCart } = useCart();

  const liked = products.filter((p) => slugs.has(p.slug));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={closeWishlist}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                <h2 className="font-extrabold text-gray-800 text-lg">
                  {isUz ? "Sevimlilar" : "Избранное"}
                </h2>
                {liked.length > 0 && (
                  <span className="bg-red-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {liked.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeWishlist}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {liked.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
                  <Heart className="w-16 h-16 text-gray-200" strokeWidth={1.5} />
                  <p className="text-gray-400 font-medium">
                    {isUz ? "Sevimlilar bo'sh" : "Избранное пусто"}
                  </p>
                </div>
              ) : (
                liked.map((product) => {
                  const name = isUz ? product.nameUz : product.nameRu;
                  const price = product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                  return (
                    <div
                      key={product.slug}
                      className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-3xl shrink-0">
                        {emojiMap[product.category] || "🍰"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{name}</p>
                        <p className="text-salmon-500 font-extrabold text-sm mt-0.5">{price} so'm</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            addToCart(product, 1);
                            toast.success(isUz ? `${name} korzinkaga qo'shildi` : `${name} добавлен в корзину`, { duration: 2000 });
                          }}
                          className="w-8 h-8 rounded-full bg-salmon-500 flex items-center justify-center text-white hover:bg-salmon-600 transition-colors cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggle(product.slug)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
