"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Truck, Clock3, BadgeCheck } from "lucide-react";

export default function DeliverySection() {
  const locale = useLocale();
  const isUz = locale === "uz";

  const cards = isUz
    ? [
        { icon: <Truck className="w-7 h-7 text-salmon-500" />, title: "Yetkazib berish", desc: "Toshkent bo'ylab yetkazib beramiz. Minimum buyurtma — 100 000 so'm." },
        { icon: <Clock3 className="w-7 h-7 text-salmon-500" />, title: "Yetkazish vaqti", desc: "Buyurtma berilgandan so'ng 2–4 soat ichida yetkazib beramiz." },
        { icon: <BadgeCheck className="w-7 h-7 text-salmon-500" />, title: "Kafolat", desc: "Mahsulot sifati kafolatlangan. Muammo bo'lsa — to'liq qaytarib beramiz." },
      ]
    : [
        { icon: <Truck className="w-7 h-7 text-salmon-500" />, title: "Доставка", desc: "Доставляем по всему Ташкенту. Минимальный заказ — 100 000 сум." },
        { icon: <Clock3 className="w-7 h-7 text-salmon-500" />, title: "Время доставки", desc: "Доставим в течение 2–4 часов после оформления заказа." },
        { icon: <BadgeCheck className="w-7 h-7 text-salmon-500" />, title: "Гарантия", desc: "Качество продукции гарантировано. Проблема? Вернём деньги полностью." },
      ];

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-salmon-500 mb-2">
            {isUz ? "Yetkazib berish" : "Доставка"}
          </h2>
          <p className="text-gray-400">
            {isUz ? "Tez va ishonchli" : "Быстро и надёжно"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 text-center flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-salmon-50 flex items-center justify-center">
                {c.icon}
              </div>
              <h3 className="font-extrabold text-gray-800 text-lg">{c.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
