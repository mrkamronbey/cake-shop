"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2, Plus, Minus, ClipboardList, ArrowLeft, CheckCircle, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart";
import MapOrderStep from "@/components/MapOrderStep";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  address: z.string().min(5),
  entrance: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  intercom: z.string().optional(),
  note: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const emojiMap: Record<string, string> = {
  cakes: "🎂",
  cupcakes: "🧁",
  cookies: "🍪",
  pastries: "🥐",
};

export default function CartDrawer() {
  const { items, totalCount, isOpen, closeCart, updateCount, removeFromCart, clearCart } = useCart();
  const locale = useLocale();
  const isUz = locale === "uz";
  const [step, setStep] = useState<1 | 2>(1);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [itemsExpanded, setItemsExpanded] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const grandTotal = items
    .reduce((sum, i) => sum + i.product.price * i.count, 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const handleClose = () => {
    closeCart();
    setTimeout(() => {
      setStep(1);
      setSubmitStatus("idle");
      reset();
    }, 300);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitStatus("loading");
    try {
      const cartItems = items.map((i) => ({
        name: isUz ? i.product.nameUz : i.product.nameRu,
        quantity: i.count,
        price: i.product.price,
      }));

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, items: cartItems, locale }),
      });

      if (!res.ok) throw new Error();
      setSubmitStatus("success");
      clearCart();
      reset();
    } catch {
      setSubmitStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Drawer */}
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
                {step === 2 && (
                  <button
                    onClick={() => { setStep(1); setSubmitStatus("idle"); }}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer mr-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                {step === 1 && <ShoppingCart className="w-5 h-5 text-salmon-500" />}
                <h2 className="font-extrabold text-gray-800 text-lg">
                  {step === 1
                    ? (isUz ? "Korzinka" : "Корзина")
                    : (isUz ? "Buyurtma" : "Заказ")}
                </h2>
                {step === 1 && totalCount > 0 && (
                  <span className="bg-salmon-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {step === 1 && items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isUz ? "Tozalash" : "Очистить"}
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step 1 — Cart items */}
            {step === 1 && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
                      <ShoppingCart className="w-16 h-16 text-gray-200" strokeWidth={1.5} />
                      <p className="text-gray-400 font-medium">
                        {isUz ? "Korzinka bo'sh" : "Корзина пуста"}
                      </p>
                    </div>
                  ) : (
                    items.map(({ product, count }) => {
                      const name = isUz ? product.nameUz : product.nameRu;
                      const itemTotal = (product.price * count)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

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
                            <p className="text-salmon-500 font-extrabold text-sm mt-0.5">
                              {itemTotal} so'm
                            </p>
                            <div className="flex items-center mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden w-fit">
                              <button
                                onClick={() => updateCount(product.slug, count - 1)}
                                className="w-8 h-8 text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-extrabold text-gray-800 text-sm border-x border-gray-200">
                                {count}
                              </span>
                              <button
                                onClick={() => updateCount(product.slug, count + 1)}
                                className="w-8 h-8 text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(product.slug)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {items.length > 0 && (
                  <div className="px-6 py-5 border-t border-gray-100 space-y-4 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">
                        {isUz ? "Jami" : "Итого"}
                      </span>
                      <span className="text-salmon-500 font-extrabold text-xl">
                        {grandTotal} so'm
                      </span>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center justify-center gap-2 w-full bg-salmon-500 text-white py-4 rounded-2xl font-bold text-base hover:bg-salmon-600 active:scale-95 transition-all shadow-lg shadow-salmon-100 cursor-pointer"
                    >
                      <ClipboardList className="w-5 h-5" />
                      {isUz ? "Buyurtmani tasdiqlash" : "Подтвердить заказ"}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Step 2 — Order form */}
            {step === 2 && (
              <>
                {submitStatus === "success" ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
                    <CheckCircle className="w-16 h-16 text-green-400" strokeWidth={1.5} />
                    <p className="text-gray-700 font-bold text-lg">
                      {isUz ? "Buyurtma qabul qilindi!" : "Заказ принят!"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {isUz ? "Tez orada siz bilan bog'lanamiz." : "Мы свяжемся с вами в ближайшее время."}
                    </p>
                    <button
                      onClick={handleClose}
                      className="mt-2 bg-salmon-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-salmon-600 transition-colors cursor-pointer"
                    >
                      {isUz ? "Yopish" : "Закрыть"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                    <MapOrderStep
                      register={register}
                      errors={errors}
                      isUz={isUz}
                    />

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-gray-100 shrink-0 space-y-3">
                      {/* Cart items + total */}
                      <div className="space-y-1">
                        <AnimatePresence initial={false}>
                          {itemsExpanded && (
                            <motion.div
                              key="cart-items"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden space-y-1 pb-2"
                            >
                              {items.map(({ product, count }) => (
                                <div key={product.slug} className="flex justify-between text-sm">
                                  <span className="text-gray-500">
                                    {isUz ? product.nameUz : product.nameRu} × {count}
                                  </span>
                                  <span className="font-semibold text-gray-800">
                                    {(product.price * count).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm
                                  </span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <button
                          type="button"
                          onClick={() => setItemsExpanded(v => !v)}
                          className="flex items-center justify-between w-full cursor-pointer"
                        >
                          <span className="text-gray-500 font-medium">{isUz ? "Jami" : "Итого"}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-salmon-500 font-extrabold text-lg">{grandTotal} so'm</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${itemsExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </button>
                      </div>

                      {submitStatus === "error" && (
                        <p className="text-red-500 text-sm text-center">
                          {isUz ? "Xatolik yuz berdi. Qaytadan urinib ko'ring." : "Произошла ошибка. Попробуйте снова."}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={submitStatus === "loading"}
                        className="flex items-center justify-center gap-2 w-full bg-salmon-500 text-white py-4 rounded-2xl font-bold text-base hover:bg-salmon-600 active:scale-95 transition-all shadow-lg shadow-salmon-100 cursor-pointer disabled:opacity-60"
                      >
                        <ClipboardList className="w-5 h-5" />
                        {submitStatus === "loading"
                          ? (isUz ? "Yuborilmoqda..." : "Отправляется...")
                          : (isUz ? "Buyurtma yuborish" : "Отправить заказ")}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
