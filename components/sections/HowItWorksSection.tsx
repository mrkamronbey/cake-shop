"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ShoppingBag, ClipboardList, Truck } from "lucide-react";

export default function HowItWorksSection() {
  const locale = useLocale();
  const isUz = locale === "uz";

  const steps = isUz
    ? [
        { num: "01", icon: <ShoppingBag className="w-10 h-10 text-salmon-500" />, title: "Mahsulot tanlang", desc: "Menyu bo'limidan o'zingizga yoqqan tortni toping va korzinkaga qo'shing." },
        { num: "02", icon: <ClipboardList className="w-10 h-10 text-salmon-500" />, title: "Buyurtma bering", desc: "Korzinkani oching, manzil va telefon raqamingizni kiriting." },
        { num: "03", icon: <Truck className="w-10 h-10 text-salmon-500" />, title: "Yetkazib beramiz", desc: "Buyurtmangizni qabul qilib, imkon qadar tez yetkazib beramiz." },
      ]
    : [
        { num: "01", icon: <ShoppingBag className="w-10 h-10 text-salmon-500" />, title: "Выберите торт", desc: "Найдите понравившийся торт в меню и добавьте в корзину." },
        { num: "02", icon: <ClipboardList className="w-10 h-10 text-salmon-500" />, title: "Оформите заказ", desc: "Откройте корзину, укажите адрес и номер телефона." },
        { num: "03", icon: <Truck className="w-10 h-10 text-salmon-500" />, title: "Доставим вам", desc: "Примем заказ и доставим как можно скорее." },
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
            {isUz ? "Qanday ishlaydi?" : "Как это работает?"}
          </h2>
          <p className="text-gray-400">{isUz ? "3 ta oddiy qadam" : "3 простых шага"}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 text-center relative overflow-hidden"
            >
              <span className="absolute top-3 right-4 text-4xl font-extrabold text-gray-100 leading-none select-none">
                {step.num}
              </span>
              <div className="flex justify-center mb-4">{step.icon}</div>
              <h3 className="font-extrabold text-gray-800 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
