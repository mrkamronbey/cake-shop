"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const locale = useLocale();
  const isUz = locale === "uz";
  const [open, setOpen] = useState<number | null>(null);

  const faqs = isUz
    ? [
        { q: "Minimal buyurtma summasi qancha?", a: "Minimal buyurtma summasi 100 000 so'm." },
        { q: "Qancha vaqtda yetkazib berasiz?", a: "Odatda buyurtma berilgandan 2–4 soat ichida yetkazamiz. Toshkent bo'ylab." },
        { q: "Individual dizayn buyurtma berish mumkinmi?", a: "Ha, albatta! Telegram yoki telefon orqali bog'laning, dizayningizni muhokama qilamiz." },
        { q: "To'lov qanday amalga oshiriladi?", a: "Naqd pul yoki karta orqali to'lashingiz mumkin. Yetkazib berishda to'lash ham mavjud." },
        { q: "Tort sovqqa yaroqlimi?", a: "Albatta! Maxsus sovg'a qadoqlash xizmatimiz ham mavjud. Buyurtma berganingizda ayting." },
        { q: "Qancha oldin buyurtma berish kerak?", a: "Oddiy tortlar uchun — 1 kun oldin. Katta va murakkab dizayn uchun — 2–3 kun oldin." },
      ]
    : [
        { q: "Какова минимальная сумма заказа?", a: "Минимальная сумма заказа — 100 000 сум." },
        { q: "Сколько времени занимает доставка?", a: "Обычно доставляем в течение 2–4 часов после оформления заказа. По всему Ташкенту." },
        { q: "Можно ли заказать индивидуальный дизайн?", a: "Да, конечно! Свяжитесь с нами через Telegram или по телефону, обсудим ваш дизайн." },
        { q: "Как осуществляется оплата?", a: "Можно оплатить наличными или картой. Также доступна оплата при получении." },
        { q: "Подходит ли торт в качестве подарка?", a: "Конечно! У нас есть специальная подарочная упаковка. Укажите это при заказе." },
        { q: "За сколько времени нужно сделать заказ?", a: "Для обычных тортов — за 1 день. Для больших и сложных дизайнов — за 2–3 дня." },
      ];

  return (
    <section className="py-20">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-salmon-500 mb-2">
            {isUz ? "Ko'p so'raladigan savollar" : "Часто задаваемые вопросы"}
          </h2>
          <p className="text-gray-400">
            {isUz ? "Javob topa olmadingizmi? Bog'laning!" : "Не нашли ответ? Свяжитесь с нами!"}
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
              >
                <span className="font-semibold text-gray-800 text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
